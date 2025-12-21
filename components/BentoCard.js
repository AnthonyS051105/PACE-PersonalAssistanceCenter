import React from "react";
import { motion } from "framer-motion";

const BentoCard = ({
  children,
  className = "",
  title,
  icon,
  glowColor = "rgba(115, 42, 223, 0.5)", // Default purple
  colSpan = "col-span-1",
  rowSpan = "row-span-1",
  ...props
}) => {
  return (
    <motion.div
      className={`
        relative group overflow-hidden rounded-3xl 
        bg-nexus-glass border border-nexus-glassBorder 
        backdrop-blur-xl transition-all duration-300 ease-out
        hover:scale-[1.01] hover:shadow-2xl hover:border-nexus-purple/30
        flex flex-col
        ${colSpan} ${rowSpan} ${className}
      `}
      style={{
        boxShadow: `0 0 0 1px inset rgba(255,255,255,0.05)`,
      }}
      {...props}
    >
      {/* Light Ray / Gradient Blob Effect */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ background: glowColor }}
      />

      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-3 p-5 pb-2 z-10">
          {icon && <div className="text-nexus-teal">{icon}</div>}
          {title && (
            <h3 className="text-lg font-semibold tracking-wide text-white/90 font-sans">
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
