import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Palette, Trash2, Maximize2 } from "lucide-react";

const BentoCard = ({
  children,
  className = "",
  title,
  icon,
  glowColor = "rgba(115, 42, 223, 0.5)", // Default purple
  colSpan = "col-span-1",
  rowSpan = "row-span-1",
  isCustomizing = false,
  pickerColor = "#732adf",
  onColorChange,
  onDelete,
  onResize,
  onTripleClick,
  ...props
}) => {
  const cardRef = useRef(null);

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = cardRef.current;
    if (!card) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = card.offsetWidth;
    const startHeight = card.offsetHeight;

    // Helper to extract number from class string or use number directly
    const getSpan = (val) => {
      if (typeof val === "number") return val;
      const matchCol = val?.match(/col-span-(\d+)/);
      if (matchCol) return parseInt(matchCol[1]);
      const matchRow = val?.match(/row-span-(\d+)/);
      if (matchRow) return parseInt(matchRow[1]);
      return 1;
    };

    const currentCS = getSpan(colSpan);
    const currentRS = getSpan(rowSpan);

    // Estimate grid unit size
    const unitWidth = startWidth / currentCS;
    const unitHeight = startHeight / currentRS;

    const handleMouseMove = (moveEvent) => {
      // Optional: Live preview logic could go here
    };

    const handleMouseUp = (upEvent) => {
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;

      const newWidth = startWidth + deltaX;
      const newHeight = startHeight + deltaY;

      // Calculate new spans with thresholds (e.g., must drag at least half a unit)
      // Using Math.round handles the "closest unit" logic
      const newColSpan = Math.max(
        1,
        Math.min(4, Math.round(newWidth / unitWidth))
      );
      const newRowSpan = Math.max(1, Math.round(newHeight / unitHeight));

      if (newColSpan !== currentCS || newRowSpan !== currentRS) {
        onResize && onResize(newColSpan, newRowSpan);
      }

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <motion.div
      ref={cardRef}
      aria-label={title}
      title={
        onTripleClick ? "Triple-click card or click title to expand" : undefined
      }
      onClick={(e) => {
        if (e.detail === 3 && onTripleClick) {
          onTripleClick();
        }
        props.onClick && props.onClick(e);
      }}
      className={`
        relative group overflow-hidden rounded-3xl 
        border border-card-border 
        backdrop-blur-xl transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1 hover:border-nexus-purple/30
        active:scale-[0.98] active:translate-y-0
        shadow-[0_0_0_1px_inset_var(--card-border)]
        hover:shadow-[0_20px_40px_-10px_var(--glow-color)]
        flex flex-col
        ${colSpan} ${rowSpan} ${className}
      `}
      style={{
        "--glow-color": glowColor,
        background: `linear-gradient(to bottom, color-mix(in srgb, ${glowColor}, black 40%), transparent 80%)`,
      }}
      {...props}
    >
      {/* Light Ray / Gradient Blob Effect */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ background: glowColor }}
      />

      {/* Customization Overlay */}
      {isCustomizing && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <div
            className="relative p-2 bg-black/50 rounded-full hover:bg-white/20 transition-colors text-white border border-white/10 shadow-lg backdrop-blur-md cursor-pointer"
            title="Change Glow Color"
          >
            <Palette size={16} />
            <input
              type="color"
              value={pickerColor}
              onChange={(e) => onColorChange && onColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-200 border border-red-500/30 shadow-lg backdrop-blur-md transition-colors"
              title="Delete Card"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-3 p-5 pb-2 z-10">
          {icon && <div className="text-nexus-teal">{icon}</div>}
          {title && (
            <h3
              onClick={(e) => {
                if (onTripleClick) {
                  e.stopPropagation();
                  onTripleClick();
                }
              }}
              className={`text-lg font-semibold tracking-wide text-text-primary font-sans ${
                onTripleClick
                  ? "cursor-pointer hover:scale-[1.02] transition-transform"
                  : ""
              }`}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 z-10 overflow-hidden relative">{children}</div>

      {/* Interactive Shine  */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-linear-to-tr from-transparent via-white/5 to-transparent" />

      {/* Resize Handle */}
      {isCustomizing && onResize && (
        <div
          className="absolute bottom-2 right-2 z-50 p-1.5 bg-black/50 rounded-full hover:bg-white/20 text-white/50 hover:text-white cursor-se-resize backdrop-blur-md transition-colors"
          onMouseDown={handleResizeStart}
        >
          <Maximize2 size={14} />
        </div>
      )}
    </motion.div>
  );
};

export default BentoCard;
