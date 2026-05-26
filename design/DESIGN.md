---
name: Cyber-Informatics Design System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#baccb0'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#85967c'
  outline-variant: '#3c4b35'
  surface-tint: '#2ae500'
  primary: '#efffe3'
  on-primary: '#053900'
  primary-container: '#39ff14'
  on-primary-container: '#107100'
  inverse-primary: '#106e00'
  secondary: '#acd19f'
  on-secondary: '#193714'
  secondary-container: '#2f4e28'
  on-secondary-container: '#9bbf8f'
  tertiary: '#fdf9f9'
  on-tertiary: '#313030'
  tertiary-container: '#e0dddc'
  on-tertiary-container: '#626161'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#79ff5b'
  primary-fixed-dim: '#2ae500'
  on-primary-fixed: '#022100'
  on-primary-fixed-variant: '#095300'
  secondary-fixed: '#c8edb9'
  secondary-fixed-dim: '#acd19f'
  on-secondary-fixed: '#042102'
  on-secondary-fixed-variant: '#2f4e28'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  container-max: 1280px
---

## Brand & Style
The design system is engineered to evoke the high-performance atmosphere of advanced computing environments and terminal interfaces. It targets a developer-centric audience, emphasizing technical mastery, precision, and an elite "hacker" aesthetic. 

The visual direction combines **Glassmorphism** and **Cyber-Informatics** styles. By layering translucent surfaces over a pure black void, the system creates a sense of infinite depth. The primary emotional response is one of focus and digital sophistication, using vibrant light-source effects (glowing borders and neon accents) to guide the eye through complex data structures.

## Colors
The color palette is strictly rooted in a high-contrast dark environment.
- **Primary:** The neon green (#39FF14) acts as the "active" light source, used for primary actions, success states, and glowing accents.
- **Surface:** The background is a true black (#000000) to maximize contrast and eliminate panel-bleed. 
- **Layers:** Glass layers use a semi-transparent dark gray (#1A1A1A at 60% opacity) to create the frosted glass effect.
- **Accents:** A deep, forest-green "Shadow Green" (#0D2B09) is used for subtle gradients and low-priority backgrounds to prevent the UI from feeling flat.

## Typography
The typography strategy leverages the contrast between industrial utility and modern readability. 
- **Headings:** Use **JetBrains Mono** to reinforce the informatics/coding theme. These should be set with tight letter-spacing to maintain a dense, technical feel.
- **Body Text:** Use **Inter** for its exceptional legibility in dark mode environments. It provides a clean, neutral balance to the aggressive headings.
- **Data Labels:** Use the monospace font for all numerical data, status indicators, and metadata to simulate a terminal read-out.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

The spacing rhythm is based on a **4px base unit**, emphasizing tight, mathematical alignment. Layouts should feel modular, like a command center dashboard. Components should utilize generous internal padding (typically 24px-32px) to offset the visual weight of neon borders and glowing effects. All cards and containers should align to the grid to maintain a structured, "engineered" appearance.

## Elevation & Depth
Depth is communicated through **transparency and light emission** rather than traditional shadows.
- **Base Level:** Pure black background.
- **Level 1 (Glass):** Semi-transparent surfaces with a 12px-20px backdrop blur and a 1px border.
- **Level 2 (Active):** High-intensity neon green borders (#39FF14) with a 4px to 8px outer "bloom" (glow) effect using a drop-shadow with 0-spread and high blur.
- **Interactions:** When an element is hovered or focused, the glow intensity increases, simulating a power surge in the hardware.

## Shapes
The system uses **Soft (0.25rem)** roundedness to maintain a precise, technical look without the harshness of raw 90-degree angles. 
- **Small Components:** (Buttons, Inputs) use 4px radius.
- **Large Components:** (Cards, Modals) use 8px (rounded-lg) to soften the glass edges.
- **Status Pills:** Can occasionally use a full pill-shape for high-contrast visibility against the rigid grid.

## Components
- **Neon-Bordered Cards:** These feature a 1px solid border in the primary color or a semi-transparent green. Use `backdrop-filter: blur(12px)` to create the glass effect.
- **Glowing Buttons:** Primary buttons are filled with the neon green color with black text. Apply a `box-shadow` with the same green color at 50% opacity to create a "bloom" effect. Secondary buttons use a ghost style with a neon border.
- **Input Fields:** Styled as "Command Lines." They feature a terminal prompt character (e.g., `>`) as a prefix and a blinking underscore cursor in the primary color.
- **Line-Art Icons:** Use ultra-thin (1px or 1.5px stroke) icons. Icons should be monochromatic green or white, never multi-colored.
- **Progress Bars:** Represented as "loading sequences" with segmented blocks rather than a smooth continuous fill, reinforcing the digital/retro-tech vibe.
- **Chips/Badges:** Small, monospace text labels with a low-opacity green background and a crisp 1px border.