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
} from "lucide-react";

const Vault = ({ searchQuery = "" }) => {
  const defaultItems = [
    { id: "1", title: "Calculus Syllabus", url: "#", category: "doc" },
    { id: "2", title: "React Crash Course", url: "#", category: "youtube" },
    { id: "3", title: "Project Drive", url: "#", category: "drive" },
    { id: "4", title: "Design System", url: "#", category: "other" },
  ];

  const [links, setLinks] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vault_links");
      if (saved) return JSON.parse(saved);
    }
    return defaultItems;
  });

  const [localSearch, setLocalSearch] = useState("");

  const filteredLinks = links.filter((link) => {
    const matchesGlobal = link.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLocal =
      link.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      link.category.toLowerCase().includes(localSearch.toLowerCase());
    return matchesGlobal && matchesLocal;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category: "other",
  });

  useEffect(() => {
    localStorage.setItem("vault_links", JSON.stringify(links));
  }, [links]);

  const handleAdd = () => {
    if (!newLink.title || !newLink.url) return;

    const item = {
      id: Date.now().toString(),
      ...newLink,
    };

    setLinks([...links, item]);
    setNewLink({ title: "", url: "", category: "other" });
    setIsAdding(false);
  };

  const handleDelete = (e, id) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    setLinks(links.filter((l) => l.id !== id));
  };

  const getIcon = (cat) => {
    switch (cat) {
      case "youtube":
        return <Youtube size={16} className="text-red-400" />;
      case "doc":
        return <FileText size={16} className="text-blue-400" />;
      case "drive":
        return <HardDrive size={16} className="text-green-400" />;
      default:
        return <LinkIcon size={16} className="text-nexus-teal" />;
    }
  };

  const categories = [
    { id: "doc", icon: <FileText size={14} />, label: "Doc" },
    { id: "drive", icon: <HardDrive size={14} />, label: "Drive" },
    { id: "youtube", icon: <Youtube size={14} />, label: "YT" },
    { id: "other", icon: <LinkIcon size={14} />, label: "Link" },
  ];

  return (
    <div className="h-full flex flex-col">
      {isAdding ? (
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-text-primary">
              Add Resource
            </h3>
            <button
              onClick={() => setIsAdding(false)}
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

          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setNewLink({ ...newLink, category: cat.id })}
                className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  newLink.category === cat.id
                    ? "bg-nexus-purple/20 border-nexus-purple text-nexus-purple"
                    : "bg-input-bg border-transparent text-text-secondary hover:bg-card-bg"
                }`}
              >
                {cat.icon}
                <span className="text-[9px] mt-1">{cat.label}</span>
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
      ) : (
        <>
          <div className="relative mb-3 shrink-0">
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
                    {getIcon(item.category)}
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
              onClick={() => setIsAdding(true)}
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
