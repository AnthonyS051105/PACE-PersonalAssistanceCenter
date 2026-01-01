"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
  CheckSquare,
  BrainCircuit,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Save,
  Check,
} from "lucide-react";

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`w-12 h-6 rounded-full transition-colors relative ${
      enabled ? "bg-nexus-purple" : "bg-white/20"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <div
      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
        enabled ? "translate-x-7" : "translate-x-1"
      }`}
    />
  </button>
);

// Notification Setting Row
const NotificationRow = ({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
  disabled,
}) => (
  <div className="flex items-center justify-between py-4 border-b border-card-border last:border-0">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-white/5">
        <Icon size={20} className="text-nexus-teal" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onChange} disabled={disabled} />
  </div>
);

export default function PreferencesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification preferences state
  const [preferences, setPreferences] = useState({
    // Email notifications
    emailTaskReminders: true,
    emailEventReminders: true,
    emailWeeklyDigest: false,
    emailAiSuggestions: false,

    // Push notifications
    pushEnabled: true,
    pushTaskReminders: true,
    pushEventReminders: true,
    pushAiInsights: true,

    // WhatsApp notifications
    whatsappEnabled: false,
    whatsappTaskReminders: false,
    whatsappEventReminders: false,

    // Sound settings
    soundEnabled: true,
    soundVolume: 70,

    // Reminder timing
    defaultReminderTime: 30, // minutes before
    dailyDigestTime: "09:00",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pace_notification_preferences");
    if (saved) {
      setPreferences((prev) => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Save to localStorage
    localStorage.setItem(
      "pace_notification_preferences",
      JSON.stringify(preferences)
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSaving(false);
    setSaved(true);

    // Reset saved indicator after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const reminderOptions = [
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 1440, label: "1 day" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-nexus-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nexus-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-deep text-foreground p-4 md:p-8 font-sans">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nexus-teal/10 rounded-full blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl transition-colors shadow-lg shadow-nexus-purple/20"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <Bell size={24} className="text-nexus-teal" />
                Notifications
              </h1>
              <p className="text-sm text-text-secondary">
                Manage how you receive updates
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-nexus-purple hover:bg-nexus-purple/80 text-white"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </motion.div>

        {/* Push Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Monitor size={20} className="text-nexus-purple" />
            <h2 className="text-lg font-semibold text-text-primary">
              Push Notifications
            </h2>
          </div>

          <div className="space-y-0">
            <NotificationRow
              icon={Bell}
              title="Enable Push Notifications"
              description="Receive notifications in your browser"
              enabled={preferences.pushEnabled}
              onChange={(v) => updatePreference("pushEnabled", v)}
            />
            <NotificationRow
              icon={CheckSquare}
              title="Task Reminders"
              description="Get notified before tasks are due"
              enabled={preferences.pushTaskReminders}
              onChange={(v) => updatePreference("pushTaskReminders", v)}
              disabled={!preferences.pushEnabled}
            />
            <NotificationRow
              icon={Calendar}
              title="Event Reminders"
              description="Get notified before calendar events"
              enabled={preferences.pushEventReminders}
              onChange={(v) => updatePreference("pushEventReminders", v)}
              disabled={!preferences.pushEnabled}
            />
            <NotificationRow
              icon={BrainCircuit}
              title="AI Insights"
              description="Receive AI-powered suggestions and tips"
              enabled={preferences.pushAiInsights}
              onChange={(v) => updatePreference("pushAiInsights", v)}
              disabled={!preferences.pushEnabled}
            />
          </div>
        </motion.div>

        {/* Email Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail size={20} className="text-nexus-purple" />
            <h2 className="text-lg font-semibold text-text-primary">
              Email Notifications
            </h2>
          </div>

          <div className="space-y-0">
            <NotificationRow
              icon={CheckSquare}
              title="Task Reminders"
              description="Receive email reminders for upcoming tasks"
              enabled={preferences.emailTaskReminders}
              onChange={(v) => updatePreference("emailTaskReminders", v)}
            />
            <NotificationRow
              icon={Calendar}
              title="Event Reminders"
              description="Receive email reminders for calendar events"
              enabled={preferences.emailEventReminders}
              onChange={(v) => updatePreference("emailEventReminders", v)}
            />
            <NotificationRow
              icon={Mail}
              title="Weekly Digest"
              description="Get a weekly summary of your productivity"
              enabled={preferences.emailWeeklyDigest}
              onChange={(v) => updatePreference("emailWeeklyDigest", v)}
            />
            <NotificationRow
              icon={BrainCircuit}
              title="AI Suggestions"
              description="Receive AI-powered productivity tips via email"
              enabled={preferences.emailAiSuggestions}
              onChange={(v) => updatePreference("emailAiSuggestions", v)}
            />
          </div>
        </motion.div>

        {/* WhatsApp Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare size={20} className="text-nexus-purple" />
            <h2 className="text-lg font-semibold text-text-primary">
              WhatsApp Notifications
            </h2>
          </div>

          <div className="space-y-0">
            <NotificationRow
              icon={Smartphone}
              title="Enable WhatsApp"
              description="Receive notifications via WhatsApp"
              enabled={preferences.whatsappEnabled}
              onChange={(v) => updatePreference("whatsappEnabled", v)}
            />
            <NotificationRow
              icon={CheckSquare}
              title="Task Reminders"
              description="Get WhatsApp messages for task reminders"
              enabled={preferences.whatsappTaskReminders}
              onChange={(v) => updatePreference("whatsappTaskReminders", v)}
              disabled={!preferences.whatsappEnabled}
            />
            <NotificationRow
              icon={Calendar}
              title="Event Reminders"
              description="Get WhatsApp messages for event reminders"
              enabled={preferences.whatsappEventReminders}
              onChange={(v) => updatePreference("whatsappEventReminders", v)}
              disabled={!preferences.whatsappEnabled}
            />
          </div>
        </motion.div>

        {/* Sound & Timing Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card-bg border border-card-border rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-nexus-purple" />
            <h2 className="text-lg font-semibold text-text-primary">
              Sound & Timing
            </h2>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-card-border">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5">
                {preferences.soundEnabled ? (
                  <Volume2 size={20} className="text-nexus-teal" />
                ) : (
                  <VolumeX size={20} className="text-text-secondary" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">
                  Notification Sound
                </h4>
                <p className="text-xs text-text-secondary">
                  Play sound for notifications
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={preferences.soundEnabled}
              onChange={(v) => updatePreference("soundEnabled", v)}
            />
          </div>

          {/* Sound Volume */}
          {preferences.soundEnabled && (
            <div className="py-4 border-b border-card-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Volume</span>
                <span className="text-sm text-text-primary">
                  {preferences.soundVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.soundVolume}
                onChange={(e) =>
                  updatePreference("soundVolume", parseInt(e.target.value))
                }
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-nexus-purple"
              />
            </div>
          )}

          {/* Default Reminder Time */}
          <div className="py-4 border-b border-card-border">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Default Reminder Time
            </label>
            <select
              value={preferences.defaultReminderTime}
              onChange={(e) =>
                updatePreference(
                  "defaultReminderTime",
                  parseInt(e.target.value)
                )
              }
              className="w-full bg-input-bg border border-card-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-nexus-purple transition-colors appearance-none cursor-pointer"
            >
              {reminderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} before
                </option>
              ))}
            </select>
          </div>

          {/* Daily Digest Time */}
          <div className="py-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Daily Digest Time
            </label>
            <input
              type="time"
              value={preferences.dailyDigestTime}
              onChange={(e) =>
                updatePreference("dailyDigestTime", e.target.value)
              }
              className="w-full bg-input-bg border border-card-border rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-nexus-purple transition-colors"
            />
            <p className="text-xs text-text-secondary mt-1">
              When to receive your daily summary
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
