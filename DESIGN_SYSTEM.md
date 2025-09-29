EventraiseHub Design System (Light Theme)

## Tokens
- Colors (CSS vars in `app/globals.css`):
  - Primary: `--hub-blue` (#1D4ED8)
  - Success: `--success-green` (#059669)
  - Accent warm: `--energy-orange` (#EA580C)
  - Purple: `--hub-purple` (#7C3AED)
  - Gold: `--hub-gold` (#F59E0B)
  - Neutrals: `--charcoal` (#1F2937), `--slate` (#475569)
- Base palette: `--background` (white), `--foreground` (charcoal)
- Shadows: `--shadow-soft`, `--shadow-elevated`, `--shadow-button`
- Radius: `--radius` = 8px
- Fonts: `--font-heading`/`--font-body` = Inter, fallbacks

## Components
- Buttons: use `components/ui/button.tsx`
  - Variants: `default` (primary blue), `outline`, `ghost`, `secondary`, `link`
  - Sizes: `default`, `sm`, `lg`, `mobile`, `icon`
  - Prefer default for primary CTAs, `outline` for secondary, `ghost` for nav/actions
- Cards: use `components/ui/card.tsx`
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
  - Keep content padding `p-4 sm:p-6`; avoid custom shadows unless needed
- Inputs: use `components/ui/input.tsx`
  - Height 48px, clear hover/focus rings; use labels from `components/ui/label`

## Layout
- Root background: white; no forced `dark` class
- Navigation: `components/layout/navigation.tsx` with `ghost` buttons
- Footer: `components/layout/Footer.tsx`
- Containers: max width `max-w-7xl`, horizontal padding `px-4 sm:px-6 lg:px-8`, vertical `py-8`

## Page Patterns
- Loading state: centered spinner with blue border, gray text
- Empty state: centered icon, `text-gray-900` heading, `text-gray-600` body
- Headings: h1 `text-3xl sm:text-4xl font-bold`, section h2 `text-2xl/3xl`

## Usage Guidance
- Prefer semantic `Button` variants over custom `btn-*` classes
- Prefer `Card` + `CardHeader`/`CardContent` over ad-hoc bordered containers
- Keep text colors: body `text-gray-700/600`, headings `text-gray-900`
- Spacing: use `space-y-*`, grid gap `gap-4 sm:gap-6`

## Deprecated Classes (avoid going forward)
- Background gradients for page shells: `bg-gradient-to-br from-gray-900 via-black to-gray-800`
- Custom button classes: `.btn-primary`, `.btn-secondary`, `.btn`, `.btn-mobile`, `.btn-mobile-lg`
- Ad-hoc dark variants in nav: `dark:*` in `navigation.tsx` (removed)

## Migration Notes
- Replace custom buttons with `<Button>` variants
- Replace gradient page backgrounds with `bg-white`
- Use shared `Footer` from layout instead of per-page footers

# 🎨 EventraiseHub Design System

## Overview
This design system ensures consistent, accessible, and beautiful user interfaces across the EventraiseHub platform. Built with the neon blue/orange theme and dark backgrounds for a modern, professional look.

## 🎨 Color Palette

### Primary Colors
- **Neon Blue**: `#00BFFF` - Primary actions, links, highlights
- **Neon Orange**: `#FF6B35` - Secondary actions, accents, success states
- **Dark Background**: `#0A0A0A` - Main background
- **Dark Surface**: `#1A1A1A` - Cards, modals, elevated surfaces

### Text Colors
- **Primary Text**: `#FFFFFF` - Headings, important text
- **Secondary Text**: `#B0B0B0` - Body text, descriptions
- **Muted Text**: `#808080` - Placeholders, captions

## 🔤 Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Hierarchy
- **H1**: `2.5rem` / `700` / `1.2` - Page titles
- **H2**: `2rem` / `600` / `1.3` - Section headers
- **H3**: `1.5rem` / `600` / `1.4` - Subsection headers
- **H4**: `1.25rem` / `500` / `1.4` - Card titles
- **Body**: `1rem` / `400` / `1.5` - Regular text
- **Caption**: `0.875rem` / `400` / `1.5` - Small text

## 🧩 Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #00BFFF 0%, #0099CC 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid #00BFFF;
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 191, 255, 0.4);
  background: linear-gradient(135deg, #00BFFF 0%, #FF6B35 100%);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: #FF6B35;
  border: 2px solid #FF6B35;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
  color: white;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}
```

### Input Fields
```css
.input {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(0, 191, 255, 0.3);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: #00BFFF;
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.2);
}

.input::placeholder {
  color: #9CA3AF;
}
```

### Cards
```css
.card {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(0, 191, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.card-elevated {
  background: rgba(31, 41, 55, 0.7);
  border: 1px solid #00BFFF;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## 🎭 Animations

### Hover Effects
- **Scale**: `transform: scale(1.05)` on hover
- **Glow**: Enhanced box-shadow with neon colors
- **Translate**: `transform: translateY(-2px)` for buttons

### Loading States
- **Spin**: Rotating border for loading indicators
- **Pulse**: Pulsing glow effect for active states
- **Bounce**: Gentle bounce for attention-grabbing elements

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Grid System
- **Container**: `max-width: 1280px`
- **Padding**: `16px` mobile, `24px` tablet, `32px` desktop
- **Gap**: `16px` mobile, `24px` tablet, `32px` desktop

## ♿ Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have clear focus states
- Color is not the only way to convey information

### Focus States
```css
:focus-visible {
  outline: 2px solid #00BFFF;
  outline-offset: 2px;
}
```

## 🎨 Usage Guidelines

### Do's
✅ Use the neon blue for primary actions
✅ Use the neon orange for secondary actions
✅ Maintain consistent spacing (8px grid)
✅ Use the dark background for all pages
✅ Apply hover effects consistently

### Don'ts
❌ Don't use light backgrounds
❌ Don't mix different color schemes
❌ Don't use low contrast text
❌ Don't skip hover states
❌ Don't use inconsistent spacing

## 🔧 Implementation

### CSS Variables
```css
:root {
  --neon-blue: #00BFFF;
  --neon-orange: #FF6B35;
  --dark-bg: #0A0A0A;
  --dark-surface: #1A1A1A;
  --text-light: #FFFFFF;
  --text-muted: #B0B0B0;
}
```

### Tailwind Classes
```css
/* Backgrounds */
.bg-gradient-dark { background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%); }

/* Text */
.text-neon-blue { color: #00BFFF; }
.text-neon-orange { color: #FF6B35; }

/* Borders */
.border-neon-blue { border-color: #00BFFF; }
.border-neon-orange { border-color: #FF6B35; }
```

## 📋 Component Checklist

When creating new components, ensure:

- [ ] Uses consistent color palette
- [ ] Has proper hover states
- [ ] Meets accessibility standards
- [ ] Is responsive across devices
- [ ] Follows spacing guidelines
- [ ] Uses appropriate typography
- [ ] Has clear focus states
- [ ] Matches the neon theme

## 🚀 Getting Started

1. Import the design system CSS
2. Use the provided component classes
3. Follow the color palette
4. Test accessibility
5. Verify responsive behavior

This design system ensures a cohesive, professional, and accessible user experience across the entire EventraiseHub platform.
