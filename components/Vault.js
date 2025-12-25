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
} from "lucide-react";

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

const Vault = ({ searchQuery = "", items = [], setItems }) => {
  const [localSearch, setLocalSearch] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "settings"
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category: "other",
  });

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

  // Persist items to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("vault_links", JSON.stringify(items));
    }
  }, [items]);

  const filteredLinks = items.filter((link) => {
    const matchesGlobal = link.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLocal =
      link.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      link.category.toLowerCase().includes(localSearch.toLowerCase());
    return matchesGlobal && matchesLocal;
  });

  const handleAdd = () => {
    if (!newLink.title || !newLink.url) return;

    const item = {
      id: Date.now().toString(),
      ...newLink,
    };

    setItems([...items, item]);
    setNewLink({ title: "", url: "", category: "other" });
    setViewMode("list");
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setItems(items.filter((l) => l.id !== id));
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

          <input
            type="text"
            placeholder="Title (e.g. Project Docs)"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-nexus-purple transition-colors"
          />

          <input
            type="text"
            placeholder="URL (https://...)"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="bg-input-bg border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-nexus-purple transition-colors"
          />

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
            onClick={handleAdd}
            disabled={!newLink.title || !newLink.url}
            className="mt-auto bg-nexus-teal text-nexus-deep py-2 rounded-lg text-xs font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Resource
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

          <p className="text-[10px] text-text-secondary text-center">
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
            <button
              onClick={() => setViewMode("settings")}
              className="p-2 bg-input-bg border border-card-border rounded-lg text-text-secondary hover:text-nexus-teal hover:border-nexus-teal/50 transition-colors"
              title="Manage Categories"
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
            {filteredLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col p-3 rounded-xl bg-input-bg border border-card-border hover:border-nexus-teal/50 transition-all hover:-translate-y-1"
              >
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 size={12} />
                </button>

                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-card-bg rounded-lg group-hover:bg-nexus-teal/20 transition-colors">
                    {getCategoryIcon(getCategoryName(item.category))}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-card-border group-hover:bg-nexus-teal transition-colors" />
                </div>
                <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary truncate">
                  {item.title}
                </span>
              </a>
            ))}

            {/* Add New Button */}
            <button
              onClick={() => setViewMode("add")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-card-border hover:border-nexus-purple/50 text-text-secondary hover:text-nexus-purple transition-all gap-1 min-h-[80px]"
            >
              <Plus size={20} />
              <span className="text-[10px]">Add Resource</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Vault;
