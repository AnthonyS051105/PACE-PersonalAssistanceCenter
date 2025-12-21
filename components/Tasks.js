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
} from "lucide-react";

const Tasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Complete Project Report",
      deadline: new Date(Date.now() + 86400000),
      completed: false,
      priority: "high",
      tags: ["uni"],
    },
    {
      id: "2",
      title: "Review Calculus III",
      deadline: new Date(Date.now() - 86400000),
      completed: false,
      priority: "medium",
      tags: ["study"],
    },
    {
      id: "3",
      title: "Buy Groceries",
      deadline: new Date(Date.now() + 172800000),
      completed: true,
      priority: "low",
      tags: ["personal"],
    },
  ]);
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPriority, setNewPriority] = useState("medium");

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
          <p
            className={`text-[10px] font-mono transition-colors duration-300 ${
              isOverdue
                ? "text-red-300"
                : isCritical
                ? "text-amber-300"
                : "text-gray-500"
            }`}
          >
            {task.deadline.toLocaleDateString()} • {task.priority.toUpperCase()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input Area */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center bg-black/20 border-b border-white/10 focus-within:border-nexus-purple transition-colors">
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
              if (newPriority === "high") setNewPriority("medium");
              else if (newPriority === "medium") setNewPriority("low");
              else setNewPriority("high");
            }}
            className={`mr-2 px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
              newPriority === "high"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                : newPriority === "low"
                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                : "bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10"
            }`}
          >
            {newPriority.toUpperCase()}
          </button>
        </div>
        <input
          type="date"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
          className="bg-black/20 border-b border-white/10 px-2 py-2 text-sm text-white focus:outline-none focus:border-nexus-purple transition-colors font-mono w-min"
        />
        <button
          onClick={addTask}
          className="text-nexus-teal hover:text-white transition-colors"
        >
          <Plus size={20} />
        </button>
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
