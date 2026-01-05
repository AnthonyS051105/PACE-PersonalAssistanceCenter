import React, { useState, useEffect } from "react";
import {
  Folder,
  Link as LinkIcon,
  Youtube,
  FileText,
  Trash2,
  Plus,
  X,
  HardDrive,
  Search,
  Settings,
  Edit2,
  Check,
  BookOpen,
  Code,
  Image,
  Music,
  Video,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Globe,
  Database,
  Cloud,
  Package,
  Filter,
  ChevronDown,
  Download,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Smart icon detection based on category name keywords
const getCategoryIcon = (categoryName, size = 16) => {
  const name = categoryName.toLowerCase();

  // Video/Media
  if (
    name.includes("youtube") ||
    name.includes("yt") ||
    name.includes("video")
  ) {
    return <Youtube size={size} className="text-red-400" />;
  }
  if (
    name.includes("music") ||
    name.includes("audio") ||
    name.includes("spotify")
  ) {
    return <Music size={size} className="text-green-400" />;
  }
  if (
    name.includes("image") ||
    name.includes("photo") ||
    name.includes("gallery")
  ) {
    return <Image size={size} className="text-pink-400" />;
  }

  // Documents
  if (
    name.includes("doc") ||
    name.includes("pdf") ||
    name.includes("file") ||
    name.includes("document")
  ) {
    return <FileText size={size} className="text-blue-400" />;
  }
  if (
    name.includes("drive") ||
    name.includes("storage") ||
    name.includes("cloud")
  ) {
    return <HardDrive size={size} className="text-green-400" />;
  }

  // Learning
  if (
    name.includes("learn") ||
    name.includes("course") ||
    name.includes("tutorial") ||
    name.includes("education")
  ) {
    return <GraduationCap size={size} className="text-yellow-400" />;
  }
  if (
    name.includes("lecture") ||
    name.includes("class") ||
    name.includes("lesson")
  ) {
    return <BookOpen size={size} className="text-nexus-teal" />;
  }
  if (
    name.includes("book") ||
    name.includes("read") ||
    name.includes("article")
  ) {
    return <BookOpen size={size} className="text-orange-400" />;
  }

  // Tech
  if (
    name.includes("code") ||
    name.includes("coding") ||
    name.includes("dev") ||
    name.includes("github") ||
    name.includes("programming")
  ) {
    return <Code size={size} className="text-cyan-400" />;
  }
  if (
    name.includes("database") ||
    name.includes("data") ||
    name.includes("api")
  ) {
    return <Database size={size} className="text-purple-400" />;
  }

  // Work
  if (
    name.includes("work") ||
    name.includes("job") ||
    name.includes("business") ||
    name.includes("office")
  ) {
    return <Briefcase size={size} className="text-slate-400" />;
  }
  if (name.includes("project") || name.includes("folder")) {
    return <Folder size={size} className="text-amber-400" />;
  }

  // Shopping/Social
  if (name.includes("shop") || name.includes("store") || name.includes("buy")) {
    return <ShoppingBag size={size} className="text-emerald-400" />;
  }
  if (
    name.includes("favorite") ||
    name.includes("fav") ||
    name.includes("star")
  ) {
    return <Star size={size} className="text-yellow-400" />;
  }
  if (
    name.includes("love") ||
    name.includes("like") ||
    name.includes("heart")
  ) {
    return <Heart size={size} className="text-red-400" />;
  }

  // Web
  if (name.includes("web") || name.includes("site") || name.includes("www")) {
    return <Globe size={size} className="text-blue-400" />;
  }

  // Default
  return <LinkIcon size={size} className="text-nexus-teal" />;
};

const Vault = ({
  searchQuery = "",
  items = [],
  setItems,
  onRefresh,
  user,
  isFullPage = false,
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "settings"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Add Resource State
  const [addType, setAddType] = useState("link"); // "link" | "file"
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category: "other",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlError, setUrlError] = useState("");

  // URL validation function
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setNewLink({ ...newLink, url });

    if (url && !isValidUrl(url)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
    } else {
      setUrlError("");
    }
  };

  // Default categories list
  const defaultCategories = [
    { id: "lecture", name: "Lecture" },
    { id: "other", name: "Other" },
    { id: "code", name: "Code" },
    { id: "doc", name: "Documents" },
    { id: "drive", name: "Drive" },
    { id: "youtube", name: "YouTube" },
  ];

  // Custom categories state with localStorage persistence
  const [categories, setCategories] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vault_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults - add any missing default categories
        const existingIds = parsed.map((c) => c.id);
        const missingDefaults = defaultCategories.filter(
          (d) => !existingIds.includes(d.id)
        );
        if (missingDefaults.length > 0) {
          return [...missingDefaults, ...parsed];
        }
        return parsed;
      }
    }
    // Default categories
    return defaultCategories;
  });

  // Category manager state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Persist categories to localStorage
  useEffect(() => {
    localStorage.setItem("vault_categories", JSON.stringify(categories));
  }, [categories]);

  // Items are now passed from App.js via Supabase fetch

  const filteredLinks = items.filter((link) => {
    const matchesGlobal = link.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLocal =
      link.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      link.category.toLowerCase().includes(localSearch.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || link.category === categoryFilter;
    return matchesGlobal && matchesLocal && matchesCategory;
  });

  const handleSave = async () => {
    if (!user) {
      alert("You must be logged in to save.");
      return;
    }

    try {
      setIsUploading(true);
      let targetUrl = newLink.url;
      let storagePath = null;
      let fileSize = null;

      // Handle File Upload
      if (addType === "file" && selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("vault")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from("vault")
          .getPublicUrl(filePath);

        targetUrl = publicUrlData.publicUrl;
        storagePath = filePath;
        fileSize = selectedFile.size;
      } else if (addType === "link") {
        if (!isValidUrl(newLink.url)) {
          setUrlError("Please enter a valid URL");
          setIsUploading(false);
          return;
        }
      }

      // Insert into Database
      const { error: dbError } = await supabase.from("vault_items").insert({
        user_id: user.id,
        title: newLink.title,
        url: targetUrl,
        category: newLink.category,
        type: addType,
        storage_path: storagePath,
        size: fileSize,
      });

      if (dbError) throw dbError;

      // Reset Form & Refresh
      setNewLink({ title: "", url: "", category: "other" });
      setSelectedFile(null);
      setAddType("link");
      setViewMode("list");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Failed to save resource: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      // Optimistic update
      setItems(items.filter((l) => l.id !== id));

      // Find item to check if it's a file
      const item = items.find((i) => i.id === id);

      // Delete from DB
      const { error } = await supabase
        .from("vault_items")
        .delete()
        .eq("id", id);
      if (error) throw error;

      // Delete from Storage if it's a file
      if (item && item.storage_path) {
        await supabase.storage.from("vault").remove([item.storage_path]);
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error deleting item:", err);
      // Revert valid logic would be complex here without deep copy,
      // effectively we rely on next fetch.
      if (onRefresh) onRefresh();
    }
  };

  // Category Management Functions
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newId = newCategoryName.toLowerCase().replace(/\s+/g, "-");

    // Check if category already exists
    if (categories.some((cat) => cat.id === newId)) {
      alert("Category already exists!");
      return;
    }

    setCategories([...categories, { id: newId, name: newCategoryName.trim() }]);
    setNewCategoryName("");
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.name);
  };

  const handleSaveEditCategory = (categoryId) => {
    if (!editCategoryName.trim()) return;

    const oldCategory = categories.find((c) => c.id === categoryId);
    const newId = editCategoryName.toLowerCase().replace(/\s+/g, "-");

    // Update category
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { id: newId, name: editCategoryName.trim() }
          : cat
      )
    );

    // Update all links with the old category to use the new one
    if (oldCategory) {
      setItems(
        items.map((item) =>
          item.category === categoryId ? { ...item, category: newId } : item
        )
      );
    }

    setEditingCategory(null);
    setEditCategoryName("");
  };

  const handleDeleteCategory = (categoryId) => {
    // Prevent deleting "other" category
    if (categoryId === "other") {
      alert("Cannot delete the 'Other' category!");
      return;
    }

    // Move all links from deleted category to "other"
    setItems(
      items.map((item) =>
        item.category === categoryId ? { ...item, category: "other" } : item
      )
    );

    // Remove category
    setCategories(categories.filter((cat) => cat.id !== categoryId));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleExportLinks = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLinks: items.length,
      categories: categories,
      links: items,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vault-links-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {viewMode === "add" ? (
        // Add Resource View
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text-primary">
              Add Resource
            </h3>
            <button
              onClick={() => setViewMode("list")}
              className="p-1 hover:bg-input-bg rounded-lg transition-colors"
            >
              <X size={16} className="text-text-secondary" />
            </button>
          </div>

          {/* Toggle Type */}
          <div className="flex bg-input-bg rounded-lg p-1 border border-card-border mb-2">
            <button
              onClick={() => setAddType("link")}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                addType === "link"
                  ? "bg-nexus-purple text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Link
            </button>
            <button
              onClick={() => setAddType("file")}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                addType === "file"
                  ? "bg-nexus-teal text-nexus-deep"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              File Upload
            </button>
          </div>

          <input
            type="text"
            placeholder="Title (e.g. Project Docs)"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-nexus-purple transition-colors"
          />

          {addType === "link" ? (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="URL (https://...)"
                value={newLink.url}
                onChange={handleUrlChange}
                className={`bg-input-bg border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none transition-colors ${
                  urlError
                    ? "border-red-500 focus:border-red-500"
                    : "border-card-border focus:border-nexus-purple"
                }`}
              />
              {urlError && (
                <span className="text-red-500 text-[10px]">{urlError}</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  if (file && !newLink.title) {
                    setNewLink({ ...newLink, title: file.name });
                  }
                }}
                className="bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-nexus-teal file:text-nexus-deep hover:file:bg-nexus-teal/80"
              />
              <span className="text-[10px] text-text-secondary">
                Max size: 50MB
              </span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setNewLink({ ...newLink, category: cat.id })}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  newLink.category === cat.id
                    ? "bg-nexus-purple/20 border-nexus-purple text-nexus-purple"
                    : "bg-input-bg border-transparent text-text-secondary hover:bg-card-bg"
                }`}
              >
                {getCategoryIcon(cat.name, 14)}
                <span className="text-[9px] mt-1 truncate w-full text-center">
                  {cat.name.length > 8
                    ? cat.name.substring(0, 8) + "..."
                    : cat.name}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={
              !newLink.title ||
              (addType === "link" && !newLink.url) ||
              (addType === "file" && !selectedFile) ||
              isUploading
            }
            className="mt-auto bg-nexus-teal text-nexus-deep py-2 rounded-lg text-xs font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>Saving...</>
            ) : (
              <>
                <Plus size={14} />
                Save Resource
              </>
            )}
          </button>
        </div>
      ) : viewMode === "settings" ? (
        // Category Manager View
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text-primary">
              Manage Categories
            </h3>
            <button
              onClick={() => setViewMode("list")}
              className="p-1 hover:bg-input-bg rounded-lg transition-colors"
            >
              <X size={16} className="text-text-secondary" />
            </button>
          </div>

          {/* Add New Category */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="flex-1 bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-nexus-purple transition-colors"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-3 py-2 bg-nexus-purple text-white rounded-lg text-xs font-bold hover:bg-nexus-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Category List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 bg-input-bg rounded-lg border border-card-border"
              >
                <div className="p-1.5 bg-card-bg rounded-lg">
                  {getCategoryIcon(cat.name, 14)}
                </div>

                {editingCategory === cat.id ? (
                  // Edit Mode
                  <>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSaveEditCategory(cat.id)
                      }
                      className="flex-1 bg-card-bg border border-nexus-purple rounded px-2 py-1 text-xs text-text-primary focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditCategory(cat.id)}
                      className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1.5 text-text-secondary hover:bg-input-bg rounded transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  // Display Mode
                  <>
                    <span className="flex-1 text-xs text-text-primary">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {items.filter((i) => i.category === cat.id).length} items
                    </span>
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="p-1.5 text-text-secondary hover:text-nexus-teal hover:bg-input-bg rounded transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      disabled={cat.id === "other"}
                      className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Export Section */}
          <div className="border-t border-card-border pt-3 mt-auto">
            <button
              onClick={handleExportLinks}
              disabled={items.length === 0}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-input-bg border border-card-border rounded-lg text-xs text-text-secondary hover:text-nexus-teal hover:border-nexus-teal/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              <span>Export Links as JSON</span>
            </button>
          </div>

          <p className="text-[10px] text-text-secondary text-center mt-2">
            Icons auto-detect based on category name keywords
          </p>
        </div>
      ) : (
        // List View
        <>
          <div className="relative mb-3 shrink-0 flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={14}
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter resources..."
                className="w-full bg-input-bg border border-card-border rounded-lg py-2 pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:border-nexus-teal transition-colors"
              />
            </div>
            {/* Category Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-2 bg-input-bg border rounded-lg text-xs transition-colors ${
                  categoryFilter !== "all"
                    ? "border-nexus-teal text-nexus-teal"
                    : "border-card-border text-text-secondary hover:text-nexus-teal hover:border-nexus-teal/50"
                }`}
                title="Filter by Category"
              >
                <Filter size={14} />
                <span className="hidden sm:inline">
                  {categoryFilter === "all"
                    ? "All"
                    : getCategoryName(categoryFilter).length > 6
                    ? getCategoryName(categoryFilter).substring(0, 6) + "..."
                    : getCategoryName(categoryFilter)}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${
                    showFilterDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a2e] border border-card-border rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto backdrop-blur-none">
                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      categoryFilter === "all"
                        ? "bg-nexus-teal/30 text-nexus-teal"
                        : "text-text-primary hover:bg-white/10"
                    }`}
                  >
                    <LinkIcon size={14} />
                    <span>All Categories</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                        categoryFilter === cat.id
                          ? "bg-nexus-teal/30 text-nexus-teal"
                          : "text-text-primary hover:bg-white/10"
                      }`}
                    >
                      {getCategoryIcon(cat.name, 14)}
                      <span>{cat.name}</span>
                      <span className="ml-auto text-[10px] opacity-70">
                        {items.filter((i) => i.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setViewMode("settings")}
              className="p-2 bg-input-bg border border-card-border rounded-lg text-text-secondary hover:text-nexus-teal hover:border-nexus-teal/50 transition-colors"
              title="Manage Categories"
            >
              <Settings size={14} />
            </button>
          </div>

          {/* Active Filter Indicator */}
          {categoryFilter !== "all" && (
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <span className="text-[10px] text-text-secondary uppercase tracking-wide">
                Filtering by:
              </span>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-nexus-purple/20 border border-nexus-purple/50 rounded-full text-xs text-nexus-purple">
                {getCategoryIcon(getCategoryName(categoryFilter), 12)}
                <span>{getCategoryName(categoryFilter)}</span>
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="ml-0.5 p-0.5 hover:bg-nexus-purple/30 rounded-full transition-colors"
                  title="Clear filter"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div
            className={`grid ${
              isFullPage
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                : "grid-cols-2 gap-3"
            } overflow-y-auto pr-1`}
          >
            {filteredLinks.map((item) => {
              // Extract domain for favicon
              let faviconUrl = null;
              try {
                const url = new URL(item.url);
                faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
              } catch (_) {
                // Invalid URL, favicon will be null
              }

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col ${
                    isFullPage ? "p-4" : "p-3"
                  } rounded-xl bg-input-bg border border-card-border hover:border-nexus-teal/50 transition-all hover:-translate-y-1 ${
                    isFullPage ? "min-h-[120px]" : ""
                  }`}
                >
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className={`absolute ${
                      isFullPage ? "top-3 right-3 p-2" : "top-2 right-2 p-1.5"
                    } bg-black/50 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20`}
                  >
                    <Trash2 size={isFullPage ? 14 : 12} />
                  </button>

                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`${
                        isFullPage ? "p-3" : "p-2"
                      } bg-card-bg rounded-lg group-hover:bg-nexus-teal/20 transition-colors`}
                    >
                      {getCategoryIcon(
                        getCategoryName(item.category),
                        isFullPage ? 20 : 16
                      )}
                    </div>
                    {faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt=""
                        className={`${
                          isFullPage ? "w-5 h-5" : "w-4 h-4"
                        } rounded-sm`}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className={`${
                          isFullPage ? "w-2.5 h-2.5" : "w-2 h-2"
                        } rounded-full bg-card-border group-hover:bg-nexus-teal transition-colors`}
                      />
                    )}
                  </div>
                  <span
                    className={`${
                      isFullPage ? "text-sm" : "text-xs"
                    } font-medium text-text-secondary group-hover:text-text-primary truncate`}
                  >
                    {item.title}
                  </span>
                </a>
              );
            })}

            {/* Add New Button */}
            <button
              onClick={() => setViewMode("add")}
              className={`flex flex-col items-center justify-center ${
                isFullPage ? "p-4" : "p-3"
              } rounded-xl border border-dashed border-card-border hover:border-nexus-purple/50 text-text-secondary hover:text-nexus-purple transition-all gap-1 ${
                isFullPage ? "min-h-[120px]" : "min-h-[80px]"
              }`}
            >
              <Plus size={isFullPage ? 24 : 20} />
              <span className={`${isFullPage ? "text-xs" : "text-[10px]"}`}>
                Add Resource
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Vault;
