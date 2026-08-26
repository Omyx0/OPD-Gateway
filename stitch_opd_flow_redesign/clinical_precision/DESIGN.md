---
name: Clinical Precision
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#3755c3'
  on-secondary: '#ffffff'
  secondary-container: '#708cfd'
  on-secondary-container: '#00217a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  card-gap: 24px
  container-padding-desktop: 40px
  container-padding-mobile: 16px
  bento-radius: 24px
---

## Brand & Style
The design system is engineered for the high-stakes environment of healthcare technology, prioritizing cognitive ease and professional trust. The aesthetic is anchored in **Minimalism**, utilizing generous whitespace to reduce clinician burnout and patient anxiety. 

A structured **Bento UI** logic organizes complex patient data into digestible, intentional modules, ensuring that the most critical information is prioritized through size and placement. To evoke a sense of "future-ready" care, the system selectively employs **Glassmorphism** and **Aurora gradients**—not as decorative flair, but as functional depth cues for active states and high-priority notifications. The result is a UI that feels calm, efficient, and technologically advanced without the visual clutter of traditional medical software.

## Colors
The palette is dominated by a range of **Deep Navy** and **Professional Blues** to establish an immediate sense of institutional authority and calm. 

- **Primary & Secondary:** Used for core navigation, high-level headers, and primary actions.
- **Accents:** Soft Cyan and Indigo are reserved for interactive data points, focus states, and the subtle "Aurora" background glows that signify the application’s active processing state.
- **Semantic Logic:** Success (Emerald), Waiting (Amber), and Emergency (Rose) follow industry standards but are rendered with slightly desaturated tones to maintain the minimalist aesthetic.
- **Surface Strategy:** Backgrounds utilize a very light cool gray to reduce screen glare during long shifts, while Pure White is reserved for the foreground Bento cards to create a clear "object" hierarchy.

## Typography
This design system uses a dual-font strategy. **Geist** provides a technical, precise feel for headings, labels, and numerical data. **Inter** is used for body copy to ensure maximum readability and a humanist touch.

- **Numerical Priority:** For queue management and vitals, use the `display-hero` or `headline-lg` styles. These should be treated as primary visual anchors.
- **Metadata:** Use `label-caps` for table headers and secondary category descriptors to create a clear distinction from patient data.
- **Technical Readability:** `data-mono` (Geist's built-in metrics) should be used for timestamps, ID numbers, and medical dosages to ensure character clarity.

## Layout & Spacing
The layout follows a **Bento UI** philosophy, organized on a 12-column grid for desktop. 

- **Grid Logic:** Elements are grouped into cards of varying spans (e.g., a 2x2 grid for vitals, a 4x2 grid for patient history). 
- **Rhythm:** A strict 4px baseline shift is used. Gutters are fixed at 24px to provide "air" between distinct data modules.
- **Responsive Adaption:** On tablet, the 12-column grid reduces to 6 columns. On mobile, the Bento cards stack vertically into a single column, with the side navigation collapsing into a bottom-anchored "Quick Action" bar.
- **Safe Zones:** High-priority buttons (e.g., 'Call Next Patient') should always maintain a 24px safe zone from other interactive elements to prevent accidental clicks.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Selective Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Background):** The canvas layer (#F8FAFC), featuring soft, diffused Aurora blurs in the corners to provide a sense of atmospheric depth.
- **Level 1 (Bento Cards):** Pure white surfaces with a 1px solid border (#E2E8F0). These have no shadow in their default state to maintain a flat, clean look.
- **Level 2 (Active/Floating):** Use a backdrop-filter (blur: 12px) with 80% opacity. This is reserved for modals, dropdowns, and "pinned" patient files. A very soft, large-radius ambient shadow (10% opacity Deep Navy) is applied here.
- **Micro-depth:** Hover states on interactive cards should trigger a subtle lift (y-offset: 4px) and a slightly more pronounced blue-tinted shadow.

## Shapes
The shape language is "Soft-Modern." While the system uses `roundedness: 2` (0.5rem) for standard components like buttons and inputs, the **Bento Cards** themselves utilize a larger `rounded-xl` (1.5rem / 24px) to create a friendly, approachable container for technical data.

- **Buttons:** 8px (0.5rem) corner radius.
- **Input Fields:** 8px (0.5rem) corner radius.
- **Badges/Chips:** Full pill-shape (999px) for status indicators.
- **Selection States:** Use a 4px inner radius for checkboxes and radio buttons to match the system's geometric precision.

## Components
- **Bento Cards:** The foundational container. Must include a consistent 24px internal padding. Titles should be `label-caps` in the top left.
- **Premium Buttons:** Primary buttons use a subtle vertical gradient (from `Professional Blue` to `Deep Navy`) with a crisp 1px top-border highlight. Secondary buttons are "Ghost" style with a `Cool Blue` outline.
- **Status Badges:** Use a desaturated background of the semantic color with high-contrast text. For example, a 'Waiting' badge uses 10% Amber fill with 100% Amber text.
- **Progress Indicators:** Use thin (4px) linear bars for patient flow tracking, employing the `accent_cyan` to show "active" movement.
- **Application Shell:** 
    - **Desktop:** A fixed 280px left sidebar in `Deep Navy` with collapsed/expanded states.
    - **Mobile:** A floating bottom tab bar with glassmorphic background blur, housing the four primary navigation nodes.
- **Input Fields:** Minimalist design with no background (transparent) and a bottom-border only in the default state, shifting to a full 1px `Professional Blue` border on focus.