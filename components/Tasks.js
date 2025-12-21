import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  BellRing,
  AlertTriangle,
  Star,
  Flame,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  Filter,
  Calendar as CalendarIcon,
  ListFilter,
  X,
} from "lucide-react";

const Tasks = ({ tasks, setTasks, compact = false, searchQuery = "" }) => {
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newReminder, setNewReminder] = useState("");
  const [showReminderInput, setShowReminderInput] = useState(false);

  // Sorting & Filtering State
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, completed
  const [filterTag, setFilterTag] = useState(null);
  const [sortBy, setSortBy] = useState(null); // deadline, priority
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [showFilters, setShowFilters] = useState(false);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Poll for reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let updatesNeeded = false;
      const updatedTasks = tasks.map((task) => {
        if (
          task.reminderTime &&
          !task.reminderSent &&
          new Date(task.reminderTime) <= now
        ) {
          // Trigger Notification
          if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
              body: `Reminder: ${task.title}`,
              icon: "/assets/logo.svg",
            });
          } else {
            alert(`Reminder: ${task.title}`);
          }
          updatesNeeded = true;
          return { ...task, reminderSent: true };
        }
        return task;
      });

      if (updatesNeeded) {
        setTasks(updatedTasks);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [tasks, setTasks]);

  const triggerReminder = (task) => {
    if (!("Notification" in window)) {
      alert(`Reminder: ${task.title} is overdue!`);
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Task Overdue", {
        body: `The task "${
          task.title
        }" was due on ${task.deadline.toLocaleDateString()}`,
        icon: "/assets/logo.svg", // Optional: Add a logo if available
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Task Overdue", {
            body: `The task "${
              task.title
            }" was due on ${task.deadline.toLocaleDateString()}`,
          });
        }
      });
    } else {
      // Fallback if permission denied
      alert(`Reminder: ${task.title} is overdue!`);
    }
  };

  const priorityConfig = {
    low: {
      label: "LOW",
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/50",
      icon: <ArrowDown size={10} />,
    },
    medium: {
      label: "MEDIUM",
      color: "text-blue-400",
      bg: "bg-blue-500/20",
      border: "border-blue-500/50",
      icon: <Minus size={10} />,
    },
    high: {
      label: "HIGH",
      color: "text-amber-400",
      bg: "bg-amber-500/20",
      border: "border-amber-500/50",
      icon: <ArrowUp size={10} />,
    },
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTask,
      deadline: newDeadline
        ? new Date(newDeadline)
        : new Date(Date.now() + 86400000), // Default tomorrow
      completed: false,
      priority: newPriority,
      tags: [],
      reminderTime: newReminder ? new Date(newReminder) : null,
      reminderSent: false,
    };
    setTasks([task, ...tasks]);
    setNewTask("");
    setNewDeadline("");
    setNewPriority("medium");
    setNewReminder("");
    setShowReminderInput(false);
  };

  const sendWhatsAppNotification = () => {
    alert(
      "Sending WhatsApp notification to registered number: \n\n" +
        tasks
          .filter((t) => !t.completed)
          .map((t) => `- ${t.title}`)
          .join("\n")
    );
  };

  const getStatusColor = (task) => {
    if (task.completed)
      return "text-green-400 decoration-slate-500 line-through";
    const isOverdue = new Date() > task.deadline;
    if (isOverdue) return "text-red-200";
    if (task.priority === "high") return "text-amber-200";
    return "text-white";
  };

  // --- Filtering & Sorting Logic ---

  // 1. Get all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || [])));

  // 2. Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search Query
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags &&
        t.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    // Status Filter
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? !t.completed
        : t.completed;

    // Tag Filter
    const matchesTag = filterTag ? t.tags && t.tags.includes(filterTag) : true;

    return matchesSearch && matchesStatus && matchesTag;
  });

  // 3. Sort tasks (if sortBy is active)
  const processedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortBy) return 0;

    let valA, valB;
    if (sortBy === "deadline") {
      valA = new Date(a.deadline).getTime();
      valB = new Date(b.deadline).getTime();
    } else if (sortBy === "priority") {
      const pMap = { high: 3, medium: 2, low: 1 };
      valA = pMap[a.priority];
      valB = pMap[b.priority];
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 4. Split for default view (only if NOT sorting)
  const criticalTasks = processedTasks.filter(
    (t) => t.priority === "high" && !t.completed
  );
  const otherTasks = processedTasks.filter(
    (t) => t.priority !== "high" || t.completed
  );

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      // Toggle order or turn off
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortBy(null);
        setSortOrder("asc");
      }
    } else {
      setSortBy(criteria);
      setSortOrder("asc");
    }
  };

  const renderTask = (task, isCritical = false) => {
    const isOverdue = !task.completed && new Date() > task.deadline;
    const pConfig = priorityConfig[task.priority];

    return (
      <div
        key={task.id}
        className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
          task.completed
            ? "bg-green-500/5 border border-green-500/10 opacity-50 hover:opacity-80"
            : isCritical
            ? "bg-gradient-to-r from-amber-900/20 to-transparent border-l-2 border-l-amber-500 hover:bg-white/5"
            : isOverdue
            ? "bg-gradient-to-r from-red-900/20 to-transparent border-l-2 border-l-red-500 hover:bg-white/5"
            : "hover:bg-white/5 border border-transparent"
        }`}
        onClick={() => toggleTask(task.id)}
      >
        <div className="transform transition-transform duration-200 hover:scale-110 active:scale-95">
          {task.completed ? (
            <CheckCircle2 size={18} className="text-nexus-teal" />
          ) : isCritical ? (
            <Star size={18} className="text-amber-500 fill-amber-500/20" />
          ) : isOverdue ? (
            <AlertTriangle size={18} className="text-red-500 animate-pulse" />
          ) : (
            <Circle
              size={18}
              className="text-gray-500 group-hover:text-nexus-purple"
            />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium transition-all duration-300 ${getStatusColor(
              task
            )}`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p
              className={`text-[10px] font-mono transition-colors duration-300 ${
                isOverdue
                  ? "text-red-300"
                  : isCritical
                  ? "text-amber-300"
                  : "text-gray-500"
              }`}
            >
              {task.deadline.toLocaleDateString()}
            </p>
            {task.reminderTime && (
              <div
                className="flex items-center gap-1 text-[10px] text-nexus-purple/80"
                title={`Reminder: ${new Date(
                  task.reminderTime
                ).toLocaleString()}`}
              >
                <Bell size={10} />
                <span className="font-mono">
                  {new Date(task.reminderTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <span
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${pConfig.bg} ${pConfig.color} ${pConfig.border}`}
            >
              {pConfig.icon}
              {pConfig.label}
            </span>
          </div>
        </div>
        {isOverdue && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerReminder(task);
            }}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all animate-pulse"
            title="Trigger Reminder"
          >
            <Bell size={16} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input Area */}
      <div className="flex flex-col gap-2 mb-4">
        {compact ? (
          // Compact Layout (BentoCard)
          <>
            <div className="bg-black/20 border-b border-white/10 focus-within:border-nexus-purple transition-colors">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="New Mission..."
                className="w-full bg-transparent px-2 py-2 text-sm text-white focus:outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="flex-1 bg-black/20 border-b border-white/10 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-nexus-purple transition-colors font-mono"
              />
              <button
                onClick={() => {
                  const next = { low: "medium", medium: "high", high: "low" };
                  setNewPriority(next[newPriority]);
                }}
                className={`px-2 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1 transition-all ${priorityConfig[newPriority].bg} ${priorityConfig[newPriority].color} ${priorityConfig[newPriority].border}`}
              >
                {priorityConfig[newPriority].icon}
                {priorityConfig[newPriority].label}
              </button>
              <button
                onClick={addTask}
                className="bg-nexus-teal/20 hover:bg-nexus-teal/40 text-nexus-teal border border-nexus-teal/50 rounded px-3 py-1 transition-colors flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </>
        ) : (
          // Standard Layout
          <>
            <div className="flex items-center bg-black/20 border-b border-white/10 focus-within:border-nexus-purple transition-colors">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="New Mission... (use #tag)"
                className="flex-1 bg-transparent px-2 py-2 text-sm text-white focus:outline-none font-mono"
              />
              <button
                onClick={() => {
                  const next = { low: "medium", medium: "high", high: "low" };
                  setNewPriority(next[newPriority]);
                }}
                className={`mr-2 px-3 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1 transition-all ${priorityConfig[newPriority].bg} ${priorityConfig[newPriority].color} ${priorityConfig[newPriority].border}`}
              >
                {priorityConfig[newPriority].icon}
                {priorityConfig[newPriority].label}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 bg-black/20 border border-white/10 rounded focus-within:border-nexus-purple transition-colors p-1">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="bg-transparent px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <button
                  onClick={() => setShowReminderInput(!showReminderInput)}
                  className={`p-1.5 rounded transition-colors ${
                    showReminderInput
                      ? "text-nexus-purple bg-nexus-purple/10"
                      : "text-gray-500 hover:text-white"
                  }`}
                  title="Set Reminder"
                >
                  <Bell size={16} />
                </button>
                {showReminderInput && (
                  <input
                    type="datetime-local"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="bg-transparent border-l border-white/10 px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-1.5 rounded transition-colors ${
                    showFilters
                      ? "text-nexus-teal bg-nexus-teal/10"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  <Filter size={16} />
                </button>
                <button
                  onClick={addTask}
                  className="bg-nexus-teal text-nexus-deep border border-nexus-teal/50 rounded px-4 py-1.5 text-xs font-bold hover:bg-white transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> ADD
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toolbar (Sort & Filter) - Only show in standard mode or if not compact */}
      {!compact && showFilters && (
        <div className="flex flex-col gap-2 mb-4 p-3 bg-black/40 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Row 1: Status & Sort */}
          <div className="flex items-center justify-between">
            {/* Status Filter */}
            <div className="flex bg-black/40 rounded-lg p-1 gap-1">
              {["all", "active", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                    filterStatus === s
                      ? "bg-nexus-purple text-white shadow-lg shadow-nexus-purple/20"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {s === "completed" ? "Done" : s}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSort("deadline")}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 border ${
                  sortBy === "deadline"
                    ? "bg-nexus-teal/10 text-nexus-teal border-nexus-teal/30"
                    : "bg-transparent border-transparent text-gray-500 hover:bg-white/5"
                }`}
                title="Sort by Deadline"
              >
                <CalendarIcon size={12} />
                <span className="text-[10px] font-bold">DATE</span>
                {sortBy === "deadline" && (
                  <span className="text-[9px]">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSort("priority")}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1.5 border ${
                  sortBy === "priority"
                    ? "bg-nexus-teal/10 text-nexus-teal border-nexus-teal/30"
                    : "bg-transparent border-transparent text-gray-500 hover:bg-white/5"
                }`}
                title="Sort by Priority"
              >
                <Flame size={12} />
                <span className="text-[10px] font-bold">PRIO</span>
                {sortBy === "priority" && (
                  <span className="text-[9px]">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Tags (Horizontal Scroll) */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide border-t border-white/5 mt-1">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-gray-400">
                <Filter size={10} />
                <span className="text-[9px]">TAGS</span>
              </div>

              <button
                onClick={() => setFilterTag(null)}
                className={`whitespace-nowrap px-3 py-1 text-[10px] rounded-full border transition-all ${
                  filterTag === null
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                  className={`whitespace-nowrap px-3 py-1 text-[10px] rounded-full border transition-all ${
                    filterTag === tag
                      ? "bg-nexus-purple/20 border-nexus-purple/50 text-nexus-purple"
                      : "bg-black/20 border-transparent text-gray-500 hover:border-white/10 hover:text-gray-300"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {sortBy ? (
          // Unified List when Sorting
          <div className="space-y-2">
            {processedTasks.map((task) => renderTask(task, false))}
            {processedTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs italic">
                No missions match current filters.
              </div>
            )}
          </div>
        ) : (
          // Default Split View
          <>
            {criticalTasks.length > 0 && (
              <div>
                <h3 className="text-amber-400 text-xs font-bold mb-2 flex items-center gap-2">
                  <Flame size={14} /> CRITICAL FOCUS
                </h3>
                <div className="space-y-2">
                  {criticalTasks.map((task) => renderTask(task, true))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-gray-400 text-xs font-bold mb-2 flex items-center gap-2">
                <ClipboardList size={14} /> MISSIONS
              </h3>
              <div className="space-y-2">
                {otherTasks.map((task) => renderTask(task, false))}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={sendWhatsAppNotification}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs rounded-lg border border-green-500/30 transition-all"
      >
        <BellRing size={14} />
        Sync to WhatsApp
      </button>
    </div>
  );
};

export default Tasks;
