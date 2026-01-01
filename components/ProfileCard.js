"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  LayoutGrid,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  Camera,
  X,
  Activity,
} from "lucide-react";

const ProfileCard = ({ theme, setTheme }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get user display info
  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const initials = username.charAt(0).toUpperCase();

  // Fetch avatar on mount and user change
  useEffect(() => {
    if (user?.id) {
      fetchAvatar();
    }
  }, [user?.id]);

  const fetchAvatar = async () => {
    try {
      // First check user metadata for avatar
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
        return;
      }

      // Then check Supabase storage
      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(`${user.id}/avatar`);

      if (data?.publicUrl) {
        // Check if the file actually exists by trying to fetch it
        const response = await fetch(data.publicUrl, { method: "HEAD" });
        if (response.ok) {
          setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
        }
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const filePath = `${user.id}/avatar`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        const newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
        setAvatarUrl(newAvatarUrl);

        // Update user metadata
        await supabase.auth.updateUser({
          data: { avatar_url: newAvatarUrl },
        });
      }

      setShowAvatarModal(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;

    setIsUploading(true);

    try {
      // Remove from storage
      await supabase.storage.from("avatars").remove([`${user.id}/avatar`]);

      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      setAvatarUrl(null);
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Error removing avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth";
  };

  const menuItems = [
    {
      icon: <Settings size={18} />,
      label: "Account Settings",
      onClick: () => {
        setIsOpen(false);
        router.push("/account");
      },
    },
    {
      icon: <LayoutGrid size={18} />,
      label: "Integrations",
      onClick: () => {
        setIsOpen(false);
        router.push("/integrations");
      },
    },
    {
      icon: <Bell size={18} />,
      label: "Notifications",
      onClick: () => {
        setIsOpen(false);
        router.push("/preferences");
      },
    },
    {
      icon: <HelpCircle size={18} />,
      label: "Help & Support",
      onClick: () => {
        setIsOpen(false);
        router.push("/help");
      },
    },
  ];

  return (
    <div className="relative" ref={cardRef}>
      {/* Avatar Button - Subtle purple border */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative group">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-nexus-purple/60 hover:border-nexus-purple/80 p-0.5 hover:scale-105 transition-all cursor-pointer bg-nexus-deep">
          <div className="w-full h-full rounded-full overflow-hidden bg-nexus-deep flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-white text-sm">{initials}</span>
            )}
          </div>
        </div>
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-nexus-deep" />
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-72 z-50"
          >
            {/* Animated Border Container */}
            <div className="relative rounded-2xl">
              {/* Animated Flowing Border - travels around the card */}
              <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `conic-gradient(
                      from var(--border-angle, 0deg),
                      transparent 0%,
                      transparent 20%,
                      rgba(115, 42, 223, 0.8) 25%,
                      rgba(101, 187, 189, 0.9) 35%,
                      rgba(115, 42, 223, 0.8) 45%,
                      transparent 50%,
                      transparent 100%
                    )`,
                    animation: "rotateBorder 4s linear infinite",
                  }}
                />
                {/* Inner background to create border effect */}
                <div className="absolute inset-[2px] rounded-[14px] bg-[#0d0829]" />
              </div>

              {/* Card Content */}
              <div className="relative rounded-2xl bg-[#0d0829] border border-white/20">
                {/* Profile Header */}
                <div className="p-4 bg-linear-to-br from-white/5 to-transparent rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    {/* Avatar with upload */}
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="relative group/avatar"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 p-0.5 bg-nexus-deep">
                        <div className="w-full h-full rounded-full overflow-hidden bg-nexus-deep flex items-center justify-center">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-white text-lg">
                              {initials}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Camera overlay on hover */}
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={16} className="text-white" />
                      </div>
                    </button>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {username}
                        </h3>
                        {/* Active Status Badge */}
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          <Activity size={8} />
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 pl-3">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all group/item"
                    >
                      <span className="text-text-secondary group-hover/item:text-nexus-teal transition-colors">
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      <ChevronRight
                        size={14}
                        className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-text-secondary"
                      />
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div className="mx-3 border-t border-white/10" />

                {/* Logout */}
                <div className="px-2 pt-1 pb-2 pl-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group/logout"
                  >
                    <LogOut size={18} />
                    <span className="flex-1 text-left text-sm font-medium">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowAvatarModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0d0829] border border-nexus-glassBorder rounded-2xl p-6 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Profile Picture
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Avatar Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 p-0.5 bg-nexus-deep">
                  <div className="w-full h-full rounded-full overflow-hidden bg-nexus-deep flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-white text-3xl">
                        {initials}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Actions */}
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-2.5 rounded-lg bg-nexus-purple hover:bg-nexus-purple/80 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera size={16} />
                      Upload New Photo
                    </>
                  )}
                </button>

                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="w-full py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors disabled:opacity-50"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <p className="text-xs text-text-secondary text-center mt-4">
                Supported formats: JPEG, PNG, GIF, WebP (max 2MB)
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSS for animated rotating border */}
      <style jsx global>{`
        @property --border-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotateBorder {
          0% {
            --border-angle: 0deg;
          }
          100% {
            --border-angle: 360deg;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileCard;
