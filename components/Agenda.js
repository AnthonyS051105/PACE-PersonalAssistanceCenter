import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const Agenda = ({
  searchQuery = "",
  events = [],
  setEvents,
  isFullPage = false,
  user,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventType, setNewEventType] = useState("personal");

  const titleInputRef = useRef(null);

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calendar Logic
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handlePrevYear = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
    );
  };

  const handleNextYear = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1)
    );
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleDateClick = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    // Don't close add mode if already open, just update date
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;

    const [hours, minutes] = newEventTime.split(":");
    const eventDate = new Date(selectedDate);
    eventDate.setHours(parseInt(hours), parseInt(minutes));

    const newEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      startTime: eventDate,
      endTime: new Date(eventDate.getTime() + 3600000), // +1 hour default
      type: newEventType,
      description: newEventDescription,
    };

    if (setEvents) {
      setEvents([...events, newEvent]);
    }

    if (user) {
      supabase
        .from("calendar_events")
        .insert({
          user_id: user.id,
          title: newEvent.title,
          start_time: newEvent.startTime.toISOString(),
          end_time: newEvent.endTime.toISOString(), // Assuming 1 hour duration logic from above
          type: newEvent.type,
          description: newEvent.description,
        })
        .select()
        .then(({ data }) => {
          if (data && data[0] && setEvents) {
            // Update ID
            setEvents((prev) =>
              prev.map((e) =>
                e.id === newEvent.id ? { ...e, id: data[0].id } : e
              )
            );
          }
        });
    }

    setNewEventTitle("");
    setNewEventDescription("");
    setIsAddingEvent(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddEvent();
    }
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.type &&
        event.type.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchQuery) return matchesSearch;

    return isSameDay(eventDate, selectedDate);
  });

  // Generate Calendar Grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = [];

  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      i
    );
    const isSelected = isSameDay(dateToCheck, selectedDate);
    const isToday = isSameDay(dateToCheck, new Date());
    const hasEvent = events.some((e) =>
      isSameDay(new Date(e.startTime), dateToCheck)
    );

    calendarDays.push(
      <div
        key={i}
        onClick={() => handleDateClick(i)}
        className={`
          h-8 w-8 flex items-center justify-center text-xs rounded-full mx-auto cursor-pointer relative group transition-all duration-200
          ${
            isSelected
              ? "bg-nexus-purple text-white shadow-lg shadow-nexus-purple/50 scale-110"
              : isToday
              ? "border border-nexus-teal text-nexus-teal"
              : "text-text-secondary hover:bg-white/10 hover:text-white hover:scale-110"
          }
        `}
      >
        {i}
        {hasEvent && !isSelected && (
          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-nexus-teal" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Calendar Header */}
      {!searchQuery && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevYear}
              className="p-1 hover:bg-white/10 rounded text-text-secondary text-[10px] transition-colors"
              title="Previous Year"
            >
              «
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/10 rounded text-text-secondary transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-bold text-text-primary w-32 text-center select-none">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/10 rounded text-text-secondary transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              onClick={handleNextYear}
              className="p-1 hover:bg-white/10 rounded text-text-secondary text-[10px] transition-colors"
              title="Next Year"
            >
              »
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {days.map((d) => (
              <div
                key={d}
                className="text-[10px] text-text-secondary font-mono opacity-50"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">{calendarDays}</div>
          <div className="h-px w-full bg-card-border my-4" />
        </div>
      )}

      {/* Agenda List Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-widest text-text-secondary font-bold">
          {searchQuery
            ? "Search Results"
            : selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
        </h4>
        {!searchQuery && (
          <button
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-nexus-purple/20 text-nexus-purple hover:bg-nexus-purple hover:text-white transition-all text-[10px] font-bold"
          >
            <Plus size={12} />
            ADD EVENT
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="relative pl-4 border-l-2 border-nexus-teal/30 group hover:border-nexus-teal transition-colors"
            >
              <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-nexus-teal shadow-[0_0_8px_#65BBBD] group-hover:scale-125 transition-transform" />
              <h5 className="text-sm font-semibold text-text-primary">
                {event.title}
              </h5>
              <span className="text-xs text-nexus-purple font-mono flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                {new Date(event.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="mt-1">
                <span className="text-[10px] bg-input-bg px-2 py-0.5 rounded text-text-secondary border border-white/5">
                  {event.type}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-text-secondary text-xs flex flex-col items-center gap-2 opacity-50">
            <CalendarIcon size={24} />
            <span>No events for this day</span>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddingEvent && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={
              isFullPage
                ? "absolute inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-nexus-deep/95 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl"
                : "absolute inset-0 z-50 bg-nexus-deep/95 backdrop-blur-xl flex flex-col p-4 rounded-3xl"
            }
          >
            <div className={isFullPage ? "w-full flex flex-col" : "contents"}>
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`${
                    isFullPage ? "text-xl" : "text-lg"
                  } font-bold text-white`}
                >
                  New Event
                </h3>
                <button
                  onClick={() => setIsAddingEvent(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-text-secondary hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className={`space-y-3 ${
                  isFullPage
                    ? ""
                    : "flex-1 overflow-y-auto custom-scrollbar pr-1"
                }`}
              >
                <div>
                  <label
                    className={`${
                      isFullPage ? "text-xs" : "text-[10px]"
                    } uppercase tracking-wider text-text-secondary font-bold mb-1 block`}
                  >
                    Title
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    placeholder="Event Title"
                    className={`w-full bg-input-bg border border-white/10 rounded-xl ${
                      isFullPage ? "px-4 py-3 text-base" : "px-3 py-2 text-sm"
                    } text-white focus:outline-none focus:border-nexus-purple transition-colors`}
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`${
                        isFullPage ? "text-xs" : "text-[10px]"
                      } uppercase tracking-wider text-text-secondary font-bold mb-1 block`}
                    >
                      Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        className={`w-full bg-input-bg border border-white/10 rounded-xl ${
                          isFullPage
                            ? "px-4 py-3 text-base"
                            : "px-3 py-2 text-sm"
                        } text-white focus:outline-none focus:border-nexus-purple transition-colors appearance-none`}
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Clock
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`${
                        isFullPage ? "text-xs" : "text-[10px]"
                      } uppercase tracking-wider text-text-secondary font-bold mb-1 block`}
                    >
                      Type
                    </label>
                    <select
                      className={`w-full bg-input-bg border border-white/10 rounded-xl ${
                        isFullPage ? "px-4 py-3 text-base" : "px-3 py-2 text-sm"
                      } text-white focus:outline-none focus:border-nexus-purple transition-colors appearance-none`}
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value)}
                      onKeyDown={handleKeyDown}
                    >
                      <option
                        value="personal"
                        className="bg-gray-900 text-white"
                      >
                        Personal
                      </option>
                      <option value="work" className="bg-gray-900 text-white">
                        Work
                      </option>
                      <option value="study" className="bg-gray-900 text-white">
                        Study
                      </option>
                      <option
                        value="meeting"
                        className="bg-gray-900 text-white"
                      >
                        Meeting
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className={`${
                      isFullPage ? "text-xs" : "text-[10px]"
                    } uppercase tracking-wider text-text-secondary font-bold mb-1 block`}
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add details..."
                    className={`w-full bg-input-bg border border-white/10 rounded-xl ${
                      isFullPage
                        ? "px-4 py-3 text-base h-32"
                        : "px-3 py-2 text-sm h-20"
                    } text-white focus:outline-none focus:border-nexus-purple transition-colors resize-none`}
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddEvent();
                      }
                    }}
                  />
                  <p
                    className={`${
                      isFullPage ? "text-xs" : "text-[10px]"
                    } text-text-secondary mt-1 text-right`}
                  >
                    Shift + Enter for new line
                  </p>
                </div>

                <div className="pt-2 pb-1">
                  <button
                    onClick={handleAddEvent}
                    className={`w-full bg-nexus-purple hover:bg-nexus-purple/80 text-white font-bold ${
                      isFullPage ? "py-3 text-base" : "py-2 text-sm"
                    } rounded-xl transition-colors shadow-lg shadow-nexus-purple/20`}
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Agenda;
