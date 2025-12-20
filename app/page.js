"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  BrainCircuit,
  Database,
  Cpu,
  LayoutGrid,
  Search,
} from "lucide-react";
import BentoCard from "../components/BentoCard";
import Agenda from "../components/Agenda";
import Tasks from "../components/Tasks";
import AIChat from "../components/AIChat";
import Notes from "../components/Notes";
import Vault from "../components/Vault";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-nexus-deep text-white p-4 md:p-8 font-sans selection:bg-nexus-purple selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nexus-teal/10 rounded-full blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        {/* Header / Nav */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
        >
          {/* Logo & Title */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/logo.svg"
                  alt="PACE Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-nexus-deep" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-nexus-teal to-nexus-purple">
                PACE
              </h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] uppercase">
                Personal Assistance Center
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="flex-1 max-w-md mx-4 relative hidden md:block"
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Global Search..."
              className="w-full bg-nexus-glass border border-nexus-glassBorder rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-nexus-teal transition-all"
            />
          </motion.div>

          {/* Right Side: Tabs + User */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 bg-nexus-glass border border-nexus-glassBorder rounded-full p-1 backdrop-blur-md">
              {["dashboard", "calendar", "tasks"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                      px-4 py-2 rounded-full text-xs font-medium transition-all
                      ${
                        activeTab === tab
                          ? "bg-white/10 text-white shadow-inner"
                          : "text-gray-400 hover:text-white"
                      }
                   `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-nexus-purple to-nexus-teal flex items-center justify-center border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform">
              <span className="font-bold text-white">U</span>
            </div>
          </motion.div>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 h-full pb-2 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 h-full"
              >
                {/* 1. AI Core (Large, spans 2 rows) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-2"
                  rowSpan="md:row-span-2"
                  title="Nexus AI Core"
                  icon={<BrainCircuit />}
                  glowColor="rgba(115, 42, 223, 0.4)"
                >
                  <AIChat />
                </BentoCard>

                {/* 2. Agenda (Tall) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-1"
                  rowSpan="md:row-span-2"
                  title="Timeline"
                  icon={<Calendar />}
                  glowColor="rgba(101, 187, 189, 0.3)"
                >
                  <Agenda />
                </BentoCard>

                {/* 3. Tasks (Standard) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-1"
                  rowSpan="md:row-span-1"
                  title="Missions"
                  icon={<CheckSquare />}
                  glowColor="rgba(255, 100, 100, 0.2)"
                >
                  <Tasks />
                </BentoCard>

                {/* 4. Quick Vault (Standard) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-1"
                  rowSpan="md:row-span-1"
                  title="Data Vault"
                  icon={<Database />}
                >
                  <Vault />
                </BentoCard>

                {/* 5. Notes (Wide) */}
                <BentoCard
                  variants={itemVariants}
                  colSpan="md:col-span-4"
                  rowSpan="md:row-span-1"
                  title="Neural Notes"
                  icon={<LayoutGrid />}
                  glowColor="rgba(255, 255, 255, 0.1)"
                >
                  <div className="h-full flex gap-4">
                    <div className="w-full md:w-3/4 h-full">
                      <Notes />
                    </div>
                    {/* Decorative Panel within Notes for aesthetics */}
                    <div className="hidden md:flex w-1/4 h-full items-center justify-center border-l border-white/5 pl-4">
                      <div className="text-center opacity-50">
                        <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent">
                          {new Date().getHours()}:
                          {new Date().getMinutes().toString().padStart(2, "0")}
                        </div>
                        <div className="text-[10px] tracking-[0.3em] uppercase mt-2 text-nexus-teal">
                          System Optimal
                        </div>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="h-full bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-nexus-teal" />
                  Full Timeline
                </h2>
                <div className="flex-1 overflow-hidden">
                  <Agenda />
                </div>
              </motion.div>
            )}

            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="h-full bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-xl overflow-hidden flex flex-col"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckSquare className="text-nexus-teal" />
                  Mission Control
                </h2>
                <div className="flex-1 overflow-hidden">
                  <Tasks />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;
