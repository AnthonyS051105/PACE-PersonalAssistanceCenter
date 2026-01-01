"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckSquare,
  BrainCircuit,
  Database,
  Cpu,
  LayoutGrid,
  Search,
  Palette,
  Sun,
  Moon,
  X,
  Check,
  FileText,
  Link as LinkIcon,
  ArrowLeft,
  Plus,
} from "lucide-react";
import BentoCard from "../components/BentoCard";
import Agenda from "../components/Agenda";
import ProfileCard from "../components/ProfileCard";
import Tasks from "../components/Tasks";
import AIChat from "../components/AIChat";
import Notes from "../components/Notes";
import Vault from "../components/Vault";
import SystemMonitor from "../components/SystemMonitor";
import { supabase } from "@/lib/supabase";

// Sortable Item Wrapper Component
const SortableItem = ({
  id,
  children,
  isCustomizing,
  colSpan = 1,
  rowSpan = 1,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isCustomizing });

  // Calculate height based on rowSpan (base unit ~125px, so 1 row = 2 units = 250px)
  // This allows for half-height cards (rowSpan 0.5 = 125px)
  const baseUnitHeight = 125;
  const calculatedHeight = rowSpan * 2 * baseUnitHeight;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.9 : 1,
    gridColumn: `span ${colSpan}`,
    height: `${calculatedHeight}px`,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(children, {
        dragHandleProps: isCustomizing ? { ...attributes, ...listeners } : null,
        isDragging,
        rowSpan, // Pass rowSpan to child for responsive styling
      })}
    </div>
  );
};

const App = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const settingsRef = useRef(null);

  // Theme & Customization State
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("nexus");
  const [customizationMode, setCustomizationMode] = useState(false);

  const accentPalette = [
    { id: "nexus", name: "Nexus", colors: ["#732adf", "#65bbbd"] },
    { id: "cyber", name: "Cyber", colors: ["#f43f5e", "#06b6d4"] },
    { id: "forest", name: "Forest", colors: ["#10b981", "#f59e0b"] },
    { id: "mono", name: "Mono", colors: ["#94a3b8", "#f8fafc"] },
    { id: "sunset", name: "Sunset", colors: ["#f97316", "#8b5cf6"] },
  ];

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }, [theme]);

  // Apply Accent Color
  useEffect(() => {
    const selected =
      accentPalette.find((a) => a.id === accentColor) || accentPalette[0];
    document.documentElement.style.setProperty(
      "--nexus-purple",
      selected.colors[0]
    );
    document.documentElement.style.setProperty(
      "--nexus-teal",
      selected.colors[1]
    );
  }, [accentColor]);

  const [cardColors, setCardColors] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_card_colors");
      if (saved) return JSON.parse(saved);
    }
    return {
      monitor: "#65bbbd",
      ai: "#732adf",
      tasks: "#732adf",
      vault: "#732adf",
      agenda: "#65bbbd",
      notes: "#ffffff",
    };
  });

  useEffect(() => {
    localStorage.setItem("nexus_card_colors", JSON.stringify(cardColors));
  }, [cardColors]);

  // Layout State for Static Widgets
  const [layout, setLayout] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_layout");
      if (saved) return JSON.parse(saved);
    }
    return {
      monitor: { col: 4, row: 0.65 },
      ai: { col: 2, row: 2 },
      tasks: { col: 1, row: 2 },
      vault: { col: 1, row: 2 },
      agenda: { col: 1, row: 2 },
      notes: { col: 3, row: 2 },
    };
  });

  useEffect(() => {
    localStorage.setItem("nexus_layout", JSON.stringify(layout));
  }, [layout]);

  // Widget Order State for Drag & Drop
  const [widgetOrder, setWidgetOrder] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_widget_order");
      if (saved) return JSON.parse(saved);
    }
    return ["monitor", "ai", "tasks", "vault", "agenda", "notes"];
  });

  useEffect(() => {
    localStorage.setItem("nexus_widget_order", JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag End Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const hexToRgba = (hex, alpha = 0.3) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return (
        "rgba(" +
        [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
        "," +
        alpha +
        ")"
      );
    }
    return `rgba(115, 42, 223, ${alpha})`;
  };

  const handleColorChange = (key, color) => {
    setCardColors((prev) => ({ ...prev, [key]: color }));
  };

  // Custom Cards State
  const [customCards, setCustomCards] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_custom_cards");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    title: "",
    colSpan: 1,
    rowSpan: 1,
    color: "#732adf",
    content: "",
  });

  useEffect(() => {
    localStorage.setItem("nexus_custom_cards", JSON.stringify(customCards));
  }, [customCards]);

  const handleAddCard = () => {
    if (!newCardData.title) return;
    const newCard = {
      id: Date.now().toString(),
      ...newCardData,
    };
    setCustomCards([...customCards, newCard]);
    setIsAddingCard(false);
    setNewCardData({
      title: "",
      colSpan: 1,
      rowSpan: 1,
      color: "#732adf",
      content: "",
    });
  };

  const handleDeleteCard = (id) => {
    setCustomCards(customCards.filter((c) => c.id !== id));
  };

  const handleUpdateCardContent = (id, content) => {
    setCustomCards(
      customCards.map((c) => (c.id === id ? { ...c, content } : c))
    );
  };

  const handleUpdateCardColor = (id, color) => {
    setCustomCards(customCards.map((c) => (c.id === id ? { ...c, color } : c)));
  };

  const handleResize = (id, type, newCol, newRow) => {
    if (type === "static") {
      setLayout((prev) => ({
        ...prev,
        [id]: { col: newCol, row: newRow },
      }));
    } else {
      setCustomCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, colSpan: newCol, rowSpan: newRow } : c
        )
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to exit customization mode or close settings
      if (e.key === "Escape") {
        if (customizationMode) {
          setCustomizationMode(false);
        }
        if (showSettings) {
          setShowSettings(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customizationMode, showSettings]);

  // Click outside handler for settings panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSettings &&
        settingsRef.current &&
        !settingsRef.current.contains(e.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  const [tasks, setTasks] = useState([]);

  // Lifted State for Search
  // Lifted State for Search
  const [events, setEvents] = useState([]);

  const [vaultItems, setVaultItems] = useState([]);

  const [noteContent, setNoteContent] = useState(
    "# Welcome to Neural Notes\n\n- Start typing to auto-save to the cloud."
  );
  const [noteMarkdown, setNoteMarkdown] = useState(""); // Track markdown separately if needed

  // Fetch Data from Supabase
  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch Vault Items
      const { data: vData, error: vError } = await supabase
        .from("vault_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!vError && vData) {
        setVaultItems(vData);
      }

      // Fetch Notes State
      const { data: nData, error: nError } = await supabase
        .from("user_notes_state")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!nError && nData) {
        if (nData.content) setNoteContent(nData.content);
        if (nData.markdown_content) setNoteMarkdown(nData.markdown_content);
      }

      // Fetch Tasks
      const { data: tData, error: tError } = await supabase
        .from("tasks")
        .select("*")
        .order("deadline", { ascending: true });

      if (!tError && tData) {
        // Convert string dates back to Date objects
        const parsedTasks = tData.map((t) => ({
          ...t,
          deadline: new Date(t.deadline),
          reminderTime: t.reminderTime ? new Date(t.reminderTime) : null,
        }));
        setTasks(parsedTasks);
      }

      // Fetch Events
      const { data: eData, error: eError } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (!eError && eData) {
        const parsedEvents = eData.map((e) => ({
          ...e,
          startTime: new Date(e.start_time),
          endTime: new Date(e.end_time),
        }));
        setEvents(parsedEvents);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Search Logic
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(-1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search Tasks
    tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(query)) {
        results.push({
          type: "task",
          title: task.title,
          id: task.id,
          data: task,
        });
      }
    });

    // Search Events
    events.forEach((event) => {
      if (event.title.toLowerCase().includes(query)) {
        results.push({
          type: "event",
          title: event.title,
          id: event.id,
          data: event,
        });
      }
    });

    // Search Vault
    vaultItems.forEach((item) => {
      if (item.title.toLowerCase().includes(query)) {
        results.push({
          type: "vault",
          title: item.title,
          id: item.id,
          data: item,
        });
      }
    });

    // Search Notes (Simple check)
    if (noteContent.toLowerCase().includes(query)) {
      results.push({
        type: "note",
        title: "Note Content Match",
        id: "note-main",
        data: null,
      });
    }

    setSearchResults(results);
    setSelectedIndex(-1);
  }, [searchQuery, tasks, events, vaultItems, noteContent]);

  const handleSearchResultClick = (result) => {
    setSearchQuery(""); // Clear search or keep it? Usually clear on navigation.

    if (result.type === "task") {
      setActiveTab("tasks");
    } else if (result.type === "event") {
      setActiveTab("calendar");
    } else if (result.type === "vault") {
      setActiveTab("dashboard");
      // Ideally scroll to vault card
    } else if (result.type === "note") {
      setActiveTab("dashboard");
      // Ideally scroll to notes card
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-nexus-deep text-foreground p-4 md:p-8 font-sans selection:bg-nexus-purple selection:text-white relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nexus-teal/10 rounded-full blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col">
        {/* Header / Nav */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
        >
          {/* Logo & Title */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            {activeTab !== "dashboard" && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className="p-2 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl transition-colors shadow-lg shadow-nexus-purple/20 mr-2"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/logo.svg"
                  alt="PACE Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-nexus-deep" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-text-primary via-nexus-teal to-nexus-purple">
                PACE
              </h1>
              <p className="text-[10px] text-text-secondary font-mono tracking-[0.2em] uppercase">
                Personal Assistance Center
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="flex-1 max-w-md mx-4 relative hidden md:block group"
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-nexus-teal transition-colors"
              size={16}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (searchResults.length === 0) return;

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                } else if (e.key === "Enter" && selectedIndex >= 0) {
                  e.preventDefault();
                  handleSearchResultClick(searchResults[selectedIndex]);
                }
              }}
              placeholder="Search ACE..."
              className="w-full bg-input-bg border border-card-border rounded-xl py-2.5 pl-10 pr-12 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-nexus-teal transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:bg-card-bg rounded-full text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="text-[10px] font-mono text-text-secondary bg-card-bg px-1.5 py-0.5 rounded border border-card-border pointer-events-none">
                  ⌘K
                </span>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchQuery && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-nexus-deep/95 backdrop-blur-xl border border-nexus-glassBorder rounded-xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                >
                  <div className="p-2">
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider px-2 py-1 mb-1">
                      Best Matches
                    </div>
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left group ${
                          index === selectedIndex
                            ? "bg-white/10"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-input-bg text-nexus-teal group-hover:bg-nexus-teal group-hover:text-nexus-deep transition-colors">
                          {result.type === "task" && <CheckSquare size={14} />}
                          {result.type === "event" && <Calendar size={14} />}
                          {result.type === "vault" && <LinkIcon size={14} />}
                          {result.type === "note" && <FileText size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">
                            {result.title}
                          </div>
                          <div className="text-[10px] text-text-secondary capitalize">
                            {result.type}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Side: Tabs + User */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 bg-card-bg border border-card-border rounded-full p-1 backdrop-blur-md">
              {(() => {
                const baseTabs = ["dashboard", "calendar", "tasks"];
                const currentTabs = baseTabs.includes(activeTab)
                  ? baseTabs
                  : [...baseTabs, activeTab];

                return currentTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-4 py-2 rounded-full text-xs font-medium transition-all capitalize
                      ${
                        activeTab === tab
                          ? "bg-input-bg text-text-primary shadow-inner"
                          : "text-text-secondary hover:text-text-primary"
                      }
                   `}
                  >
                    {tab}
                  </button>
                ));
              })()}
            </div>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-all ${
                  showSettings || customizationMode
                    ? "bg-nexus-purple text-white shadow-[0_0_15px_rgba(115,42,223,0.5)]"
                    : "bg-nexus-glass border border-nexus-glassBorder text-gray-400 hover:text-white"
                }`}
                title="Customize Theme"
              >
                <Palette size={18} />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-72 bg-nexus-deep/95 backdrop-blur-xl border border-nexus-glassBorder rounded-xl p-4 shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">
                        Appearance
                      </h3>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Theme Toggle */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-400 mb-2 block">
                        Theme Mode
                      </label>
                      <div className="flex bg-nexus-glass rounded-lg p-1 border border-nexus-glassBorder">
                        <button
                          onClick={() => setTheme("light")}
                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                            theme === "light"
                              ? "bg-white text-nexus-deep shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <Sun size={14} /> Light
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                            theme === "dark"
                              ? "bg-nexus-purple text-white shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <Moon size={14} /> Dark
                        </button>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette size={14} className="text-text-secondary" />
                        <label className="text-xs font-bold text-text-secondary tracking-widest uppercase">
                          Neural Interface Accents
                        </label>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {accentPalette.map((accent) => (
                          <button
                            key={accent.id}
                            onClick={() => setAccentColor(accent.id)}
                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                              accentColor === accent.id
                                ? "bg-white/5 border-nexus-purple shadow-[0_0_15px_rgba(115,42,223,0.3)]"
                                : "bg-transparent border-white/5 hover:border-white/20 hover:bg-white/5"
                            }`}
                          >
                            {/* Color Circles */}
                            <div className="relative w-6 h-4">
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm z-10"
                                style={{ backgroundColor: accent.colors[0] }}
                              />
                              <div
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: accent.colors[1] }}
                              />
                            </div>

                            <span
                              className={`text-xs font-medium ${
                                accentColor === accent.id
                                  ? "text-white"
                                  : "text-text-secondary"
                              }`}
                            >
                              {accent.name}
                            </span>

                            {/* Active Indicator */}
                            {accentColor === accent.id && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-nexus-teal rounded-full border border-nexus-deep flex items-center justify-center">
                                <Check
                                  size={8}
                                  className="text-nexus-deep"
                                  strokeWidth={4}
                                />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Glow Toggle */}
                    <div>
                      <label className="text-xs text-text-secondary mb-2 block">
                        Dashboard Personalization
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setCustomizationMode(!customizationMode)
                          }
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            customizationMode
                              ? "bg-nexus-purple/20 border-nexus-purple text-nexus-purple"
                              : "bg-input-bg border-card-border text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {customizationMode
                            ? "Save Changes"
                            : "Edit Layout & Colors"}
                        </button>
                        <button
                          onClick={() => {
                            setShowSettings(false);
                            setIsAddingCard(true);
                          }}
                          className="flex-1 py-2 rounded-lg text-xs font-bold border border-nexus-teal/30 text-nexus-teal hover:bg-nexus-teal/10 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={14} /> Add Card
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Card */}
            <ProfileCard theme={theme} setTheme={setTheme} />
          </motion.div>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 pb-12">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={[...widgetOrder, ...customCards.map((c) => c.id)]}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {widgetOrder.map((widgetId) => {
                        // Render widgets based on their ID
                        switch (widgetId) {
                          case "monitor":
                            return (
                              <SortableItem
                                key="monitor"
                                id="monitor"
                                isCustomizing={customizationMode}
                                colSpan={layout.monitor.col}
                                rowSpan={layout.monitor.row}
                              >
                                <BentoCard
                                  variants={itemVariants}
                                  colSpan={layout.monitor.col}
                                  rowSpan={layout.monitor.row}
                                  className="min-h-[160px]"
                                  glowColor={hexToRgba(cardColors.monitor, 0.2)}
                                  isCustomizing={customizationMode}
                                  pickerColor={cardColors.monitor}
                                  onColorChange={(c) =>
                                    handleColorChange("monitor", c)
                                  }
                                  onResize={(c, r) =>
                                    handleResize("monitor", "static", c, r)
                                  }
                                >
                                  <SystemMonitor tasks={tasks} />
                                </BentoCard>
                              </SortableItem>
                            );
                          case "ai":
                            return (
                              <SortableItem
                                key="ai"
                                id="ai"
                                isCustomizing={customizationMode}
                                colSpan={layout.ai.col}
                                rowSpan={layout.ai.row}
                              >
                                <BentoCard
                                  variants={itemVariants}
                                  colSpan={layout.ai.col}
                                  rowSpan={layout.ai.row}
                                  onTripleClick={() => setActiveTab("ai")}
                                  glowColor={hexToRgba(cardColors.ai, 0.4)}
                                  isCustomizing={customizationMode}
                                  pickerColor={cardColors.ai}
                                  onColorChange={(c) =>
                                    handleColorChange("ai", c)
                                  }
                                  onResize={(c, r) =>
                                    handleResize("ai", "static", c, r)
                                  }
                                  className="min-h-[500px]"
                                  contentPadding={false}
                                >
                                  <AIChat user={user} showHeader={true} />
                                </BentoCard>
                              </SortableItem>
                            );
                          case "tasks":
                            return (
                              <SortableItem
                                key="tasks"
                                id="tasks"
                                isCustomizing={customizationMode}
                                colSpan={layout.tasks.col}
                                rowSpan={layout.tasks.row}
                              >
                                <BentoCard
                                  variants={itemVariants}
                                  colSpan={layout.tasks.col}
                                  rowSpan={layout.tasks.row}
                                  title="Missions"
                                  onTripleClick={() => setActiveTab("tasks")}
                                  icon={<CheckSquare />}
                                  glowColor={hexToRgba(cardColors.tasks, 0.2)}
                                  isCustomizing={customizationMode}
                                  pickerColor={cardColors.tasks}
                                  onColorChange={(c) =>
                                    handleColorChange("tasks", c)
                                  }
                                  onResize={(c, r) =>
                                    handleResize("tasks", "static", c, r)
                                  }
                                  className="min-h-[500px]"
                                >
                                  <Tasks
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    compact={true}
                                    searchQuery={searchQuery}
                                    user={user}
                                  />
                                </BentoCard>
                              </SortableItem>
                            );
                          case "vault":
                            return (
                              <SortableItem
                                key="vault"
                                id="vault"
                                isCustomizing={customizationMode}
                                colSpan={layout.vault.col}
                                rowSpan={layout.vault.row}
                              >
                                <BentoCard
                                  variants={itemVariants}
                                  colSpan={layout.vault.col}
                                  rowSpan={layout.vault.row}
                                  title="Data Vault"
                                  onTripleClick={() => setActiveTab("vault")}
                                  icon={<Database />}
                                  glowColor={hexToRgba(cardColors.vault, 0.5)}
                                  isCustomizing={customizationMode}
                                  pickerColor={cardColors.vault}
                                  onColorChange={(c) =>
                                    handleColorChange("vault", c)
                                  }
                                  onResize={(c, r) =>
                                    handleResize("vault", "static", c, r)
                                  }
                                  className="min-h-[500px]"
                                >
                                  <Vault
                                    searchQuery={searchQuery}
                                    items={vaultItems}
                                    setItems={setVaultItems}
                                    onRefresh={fetchData}
                                    user={user}
                                  />
                                </BentoCard>
                              </SortableItem>
                            );
                          case "agenda":
                            return (
                              <SortableItem
                                key="agenda"
                                id="agenda"
                                isCustomizing={customizationMode}
                                colSpan={layout.agenda.col}
                                rowSpan={layout.agenda.row}
                              >
                                <BentoCard
                                  variants={itemVariants}
                                  colSpan={layout.agenda.col}
                                  rowSpan={layout.agenda.row}
                                  title="Timeline"
                                  onTripleClick={() => setActiveTab("calendar")}
                                  icon={<Calendar />}
                                  glowColor={hexToRgba(cardColors.agenda, 0.3)}
                                  isCustomizing={customizationMode}
                                  pickerColor={cardColors.agenda}
                                  onColorChange={(c) =>
                                    handleColorChange("agenda", c)
                                  }
                                  onResize={(c, r) =>
                                    handleResize("agenda", "static", c, r)
                                  }
                                  className="min-h-[500px]"
                                >
                                  <Agenda
                                    searchQuery={searchQuery}
                                    events={events}
                                    setEvents={setEvents}
                                    user={user}
                                  />
                                </BentoCard>
                              </SortableItem>
                            );
                          case "notes":
                            return (
                              <SortableItem
                                key="notes"
                                id="notes"
                                isCustomizing={customizationMode}
                                colSpan={layout.notes.col}
                                rowSpan={layout.notes.row}
                              >
                                <BentoCard
                                  variants={itemVariants}
                                  colSpan={layout.notes.col}
                                  rowSpan={layout.notes.row}
                                  title="Neural Notes"
                                  onTripleClick={() => setActiveTab("notes")}
                                  icon={<LayoutGrid />}
                                  glowColor={hexToRgba(cardColors.notes, 0.1)}
                                  isCustomizing={customizationMode}
                                  pickerColor={cardColors.notes}
                                  onColorChange={(c) =>
                                    handleColorChange("notes", c)
                                  }
                                  onResize={(c, r) =>
                                    handleResize("notes", "static", c, r)
                                  }
                                  className="h-[500px]"
                                >
                                  <Notes
                                    searchQuery={searchQuery}
                                    content={noteContent}
                                    setContent={setNoteContent}
                                    markdownContent={noteMarkdown}
                                    setMarkdownContent={setNoteMarkdown}
                                    user={user}
                                  />
                                </BentoCard>
                              </SortableItem>
                            );
                          default:
                            return null;
                        }
                      })}

                      {/* Custom Cards */}
                      {customCards.map((card) => (
                        <SortableItem
                          key={card.id}
                          id={card.id}
                          isCustomizing={customizationMode}
                          colSpan={card.colSpan}
                          rowSpan={card.rowSpan}
                        >
                          <BentoCard
                            variants={itemVariants}
                            colSpan={card.colSpan}
                            rowSpan={card.rowSpan}
                            title={card.title}
                            glowColor={hexToRgba(card.color, 0.3)}
                            isCustomizing={customizationMode}
                            pickerColor={card.color}
                            onColorChange={(c) =>
                              handleUpdateCardColor(card.id, c)
                            }
                            onDelete={() => handleDeleteCard(card.id)}
                            onResize={(c, r) =>
                              handleResize(card.id, "custom", c, r)
                            }
                            className="min-h-[200px]"
                          >
                            <textarea
                              className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-text-secondary text-sm p-2"
                              placeholder="Type something..."
                              value={card.content}
                              onChange={(e) =>
                                handleUpdateCardContent(card.id, e.target.value)
                              }
                            />
                          </BentoCard>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="min-h-[80vh] bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-nexus-teal" />
                  Full Timeline
                </h2>
                <div className="flex-1 overflow-hidden">
                  <Agenda
                    searchQuery={searchQuery}
                    events={events}
                    setEvents={setEvents}
                    isFullPage={true}
                    user={user}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="min-h-[80vh] bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckSquare className="text-nexus-teal" />
                  Mission Control
                </h2>
                <div className="flex-1 overflow-hidden">
                  <Tasks
                    tasks={tasks}
                    setTasks={setTasks}
                    searchQuery={searchQuery}
                    user={user}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="min-h-[80vh] bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <LayoutGrid className="text-nexus-teal" />
                  Neural Notes Workspace
                </h2>
                <div className="flex-1 overflow-hidden">
                  <Notes
                    searchQuery={searchQuery}
                    content={noteContent}
                    setContent={setNoteContent}
                    markdownContent={noteMarkdown}
                    setMarkdownContent={setNoteMarkdown}
                    user={user}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="min-h-[80vh] bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Database className="text-nexus-teal" />
                  Data Vault Archive
                </h2>
                <div className="flex-1 overflow-hidden">
                  <Vault
                    searchQuery={searchQuery}
                    items={vaultItems}
                    setItems={setVaultItems}
                    onRefresh={fetchData}
                    user={user}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="min-h-[80vh] bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BrainCircuit className="text-nexus-teal" />
                  Nexus AI Core - Full Interface
                </h2>
                <div className="flex-1 overflow-hidden">
                  <AIChat user={user} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddingCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-nexus-deep w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add New Card</h3>
                <button
                  onClick={() => setIsAddingCard(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-text-secondary hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-2 block">
                    Card Title
                  </label>
                  <input
                    type="text"
                    placeholder="My Custom Card"
                    className="w-full bg-input-bg border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nexus-purple transition-colors"
                    value={newCardData.title}
                    onChange={(e) =>
                      setNewCardData({ ...newCardData, title: e.target.value })
                    }
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-2 block">
                      Width
                    </label>
                    <select
                      className="w-full bg-input-bg border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nexus-purple transition-colors appearance-none"
                      value={newCardData.colSpan}
                      onChange={(e) =>
                        setNewCardData({
                          ...newCardData,
                          colSpan: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={1} className="bg-gray-900 text-white">
                        Standard (1 Col)
                      </option>
                      <option value={2} className="bg-gray-900 text-white">
                        Wide (2 Cols)
                      </option>
                      <option value={3} className="bg-gray-900 text-white">
                        Extra Wide (3 Cols)
                      </option>
                      <option value={4} className="bg-gray-900 text-white">
                        Full Width (4 Cols)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-2 block">
                      Height
                    </label>
                    <select
                      className="w-full bg-input-bg border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nexus-purple transition-colors appearance-none"
                      value={newCardData.rowSpan}
                      onChange={(e) =>
                        setNewCardData({
                          ...newCardData,
                          rowSpan: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={1} className="bg-gray-900 text-white">
                        Standard
                      </option>
                      <option value={2} className="bg-gray-900 text-white">
                        Tall
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-2 block">
                    Glow Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                      value={newCardData.color}
                      onChange={(e) =>
                        setNewCardData({
                          ...newCardData,
                          color: e.target.value,
                        })
                      }
                    />
                    <span className="text-sm text-text-secondary">
                      {newCardData.color}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddCard}
                  disabled={!newCardData.title}
                  className="w-full bg-nexus-purple hover:bg-nexus-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-nexus-purple/20 mt-4"
                >
                  Create Card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Exit Button for Customization Mode */}
      <AnimatePresence>
        {customizationMode && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => setCustomizationMode(false)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-nexus-purple hover:bg-nexus-purple/90 text-white font-bold rounded-xl shadow-lg shadow-nexus-purple/30 transition-all hover:scale-105"
            title="Press Escape to exit"
          >
            <Check size={18} />
            <span>Done Editing</span>
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
              ESC
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
