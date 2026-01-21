// src/app/admin/stats/_components/KPICard.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type TrendDirection = 'up' | 'down' | 'flat';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: {
    direction: TrendDirection;
    value: string;
    label?: string;
  };
  color?: 'gold' | 'blue' | 'purple' | 'emerald' | 'rose';
  loading?: boolean;
}

const colorClasses = {
  gold: {
    bg: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  blue: {
    bg: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  purple: {
    bg: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-green-500/20',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  rose: {
    bg: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    icon: 'text-rose-400',
    glow: 'shadow-rose-500/20',
  },
};

export default function KPICard({
  icon,
  label,
  value,
  trend,
  color = 'gold',
  loading = false,
}: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
    >
      {/* Glassmorphism card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${colors.bg}
          border ${colors.border}
          backdrop-blur-xl
          transition-all duration-300
          hover:shadow-2xl hover:${colors.glow}
          p-6
        `}
      >
        {/* Animated glow effect */}
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100
            bg-gradient-to-br ${colors.bg}
            transition-opacity duration-500
            blur-xl
          `}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon & Label */}
          <div className="flex items-center justify-between mb-4">
            <div className={`${colors.icon} transition-transform duration-300 group-hover:scale-110`}>
              {icon}
            </div>
            
            {trend && (
              <div
                className={`
                  flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                  ${trend.direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                  ${trend.direction === 'down' ? 'bg-red-500/20 text-red-400' : ''}
                  ${trend.direction === 'flat' ? 'bg-slate-500/20 text-slate-400' : ''}
                `}
              >
                {trend.direction === 'up' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3l5 5h-3v7H8V8H5l5-5z" />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 17l-5-5h3V5h4v7h3l-5 5z" />
                  </svg>
                )}
                {trend.value}
              </div>
            )}
          </div>

          {/* Label */}
          <div className="text-slate-400 text-sm font-medium mb-2">
            {label}
          </div>

          {/* Value */}
          {loading ? (
            <div className="h-10 bg-slate-700/30 rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-white">
              {value}
            </div>
          )}

          {/* Trend label - всегда резервируем место */}
          <div className="text-xs text-slate-500 mt-2 h-4">
            {trend?.label || '\u00A0'}
          </div>
        </div>

        {/* Decorative gradient */}
        <div
          className={`
            absolute -right-8 -bottom-8 w-32 h-32 rounded-full
            bg-gradient-to-br ${colors.bg}
            opacity-20 blur-2xl
            transition-transform duration-700
            group-hover:scale-150
          `}
        />
      </div>
    </motion.div>
  );
}