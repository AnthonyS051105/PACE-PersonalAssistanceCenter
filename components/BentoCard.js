import React from "react";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";

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
  onTripleClick,
  ...props
}) => {
  return (
    <motion.div
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
        hover:scale-[1.01] hover:border-nexus-purple/30
        active:scale-[0.98]
        shadow-[0_0_0_1px_inset_var(--card-border)]
        hover:shadow-[0_0_30px_-5px_var(--glow-color)]
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
        <div className="absolute top-4 right-4 z-50">
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
    </motion.div>
  );
};

export default BentoCard;
