---
name: ViMeet Design System
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#516070'
  on-secondary: '#ffffff'
  secondary-container: '#d5e4f8'
  on-secondary-container: '#576676'
  tertiary: '#535555'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c6d6d'
  on-tertiary-container: '#f0f0f0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e4f8'
  secondary-fixed-dim: '#b9c8db'
  on-secondary-fixed: '#0e1d2b'
  on-secondary-fixed-variant: '#3a4858'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  sidebar_width: 280px
---

## Brand & Style
The design system is engineered for high-stakes collaboration and seamless communication. It evokes a sense of **reliability, focus, and professional polish**, ensuring that the technology fades into the background so the conversation can take center stage. 

Drawing from **Modern Corporate** aesthetics, the style emphasizes clarity and utilitarian elegance. It utilizes generous whitespace to reduce cognitive load during long meetings and employs a refined color palette that signals trust. The visual language is intentionally "un-fussy," favoring precise alignment and functional hierarchy over decorative flourishes, mirroring the efficiency of top-tier productivity tools like Slack and Google Meet.

## Colors
The palette is anchored by "Professional Blue," a high-contrast primary used for core actions and brand presence. The supporting palette utilizes a "Light Blue" for soft backgrounds and subtle highlighting, while "Light Gray" and "White" provide the structural foundation for the UI's tonal layers.

For semantic feedback, the system employs standard high-visibility hues for success, warning, and danger states, ensuring accessibility is maintained. In video environments, these colors should be applied with consideration for overlay legibility against varying skin tones and backgrounds.

## Typography
This design system utilizes **Inter** for its exceptional legibility and neutral, modern character. The hierarchy is strictly defined to help users scan complex information quickly. 

- **Headlines:** Use tight letter-spacing and semi-bold weights to create a strong visual anchor for page sections.
- **Body Text:** Standardized at 16px for optimal readability. 14px is reserved for secondary metadata or dense sidebar information.
- **Labels:** Utilized for buttons, tags, and small captions, often employing a slightly heavier weight (Medium or Semi-Bold) to ensure they stand out even at small scales.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid model**. 
- **Navigation & Sidebars:** Fixed width (280px) to provide a stable anchor for tools and participant lists.
- **Main Canvas:** Fluid grid that adapts to the number of video tiles present, maximizing screen real estate.
- **Grid:** A 12-column grid is used for dashboard views with 24px gutters.

The spacing rhythm is built on a 4px baseline. Use 16px (md) for standard padding within cards and containers, and 24px (lg) for margins between major layout sections. For mobile views, margins should compress to 16px to conserve space.

## Elevation & Depth
Depth in the design system is achieved through **Tonal Layering** and **Ambient Shadows**. 

1. **Level 0 (Base):** Light Gray (#F3F4F6) for the main application background.
2. **Level 1 (Surface):** White (#FFFFFF) for cards and primary content containers, featuring a subtle 1px border (#E5E7EB).
3. **Level 2 (Elevated):** Soft, diffused shadows used for dropdowns, modals, and active video tiles. Shadows should use a low-opacity blur (e.g., `0 4px 12px rgba(0,0,0,0.05)`) to feel natural rather than harsh.
4. **Active States:** Elements being interacted with (like a dragged video tile) receive a more pronounced shadow to indicate they are lifted from the canvas.

## Shapes
The design system uses a friendly yet professional roundedness scale. 
- **Standard Elements:** Buttons and small input fields use a 12px (rounded-xl) radius.
- **Large Containers:** Cards, video tiles, and sidebar modules use a 16px (rounded-2xl) radius to soften the overall interface and make it feel more modern and approachable.
- **Interactive States:** Focus rings should follow the curvature of the element they surround, typically with a 2px offset.

## Components

### Buttons
- **Primary:** Professional Blue background, White text. High emphasis.
- **Secondary:** Light Blue (#DBEAFE) background, Professional Blue text. Medium emphasis.
- **Ghost:** Transparent background, Professional Blue or Gray text. Used for secondary navigation or low-priority actions.
- **Danger:** Danger Red (#EF4444) background, White text. Reserved for "End Meeting" or "Delete" actions.

### Video Tiles
Video tiles are the core of the experience. They must maintain a 16:9 aspect ratio where possible. The participant's name should be displayed in a semi-transparent dark pill in the bottom-left corner. An active speaker should be highlighted with a 2px Professional Blue border.

### Sidebar & Navigation
The sidebar uses a clean, vertical list style. Active items are indicated by a Professional Blue left-accent bar and a soft blue background tint. Icons should be line-based (2px stroke) for a lightweight feel.

### Input Fields
Standard fields use the 12px radius, a 1px Light Gray border, and a 16px horizontal padding. On focus, the border transitions to Professional Blue with a soft blue outer glow (halo).

### Cards
Cards are White with a 16px radius and a very subtle shadow. They should be used to group related dashboard information, such as upcoming meetings or recent recordings.