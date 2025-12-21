import React, { useState, useEffect } from "react";
import {
  Wifi,
  Battery,
  CloudSun,
  Cpu,
  Activity,
  CheckCircle2,
  AlertCircle,
  Target,
  Zap,
} from "lucide-react";

const SystemMonitor = ({ tasks = [] }) => {
  const [time, setTime] = useState(null);
  const [weather, setWeather] = useState({
    temp: "--",
    condition: "Scanning...",
  });

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Fetch Weather for Jakarta
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current=temperature_2m,weather_code&timezone=Asia%2FJakarta"
        );
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition: getWeatherCondition(data.current.weather_code),
        });
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 600000); // Every 10 mins

    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  const getWeatherCondition = (code) => {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Unknown";
  };

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

  // Calculate Real Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const urgentTasks = tasks.filter(
    (t) => !t.completed && t.priority === "high"
  ).length;

  // Mission Progress
  const missionProgressPercent =
    totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  const missionProgressText = `${completedTasks}/${totalTasks}`;

  // Daily Progress
  const isToday = (dateObj) => {
    const date = new Date(dateObj);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todaysTasks = tasks.filter((t) => isToday(t.deadline));
  const totalToday = todaysTasks.length;
  const completedToday = todaysTasks.filter((t) => t.completed).length;

  let dailyProgressPercent = 0;
  let dailyProgressText = "";

  if (totalToday === 0) {
    dailyProgressPercent = 100;
    dailyProgressText = "No tasks today";
  } else {
    dailyProgressPercent = (completedToday / totalToday) * 100;
    dailyProgressText = `${completedToday}/${totalToday}`;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-full px-2 gap-4 md:gap-0">
      {/* Left: Date & Location */}
      <div className="flex items-center gap-4 w-full md:w-1/3">
        <div className="p-3 bg-input-bg rounded-xl border border-card-border">
          <CloudSun size={24} className="text-nexus-teal" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-wide">
            {time ? formatDate(time) : "Loading..."}
          </h2>
          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
            <span>Jakarta, ID</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>
              {weather.temp}°C {weather.condition}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Big Clock */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3">
        <div className="text-5xl md:text-6xl font-mono font-bold text-transparent bg-clip-text bg-linear-to-b from-text-primary to-text-secondary tracking-tighter">
          {time ? formatTime(time) : "00:00"}
          <span className="text-lg md:text-xl text-nexus-purple ml-1 animate-pulse">
            {time ? time.getSeconds().toString().padStart(2, "0") : "00"}
          </span>
        </div>
        <div className="text-[10px] tracking-[0.3em] text-nexus-teal uppercase mt-1">
          System Optimal
        </div>
      </div>

      {/* Right: Real Task Stats */}
      <div className="flex flex-col gap-2 w-full md:w-1/3 items-end">
        {/* Quick Stats Row */}
        <div className="flex items-center gap-3 text-xs font-mono text-text-secondary mb-1">
          <div className="flex items-center gap-1" title="Pending Missions">
            <Target size={14} className="text-nexus-teal" />
            <span>PENDING: {pendingTasks}</span>
          </div>
          <div className="flex items-center gap-1" title="Urgent Missions">
            <AlertCircle size={14} className="text-amber-500" />
            <span>URGENT: {urgentTasks}</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="w-full max-w-50 space-y-1.5">
          {/* Mission Progress */}
          <div className="flex items-center justify-between text-[10px] text-nexus-teal/80 font-bold uppercase">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} /> Mission Progress
            </span>
            <span>{missionProgressText}</span>
          </div>
          <div className="w-full h-1.5 bg-input-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-nexus-teal rounded-full shadow-[0_0_10px_#65BBBD] transition-all duration-500"
              style={{ width: `${missionProgressPercent}%` }}
            />
          </div>

          {/* Daily Progress */}
          <div className="flex items-center justify-between text-[10px] text-nexus-purple/80 font-bold uppercase mt-1">
            <span className="flex items-center gap-1">
              <Zap size={10} /> Daily Goals
            </span>
            <span>{dailyProgressText}</span>
          </div>
          <div className="w-full h-1.5 bg-input-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-nexus-purple rounded-full shadow-[0_0_10px_#732ADF] transition-all duration-500"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
