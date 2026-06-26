import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Shield } from "lucide-react";

/**
 * CyberLoader - A sleek, spinning radial cyberpunk spinner with glow effects.
 */
export function CyberLoader({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-2",
    lg: "w-16 h-16 border-3",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="relative">
        {/* Glow backdrop */}
        <div
          className={`absolute inset-0 rounded-full bg-acid/25 blur-md ${sizeClasses[size]}`}
        />

        {/* Rotating outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className={`rounded-full border-t-acid border-r-acid/30 border-b-acid/15 border-l-acid/5 shadow-acid ${sizeClasses[size]}`}
        />

        {/* Static inner dot */}
        <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-acid rounded-full animate-ping" />
      </div>
    </div>
  );
}

/**
 * TerminalBootLoader - A premium simulated terminal boot uplink sequence.
 * Very fast, aesthetic, and fits the hacking theme.
 */
export function TerminalBootLoader({
  title = "VERIFYING CREDENTIALS",
  onComplete,
  className = "",
}) {
  const bootLines = [
    "PING // SECURE_HANDSHAKE_INITIALIZED",
    "RESOLVING // MAINFRAME_GATEWAY_ADR...",
    "DOWNLOADING // RSA_KEYS_VALIDATED",
    "ESTABLISHING // ENCRYPTED_CHANNEL",
    "SYNCHRONIZING // SYSTEM_SESSION_UPLINK",
  ];

  const [lines, setLines] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (currentIdx < bootLines.length) {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, bootLines[currentIdx]]);
        setCurrentIdx(currentIdx + 1);
      }, 150); // Fast but readable progression
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      const timeout = setTimeout(onComplete, 200);
      return () => clearTimeout(timeout);
    }
  }, [currentIdx]);

  return (
    <div
      className={`font-mono text-xs text-acid bg-void/80 border border-acid/20 rounded p-6 max-w-md w-full shadow-acid space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-acid/15 pb-2 text-[10px] uppercase tracking-widest text-acid/80">
        <Terminal className="h-4 w-4 animate-pulse" />
        {title} // SECURE_LINK
      </div>

      <div className="space-y-1.5 min-h-[100px]">
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="text-acid/55">&gt;</span>
            <span>{line}</span>
            {idx === lines.length - 1 && currentIdx < bootLines.length && (
              <span className="w-1.5 h-3 bg-acid animate-pulse" />
            )}
          </div>
        ))}
        {currentIdx === bootLines.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-hazard font-bold pt-2 uppercase text-[10px] tracking-wider"
          >
            <Shield className="h-3.5 w-3.5" />
            UPLINK_STABLE // RENDER_CONTEXT
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * SkeletonBlock - Pulsing placeholder block.
 */
export function SkeletonBlock({
  className = "",
  height = "h-4",
  width = "w-full",
  rounded = "rounded",
  shape = "",
}) {
  return (
    <div
      className={`animate-pulse bg-sludge/70 border border-acid/5 ${height} ${width} ${rounded} ${shape} ${className}`}
      style={{
        boxShadow: "inset 0 0 10px rgba(57, 255, 20, 0.05)",
      }}
    />
  );
}

/**
 * ProductSkeleton - Matches the aspect ratio and grid block of a catalog product.
 */
export function ProductSkeleton() {
  return (
    <div className="flex flex-col justify-between w-full h-full bg-sludge border border-acid/10 clip-chamfer p-4 font-mono space-y-4 animate-pulse">
      {/* Product Image placeholder */}
      <div className="relative w-full aspect-square rounded bg-void overflow-hidden border border-acid/5 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-acid/5 border-t-acid/15 animate-spin" />
      </div>

      <div className="space-y-3 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category tag */}
          <SkeletonBlock height="h-3" width="w-1/3" />
          {/* Title */}
          <SkeletonBlock height="h-5" width="w-4/5" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-acid/5">
          {/* Price */}
          <SkeletonBlock height="h-4" width="w-1/4" />
          {/* Rating */}
          <SkeletonBlock height="h-4.5" width="w-1/6" />
        </div>
      </div>

      {/* Button placeholder */}
      <div className="h-9 w-full bg-acid/5 border border-acid/10 rounded-full" />
    </div>
  );
}

/**
 * ProfileSkeleton - Matches Profile page layout structure progressively.
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Credentials skeleton card */}
      <div className="bg-sludge border border-acid/10 p-5 rounded clip-chamfer text-xs space-y-4 animate-pulse">
        <div className="border-b border-acid/15 pb-2">
          <SkeletonBlock height="h-4.5" width="w-1/2" />
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <SkeletonBlock height="h-2.5" width="w-1/4" />
            <SkeletonBlock height="h-9" />
          </div>
          <div className="space-y-1">
            <SkeletonBlock height="h-2.5" width="w-1/4" />
            <SkeletonBlock height="h-9" />
          </div>
          <div className="space-y-1">
            <SkeletonBlock height="h-2.5" width="w-1/4" />
            <SkeletonBlock height="h-9" />
          </div>
          <SkeletonBlock height="h-8" className="mt-2" />
        </div>
      </div>

      {/* Address book skeleton card */}
      <div className="bg-sludge border border-acid/10 p-5 rounded clip-chamfer text-xs space-y-4 animate-pulse">
        <div className="border-b border-acid/15 pb-2">
          <SkeletonBlock height="h-4.5" width="w-2/3" />
        </div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="p-3 bg-void border border-acid/10 rounded flex items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-grow">
                <SkeletonBlock height="h-3" width="w-3/4" />
                <SkeletonBlock height="h-2.5" width="w-1/2" />
              </div>
              <SkeletonBlock height="h-4" width="w-4" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * OrdersSkeleton - Matches orders timeline listing in Profile mainframe.
 */
export function OrdersSkeleton() {
  return (
    <div className="bg-sludge border border-acid/10 p-5 rounded clip-chamfer text-xs space-y-4 animate-pulse">
      <div className="border-b border-acid/15 pb-2">
        <SkeletonBlock height="h-4.5" width="w-1/3" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-void border border-acid/10 rounded flex flex-col sm:flex-row justify-between gap-4"
          >
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <SkeletonBlock height="h-4" width="w-24" />
                <SkeletonBlock height="h-3.5" width="w-16" />
              </div>
              <SkeletonBlock height="h-2.5" width="w-40" />
              <div className="flex gap-2 pt-1">
                <SkeletonBlock height="h-4" width="w-16" />
                <SkeletonBlock height="h-4" width="w-20" />
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
              <SkeletonBlock height="h-5" width="w-16" />
              <SkeletonBlock height="h-7.5" width="w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
