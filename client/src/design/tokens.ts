/**
 * Design Tokens for Tally
 * Palantir-inspired Intelligence Platform Design System
 *
 * Usage:
 *   import { colors, spacing, typography } from '@/design/tokens';
 *
 *   <div style={{ color: colors.accent.cyan[400] }}>...</div>
 *   <div className={typography.classes.monospace}>...</div>
 */

export const colors = {
  // Primary accent colors
  accent: {
    cyan: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    blue: {
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
    },
    purple: {
      500: '#a855f7',
      600: '#9333ea',
    },
  },

  // Neutral colors
  neutral: {
    slate: {
      200: '#e2e8f0', // Primary text
      400: '#94a3b8', // Secondary text
      500: '#64748b', // Tertiary text
      600: '#475569', // Muted text
      700: '#334155', // Borders
      800: '#1e293b', // Backgrounds
      900: '#0f172a', // Dark backgrounds
    },
  },

  // Background colors
  background: {
    primary: '#0a0e1a',
    secondary: '#1a1f2e',
  },

  // Status colors
  status: {
    success: {
      400: '#34d399',
      500: '#10b981',
    },
    warning: {
      400: '#fbbf24',
      500: '#f59e0b',
    },
    error: {
      400: '#f87171',
      500: '#ef4444',
    },
    info: {
      400: '#22d3ee',
    },
  },

  // Semantic colors for tasks
  priority: {
    low: '#64748b',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
  },

  taskStatus: {
    pending: '#64748b',
    active: '#22d3ee',
    blocked: '#f87171',
    complete: '#34d399',
    cancelled: '#475569',
  },
} as const;

export const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Utility classes
  classes: {
    monospace: 'mono',
    gradientText: 'gradient-text',
  },
} as const;

export const effects = {
  // Glass-morphism backgrounds
  glass: {
    standard: {
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
    },
    dark: {
      background: 'rgba(10, 14, 26, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(59, 130, 246, 0.15)',
    },
  },

  // Glow effects
  glow: {
    cyan: 'glow-cyan',
    blue: 'glow-blue',
    purple: 'glow-purple',
  },

  // Blur levels
  blur: {
    subtle: '8px',
    standard: '12px',
    heavy: '16px',
    maximum: '24px',
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
  },

  // Transitions
  transition: {
    standard: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const gradients = {
  text: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  },
  background: {
    primary: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)',
  },
  button: {
    primary: 'linear-gradient(to right, #0891b2, #2563eb)',
    primaryHover: 'linear-gradient(to right, #06b6d4, #3b82f6)',
  },
} as const;

export const patterns = {
  grid: {
    large: {
      backgroundImage: `
        linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
    },
    small: {
      backgroundImage: `
        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
    },
  },
} as const;

export const iconSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

/**
 * Utility function to get status color
 */
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    todo: colors.taskStatus.pending,
    pending: colors.taskStatus.pending,
    in_progress: colors.taskStatus.active,
    active: colors.taskStatus.active,
    blocked: colors.taskStatus.blocked,
    completed: colors.taskStatus.complete,
    complete: colors.taskStatus.complete,
    cancelled: colors.taskStatus.cancelled,
  };

  return statusMap[status.toLowerCase()] || colors.neutral.slate[500];
};

/**
 * Utility function to get priority color
 */
export const getPriorityColor = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    low: colors.priority.low,
    medium: colors.priority.medium,
    high: colors.priority.high,
    urgent: colors.priority.urgent,
  };

  return priorityMap[priority.toLowerCase()] || colors.priority.medium;
};

/**
 * Utility function to get Tailwind border class for priority
 */
export const getPriorityBorderClass = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    low: 'border-l-slate-600',
    medium: 'border-l-amber-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
  };

  return priorityMap[priority.toLowerCase()] || 'border-l-slate-600';
};

/**
 * Utility function to format confidence as percentage
 */
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

/**
 * Utility function to get confidence color based on value
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return colors.accent.cyan[400];
  if (confidence >= 0.6) return colors.accent.blue[400];
  if (confidence >= 0.4) return colors.status.warning[400];
  return colors.neutral.slate[500];
};

// Export all tokens as a single object for convenience
export const designTokens = {
  colors,
  spacing,
  typography,
  effects,
  gradients,
  patterns,
  iconSizes,
} as const;

// Type exports for TypeScript
export type Color = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Effects = typeof effects;
export type Gradients = typeof gradients;
export type Patterns = typeof patterns;
export type IconSizes = typeof iconSizes;
