import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  BellRing,
  AlertTriangle,
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
      priority: "medium",
      tags: [],
    };
    setTasks([task, ...tasks]);
    setNewTask("");
    setNewDeadline("");
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
    return "text-white";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input Area */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="New Mission..."
          className="flex-1 bg-black/20 border-b border-white/10 px-2 py-2 text-sm text-white focus:outline-none focus:border-nexus-purple transition-colors font-mono"
        />
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
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {tasks.map((task) => {
          const isOverdue = !task.completed && new Date() > task.deadline;
          return (
            <div
              key={task.id}
              className={`group flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer ${
                isOverdue
                  ? "bg-gradient-to-r from-red-900/20 to-transparent border-l-2 border-l-red-500"
                  : ""
              }`}
              onClick={() => toggleTask(task.id)}
            >
              {task.completed ? (
                <CheckCircle2 size={18} className="text-nexus-teal" />
              ) : isOverdue ? (
                <AlertTriangle
                  size={18}
                  className="text-red-500 animate-pulse"
                />
              ) : (
                <Circle
                  size={18}
                  className="text-gray-500 group-hover:text-nexus-purple"
                />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-all ${getStatusColor(
                    task
                  )}`}
                >
                  {task.title}
                </p>
                <p
                  className={`text-[10px] font-mono ${
                    isOverdue ? "text-red-300" : "text-gray-500"
                  }`}
                >
                  {task.deadline.toLocaleDateString()} •{" "}
                  {task.priority.toUpperCase()}
                </p>
              </div>
            </div>
          );
        })}
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
