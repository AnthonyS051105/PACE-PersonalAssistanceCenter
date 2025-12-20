import React from "react";
import { Folder, Link as LinkIcon, Youtube, FileText } from "lucide-react";

const Vault = () => {
  const items = [
    { id: "1", title: "Calculus Syllabus", url: "#", category: "doc" },
    { id: "2", title: "React Crash Course", url: "#", category: "youtube" },
    { id: "3", title: "Project Drive", url: "#", category: "drive" },
    { id: "4", title: "Design System", url: "#", category: "other" },
  ];

  const getIcon = (cat) => {
    switch (cat) {
      case "youtube":
        return <Youtube size={16} className="text-red-400" />;
      case "doc":
        return <FileText size={16} className="text-blue-400" />;
      default:
        return <LinkIcon size={16} className="text-nexus-teal" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="group flex flex-col p-3 rounded-xl bg-white/5 border border-white/5 hover:border-nexus-teal/50 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-black/30 rounded-lg group-hover:bg-nexus-teal/20 transition-colors">
                {getIcon(item.category)}
              </div>
              <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-nexus-teal transition-colors" />
            </div>
            <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
              {item.title}
            </span>
          </a>
        ))}

        {/* Add New Button */}
        <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-white/10 hover:border-nexus-purple/50 text-gray-500 hover:text-nexus-purple transition-all gap-1">
          <Folder size={20} />
          <span className="text-[10px]">Add Resource</span>
        </button>
      </div>
    </div>
  );
};

export default Vault;
