# Component Patterns

Common UI patterns for the Tally design system. Copy and paste these into your components.

---

## Terminal Input

Use for command-line style inputs.

```tsx
<div className="flex-1 relative">
  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 mono text-sm">
    &gt;
  </div>
  <input
    type="text"
    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded text-slate-200 text-sm mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600 transition-all-smooth"
    placeholder="Enter command or describe work..."
  />
</div>
```

---

## Status Badge

Use for displaying task status, actions, or states.

```tsx
// Active/Success Status
<div className="flex items-center gap-2 text-xs mono">
  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full glow-cyan"></div>
  <span className="text-cyan-400">TASK_CREATED</span>
</div>

// Pending Status
<div className="flex items-center gap-2 text-xs mono">
  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
  <span className="text-slate-500">CONVERSATION</span>
</div>

// Error/Blocked Status
<div className="flex items-center gap-2 text-xs mono">
  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
  <span className="text-red-400">BLOCKED</span>
</div>
```

---

## Glass Card

Standard glass-morphism card.

```tsx
// Standard Glass
<div className="glass rounded-lg p-4 border border-cyan-500/20">
  <h3 className="text-sm font-semibold text-slate-200 mb-2">Card Title</h3>
  <p className="text-sm text-slate-400">Card content goes here.</p>
</div>

// Dark Glass (for headers/footers)
<div className="glass-dark rounded-lg p-4 border border-cyan-500/15">
  <h3 className="text-sm font-semibold text-cyan-400 mono tracking-wider">SECTION HEADER</h3>
</div>
```

---

## Task Card

Full task card with status, priority, and metadata.

```tsx
import { Calendar, Users } from 'lucide-react';

<div className="glass-dark border-l-2 border-l-cyan-500 rounded p-3 hover:border-cyan-500/40 transition-all-smooth cursor-pointer">
  {/* Task ID */}
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

**Priority Variants:**
- Low: `border-l-slate-600`
- Medium: `border-l-amber-500`
- High: `border-l-orange-500`
- Urgent: `border-l-red-500`

---

## Confidence Progress Bar

Shows confidence score with gradient bar.

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

---

## Metadata Display

Display key-value pairs in monospace.

```tsx
// Invoice Number
<div className="flex items-center gap-2 text-xs text-slate-500 mono">
  <span className="text-slate-600">INV:</span>
  <span className="text-cyan-400">INV-2847</span>
</div>

// Amount
<div className="flex items-center gap-2 text-xs text-slate-500 mono">
  <span className="text-slate-600">AMT:</span>
  <span className="text-emerald-400">$25,000</span>
</div>

// Customer
<div className="flex items-center gap-2 text-xs text-slate-500 mono">
  <span className="text-slate-600">CLIENT:</span>
  <span className="text-slate-300">TechCorp</span>
</div>
```

---

## Button Variants

```tsx
// Primary Button (with gradient and glow)
<button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all-smooth glow-blue mono text-sm font-semibold">
  <Send size={16} />
  SEND
</button>

// Secondary Button
<button className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded hover:border-cyan-500/50 transition-all-smooth text-sm mono">
  Cancel
</button>

// Ghost Button
<button className="px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded transition-all-smooth text-sm mono">
  Learn More
</button>

// Icon Button
<button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded transition-all-smooth">
  <Settings size={16} />
</button>
```

---

## Section Header

Use for major sections of the UI.

```tsx
import { Terminal } from 'lucide-react';

<div className="glass-dark border-b border-cyan-500/20 px-4 py-3">
  <div className="flex items-center gap-2">
    <Terminal size={16} className="text-cyan-400" />
    <h2 className="text-sm font-semibold text-cyan-400 mono tracking-wider">
      COMMAND INTERFACE
    </h2>
  </div>
  <p className="text-xs text-slate-500 mt-1 mono">
    Natural language task management
  </p>
</div>
```

---

## Message Bubble

Chat message with user indicator.

```tsx
// Current User Message
<div className="flex justify-end">
  <div className="max-w-[80%] glass-dark border border-cyan-500/30 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-semibold mono text-cyan-400">
        &gt; Alice
      </span>
      <span className="text-xs text-slate-600 mono">2m ago</span>
    </div>
    <p className="text-sm text-slate-200 leading-relaxed">
      Generated invoice for TechCorp
    </p>
  </div>
</div>

// Other User Message
<div className="flex justify-start">
  <div className="max-w-[80%] glass border border-slate-700/30 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-semibold mono text-slate-400">
        • Bob
      </span>
      <span className="text-xs text-slate-600 mono">5m ago</span>
    </div>
    <p className="text-sm text-slate-200 leading-relaxed">
      What was the invoice amount?
    </p>
  </div>
</div>
```

---

## Loading States

```tsx
// Spinner
<div className="flex items-center justify-center p-8">
  <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
</div>

// Skeleton Card
<div className="glass rounded-lg p-4 animate-pulse">
  <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-3"></div>
  <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-2"></div>
  <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
</div>

// Pulsing Indicator
<div className="w-2 h-2 bg-cyan-400 rounded-full pulse-glow"></div>
```

---

## Empty State

Use when no data is available.

```tsx
import { Inbox } from 'lucide-react';

<div className="glass rounded-lg p-8 text-center">
  <Inbox size={48} className="text-slate-600 mx-auto mb-4" />
  <h3 className="text-lg font-semibold text-slate-300 mb-2">
    No tasks yet
  </h3>
  <p className="text-sm text-slate-500 mono">
    Start a conversation to create your first task
  </p>
</div>
```

---

## Filter Chips

Use for filtering or tag display.

```tsx
// Active Filter
<button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-full text-xs mono hover:bg-cyan-500/30 transition-all-smooth">
  ACTIVE
</button>

// Inactive Filter
<button className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 text-slate-400 rounded-full text-xs mono hover:border-slate-600 transition-all-smooth">
  PENDING
</button>
```

---

## Tooltip/Popover

Simple tooltip with glass effect.

```tsx
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-dark rounded px-3 py-2 text-xs mono text-slate-300 whitespace-nowrap pointer-events-none">
  Task created successfully
  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
</div>
```

---

## Table Row

Data table row with hover effect.

```tsx
<div className="glass-dark border-b border-slate-700/30 p-3 hover:bg-slate-800/50 transition-all-smooth cursor-pointer">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="text-xs text-cyan-400 mono">INV-2847</span>
      <span className="text-sm text-slate-200">TechCorp Invoice</span>
    </div>
    <div className="flex items-center gap-4 text-xs text-slate-500 mono">
      <span>$25,000</span>
      <span>Nov 19, 2025</span>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
        <span className="text-emerald-400">PAID</span>
      </div>
    </div>
  </div>
</div>
```

---

## Alert/Banner

Information or warning banners.

```tsx
// Info
<div className="glass-dark border-l-2 border-l-cyan-500 rounded p-3 mb-4">
  <div className="flex items-start gap-3">
    <Info size={16} className="text-cyan-400 mt-0.5" />
    <div>
      <h4 className="text-sm font-semibold text-cyan-400 mono mb-1">INFO</h4>
      <p className="text-sm text-slate-300">LLM parsing is enabled for intelligent task detection.</p>
    </div>
  </div>
</div>

// Warning
<div className="glass-dark border-l-2 border-l-amber-500 rounded p-3 mb-4">
  <div className="flex items-start gap-3">
    <AlertCircle size={16} className="text-amber-400 mt-0.5" />
    <div>
      <h4 className="text-sm font-semibold text-amber-400 mono mb-1">WARNING</h4>
      <p className="text-sm text-slate-300">No ANTHROPIC_API_KEY found. Using deterministic parser.</p>
    </div>
  </div>
</div>

// Error
<div className="glass-dark border-l-2 border-l-red-500 rounded p-3 mb-4">
  <div className="flex items-start gap-3">
    <XCircle size={16} className="text-red-400 mt-0.5" />
    <div>
      <h4 className="text-sm font-semibold text-red-400 mono mb-1">ERROR</h4>
      <p className="text-sm text-slate-300">Failed to create task. Please try again.</p>
    </div>
  </div>
</div>
```

---

## Grid Layout

Standard grid for task boards or data displays.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 data-grid p-4">
  {/* Column 1: PENDING */}
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Circle size={14} className="text-slate-500" />
      <h3 className="text-xs font-semibold text-slate-500 mono tracking-wider">
        PENDING
      </h3>
      <span className="text-xs text-slate-600 mono">[{count}]</span>
    </div>
    {/* Cards go here */}
  </div>

  {/* Column 2: ACTIVE */}
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <Clock size={14} className="text-cyan-400" />
      <h3 className="text-xs font-semibold text-cyan-400 mono tracking-wider">
        ACTIVE
      </h3>
      <span className="text-xs text-slate-600 mono">[{count}]</span>
    </div>
    {/* Cards go here */}
  </div>

  {/* Continue for other columns... */}
</div>
```

---

## Usage Tips

1. **Always use monospace (`mono` class) for:**
   - IDs, invoice numbers, task references
   - Amounts, dates, timestamps
   - Status labels (ALL CAPS)
   - Metadata labels

2. **Use glass effects for:**
   - Cards and panels
   - Modals and overlays
   - Headers and footers

3. **Add glow to:**
   - Status indicators (active states)
   - Primary buttons
   - Important notifications

4. **Transitions:**
   - Always use `transition-all-smooth` for hover states
   - Keep animations subtle and purposeful

5. **Color hierarchy:**
   - Cyan (#22d3ee) = Primary actions, active states
   - Blue (#3b82f6) = Secondary actions
   - Slate-200 (#e2e8f0) = Primary text
   - Slate-400 (#94a3b8) = Secondary text
   - Slate-600 (#475569) = Muted/labels

---

## Component Checklist

When creating a new component, ensure:

- [ ] Uses appropriate glass variant (`.glass` or `.glass-dark`)
- [ ] Has proper border styling (`border-cyan-500/20`)
- [ ] Uses monospace font for data/IDs
- [ ] Includes hover states with smooth transitions
- [ ] Has proper spacing (p-3 or p-4)
- [ ] Uses semantic color for status
- [ ] Includes focus states for interactive elements
- [ ] Follows the mobile-first responsive pattern
- [ ] Has accessible contrast ratios
- [ ] Uses Lucide icons at appropriate sizes

---

## Reference Files

- **Design System**: `/DESIGN_SYSTEM.md`
- **Design Tokens**: `/client/src/design/tokens.ts`
- **Styles**: `/client/src/styles/index.css`
- **Example Components**:
  - `/client/src/components/ChatInterface.tsx`
  - `/client/src/components/TaskBoard.tsx`
