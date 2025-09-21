# 🎨 Event Raise Design System

## Brand Overview
Event Raise is a platform that empowers schools and parents to manage and fundraise for events. Our design system reflects our values of community, growth, and celebration.

---

## 1. Color Palette

### Primary Colors
- **Event Blue**: `#2563EB` - Primary actions, navigation, key CTAs
- **Success Green**: `#10B981` - Success states, progress indicators, positive feedback

### Secondary Colors  
- **Warm Orange**: `#F59E0B` - Accent elements, highlights, energy
- **Community Purple**: `#8B5CF6` - Secondary actions, special features

### Neutral Colors
- **Charcoal**: `#1F2937` - Primary text, headers
- **Slate**: `#64748B` - Secondary text, descriptions

### Usage Context
- **Event Blue**: Buttons, links, navigation, primary branding
- **Success Green**: Progress bars, success messages, completion states
- **Warm Orange**: Highlights, energy, celebration elements
- **Community Purple**: Secondary buttons, special features, community elements
- **Charcoal**: Headlines, important text, high contrast
- **Slate**: Body text, captions, supporting information

### CSS Variables
```css
:root {
  --event-blue: #2563EB;
  --success-green: #10B981;
  --warm-orange: #F59E0B;
  --community-purple: #8B5CF6;
  --charcoal: #1F2937;
  --slate: #64748B;
}
```

### Tailwind Classes
```css
/* Primary Colors */
.text-event-blue { color: #2563EB; }
.bg-event-blue { background-color: #2563EB; }
.border-event-blue { border-color: #2563EB; }

.text-success-green { color: #10B981; }
.bg-success-green { background-color: #10B981; }

.text-warm-orange { color: #F59E0B; }
.bg-warm-orange { background-color: #F59E0B; }

.text-community-purple { color: #8B5CF6; }
.bg-community-purple { background-color: #8B5CF6; }

.text-charcoal { color: #1F2937; }
.text-slate { color: #64748B; }
```

---

## 2. Typography

### Font Stack
- **Headings**: Inter (clean, modern, highly readable)
- **Body**: Inter (consistent with headings)
- **Accent**: Poppins (for special elements, celebrations)

### Hierarchy
- **H1**: `2.5rem / 3rem` (40px/48px) - Page titles
- **H2**: `2rem / 2.5rem` (32px/40px) - Section headers
- **H3**: `1.5rem / 2rem` (24px/32px) - Subsection headers
- **H4**: `1.25rem / 1.75rem` (20px/28px) - Card titles
- **Body**: `1rem / 1.5rem` (16px/24px) - Regular text
- **Caption**: `0.875rem / 1.25rem` (14px/20px) - Small text

### CSS Setup
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

:root {
  --font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-accent: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.2;
  color: var(--charcoal);
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.5;
  color: var(--charcoal);
}
```

---

## 3. Logo & Icon Direction

### Wordmark Concept
**"Event Raise"** - Clean, modern sans-serif with subtle upward motion
- Primary: Inter Bold
- Accent: Slight upward tilt on "Raise" (2-3 degrees)
- Color: Event Blue (#2563EB)

### Symbol Ideas
- **Rising Balloon**: Represents celebration and upward movement
- **Community Hands**: Multiple hands coming together
- **Growth Arrow**: Upward trending line with heart
- **Event Ticket**: Stylized ticket with upward sweep

### Sample Icons (SVG)

#### Balloon Icon
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.5 2 6 4.5 6 8C6 11.5 8.5 14 12 14C15.5 14 18 11.5 18 8C18 4.5 15.5 2 12 2Z" fill="#2563EB"/>
  <path d="M12 14V22" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
  <path d="M8 20L12 22L16 20" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
</svg>
```

#### Star Icon
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="#F59E0B"/>
</svg>
```

#### Event Ticket Icon
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 9C2 7.9 2.9 7 4 7H20C21.1 7 22 7.9 22 9V15C22 16.1 21.1 17 20 17H4C2.9 17 2 16.1 2 15V9Z" fill="#8B5CF6"/>
  <path d="M6 11H18" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 13H14" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
```

---

## 4. UI Elements

### Button Styles

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: #2563EB;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid #2563EB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #2563EB;
  color: white;
}
```

#### Disabled Button
```css
.btn-disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: not-allowed;
}
```

### Card Styles

#### Event Listing Card
```css
.event-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  transition: all 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

#### Fundraising Success Card
```css
.success-card {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
```

### Callout/Alert Styles

#### Success Alert
```css
.alert-success {
  background: #ECFDF5;
  border: 1px solid #10B981;
  border-radius: 8px;
  padding: 16px;
  color: #065F46;
}

.alert-success::before {
  content: "✓";
  color: #10B981;
  font-weight: bold;
  margin-right: 8px;
}
```

#### Celebration Callout
```css
.celebration-callout {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 1px solid #F59E0B;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #92400E;
}
```

---

## 5. Layout Guidelines

### Grid System
- **Desktop**: 12-column grid, max-width 1200px
- **Tablet**: 8-column grid, max-width 768px  
- **Mobile**: 4-column grid, max-width 375px

### Container Classes
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.container-sm {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 16px;
}
```

### Visual Motifs

#### Rounded Shapes
- **Cards**: 12px border-radius
- **Buttons**: 8px border-radius
- **Images**: 8px border-radius

#### Upward Sweeps
- **Progress bars**: Curved top edges
- **Accent lines**: Subtle upward curves
- **Icon containers**: Rounded with slight upward tilt

#### Arc Elements
- **Section dividers**: Curved SVG paths
- **Background patterns**: Subtle arc overlays
- **Hero sections**: Curved bottom edges

---

## 6. Tone & Imagery

### Brand Tone Keywords
1. **Celebratory** - Joyful, positive, uplifting
2. **Community-Focused** - Collaborative, supportive, inclusive
3. **Professional** - Trustworthy, reliable, organized
4. **Approachable** - Friendly, accessible, welcoming

### Photography Style
- **Candid Event Photos**: Real moments of celebration and community
- **Diverse Groups**: Inclusive representation of all community members
- **Natural Lighting**: Warm, inviting atmosphere
- **Action Shots**: People actively participating in events

### Illustration Style
- **Flat Design**: Clean, modern, minimal
- **Rounded Corners**: Soft, approachable shapes
- **Warm Colors**: Event Blue, Success Green, Warm Orange
- **Community Elements**: Groups of people, hands, celebrations

### Image Guidelines
- **Aspect Ratios**: 16:9 for hero images, 4:3 for cards
- **File Formats**: WebP for performance, PNG for transparency
- **Alt Text**: Descriptive, inclusive language
- **Loading States**: Skeleton screens with brand colors

---

## Implementation Notes

### CSS Framework Integration
This design system works seamlessly with Tailwind CSS. Use the provided color variables and component classes for consistent implementation.

### Accessibility
- **Color Contrast**: All color combinations meet WCAG AA standards
- **Focus States**: Clear focus indicators for keyboard navigation
- **Screen Readers**: Semantic HTML and proper ARIA labels

### Performance
- **Font Loading**: Use `font-display: swap` for optimal loading
- **Image Optimization**: Lazy loading and responsive images
- **CSS**: Minimal custom CSS, leverage utility classes

### Brand Consistency
- **Logo Usage**: Always maintain proper spacing and sizing
- **Color Application**: Use the defined color palette consistently
- **Typography**: Stick to the established hierarchy and font choices

This design system ensures Event Raise maintains a professional, community-driven, and modern appearance across all touchpoints.
