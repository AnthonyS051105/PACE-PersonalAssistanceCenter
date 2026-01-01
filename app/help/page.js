"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import {
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Lightbulb,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Calendar,
  BrainCircuit,
  Database,
  FileText,
  Palette,
  Zap,
  Mail,
  ExternalLink,
} from "lucide-react";

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border border-card-border rounded-xl overflow-hidden">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
    >
      <span className="font-medium text-text-primary">{question}</span>
      <ChevronDown
        size={18}
        className={`text-text-secondary transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Feature Guide Card
const FeatureCard = ({ icon: Icon, title, description, steps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg border border-card-border rounded-2xl p-5 backdrop-blur-xl"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-nexus-purple/20 text-nexus-purple">
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
          </div>
          <ChevronRight
            size={18}
            className={`text-text-secondary transition-transform mt-1 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && steps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-card-border"
          >
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              How to use
            </h4>
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-nexus-purple/20 text-nexus-purple text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-text-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function HelpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("guide");
  const [openFAQ, setOpenFAQ] = useState(null);

  const tabs = [
    { id: "guide", label: "Feature Guide", icon: BookOpen },
    { id: "tips", label: "Tips & Tricks", icon: Lightbulb },
    { id: "faq", label: "FAQ", icon: MessageCircle },
  ];

  const features = [
    {
      icon: CheckSquare,
      title: "Missions (Tasks)",
      description: "Manage your daily tasks and to-dos with smart reminders.",
      steps: [
        'Click "Add Task" or press the + button to create a new task',
        "Set a title, deadline, priority level, and optional tags",
        "Enable reminders to get notified before deadlines",
        "Click the checkbox to mark tasks as complete",
        "Use filters to view tasks by priority or status",
      ],
    },
    {
      icon: Calendar,
      title: "Timeline (Calendar)",
      description: "Schedule events and manage your time effectively.",
      steps: [
        "Navigate to the Timeline section from the dashboard",
        "Click on any date to add a new event",
        "Set the event title, start/end time, and description",
        "Events sync automatically across all your devices",
        "Triple-click on the Timeline card to expand to full view",
      ],
    },
    {
      icon: BrainCircuit,
      title: "AI Assistant",
      description: "Get intelligent help and suggestions powered by AI.",
      steps: [
        "Type your question or request in the chat input",
        "Ask for task suggestions, schedule optimization, or general help",
        "The AI can help summarize notes and generate content",
        "Use natural language - the AI understands context",
        "Chat history is saved for your reference",
      ],
    },
    {
      icon: Database,
      title: "Data Vault",
      description: "Store and organize your important links and files.",
      steps: [
        'Click "Add Item" to store a new link or upload a file',
        "Organize items into categories for easy access",
        "Use the search bar to quickly find stored items",
        "Files are securely stored in the cloud",
        "Share vault items with a generated link",
      ],
    },
    {
      icon: FileText,
      title: "Neural Notes",
      description: "Take rich notes with Markdown support and AI summaries.",
      steps: [
        "Start typing in the notes editor to create content",
        "Use Markdown syntax for formatting (headers, lists, code)",
        "Toggle between Edit, Split, and Preview modes",
        "Upload .md or .txt files to import content",
        'Click "AI Summary" to generate a smart summary',
      ],
    },
    {
      icon: Palette,
      title: "Customization",
      description: "Personalize your dashboard appearance and layout.",
      steps: [
        "Click the palette icon in the header to open settings",
        "Switch between Light and Dark themes",
        "Choose from different accent color palettes",
        'Enable "Edit Layout & Colors" to rearrange widgets',
        "Drag and drop cards to customize your dashboard",
      ],
    },
  ];

  const tips = [
    {
      icon: Zap,
      title: "Keyboard Shortcuts",
      description: "Speed up your workflow with these shortcuts.",
      steps: [
        "⌘/Ctrl + K: Open global search",
        "Escape: Close modals and exit customization mode",
        "Triple-click on cards: Expand to full view",
      ],
    },
    {
      icon: BrainCircuit,
      title: "AI Power Tips",
      description: "Get the most out of the AI assistant.",
      steps: [
        "Be specific with your requests for better responses",
        "Ask the AI to help prioritize your tasks",
        "Use AI to draft emails or documents from your notes",
        "Request schedule suggestions based on your tasks",
      ],
    },
    {
      icon: Database,
      title: "Organization Tips",
      description: "Keep your data organized and accessible.",
      steps: [
        "Create consistent category names in the Vault",
        "Use tags on tasks for easy filtering",
        "Review and archive completed tasks regularly",
        "Use the search feature to find anything quickly",
      ],
    },
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        'Go to Account Settings from your profile menu, then expand the "Change Password" section. Enter your new password and confirm it to update.',
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! All data is encrypted and stored securely using Supabase. Your information is protected with row-level security, meaning only you can access your own data.",
    },
    {
      question: "Can I use PACE offline?",
      answer:
        "Currently, PACE requires an internet connection to sync data and access AI features. Offline support is planned for future updates.",
    },
    {
      question: "How do I change my profile picture?",
      answer:
        "Click on your avatar in the top-right corner, then click your profile picture in the dropdown. You can upload a new image or remove the existing one.",
    },
    {
      question: "What file types can I upload to the Vault?",
      answer:
        "You can upload most common file types including documents (PDF, DOC), images (JPG, PNG, GIF), and other files up to 50MB each.",
    },
    {
      question: "How do task reminders work?",
      answer:
        "When creating a task, enable the reminder option and set your preferred reminder time. You'll receive notifications via your enabled channels (push, email, or WhatsApp).",
    },
    {
      question: "Can I export my data?",
      answer:
        "Data export functionality is coming soon. You'll be able to export your tasks, events, notes, and vault items in various formats.",
    },
    {
      question: "How do I contact support?",
      answer:
        "For bugs or feature requests, please open an issue on our GitHub repository. For other inquiries, you can reach us through the contact options below.",
    },
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="p-2 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl transition-colors shadow-lg shadow-nexus-purple/20"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <HelpCircle size={24} className="text-nexus-teal" />
              Help & Support
            </h1>
            <p className="text-sm text-text-secondary">
              Learn how to get the most out of PACE
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-nexus-purple text-white shadow-lg shadow-nexus-purple/20"
                  : "bg-card-bg border border-card-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "guide" && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <p className="text-text-secondary mb-6">
                Click on any feature below to learn how to use it effectively.
              </p>
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </motion.div>
          )}

          {activeTab === "tips" && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <p className="text-text-secondary mb-6">
                Pro tips to boost your productivity with PACE.
              </p>
              {tips.map((tip, index) => (
                <FeatureCard key={index} {...tip} />
              ))}
            </motion.div>
          )}

          {activeTab === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <p className="text-text-secondary mb-6">
                Frequently asked questions about PACE.
              </p>
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-linear-to-br from-nexus-purple/10 to-nexus-teal/10 border border-card-border rounded-2xl p-8 text-center"
        >
          <MessageCircle size={32} className="mx-auto text-nexus-teal mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Still need help?
          </h3>
          <p className="text-text-secondary max-w-md mx-auto mb-6">
            Can't find what you're looking for? Reach out to us and we'll help
            you out.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://github.com/AnthonyS051105/PACE-PersonalAssistanceCenter/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl font-medium transition-colors"
            >
              <ExternalLink size={16} />
              Report an Issue
            </a>
            <a
              href="mailto:support@pace-app.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-card-border text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl font-medium transition-colors"
            >
              <Mail size={16} />
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
