# Design Guidelines: "The System" - Gamified Personal Development SaaS

## Design Approach: Reference-Based (Manhwa RPG Aesthetic)

**Primary References:** Solo Leveling, The Gamer (Korean manhwa), cyberpunk game UIs
**Philosophy:** Create an invasive, futuristic system interface that feels like a real RPG status window overlaid on reality. This is NOT a playful gamification - it's a cold, data-driven progression system that appeals to analytical minds.

**Core Principle:** The interface should feel like an omniscient AI system monitoring and optimizing the user's life, not a cute productivity app.

---

## Visual Identity

### Color Palette
- **Primary Background:** Deep slate/charcoal (`bg-slate-900`, `bg-slate-950`)
- **Secondary Background:** Translucent dark layers (`bg-slate-800/50`, `bg-slate-900/80`)
- **Accent Color:** Cyan neon (`text-cyan-400`, `border-cyan-500/30`)
- **Status Indicators:**
  - HP: Red (`bg-red-500`)
  - MP: Blue (`bg-blue-600`)
  - XP: Yellow/Gold (`bg-yellow-400`)
  - Success: Green (`border-green-500`)
  - Warning/Urgent: Red (`border-red-500`)

### Visual Effects
- **Glow Effects:** Subtle cyan glows on borders and interactive elements (`shadow-[0_0_15px_rgba(34,211,238,0.2)]`)
- **Holographic Cards:** Semi-transparent backgrounds with glowing borders for quest cards and stat panels
- **Scanline Effect:** Optional subtle horizontal lines to enhance cyberpunk aesthetic
- **Gradient Overlays:** Use sparingly on profile avatars and hero sections (`bg-gradient-to-t from-cyan-900/50`)

---

## Typography

### Font Families
- **Primary:** System font stack for readability (Inter, SF Pro Display, Segoe UI)
- **Monospace:** For stats, XP values, timestamps (`font-mono`)
- **Display:** Bold, wide-tracked uppercase for headers (`tracking-widest`, `uppercase`)

### Hierarchy
- **System Messages/Titles:** `text-xs`, `tracking-widest`, `uppercase`, cyan or slate-400
- **Player Name/Headers:** `text-2xl`, `font-bold`, `tracking-widest`
- **Stats/Numbers:** `text-4xl`, `font-mono`, cyan accent, bold
- **Quest Titles:** `font-medium`, white or yellow for urgency
- **Descriptions:** `text-sm`, slate-400, regular weight

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 3, 4, 6, 8** for consistent rhythm
- Tight spacing: `gap-2`, `p-2` (within cards)
- Standard: `gap-4`, `p-4`, `space-y-4` (between elements)
- Section separation: `space-y-6`, `mb-6`

### Grid Structure
- **Mobile-First:** Single column, full-width cards
- **Desktop:** Maintain vertical flow; avoid multi-column for main content (RPG interfaces are typically vertical scrolls)
- **Stat Rows:** Flex layout with space-between for label/value alignment

---

## Component Library

### 1. Player Status Card
- **Avatar:** 80x80px square with border, icon overlay, gradient bottom fade
- **Info Block:** Name (large), title badge (small chip), level (huge monospace number)
- **Progress Bars:** HP (red), MP (blue), XP (yellow) - thin, 2px height, rounded, with label and fraction

### 2. Stat Panel
- **Container:** Dark background (`bg-slate-900/50`), bordered, rounded
- **Stat Rows:** Icon (16px, in dark circle) + Label (uppercase, small) + Value (monospace, large) + Increment button (if points available)
- **Available Points Badge:** Yellow text, monospace, top-right corner

### 3. Quest Cards
- **Structure:** Left border (4px, colored by status), padding 16px, dark background
- **Header:** Quest type tag (small, uppercase) + difficulty rank
- **Title:** Medium weight, strikethrough if completed
- **Description:** Small text, slate-400
- **Action Button:** Border-only, hover to green glow, check icon

### 4. Journal/Chat Interface
- **Message Types:**
  - System: Cyan text, smaller, left-aligned
  - User: White text, right-aligned
- **Input:** Dark background, cyan border on focus, placeholder text in slate-500

### 5. Mapping/Graphs
- **Container:** Dark background, bordered, subtle padding
- **Chart:** Line chart with cyan stroke, dark tooltip background
- **Stat Cards:** 2-column grid, left border colored by metric (green = strength, red = weakness)

---

## Interaction Patterns

### Hover States
- **Buttons:** Glow effect, border color change to accent
- **Cards:** Subtle background lightening (`hover:bg-cyan-900/10`)
- **Stats:** No hover (static display)

### Completion Animations
- **Quest Complete:** Card background dims, text strikes through, "CONCLUÍDO" badge appears
- **Level Up:** XP bar fills, brief delay, then level number increments with glow pulse
- **Stat Increase:** Number changes with quick fade transition

### System Feedback
- **AI Response Delay:** 1.5s simulated typing for realism
- **Messages:** Auto-scroll to bottom on new entry
- **Loading States:** "Aguardando geração..." in dashed border box

---

## Special Considerations

### Monetization Tiers Visual Differentiation
- **Free (Rank E):** Standard cyan accents
- **Premium (Rank S):** Add gold/purple accents, unlock badges, exclusive quest borders

### Responsive Behavior
- **Mobile:** Full-width cards, larger touch targets (44px min), single column
- **Desktop:** Max-width container (7xl), maintain vertical scroll, wider stat displays

### Accessibility
- Maintain 4.5:1 contrast ratios (cyan-400 on slate-900 passes)
- Use semantic HTML for screen readers
- Keyboard navigation for all interactive elements

---

## Key Design Principles

1. **Data Density:** Show meaningful stats, avoid empty space - users want information overload
2. **Cyberpunk Precision:** Clean edges, perfect alignment, monospace numbers for technical feel
3. **Cold AI Persona:** No friendly language, use system terminology ("Sincronização", "Penalty Quest", "Eficiência aceitável")
4. **Progression Visibility:** Always show XP progress, level, and available points prominently
5. **Dark First:** No light mode - the darkness IS the aesthetic