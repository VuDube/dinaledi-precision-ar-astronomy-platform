import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface PatternProps {
  className?: string;
  opacity?: number;
}
export function DiamondGrid({ className, opacity = 0.05 }: PatternProps) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="diamond-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
    </svg>
  );
}
export function CalibrationMotion({ className, opacity = 0.5 }: PatternProps) {
  return (
    <div className={cn("relative w-48 h-32 flex items-center justify-center", className)} style={{ opacity }}>
      <svg width="180" height="100" viewBox="0 0 180 100" className="text-nebula">
        <motion.path
          d="M 45 50 C 45 20 90 20 90 50 C 90 80 135 80 135 50 C 135 20 90 20 90 50 C 90 80 45 80 45 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          r="4"
          fill="currentColor"
          animate={{
            offsetDistance: ["0%", "100%"]
          }}
          style={{ offsetPath: "path('M 45 50 C 45 20 90 20 90 50 C 90 80 135 80 135 50 C 135 20 90 20 90 50 C 90 80 45 80 45 50 Z')" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-x-0 -bottom-8 text-center">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-nebula animate-pulse">Mag_Zero Calibration</span>
      </div>
    </div>
  );
}
export function ConstellationWeb({ className, opacity = 0.03 }: PatternProps) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="web-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M 20 20 L 60 40 L 100 20 M 60 40 L 60 100 M 10 70 L 60 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
          <circle cx="20" cy="20" r="1" fill="currentColor" />
          <circle cx="60" cy="40" r="1.5" fill="currentColor" />
          <circle cx="100" cy="20" r="1" fill="currentColor" />
          <circle cx="60" cy="100" r="1" fill="currentColor" />
          <circle cx="100" cy="70" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#web-pattern)" />
    </svg>
  );
}
export function ChevronFlow({ className, opacity = 0.03 }: PatternProps) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="chevron-pattern" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
          <path d="M 0 15 L 15 0 L 30 15 L 45 0 L 60 15" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#chevron-pattern)" />
    </svg>
  );
}
export function StarPoint({ className, opacity = 0.08 }: PatternProps) {
  return (
    <div className={cn("absolute flex items-center justify-center opacity-10", className)}>
      <svg width="200" height="200" viewBox="0 0 100 100" className="text-nebula">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
        <path d="M 50 0 L 55 45 L 100 50 L 55 55 L 50 100 L 45 55 L 0 50 L 45 45 Z" fill="currentColor" />
      </svg>
    </div>
  );
}