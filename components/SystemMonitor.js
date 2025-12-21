import React, { useState, useEffect } from "react";
import { Wifi, Battery, CloudSun, Cpu, Activity } from "lucide-react";

const SystemMonitor = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-full px-2 gap-4 md:gap-0">
      {/* Left: Date & Location */}
      <div className="flex items-center gap-4 w-full md:w-1/3">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <CloudSun size={24} className="text-nexus-teal" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {formatDate(time)}
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>Jakarta, ID</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>32°C</span>
          </div>
        </div>
      </div>

      {/* Center: Big Clock */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3">
        <div className="text-5xl md:text-6xl font-mono font-bold text-transparent bg-clip-text bg-linear-to-b from-white to-white/50 tracking-tighter">
          {formatTime(time)}
          <span className="text-lg md:text-xl text-nexus-purple ml-1 animate-pulse">
            {time.getSeconds().toString().padStart(2, "0")}
          </span>
        </div>
        <div className="text-[10px] tracking-[0.3em] text-nexus-teal uppercase mt-1">
          System Optimal
        </div>
      </div>

      {/* Right: System Stats (Visual Only) */}
      <div className="flex flex-col gap-2 w-full md:w-1/3 items-end">
        {/* Connection Status */}
        <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mb-1">
          <div className="flex items-center gap-1">
            <Wifi size={14} className="text-green-400" />
            <span>NET: 5G</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery size={14} className="text-nexus-purple" />
            <span>PWR: 98%</span>
          </div>
        </div>

        {/* Resource Bars */}
        <div className="w-full max-w-50 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-nexus-teal/80 font-bold uppercase">
            <span className="flex items-center gap-1">
              <Cpu size={10} /> CPU Load
            </span>
            <span>12%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-nexus-teal w-[12%] rounded-full shadow-[0_0_10px_#65BBBD]" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-nexus-purple/80 font-bold uppercase mt-1">
            <span className="flex items-center gap-1">
              <Activity size={10} /> Memory
            </span>
            <span>4.2 GB</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-nexus-purple w-[45%] rounded-full shadow-[0_0_10px_#732ADF]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
