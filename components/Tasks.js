import React, { useState } from "react";
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
} from "lucide-react";

const Tasks = ({ tasks, setTasks, compact = false }) => {
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPriority, setNewPriority] = useState("medium");

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
    };
    setTasks([task, ...tasks]);
    setNewTask("");
    setNewDeadline("");
    setNewPriority("medium");
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

  const criticalTasks = tasks.filter(
    (t) => t.priority === "high" && !t.completed
  );
  const otherTasks = tasks.filter((t) => t.priority !== "high" || t.completed);

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
            <span
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${pConfig.bg} ${pConfig.color} ${pConfig.border}`}
            >
              {pConfig.icon}
              {pConfig.label}
            </span>
          </div>
        </div>
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
                placeholder="New Mission..."
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
            <div className="flex items-center justify-between gap-2">
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="flex-1 bg-black/20 border-b border-white/10 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-nexus-purple transition-colors font-mono"
              />
              <button
                onClick={addTask}
                className="bg-nexus-teal/20 hover:bg-nexus-teal/40 text-nexus-teal border border-nexus-teal/50 rounded px-3 py-1 transition-colors flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
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
