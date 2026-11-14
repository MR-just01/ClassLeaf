---
name: Quiet Folio
colors:
  surface: '#fdf9f5'
  surface-dim: '#ddd9d6'
  surface-bright: '#fdf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ef'
  surface-container: '#f1edea'
  surface-container-high: '#ece7e4'
  surface-container-highest: '#e6e2de'
  on-surface: '#1c1b1a'
  on-surface-variant: '#3f4947'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f4f0ec'
  outline: '#6f7978'
  outline-variant: '#bfc8c7'
  surface-tint: '#276864'
  primary: '#0e5653'
  on-primary: '#ffffff'
  primary-container: '#2f6f6b'
  on-primary-container: '#afefea'
  inverse-primary: '#93d2cd'
  secondary: '#635e56'
  on-secondary: '#ffffff'
  secondary-container: '#e6dfd4'
  on-secondary-container: '#67625a'
  tertiary: '#734029'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f573f'
  on-tertiary-container: '#ffdccf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aeeee9'
  primary-fixed-dim: '#93d2cd'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#01504c'
  secondary-fixed: '#e9e1d7'
  secondary-fixed-dim: '#cdc5bc'
  on-secondary-fixed: '#1e1b15'
  on-secondary-fixed-variant: '#4a463f'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#feb698'
  on-tertiary-fixed: '#351001'
  on-tertiary-fixed-variant: '#6b3a24'
  background: '#fdf9f5'
  on-background: '#1c1b1a'
  surface-variant: '#e6e2de'
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.015em
  display-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  editorial-body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  editorial-body:
    fontFamily: Source Serif 4
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 29px
  ui-body:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  ui-body-medium:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies the quiet, focused discipline of a premium archival paper notebook seamlessly integrated with the frictionless utility of modern workspace software. It targets writers, researchers, thinkers, and knowledge workers who require deep focus, editorial clarity, and an environment stripped of visual noise.

The design movement combines **Minimalism** with an **Editorial Tactile** aesthetic. Interfaces prioritize text hierarchy, quiet negative space, and honest materials. It rejects synthetic high-saturation blurs, gamified rewards, and gratuitous decorations in favor of deliberate margins, restrained contrast, and archival typography. The emotional posture is calm, dependable, scholarly, and distraction-free.

## Colors

The palette draws inspiration from Japanese linen bindings, cream cotton paper, and fountain pen ink.

### Light Mode (Default)
- **Canvas / Background**: `#FAF7F2` (Warm archival linen)
- **Surface / Container**: `#FFFFFF` (Crisp paper surface)
- **Border / Rule**: `#E7E2D9` (Warm-gray structural rule)
- **Text Primary**: `#2B2A28` (Warm carbon black)
- **Text Secondary**: `#6B665E` (Subdued graphite)
- **Accent / Interactive**: `#2F6F6B` (Muted deep teal for focal triggers, links, and selected states)

### Status & Semantic Indicators
- **Draft / Inactive**: Background `#F0ECE1`, text `#6B665E`, border `transparent`
- **Published / Verified**: Background `#EAF5EE`, text `#2E7246`, border `#C5E5D0`
- **Flagged / Annotations**: Background `#FFF1C7`, underline `#E0A800`, text `#784C00`

### Dark Mode (Nocturne Mode)
- **Canvas / Background**: `#1F1E1C`
- **Surface / Container**: `#292825`
- **Border / Rule**: `#383632`
- **Text Primary**: `#F5F2EB`
- **Text Secondary**: `#9E998F`
- **Accent Teal**: `#428E89`
- **Status Draft**: Background `#2C2B27`, text `#9E998F`
- **Status Published**: Background `#1C2E24`, text `#57A977`, border `#274A37`
- **Status Flagged**: Background `#382F19`, text `#E5B842`, underline `#B88B14`

## Typography

The typographic hierarchy divides responsibility strictly:
- **Literary Voice (Source Serif 4)**: Carries all content-first experiences, headers, and sustained body reading. It provides natural cadence, open apertures, and an authoritative yet unpretentious reading tone. Editorial prose maintains an optimal line-height of ~1.7 to recreate the physical margins of hardcover book pages.
- **Instrumental Voice (Inter)**: Handles chrome, navigation, contextual metadata, inputs, and button labels. It stays quiet, objective, and ultra-crisp at low sizes without fighting the warmth of the serif body.

## Layout & Spacing

The layout is grounded in a strict 8px baseline rhythm with content-first reading columns.

- **Reading Measure**: Core document reading bodies must cap at a maximum width of `680px` (~65 characters per line), centered within the reading canvas to preserve line tracking ease and reduce eye fatigue.
- **App Shell Grid**: Sidebars and navigation conform to a modular fixed-fluid layout: collapsible navigation pane (260px fixed width), contextual utility drawer (320px fixed width), and fluid central workspace.
- **Form Factors**:
  - *Desktop (≥1024px)*: 3rem outer margins; dual column layout with persistent toolbars and centered document views.
  - *Tablet (768px - 1023px)*: 2rem outer margins; collapsable side drawers accessible via minimal icon triggers.
  - *Mobile (<768px)*: 1.25rem outer margins; strict single-column flow; 44px min touch target bounding boxes.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows or floating 3D planes. Instead, depth is achieved through **tonal stacking** and **tactile structural outlines**:

1. **Ground Tier (Canvas)**: Background `#FAF7F2` creates an earthy base layer.
2. **Layer Tier (Sheets & Cards)**: Crisp white surfaces (`#FFFFFF`) sitting on the canvas bounded by a continuous, clean `1px solid #E7E2D9` border.
3. **Soft Shadowing**: Elevations have only one standard whisper-shadow: `0 1px 3px rgba(43, 42, 40, 0.04)`.
4. **Floating Popovers & Menus**: Modals and dropdown flyouts use `0 4px 16px rgba(43, 42, 40, 0.08)` paired with the standard `1px solid #E7E2D9` border. Never use colored, saturated glows or heavy blur radii.

## Shapes

The geometry uses a balanced `roundedness: 2` (10px to 12px for primary containers) to mirror the softly cut corners of premium stationer notebooks without looking bubbly or playful.

- **Interactive Triggers (Buttons, Inputs)**: `10px` border-radius.
- **Cards & Document Panes**: `12px` border-radius.
- **Status Pills & Chips**: `9999px` (fully rounded pill) to delineate metadata cleanly from content rectangles.

## Components

### Buttons
- **Primary**: Background `#2F6F6B`, text `#FFFFFF`, border none, border-radius 10px, font `Inter` 14px weight 500. Height 40px (min 44px touch target via transparent padding on mobile). Hover: `#265C58`. Active: `#1F4A47`.
- **Secondary / Ghost**: Background transparent, border `1px solid #E7E2D9`, text `#2B2A28`. Hover: `#F0ECE1`.
- **Subtle Action**: Background transparent, border none, text `#6B665E`. Hover: `#2B2A28` with background `#F5F2EB`.

### Status Badges & Pills
- Pill shape (`padding: 2px 10px`), font `Inter` 11px weight 600, uppercase letter spacing `0.04em`.
- **Draft**: Neutral gray `#F0ECE1`, text `#6B665E`.
- **Published**: Gentle mint `#EAF5EE`, text `#2E7246`, border `1px solid #C5E5D0`.
- **Review / Uncertain**: Gold `#FFF1C7`, text `#784C00`, border `1px solid #E0A800`.

### Text Annotation Highlights
- Inline flagged words: background `#FFF1C7`, colored bottom border `1.5px solid #E0A800`, text `#784C00`, border-radius 2px.

### Cards & Blocks
- Background `#FFFFFF`, 1px border `#E7E2D9`, shadow `0 1px 3px rgba(43,42,40,0.04)`, border-radius 12px, padding `1.5rem`.

### Form Inputs
- Background `#FFFFFF`, border `1px solid #E7E2D9`, border-radius 10px, font `Inter` 15px, text `#2B2A28`. Height 42px.
- Focus: border color `#2F6F6B` accompanied by a soft non-blurring ring `0 0 0 1px #2F6F6B`.

### Checkboxes & Radios
- Size 18x18px. Border `1.5px solid #6B665E`, border-radius 4px (checkbox) / 50% (radio).
- Checked: Background `#2F6F6B`, border-color `#2F6F6B`, white checkmark or center pip.

### Icons
- Clean, monoline outline stroke (1.5px uniform weight) matching the active text token color. Never combine solid glyph fills with line icons; strictly avoid emojis and playful badges.