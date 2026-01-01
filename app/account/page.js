"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setUsername(
        user.user_metadata?.username || user.email?.split("@")[0] || ""
      );
      setEmail(user.email || "");
      fetchAvatar();
    }
  }, [user]);

  const fetchAvatar = async () => {
    try {
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
        return;
      }

      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(`${user.id}/avatar`);

      if (data?.publicUrl) {
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

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" });
      return;
    }

    setIsUploading(true);

    try {
      const filePath = `${user.id}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        const newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
        setAvatarUrl(newAvatarUrl);

        await supabase.auth.updateUser({
          data: { avatar_url: newAvatarUrl },
        });

        setMessage({ type: "success", text: "Avatar updated successfully!" });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({
        type: "error",
        text: "Failed to upload avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;

    setIsUploading(true);

    try {
      await supabase.storage.from("avatars").remove([`${user.id}/avatar`]);

      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      setAvatarUrl(null);
      setMessage({ type: "success", text: "Avatar removed successfully!" });
    } catch (error) {
      console.error("Error removing avatar:", error);
      setMessage({ type: "error", text: "Failed to remove avatar." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.auth.updateUser({
        data: { username },
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({
        type: "error",
        text: "Failed to update password. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setMessage({ type: "error", text: "Please type DELETE to confirm." });
      return;
    }

    // Note: Full account deletion requires server-side implementation
    // This would need a proper API route with admin privileges
    setMessage({
      type: "error",
      text: "Account deletion requires contacting support. Please email support@pace.app",
    });
  };

  const initials = username.charAt(0).toUpperCase() || "U";

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
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="p-2 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl transition-colors shadow-lg shadow-nexus-purple/20"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Account Settings
            </h1>
            <p className="text-sm text-text-secondary">
              Manage your profile and preferences
            </p>
          </div>
        </motion.div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                : "bg-red-500/20 border border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? <Check size={18} /> : <X size={18} />}
            {message.text}
          </motion.div>
        )}

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
            <User size={20} className="text-nexus-teal" />
            Profile Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-nexus-purple/30 bg-linear-to-tr from-nexus-purple to-nexus-teal p-0.75">
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
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={24} className="text-white" />
              </button>
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera size={16} />
                      Change Photo
                    </>
                  )}
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-2">
                JPEG, PNG, GIF, or WebP (max 2MB)
              </p>
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Username
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-input-bg border border-card-border rounded-xl py-3 pl-10 pr-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-nexus-purple transition-colors"
                placeholder="Your username"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-input-bg/50 border border-card-border rounded-xl py-3 pl-10 pr-4 text-text-secondary cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Email cannot be changed
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full py-3 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </motion.div>

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 backdrop-blur-xl"
        >
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Lock size={20} className="text-nexus-teal" />
              Change Password
            </h2>
            <div
              className={`transform transition-transform ${
                showPasswordSection ? "rotate-180" : ""
              }`}
            >
              <ArrowLeft size={20} className="-rotate-90 text-text-secondary" />
            </div>
          </button>

          {showPasswordSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 space-y-4"
            >
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-input-bg border border-card-border rounded-xl py-3 pl-10 pr-12 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-nexus-purple transition-colors"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, new: !p.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-input-bg border border-card-border rounded-xl py-3 pl-10 pr-12 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-nexus-purple transition-colors"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isSaving || !newPassword || !confirmPassword}
                className="w-full py-3 bg-nexus-purple hover:bg-nexus-purple/80 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Update Password
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </h2>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 border border-red-500/50 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                This action is irreversible. Type{" "}
                <strong className="text-red-400">DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-input-bg border border-red-500/30 rounded-xl py-3 px-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Type DELETE to confirm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 py-3 border border-card-border text-text-secondary hover:text-text-primary rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
