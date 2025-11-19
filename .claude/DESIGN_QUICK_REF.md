# Design System Quick Reference

For future Claude Code sessions working on Tally.

## 🎨 Visual Identity

**Style:** Palantir-inspired Intelligence Platform
**Theme:** Dark, professional, data-centric
**Primary Accent:** Cyan (#22d3ee)
**Secondary Accent:** Blue (#3b82f6)

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/DESIGN_SYSTEM.md` | Complete design system documentation |
| `/COMPONENT_PATTERNS.md` | Copy-paste component examples |
| `/client/src/design/tokens.ts` | TypeScript design tokens |
| `/client/src/styles/index.css` | Custom CSS utilities |

## 🚀 Quick Start

### Import Design Tokens
```typescript
import { colors, spacing, typography } from '@/design/tokens';
import { getStatusColor, getPriorityBorderClass } from '@/design/tokens';
```

### Common Classes

```css
/* Glass Effects */
.glass           /* Standard glass card */
.glass-dark      /* Dark glass for headers */

/* Text Styles */
.mono            /* Monospace font for data/IDs */
.gradient-text   /* Cyan-to-blue gradient text */

/* Effects */
.glow-cyan       /* Cyan glow for active states */
.glow-blue       /* Blue glow for buttons */
.pulse-glow      /* Pulsing animation */

/* Backgrounds */
.grid-bg         /* Large grid pattern */
.data-grid       /* Small grid pattern */

/* Transitions */
.transition-all-smooth  /* Standard 300ms ease */
```

## 🎯 Design Rules

### ✅ Do

- Use **monospace** for: IDs, amounts, dates, status labels
- Use **glass effects** for cards, panels, overlays
- Use **cyan (#22d3ee)** for primary/active states
- Use **all caps + tracking** for section headers
- Add **smooth transitions** to interactive elements
- Keep borders **subtle** (rgba opacity 0.1-0.3)
- Use **border-left accent** for priority/status

### ❌ Don't

- Don't use bright, saturated colors
- Don't use large border-radius (> 8px)
- Don't use drop shadows (use glows instead)
- Don't use emojis (professional appearance)
- Don't use sans-serif for numbers/IDs
- Don't add unnecessary animations

## 🎨 Color Usage

```typescript
// Status
pending/todo: #64748b (slate-500)
active/in_progress: #22d3ee (cyan-400)
blocked: #f87171 (red-400)
complete: #34d399 (emerald-400)

// Priority
low: #64748b (slate-600)
medium: #f59e0b (amber-500)
high: #f97316 (orange-500)
urgent: #ef4444 (red-500)

// Text
primary: #e2e8f0 (slate-200)
secondary: #94a3b8 (slate-400)
muted: #475569 (slate-600)
```

## 📦 Common Patterns

### Terminal Input
```tsx
<div className="relative">
  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 mono text-sm">&gt;</div>
  <input className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded text-slate-200 text-sm mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 transition-all-smooth" />
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
  {/* content */}
</div>
```

### Task Card with Priority
```tsx
<div className="glass-dark border-l-2 border-l-cyan-500 rounded p-3 hover:border-cyan-500/40 transition-all-smooth">
  {/* Priority: border-l-amber-500, border-l-orange-500, border-l-red-500 */}
</div>
```

### Metadata Display
```tsx
<div className="flex items-center gap-2 text-xs text-slate-500 mono">
  <span className="text-slate-600">INV:</span>
  <span className="text-cyan-400">INV-2847</span>
</div>
```

## 🔧 Utility Functions

```typescript
// Get status color
const color = getStatusColor('in_progress'); // returns: #22d3ee

// Get priority border class
const borderClass = getPriorityBorderClass('high'); // returns: 'border-l-orange-500'

// Format confidence
const formatted = formatConfidence(0.85); // returns: '85%'
```

## 📐 Layout Guidelines

### Spacing
- Small: `p-3` (12px)
- Medium: `p-4` (16px)
- Large: `p-6` (24px)

### Gaps
- Tight: `gap-2` (8px)
- Standard: `gap-3` (12px)
- Loose: `gap-4` (16px)

### Border Radius
- Standard: `rounded` (4px)
- Medium: `rounded-lg` (8px)

## 🎭 Icon Guidelines

**Library:** Lucide React

**Sizes:**
- xs: 12px (inline with text)
- sm: 14px (badges, labels)
- md: 16px (buttons, list items) ← Most common
- lg: 20px (headers)
- xl: 24px (hero sections)

**Colors:**
- Active: `text-cyan-400`
- Inactive: `text-slate-500`
- Warning: `text-amber-400`
- Error: `text-red-400`

## 🔍 Component Checklist

When creating components:
- [ ] Glass effect (`.glass` or `.glass-dark`)
- [ ] Border (`border-cyan-500/20`)
- [ ] Monospace for data
- [ ] Hover states with transitions
- [ ] Proper spacing (p-3/p-4)
- [ ] Semantic colors
- [ ] Focus states
- [ ] Responsive design
- [ ] Accessible contrast

## 📚 Full Documentation

For complete details, examples, and guidelines:
- **Read:** `/DESIGN_SYSTEM.md` (complete design system)
- **Copy from:** `/COMPONENT_PATTERNS.md` (ready-to-use patterns)
- **Import:** `/client/src/design/tokens.ts` (TypeScript tokens)

---

**Last Updated:** 2025-11-19
**Version:** 1.0.0
