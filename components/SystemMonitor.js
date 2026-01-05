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
  Calendar,
  Clock,
} from "lucide-react";

const SystemMonitor = ({ tasks = [], monitorPrefs = null }) => {
  const [time, setTime] = useState(null);
  const [weather, setWeather] = useState({
    temp: "--",
    condition: "Scanning...",
  });
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Load preferences from localStorage if not provided
  const defaults = {
    showWeather: true,
    showTime: true,
    showTaskSummary: true,
    showTaskCarousel: false,
    taskAlertDays: 7,
    urgentThreshold: 3,
    layout: "default",
  };

  const prefs = (() => {
    if (monitorPrefs) {
      // If prefs provided, merge with defaults
      return { ...defaults, ...monitorPrefs };
    }

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_monitor_prefs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...defaults, ...parsed };
        } catch (e) {
          console.error("Failed to parse monitor prefs:", e);
          return defaults;
        }
      }
    }
    return defaults;
  })();

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

  // Carousel auto-rotation effect
  useEffect(() => {
    if (prefs.showTaskCarousel) {
      const carouselTimer = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % 4); // 4 cards: 1 day, 3 days, 7 days, 14 days
      }, 4000); // Change every 4 seconds

      return () => clearInterval(carouselTimer);
    }
  }, [prefs.showTaskCarousel]);

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

  // Calculate Real Stats based on preferences
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Calculate urgent tasks based on urgentThreshold from preferences
  const getTasksWithinDays = (days) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return tasks.filter((t) => {
      if (t.completed) return false;
      const deadline = new Date(t.deadline);
      return deadline <= futureDate && deadline >= now;
    });
  };

  const urgentTasks = getTasksWithinDays(prefs.urgentThreshold).length;
  const upcomingTasks = getTasksWithinDays(prefs.taskAlertDays).length;

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

  // Carousel task groups
  const carouselGroups = [
    { days: 1, label: "Tomorrow", color: "text-red-400" },
    { days: 3, label: "3 Days", color: "text-amber-400" },
    { days: 7, label: "This Week", color: "text-yellow-400" },
    { days: 14, label: "2 Weeks", color: "text-nexus-teal" },
  ];

  const getCarouselTasks = (days) => {
    return getTasksWithinDays(days).slice(0, 3); // Show max 3 tasks per card
  };

  const currentCarouselGroup = carouselGroups[carouselIndex];
  const currentCarouselTasks = getCarouselTasks(currentCarouselGroup.days);

  return (
    <div
      className={`flex ${
        prefs.layout === "compact" ? "flex-row" : "flex-col md:flex-row"
      } items-center justify-between h-full px-2 gap-4 md:gap-0`}
    >
      {/* Left: Date & Location */}
      {(prefs.showTime || prefs.showWeather) && (
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <div className="p-3 bg-input-bg rounded-xl border border-card-border">
            <CloudSun
              size={prefs.layout === "compact" ? 20 : 24}
              className="text-nexus-teal"
            />
          </div>
          <div>
            {prefs.showTime && (
              <h2
                className={`${
                  prefs.layout === "compact" ? "text-lg" : "text-xl"
                } font-bold text-text-primary tracking-wide`}
              >
                {time ? formatDate(time) : "Loading..."}
              </h2>
            )}
            {prefs.showWeather && (
              <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
                <span>Jakarta, ID</span>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>
                  {weather.temp}°C {weather.condition}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Center: Big Clock */}
      {prefs.showTime && (
        <div className="flex flex-col items-center justify-center w-full md:w-1/3">
          <div
            className={`${
              prefs.layout === "compact"
                ? "text-3xl md:text-4xl"
                : prefs.layout === "detailed"
                ? "text-6xl md:text-7xl"
                : "text-5xl md:text-6xl"
            } font-mono font-bold text-transparent bg-clip-text bg-linear-to-b from-text-primary to-text-secondary tracking-tighter`}
          >
            {time ? formatTime(time) : "00:00"}
            <span
              className={`${
                prefs.layout === "compact" ? "text-sm" : "text-lg md:text-xl"
              } text-nexus-purple ml-1 animate-pulse`}
            >
              {time ? time.getSeconds().toString().padStart(2, "0") : "00"}
            </span>
          </div>
          <div className="text-[10px] tracking-[0.3em] text-nexus-teal uppercase mt-1">
            System Optimal
          </div>
        </div>
      )}

      {/* Right: Task Carousel OR Task Stats */}
      {prefs.showTaskCarousel ? (
        <div className="flex flex-col gap-2 w-full md:w-1/3 items-end">
          {/* Carousel Header */}
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary mb-1">
            <Calendar size={14} className={currentCarouselGroup.color} />
            <span
              className={`font-bold uppercase ${currentCarouselGroup.color}`}
            >
              Due: {currentCarouselGroup.label}
            </span>
            <div className="flex gap-1 ml-2">
              {carouselGroups.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === carouselIndex
                      ? "bg-nexus-purple w-3"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Carousel Tasks */}
          <div className="w-full max-w-50 bg-input-bg/50 rounded-xl p-3 border border-card-border min-h-[80px]">
            {currentCarouselTasks.length > 0 ? (
              <div className="space-y-2">
                {currentCarouselTasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className="flex items-start gap-2 text-xs animate-fadeIn"
                  >
                    <div
                      className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        currentCarouselGroup.days === 1
                          ? "bg-red-400"
                          : currentCarouselGroup.days === 3
                          ? "bg-amber-400"
                          : currentCarouselGroup.days === 7
                          ? "bg-yellow-400"
                          : "bg-nexus-teal"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary font-medium truncate">
                        {task.title || task.text}
                      </div>
                      <div className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                        <Clock size={8} />
                        {new Date(task.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary text-xs">
                <CheckCircle2 size={20} className="text-nexus-teal mb-1" />
                <span>No tasks due</span>
              </div>
            )}
          </div>

          {/* Total count */}
          <div className="text-[10px] text-text-secondary font-mono">
            {getTasksWithinDays(currentCarouselGroup.days).length} task(s)
            within {currentCarouselGroup.days} day(s)
          </div>
        </div>
      ) : prefs.showTaskSummary ? (
        <div className="flex flex-col gap-2 w-full md:w-1/3 items-end">
          {/* Quick Stats Row */}
          <div className="flex items-center gap-3 text-xs font-mono text-text-secondary mb-1">
            <div
              className="flex items-center gap-1"
              title={`Upcoming (${prefs.taskAlertDays} days)`}
            >
              <Target size={14} className="text-nexus-teal" />
              <span>UPCOMING: {upcomingTasks}</span>
            </div>
            <div
              className="flex items-center gap-1"
              title={`Urgent (${prefs.urgentThreshold} days)`}
            >
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
            {prefs.layout !== "compact" && (
              <>
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
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SystemMonitor;
