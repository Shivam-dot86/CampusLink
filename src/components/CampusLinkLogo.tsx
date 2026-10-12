import React from 'react';

interface CampusLinkLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isDark?: boolean;
  showSubtitle?: boolean;
}

export const CampusLinkLogo: React.FC<CampusLinkLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  isDark = false,
  showSubtitle = true
}) => {
  // Height configurations
  const heightClasses = {
    sm: variant === 'full' ? 'h-8' : 'h-7',
    md: variant === 'full' ? 'h-10' : 'h-9',
    lg: variant === 'full' ? 'h-14' : 'h-12',
    xl: variant === 'full' ? 'h-20' : 'h-16'
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Unique ID generator for gradient uniqueness across instances
  const idPrefix = React.useId().replace(/:/g, '');

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 420 300"
        className={`${iconSizes[size]} ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`${idPrefix}-leftHead`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
          <radialGradient id={`${idPrefix}-rightHead`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <linearGradient id={`${idPrefix}-ribbon`} x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="30%" stopColor="#2563EB" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="80%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id={`${idPrefix}-glow-icon`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.12" />
          </filter>
        </defs>
        <g filter={`url(#${idPrefix}-glow-icon)`}>
          <circle cx="115" cy="88" r="28" fill={`url(#${idPrefix}-leftHead)`} />
          <circle cx="218" cy="72" r="28" fill={`url(#${idPrefix}-rightHead)`} />
          <path
            d="M 115,118
               C 70,118 35,148 35,185
               C 35,225 75,252 118,252
               C 160,252 195,212 225,180
               C 255,148 282,122 322,122
               C 362,122 392,150 392,185
               C 392,222 360,250 320,250
               C 278,250 240,210 208,178
               C 178,148 152,118 115,118 Z
               M 118,212
               C 95,212 75,198 75,185
               C 75,170 92,156 115,156
               C 138,156 158,174 180,195
               C 160,208 140,212 118,212 Z
               M 320,160
               C 342,160 355,172 355,185
               C 355,198 338,212 320,212
               C 298,212 278,194 256,172
               C 278,162 298,160 320,160 Z"
            fill={`url(#${idPrefix}-ribbon)`}
            fillRule="evenodd"
          />
        </g>
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${heightClasses[size]} ${className}`}>
      {/* Icon Mark */}
      <svg
        viewBox="0 0 420 300"
        className="h-full w-auto aspect-[420/300] shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`${idPrefix}-leftHead`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
          <radialGradient id={`${idPrefix}-rightHead`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <linearGradient id={`${idPrefix}-ribbon`} x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="30%" stopColor="#2563EB" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="80%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id={`${idPrefix}-glow`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.12" />
          </filter>
        </defs>
        <g filter={`url(#${idPrefix}-glow)`}>
          <circle cx="115" cy="88" r="28" fill={`url(#${idPrefix}-leftHead)`} />
          <circle cx="218" cy="72" r="28" fill={`url(#${idPrefix}-rightHead)`} />
          <path
            d="M 115,118
               C 70,118 35,148 35,185
               C 35,225 75,252 118,252
               C 160,252 195,212 225,180
               C 255,148 282,122 322,122
               C 362,122 392,150 392,185
               C 392,222 360,250 320,250
               C 278,250 240,210 208,178
               C 178,148 152,118 115,118 Z
               M 118,212
               C 95,212 75,198 75,185
               C 75,170 92,156 115,156
               C 138,156 158,174 180,195
               C 160,208 140,212 118,212 Z
               M 320,160
               C 342,160 355,172 355,185
               C 355,198 338,212 320,212
               C 298,212 278,194 256,172
               C 278,162 298,160 320,160 Z"
            fill={`url(#${idPrefix}-ribbon)`}
            fillRule="evenodd"
          />
        </g>
      </svg>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline font-black tracking-tight">
          <span className={isDark ? 'text-white' : 'text-slate-900 dark:text-white'}>
            Campus
          </span>
          <span className="text-[#00B589]">Link</span>
        </div>
        {variant === 'full' && showSubtitle && (
          <span
            className={`text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            AI-POWERED CAMPUS PLACEMENT PLATFORM
          </span>
        )}
      </div>
    </div>
  );
};
