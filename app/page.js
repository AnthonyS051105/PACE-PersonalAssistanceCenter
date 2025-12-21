"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import BentoCard from "../components/BentoCard";
import Agenda from "../components/Agenda";
import Tasks from "../components/Tasks";
import AIChat from "../components/AIChat";
import Notes from "../components/Notes";
import Vault from "../components/Vault";
import SystemMonitor from "../components/SystemMonitor";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

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

  const [cardColors, setCardColors] = useState({
    monitor: "#65bbbd",
    ai: "#732adf",
    tasks: "#ff6464",
    vault: "#732adf",
    agenda: "#65bbbd",
    notes: "#ffffff",
  });

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Complete Project Report",
      description:
        "Finalize the introduction and methodology sections. Ensure all citations are in APA format.",
      deadline: new Date(Date.now() + 86400000),
      completed: false,
      priority: "high",
      tags: ["uni"],
    },
    {
      id: "2",
      title: "Review Calculus III",
      description:
        "Go through Chapter 5: Multiple Integrals. Solve practice problems 1-10.",
      deadline: new Date(Date.now() - 86400000),
      completed: false,
      priority: "medium",
      tags: ["study"],
    },
    {
      id: "3",
      title: "Buy Groceries",
      description: "Milk, Eggs, Bread, Chicken Breast, Broccoli, Rice.",
      deadline: new Date(Date.now() + 172800000),
      completed: true,
      priority: "low",
      tags: ["personal"],
    },
  ]);

  // Lifted State for Search
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Web Dev Lecture",
      startTime: new Date(),
      endTime: new Date(),
      type: "lecture",
    },
    {
      id: "2",
      title: "Team Meeting",
      startTime: new Date(),
      endTime: new Date(),
      type: "meeting",
    },
  ]);

  const [vaultItems, setVaultItems] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vault_links");
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: "1", title: "Calculus Syllabus", url: "#", category: "doc" },
      { id: "2", title: "React Crash Course", url: "#", category: "youtube" },
      { id: "3", title: "Project Drive", url: "#", category: "drive" },
      { id: "4", title: "Design System", url: "#", category: "other" },
    ];
  });

  const [noteContent, setNoteContent] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_notes_content");
      if (saved) return saved;
    }
    return "# Lecture 4: React Hooks\n\n- useState\n- useEffect\n\nEquation: $E=mc^2$";
  });

  // Search Logic
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
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
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
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

            <div className="relative">
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
                        Card Customization
                      </label>
                      <button
                        onClick={() => setCustomizationMode(!customizationMode)}
                        className={`w-full py-2 rounded-lg text-xs font-bold border transition-all ${
                          customizationMode
                            ? "bg-nexus-purple/20 border-nexus-purple text-nexus-purple"
                            : "bg-input-bg border-card-border text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {customizationMode
                          ? "Done Customizing"
                          : "Edit Card Glows"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-nexus-purple to-nexus-teal flex items-center justify-center border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform">
              <span className="font-bold text-white">U</span>
            </div>
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
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                {/* 0. System Monitor (Full Width, Short) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-4"
                  rowSpan="md:row-span-1"
                  className="h-[160px]"
                  glowColor={hexToRgba(cardColors.monitor, 0.2)}
                  isCustomizing={customizationMode}
                  pickerColor={cardColors.monitor}
                  onColorChange={(c) => handleColorChange("monitor", c)}
                >
                  <SystemMonitor tasks={tasks} />
                </BentoCard>

                {/* 1. AI Core (Wide, Short) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-2"
                  rowSpan="md:row-span-1"
                  title="A.C.E"
                  onTripleClick={() => setActiveTab("ai")}
                  icon={
                    <div className="relative w-8 h-8">
                      <Image
                        src="/assets/ai-mascot.png"
                        alt="A.C.E Mascot"
                        fill
                        className="object-contain"
                      />
                    </div>
                  }
                  glowColor={hexToRgba(cardColors.ai, 0.4)}
                  isCustomizing={customizationMode}
                  pickerColor={cardColors.ai}
                  onColorChange={(c) => handleColorChange("ai", c)}
                  className="h-[500px]"
                >
                  <AIChat />
                </BentoCard>

                {/* 2. Tasks (Standard) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-1"
                  rowSpan="md:row-span-1"
                  title="Missions"
                  onTripleClick={() => setActiveTab("tasks")}
                  icon={<CheckSquare />}
                  glowColor={hexToRgba(cardColors.tasks, 0.2)}
                  isCustomizing={customizationMode}
                  pickerColor={cardColors.tasks}
                  onColorChange={(c) => handleColorChange("tasks", c)}
                  className="h-[500px]"
                >
                  <Tasks
                    tasks={tasks}
                    setTasks={setTasks}
                    compact={true}
                    searchQuery={searchQuery}
                  />
                </BentoCard>

                {/* 3. Quick Vault (Standard) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-1"
                  rowSpan="md:row-span-1"
                  title="Data Vault"
                  onTripleClick={() => setActiveTab("vault")}
                  icon={<Database />}
                  glowColor={hexToRgba(cardColors.vault, 0.5)}
                  isCustomizing={customizationMode}
                  pickerColor={cardColors.vault}
                  onColorChange={(c) => handleColorChange("vault", c)}
                  className="h-[500px]"
                >
                  <Vault
                    searchQuery={searchQuery}
                    items={vaultItems}
                    setItems={setVaultItems}
                  />
                </BentoCard>

                {/* 4. Agenda (Tall) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-1"
                  rowSpan="md:row-span-1"
                  title="Timeline"
                  onTripleClick={() => setActiveTab("calendar")}
                  icon={<Calendar />}
                  glowColor={hexToRgba(cardColors.agenda, 0.3)}
                  isCustomizing={customizationMode}
                  pickerColor={cardColors.agenda}
                  onColorChange={(c) => handleColorChange("agenda", c)}
                  className="h-[500px]"
                >
                  <Agenda searchQuery={searchQuery} events={events} />
                </BentoCard>

                {/* 5. Notes (Wide, Tall) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-3"
                  rowSpan="md:row-span-1"
                  title="Neural Notes"
                  onTripleClick={() => setActiveTab("notes")}
                  icon={<LayoutGrid />}
                  glowColor={hexToRgba(cardColors.notes, 0.1)}
                  isCustomizing={customizationMode}
                  pickerColor={cardColors.notes}
                  onColorChange={(c) => handleColorChange("notes", c)}
                  className="h-[500px]"
                >
                  <Notes
                    searchQuery={searchQuery}
                    content={noteContent}
                    setContent={setNoteContent}
                  />
                </BentoCard>
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
                  <Agenda searchQuery={searchQuery} events={events} />
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
                  <AIChat />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;
