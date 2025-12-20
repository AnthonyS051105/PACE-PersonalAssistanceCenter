"use client";

import { motion } from "framer-motion";
import Editor from "../components/Editor";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-nexus-deep text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-purple/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nexus-teal/20 rounded-full blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-nexus-teal to-nexus-purple">
              P A C E
            </h1>
            <p className="text-nexus-teal/80 font-mono mt-2">
              PERSONAL ASSISTANCE CENTER
            </p>
          </div>
          <div className="flex gap-4">
            {/* Placeholder for Auth/Profile */}
            <div className="w-10 h-10 rounded-full bg-nexus-glass border border-nexus-glassBorder flex items-center justify-center">
              <span className="font-bold">U</span>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* Agenda / Calendar - Large Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-md hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nexus-purple"></span>
              Agenda & Calendar
            </h2>
            <div className="h-full flex items-center justify-center text-white/40 font-mono">
              [Calendar Component Placeholder]
            </div>
          </motion.div>

          {/* Tasks - Tall Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-md hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nexus-teal"></span>
              Tasks
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-nexus-dark/50 rounded-xl border border-nexus-glassBorder">
                <div className="text-sm font-medium">
                  Complete Project Refactor
                </div>
                <div className="text-xs text-nexus-teal mt-1">Today</div>
              </div>
              <div className="p-3 bg-nexus-dark/50 rounded-xl border border-nexus-glassBorder">
                <div className="text-sm font-medium">Review Lecture Notes</div>
                <div className="text-xs text-nexus-teal mt-1">Tomorrow</div>
              </div>
            </div>
          </motion.div>

          {/* AI Assistant - Square Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-gradient-to-br from-nexus-purple/20 to-nexus-deep border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-nexus-purple/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl font-semibold mb-2">Gemini AI</h2>
            <p className="text-sm text-white/60">Ask me anything...</p>
            <div className="mt-4 p-2 bg-nexus-dark/50 rounded-lg border border-nexus-glassBorder text-xs font-mono text-nexus-teal">
              Ready to assist.
            </div>
          </motion.div>

          {/* Notes - Wide Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-md hover:bg-white/5 transition-colors overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              Quick Notes
            </h2>
            <div className="bg-nexus-dark/30 rounded-xl border border-nexus-glassBorder p-3 text-sm text-white/80">
              <Editor />
            </div>
          </motion.div>

          {/* Storage / Links - Square Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-6 backdrop-blur-md hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-4">Storage</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-nexus-dark/50 rounded-lg flex items-center justify-center border border-nexus-glassBorder hover:border-nexus-teal transition-colors cursor-pointer">
                <span className="text-xs">Docs</span>
              </div>
              <div className="aspect-square bg-nexus-dark/50 rounded-lg flex items-center justify-center border border-nexus-glassBorder hover:border-nexus-teal transition-colors cursor-pointer">
                <span className="text-xs">Drive</span>
              </div>
            </div>
          </motion.div>

          {/* 3D Element Placeholder - Temporarily Removed */}
          {/* <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-nexus-glass border border-nexus-glassBorder rounded-3xl p-0 backdrop-blur-md overflow-hidden relative"
          >
             <Scene />
          </motion.div> */}
        </div>
      </div>
    </main>
  );
}
