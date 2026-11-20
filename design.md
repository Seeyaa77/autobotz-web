# AUTOBOTZ - Design System & UI Guidelines
**Style Paradigm:** Neo-Brutalist Tech (Vibrant, Bold, High-Contrast)

---

## 1. Brand Identity & Overview
- **Name:** Autobotz
- **Tagline:** Platform Sewa & Beli Script Bot Telegram Jual-Beli Akun Otomatis
- **Vibe:** Energetik, berani, modern, retro-tech, profesional namun fun & anti-boring.

---

## 2. Color Palette

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| **Primary (True Pink)** | `#FD1843` | Main CTA button, active tabs, glowing accents, highlights, primary badge fill |
| **Primary Hover** | `#E00E36` | Button hover & active click state |
| **Secondary (Chill White)** | `#FFF9FA` | Main page background, card surfaces, clean contrast sections |
| **Surface Off-White** | `#FFF0F3` | Subtle pinkish tint for secondary containers, table stripes, pill chips |
| **Dark Obsidian** | `#111217` | Text primary, dark section backdrops, high-contrast badges |
| **Brutalist Border** | `#111217` | Standard 2px - 3px solid borders across all cards, buttons, inputs |
| **Accent Mint Green** | `#10B981` | Success status, "Ready Stock", "24/7 Online", checkmarks |
| **Accent Electric Blue**| `#2563EB` | Tech chips, Telegram brand highlights, info badges |
| **Accent Vivid Amber** | `#F59E0B` | Best-seller ribbons, promo tags, warnings |

### Tailwind Color Mapping (`tailwind.config.js`)
```javascript
colors: {
  brand: {
    pink: '#FD1843',
    'pink-hover': '#E00E36',
    'chill-white': '#FFF9FA',
    'surface-tint': '#FFF0F3',
    dark: '#111217',
    muted: '#5A5E6D',
    border: '#111217',
    mint: '#10B981',
    blue: '#2563EB',
    amber: '#F59E0B'
  }
}
```

---

## 3. Neo-Brutalist Visual Rules

### A. Borders & Outlines
- All interactive components (buttons, input fields, cards, modal dialogs) have solid dark borders:
  `border-2 border-brand-dark` or `border-[3px] border-brand-dark`.
- Corner Radius: Playful neo-brutalism (`rounded-xl` / `rounded-2xl`).

### B. Hard Box Shadows (Zero Blur)
- Standard Card: `shadow-[4px_4px_0px_0px_#111217]`
- Hover Card: `shadow-[6px_6px_0px_0px_#111217] -translate-x-0.5 -translate-y-0.5`
- Primary Pink Pop Shadow: `shadow-[4px_4px_0px_0px_#FD1843]`
- Button Active Press: `shadow-[0px_0px_0px_0px_#111217] translate-x-1 translate-y-1`

### C. Typography
- Headings: Bold grotesque / sans-serif with extra tracking-tight (`font-extrabold tracking-tight`).
- Body: Clean readable sans-serif (`font-medium`).
- Tech Tags & Badges: Monospace (`font-mono text-xs uppercase tracking-wider`).

---

## 4. Component Styles

### Primary Button
- Background: `#FD1843` (True Pink)
- Text: White / Chill White (`#FFF9FA`), `font-bold`
- Border: `2px solid #111217`
- Shadow: `shadow-[4px_4px_0px_0px_#111217]`
- Transition: Fast snap `transition-all duration-150 active:translate-x-1 active:translate-y-1 active:shadow-none`

### Secondary Button
- Background: `#FFF9FA` (Chill White)
- Text: `#111217` (Dark Obsidian)
- Border: `2px solid #111217`
- Shadow: `shadow-[4px_4px_0px_0px_#111217]`

### Brutalist Badges / Stickers
- Small pill with solid border: `px-3 py-1 text-xs font-mono font-bold uppercase rounded-full border-2 border-black`
- Rotated stickers (`-rotate-2` / `rotate-3`) for catchy promotions like "BEST VALUE", "INSTANT SETUP", "100% OPEN SOURCE".

### Interactive Telegram Simulator
- Frame resembling a modern Telegram chat client.
- Header: Bot name "Autobotz Store", status "bot", profile avatar with True Pink glow.
- Body: Chat messages with buttons (inline keyboard) that respond to user clicks in real time to showcase how the bot delivers accounts instantly.

---

## 5. Layout Grid & Structure
- Max Container Width: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- Spacing: Generous vertical padding (`py-16 md:py-24`) to give brutalist elements breathing room.
- Micro-interactions: Snappy hover states, animated pulsing status dots, tab toggles for pricing switch.
