# Tally Design System

**Version:** 1.0.0
**Style:** Palantir-inspired Intelligence Platform
**Theme:** Dark, sleek, data-centric

---

## Design Philosophy

This design system creates a professional, intelligence platform aesthetic inspired by Palantir Foundry and Apollo. The system prioritizes:

1. **Data Clarity** - Information is always readable and scannable
2. **Minimalism** - No unnecessary visual elements
3. **Professionalism** - Enterprise-grade appearance
4. **Depth** - Glass-morphism and layering create visual hierarchy
5. **Tech-Forward** - Monospace fonts and terminal aesthetics

---

## Color Palette

### Primary Colors

```css
/* Cyan (Primary Accent) */
--cyan-400: #22d3ee
--cyan-500: #06b6d4
--cyan-600: #0891b2

/* Blue (Secondary Accent) */
--blue-400: #60a5fa
--blue-500: #3b82f6
--blue-600: #2563eb

/* Purple (Tertiary) */
--purple-500: #a855f7
--purple-600: #9333ea
```

### Neutral Colors

```css
/* Backgrounds */
--slate-900: #0f172a  /* Primary background */
--slate-800: #1e293b  /* Secondary background */
--slate-700: #334155  /* Tertiary background */

/* Dark Accents */
--bg-primary: #0a0e1a
--bg-secondary: #1a1f2e

/* Text */
--slate-200: #e2e8f0  /* Primary text */
--slate-400: #94a3b8  /* Secondary text */
--slate-500: #64748b  /* Tertiary text */
--slate-600: #475569  /* Muted text */
```

### Status Colors

```css
/* Success */
--emerald-400: #34d399
--emerald-500: #10b981

/* Warning */
--amber-400: #fbbf24
--amber-500: #f59e0b

/* Error */
--red-400: #f87171
--red-500: #ef4444

/* Info */
--cyan-400: #22d3ee
```

### Semantic Colors

```css
/* Task Priority */
--priority-low: #64748b      /* slate-600 */
--priority-medium: #f59e0b   /* amber-500 */
--priority-high: #f97316     /* orange-500 */
--priority-urgent: #ef4444   /* red-500 */

/* Task Status */
--status-pending: #64748b    /* slate-500 */
--status-active: #22d3ee     /* cyan-400 */
--status-blocked: #f87171    /* red-400 */
--status-complete: #34d399   /* emerald-400 */
--status-cancelled: #475569  /* slate-600 */
```

---

## Typography

### Font Families

```css
/* Sans Serif (Primary) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif

/* Monospace (Code, Data, Terminal) */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace
```

### Font Sizes

```css
--text-xs: 0.75rem    /* 12px - Labels, metadata */
--text-sm: 0.875rem   /* 14px - Body text, UI elements */
--text-base: 1rem     /* 16px - Standard text */
--text-lg: 1.125rem   /* 18px - Subheadings */
--text-xl: 1.25rem    /* 20px - Headings */
--text-2xl: 1.5rem    /* 24px - Large headings */
```

### Font Weights

```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Usage Guidelines

- **Monospace** for: Task IDs, invoice numbers, amounts, dates, timestamps, code
- **Sans Serif** for: Descriptions, names, conversational text
- **All Caps + Tracking** for: Section headers, status labels (e.g., "TASK_CREATED")

---

## Spacing Scale

```css
--spacing-1: 0.25rem   /* 4px */
--spacing-2: 0.5rem    /* 8px */
--spacing-3: 0.75rem   /* 12px */
--spacing-4: 1rem      /* 16px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
--spacing-12: 3rem     /* 48px */
```

---

## Glass-Morphism System

### Glass Variants

#### Standard Glass
```css
.glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.2);
}
```

**Use for:** Cards, panels, modals, overlays

#### Dark Glass
```css
.glass-dark {
  background: rgba(10, 14, 26, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(59, 130, 246, 0.15);
}
```

**Use for:** Headers, footers, fixed elements, elevated surfaces

### Blur Levels

- **8px**: Subtle, barely noticeable
- **12px**: Standard for cards and panels
- **16px**: Heavy, for important UI chrome
- **24px**: Maximum, for modals and overlays

---

## Effects & Animations

### Glow Effects

```css
/* Cyan Glow */
.glow-cyan {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}

/* Blue Glow */
.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Purple Glow */
.glow-purple {
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
}
```

**Use for:** Primary buttons, active indicators, important status markers

### Pulse Animation

```css
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
}
```

**Use for:** Loading states, pending actions, real-time updates

### Transitions

```css
/* Standard Transition */
.transition-all-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Use for:** Hover states, state changes, interactive elements

---

## Background Patterns

### Grid Background
```css
.grid-bg {
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

**Use for:** Main application background, large containers

### Data Grid
```css
.data-grid {
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

**Use for:** Chat message areas, task list containers

---

## Gradients

### Text Gradient (Primary)
```css
.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Use for:** Headings, brand elements, important labels

### Background Gradient
```css
background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
```

**Use for:** Body background, large containers

### Button Gradient
```css
background: linear-gradient(to right, #0891b2, #2563eb);

/* Hover */
background: linear-gradient(to right, #06b6d4, #3b82f6);
```

**Use for:** Primary action buttons

---

## Component Patterns

### Terminal Input

```tsx
<div className="flex-1 relative">
  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 mono text-sm">
    &gt;
  </div>
  <input
    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded text-slate-200 text-sm mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 transition-all-smooth"
    placeholder="Enter command or describe work..."
  />
</div>
```

### Status Badge

```tsx
<div className="flex items-center gap-2 text-xs mono">
  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full glow-cyan"></div>
  <span className="text-cyan-400">TASK_CREATED</span>
</div>
```

### Glass Card

```tsx
<div className="glass rounded-lg p-4 border border-cyan-500/20">
  {/* Content */}
</div>
```

### Confidence Bar

```tsx
<div className="flex items-center gap-2 text-xs text-slate-500 mono">
  <span>CONFIDENCE:</span>
  <div className="flex-1 max-w-[100px] h-1 bg-slate-800 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
      style={{ width: `${confidence * 100}%` }}
    />
  </div>
  <span>{Math.round(confidence * 100)}%</span>
</div>
```

### Metadata Display

```tsx
<div className="flex items-center gap-2 text-xs text-slate-500 mono">
  <span className="text-slate-600">INV:</span>
  <span className="text-cyan-400">INV-2847</span>
</div>
```

---

## Layout Guidelines

### Container Widths

- **Full Width**: Task board, main canvas
- **Max Width (1280px)**: Content areas with sidebar
- **Max Width (768px)**: Chat messages, forms

### Padding

- **Small Components**: `p-3` (12px)
- **Medium Components**: `p-4` (16px)
- **Large Containers**: `p-6` (24px)

### Gaps

- **Tight**: `gap-2` (8px) - Inline elements, badges
- **Standard**: `gap-3` (12px) - Form fields, list items
- **Loose**: `gap-4` (16px) - Sections, cards

### Borders

- **Standard**: `1px solid rgba(59, 130, 246, 0.2)`
- **Subtle**: `1px solid rgba(59, 130, 246, 0.1)`
- **Emphasis**: `1px solid rgba(59, 130, 246, 0.3)`
- **Left Accent**: `border-l-2` with status color

---

## Iconography

### Icon Library
**Lucide React** (https://lucide.dev)

### Icon Sizes

- **Extra Small**: 12px - Inline with text
- **Small**: 14px - Badges, labels
- **Medium**: 16px - Buttons, list items
- **Large**: 20px - Headers, primary actions
- **Extra Large**: 24px - Hero sections

### Icon Colors

- **Active**: `text-cyan-400`
- **Inactive**: `text-slate-500`
- **Warning**: `text-amber-400`
- **Error**: `text-red-400`
- **Success**: `text-emerald-400`

---

## Accessibility

### Contrast Ratios

All text meets WCAG AA standards:
- Primary text (`#e2e8f0`) on dark backgrounds: **12:1**
- Secondary text (`#94a3b8`) on dark backgrounds: **7:1**
- Cyan accent (`#22d3ee`) on dark backgrounds: **8:1**

### Focus States

```css
focus:outline-none
focus:ring-1
focus:ring-cyan-500/50
focus:border-cyan-500/50
```

### Keyboard Navigation

All interactive elements must be keyboard accessible with visible focus indicators.

---

## Scrollbars

### Custom Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
```

---

## Usage Examples

### Creating a New Component

1. **Choose glass variant**: `.glass` or `.glass-dark`
2. **Add appropriate border**: `border border-cyan-500/20`
3. **Use monospace for data**: Invoice numbers, amounts, IDs
4. **Add status indicators**: Colored dots with matching text
5. **Include hover states**: `hover:border-cyan-500/40`

### Example: Task Card

```tsx
<div className="glass-dark border-l-2 border-l-cyan-500 rounded p-3 hover:border-cyan-500/40 transition-all-smooth">
  {/* Header */}
  <div className="flex items-center gap-2 text-xs text-slate-500 mono mb-2">
    <span className="text-slate-600">ID:</span>
    <span className="text-cyan-400">TSK-1234</span>
  </div>

  {/* Title */}
  <h3 className="text-sm text-slate-200 font-medium mb-2">
    Generate invoice for TechCorp
  </h3>

  {/* Metadata */}
  <div className="flex items-center gap-4 text-xs text-slate-500 mono">
    <div className="flex items-center gap-1">
      <Calendar size={12} />
      <span>Nov 19</span>
    </div>
    <div className="flex items-center gap-1">
      <Users size={12} />
      <span>Alice</span>
    </div>
  </div>

  {/* Status */}
  <div className="flex items-center gap-2 text-xs mono mt-3 pt-3 border-t border-slate-700/50">
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full glow-cyan"></div>
    <span className="text-cyan-400">ACTIVE</span>
  </div>
</div>
```

---

## Don'ts

❌ **Don't use bright, saturated colors** - Keep colors muted and professional
❌ **Don't use rounded corners > 8px** - Keep corners subtle (4-8px)
❌ **Don't use drop shadows** - Use glows for emphasis instead
❌ **Don't use sans-serif for data** - Always use monospace for numbers, IDs, codes
❌ **Don't use emojis** - Maintain professional appearance
❌ **Don't use multiple accent colors in one component** - Stick to one accent
❌ **Don't add unnecessary animations** - Only animate state changes

---

## File References

### Core Design Files

- **Styles**: `client/src/styles/index.css` - All custom CSS utilities
- **Tailwind Config**: `client/tailwind.config.js` - Tailwind customization
- **Components**: `client/src/components/` - All React components

### Key Components Using This System

- `ChatInterface.tsx` - Terminal-style input, message display
- `TaskBoard.tsx` - Glass cards, status badges, data grid
- `App.tsx` - Main layout, gradient backgrounds

---

## Version History

### v1.0.0 (2025-11-19)
- Initial design system documentation
- Palantir-inspired dark theme
- Glass-morphism effects
- Terminal aesthetics
- Finance-specific patterns

---

## Maintenance

This design system should be updated when:
- New color tokens are added
- New component patterns emerge
- Accessibility requirements change
- Brand guidelines evolve

Always commit design system changes with clear documentation of what changed and why.
