import React, { useId } from 'react';

export interface FPDAFLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  height?: number | string;
}

export const FPDAFLogo: React.FC<FPDAFLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  className = '',
  height
}) => {
  const rawId = useId();
  // Sanitize id for SVG references
  const id = rawId.replace(/:/g, '');

  const emblemGradId = `emblemGrad_${id}`;
  const arcGradId = `arcGrad_${id}`;
  const crossFillId = `crossFill_${id}`;
  const tealGlowId = `tealGlow_${id}`;

  // Theme-aware styles
  const isExplicitDark = theme === 'dark';
  const isExplicitLight = theme === 'light';

  // Responsive SVG definitions
  const defs = (
    <defs>
      <linearGradient id={emblemGradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>

      <linearGradient id={arcGradId} x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>

      <linearGradient id={crossFillId} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity={isExplicitDark ? 0.14 : isExplicitLight ? 0.08 : 0.12} />
        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={isExplicitDark ? 0.04 : isExplicitLight ? 0.02 : 0.03} />
      </linearGradient>

      <filter id={tealGlowId} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  // Core Emblem Mark (Cross + 3 Federated Nodes + Orbiting Crescent)
  const emblemGroup = (
    <g transform="translate(10, 8)">
      {/* 3 Federated Hospital Nodes Arc */}
      <path 
        d="M 64 74 C 82 28, 162 28, 180 74" 
        fill="none" 
        stroke="#38bdf8" 
        strokeWidth="2.2" 
        strokeDasharray="4,4" 
        opacity="0.85" 
      />

      {/* Node 1: Left Hospital (Hospital 1) */}
      <g transform="translate(42, 50)">
        <rect x="0" y="8" width="28" height="20" rx="3.5" className="fill-white dark:fill-[#0c1527] stroke-teal-500 dark:stroke-teal-400" strokeWidth="2.2" />
        <path d="M 14 0 L 14 8 M 10 4 L 18 4" className="stroke-teal-500 dark:stroke-teal-400" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="5" y="13" width="5" height="5" rx="1" className="fill-teal-500 dark:fill-teal-400" />
        <rect x="18" y="13" width="5" height="5" rx="1" className="fill-teal-500 dark:fill-teal-400" />
        <rect x="11.5" y="21" width="5" height="7" rx="1" className="fill-slate-100 dark:fill-[#142238] stroke-teal-500 dark:stroke-teal-400" strokeWidth="1.2" />
      </g>

      {/* Node 2: Top Center Hospital (Federated Aggregator) */}
      <g transform="translate(108, 12)">
        <rect x="0" y="8" width="28" height="20" rx="3.5" className="fill-white dark:fill-[#0c1527] stroke-sky-500 dark:stroke-sky-400" strokeWidth="2.2" />
        <path d="M 14 0 L 14 8 M 10 4 L 18 4" className="stroke-sky-500 dark:stroke-sky-400" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="5" y="13" width="5" height="5" rx="1" className="fill-sky-500 dark:fill-sky-400" />
        <rect x="18" y="13" width="5" height="5" rx="1" className="fill-sky-500 dark:fill-sky-400" />
        <rect x="11.5" y="21" width="5" height="7" rx="1" className="fill-slate-100 dark:fill-[#142238] stroke-sky-500 dark:stroke-sky-400" strokeWidth="1.2" />
        {/* Beacon pulse circle */}
        <circle cx="14" cy="4" r="8.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
      </g>

      {/* Node 3: Right Hospital (Hospital 3) */}
      <g transform="translate(172, 50)">
        <rect x="0" y="8" width="28" height="20" rx="3.5" className="fill-white dark:fill-[#0c1527] stroke-teal-500 dark:stroke-teal-400" strokeWidth="2.2" />
        <path d="M 14 0 L 14 8 M 10 4 L 18 4" className="stroke-teal-500 dark:stroke-teal-400" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="5" y="13" width="5" height="5" rx="1" fill="#2dd4bf" />
        <rect x="18" y="13" width="5" height="5" rx="1" fill="#2dd4bf" />
        <rect x="11.5" y="21" width="5" height="7" rx="1" className="fill-slate-100 dark:fill-[#142238] stroke-teal-500 dark:stroke-teal-400" strokeWidth="1.2" />
      </g>

      {/* Main Medical Cross */}
      <g transform="translate(74, 84)">
        <path 
          d="M 32 0 H 60 A 8 8 0 0 1 68 8 V 32 H 92 A 8 8 0 0 1 100 40 V 68 A 8 8 0 0 1 92 76 H 68 V 100 A 8 8 0 0 1 60 108 H 32 A 8 8 0 0 1 24 100 V 76 H 8 A 8 8 0 0 1 0 68 V 40 A 8 8 0 0 1 8 32 H 24 V 8 A 8 8 0 0 1 32 0 Z" 
          fill={`url(#${crossFillId})`} 
          stroke={`url(#${emblemGradId})`} 
          strokeWidth="5" 
          strokeLinejoin="round" 
        />

        {/* High-Precision Real-time ECG Pulse Wave */}
        <path 
          d="M 6 54 L 26 54 L 32 54 L 36 47 L 41 63 L 48 14 L 57 88 L 64 48 L 70 59 L 76 54 L 94 54" 
          fill="none" 
          stroke={`url(#${emblemGradId})`} 
          strokeWidth="4.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter={`url(#${tealGlowId})`} 
        />
        
        {/* Peak focal marker */}
        <circle cx="48" cy="14" r="3.2" className="fill-white dark:fill-white" />
      </g>

      {/* Dynamic Orbiting Crescent Swoosh */}
      <path 
        d="M 44 172 C 36 216, 110 230, 162 218 C 206 206, 230 170, 234 146 C 228 168, 196 198, 150 206 C 96 216, 50 198, 44 172 Z" 
        fill={`url(#${arcGradId})`} 
        opacity="0.95" 
      />
    </g>
  );

  // 1. Icon Only Variant
  if (variant === 'icon') {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 255 240" 
        className={className} 
        style={height ? { height } : undefined}
      >
        {defs}
        {emblemGroup}
      </svg>
    );
  }

  // 2. Compact Navbar / Header Variant
  if (variant === 'compact') {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 520 180" 
        className={className} 
        style={height ? { height } : undefined}
      >
        {defs}
        <g transform="scale(0.72) translate(-5, 0)">
          {emblemGroup}
        </g>
        <line 
          x1="188" 
          y1="20" 
          x2="188" 
          y2="155" 
          className="stroke-black/15 dark:stroke-white/20" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
        />
        <g transform="translate(210, 0)">
          <text 
            x="0" 
            y="86" 
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif" 
            fontWeight="900" 
            fontSize="78" 
            className="fill-slate-900 dark:fill-white" 
            letterSpacing="0.01em"
          >
            FPDAF
          </text>
          
          {/* Accent Swoosh on A */}
          <path 
            d="M 198 74 C 218 56, 246 48, 275 48 C 248 50, 222 60, 201 76 Z" 
            fill={`url(#${arcGradId})`} 
            filter={`url(#${tealGlowId})`} 
          />
          
          <text 
            x="2" 
            y="122" 
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif" 
            fontSize="16" 
            fontWeight="700" 
            className="fill-slate-800 dark:fill-slate-100" 
            letterSpacing="0.03em"
          >
            Clinical AI Suite &bull; CDSS
          </text>
          <text 
            x="2" 
            y="148" 
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif" 
            fontSize="13" 
            fontWeight="600" 
            className="fill-teal-600 dark:fill-teal-400" 
            letterSpacing="0.04em"
          >
            Federated Sepsis Intelligence
          </text>
        </g>
      </svg>
    );
  }

  // 3. Full Brand Wordmark Variant
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 920 230" 
      className={className} 
      style={height ? { height } : undefined}
    >
      {defs}
      {emblemGroup}

      {/* Elegant Vertical Divider */}
      <line 
        x1="272" 
        y1="26" 
        x2="272" 
        y2="206" 
        className="stroke-black/15 dark:stroke-white/20" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* Typography Block */}
      <g transform="translate(305, 0)">
        {/* "FPDAF" Bold Geometric Wordmark */}
        <text 
          x="0" 
          y="104" 
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif" 
          fontWeight="900" 
          fontSize="104" 
          className="fill-slate-900 dark:fill-white" 
          letterSpacing="0.01em"
        >
          FPDAF
        </text>

        {/* Dynamic Cyan-Teal Ascending Accent Swoosh through 'A' */}
        <path 
          d="M 264 88 C 290 66, 328 54, 368 56 C 336 58, 298 70, 268 90 Z" 
          fill={`url(#${arcGradId})`} 
          filter={`url(#${tealGlowId})`} 
        />

        {/* Subtitle */}
        <text 
          x="2" 
          y="144" 
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif" 
          fontSize="20" 
          fontWeight="700" 
          className="fill-slate-900 dark:fill-white" 
          letterSpacing="0.03em"
        >
          Federated Personalized Drift-Aware Attention Framework
        </text>

        {/* Tagline */}
        <g transform="translate(2, 184)">
          <line 
            x1="8" 
            y1="-5" 
            x2="105" 
            y2="-5" 
            className="stroke-teal-600 dark:stroke-teal-400" 
            strokeWidth="2" 
            strokeLinecap="round" 
            opacity="0.85" 
          />
          <text 
            x="116" 
            y="0" 
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif" 
            fontSize="16" 
            fontStyle="italic" 
            fontWeight="500" 
            className="fill-slate-600 dark:fill-slate-400" 
            letterSpacing="0.05em"
          >
            for Healthcare Time-Series Forecasting
          </text>
          <line 
            x1="462" 
            y1="-5" 
            x2="560" 
            y2="-5" 
            className="stroke-teal-600 dark:stroke-teal-400" 
            strokeWidth="2" 
            strokeLinecap="round" 
            opacity="0.85" 
          />
        </g>
      </g>
    </svg>
  );
};
