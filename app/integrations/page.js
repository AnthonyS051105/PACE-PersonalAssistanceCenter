"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import {
  ArrowLeft,
  LayoutGrid,
  Check,
  ExternalLink,
  Zap,
  Calendar,
  MessageSquare,
  Cloud,
  Github,
  Slack,
  Bell,
  Link,
  Unlink,
} from "lucide-react";

// Integration card component
const IntegrationCard = ({ integration, onConnect, onDisconnect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-card-bg border border-card-border rounded-2xl p-6 backdrop-blur-xl hover:border-nexus-purple/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${
            integration.connected ? "bg-nexus-purple/20" : "bg-white/5"
          } transition-colors`}
        >
          <integration.icon
            size={24}
            className={
              integration.connected
                ? "text-nexus-purple"
                : "text-text-secondary"
            }
          />
        </div>
        {integration.connected && (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
            <Check size={12} />
            Connected
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {integration.name}
      </h3>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {integration.description}
      </p>

      <div className="flex items-center gap-2">
        {integration.connected ? (
          <>
            <button
              onClick={() => onDisconnect(integration.id)}
              className="flex-1 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Unlink size={14} />
              Disconnect
            </button>
            <button
              className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary rounded-lg transition-colors"
              title="Open settings"
            >
              <ExternalLink size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(integration.id)}
            className="flex-1 py-2 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Link size={14} />
            Connect
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default function IntegrationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Sample integrations data
  const [integrations, setIntegrations] = useState([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description:
        "Sync your events and schedule with Google Calendar for seamless planning.",
      icon: Calendar,
      category: "productivity",
      connected: false,
    },
    {
      id: "slack",
      name: "Slack",
      description:
        "Get notifications and updates directly in your Slack workspace.",
      icon: Slack,
      category: "communication",
      connected: false,
    },
    {
      id: "github",
      name: "GitHub",
      description:
        "Track commits, PRs, and issues from your GitHub repositories.",
      icon: Github,
      category: "development",
      connected: false,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description:
        "Receive task reminders and notifications via WhatsApp messages.",
      icon: MessageSquare,
      category: "communication",
      connected: false,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description:
        "Store and sync your vault files with Dropbox cloud storage.",
      icon: Cloud,
      category: "storage",
      connected: false,
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automate workflows by connecting PACE with 5000+ apps.",
      icon: Zap,
      category: "automation",
      connected: false,
    },
    {
      id: "push-notifications",
      name: "Push Notifications",
      description: "Enable browser push notifications for important updates.",
      icon: Bell,
      category: "notifications",
      connected: true,
    },
  ]);

  const categories = [
    { id: "all", label: "All" },
    { id: "productivity", label: "Productivity" },
    { id: "communication", label: "Communication" },
    { id: "development", label: "Development" },
    { id: "storage", label: "Storage" },
    { id: "automation", label: "Automation" },
    { id: "notifications", label: "Notifications" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  const handleConnect = (integrationId) => {
    // In a real app, this would initiate OAuth flow or API connection
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId ? { ...int, connected: true } : int
      )
    );
  };

  const handleDisconnect = (integrationId) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId ? { ...int, connected: false } : int
      )
    );
  };

  const filteredIntegrations = integrations.filter((int) => {
    const matchesCategory =
      activeCategory === "all" || int.category === activeCategory;
    const matchesSearch =
      int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter((int) => int.connected).length;

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

      <div className="relative z-10 max-w-5xl mx-auto">
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
                <LayoutGrid size={24} className="text-nexus-teal" />
                Integrations
              </h1>
              <p className="text-sm text-text-secondary">
                {connectedCount} of {integrations.length} integrations connected
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="w-full bg-input-bg border border-card-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-nexus-purple transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-nexus-purple text-white"
                      : "bg-card-bg border border-card-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <LayoutGrid
              size={48}
              className="mx-auto text-text-secondary mb-4"
            />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No integrations found
            </h3>
            <p className="text-text-secondary">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-linear-to-br from-nexus-purple/10 to-nexus-teal/10 border border-card-border rounded-2xl p-8 text-center"
        >
          <Zap size={32} className="mx-auto text-nexus-teal mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">
            More Integrations Coming Soon
          </h3>
          <p className="text-text-secondary max-w-md mx-auto">
            We're constantly adding new integrations to help you work smarter.
            Have a suggestion? Let us know!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
