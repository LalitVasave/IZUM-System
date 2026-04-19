# Design System Strategy: The Kinetic Observatory

## 1. Overview & Creative North Star
The "Kinetic Observatory" is the creative North Star for this design system. It reimagines campus mobility not as a static utility, but as a living, breathing ecosystem of energy and movement. This system rejects the "flat web" trend in favor of a high-end, editorial approach that mimics a sophisticated command center.

To break the "template" look, we employ **intentional asymmetry** and **tonal depth**. Layouts should feel curated—using generous negative space to allow data-heavy components to breathe. We move away from rigid grids by layering elements; a "floating" glass module might overlap a background container, creating a sense of physical space and "resilience" that feels both professional and futuristic.

---

### 2. Colors & Surface Philosophy
The palette is rooted in the deep void of `#0e0e13`, designed to make the vibrant neon-green (`primary`) feel like light emitting from a screen.

*   **The "No-Line" Rule:** We do not use 1px solid borders to define sections. Boundaries are created through background shifts. For example, a dashboard widget (using `surface_container_low`) sits directly on the `surface` background. The eye should perceive the edge via the change in luminance, not a stroke.
*   **Surface Hierarchy & Nesting:** Use the `surface_container` tiers to create a "nested" physical reality.
    *   **Level 0:** `surface` (The base canvas).
    *   **Level 1:** `surface_container_low` (Major content sections).
    *   **Level 2:** `surface_container` (Cards or interactive modules).
    *   **Level 3:** `surface_container_highest` (Active/Hovered states).
*   **The "Glass & Gradient" Rule:** Floating UI elements (modals, tooltips, navigation bars) must use **Glassmorphism**. Combine `surface_container` with a 20px–40px backdrop-blur and a 60% opacity. 
*   **Signature Textures:** For high-priority CTAs or status hero-sections, use a linear gradient transitioning from `primary` (#8eff71) to `primary_container` (#2ff801). This adds "soul" and dimension to an otherwise digital-first interface.

---

### 3. Typography: The Technical Editorial
We utilize two distinct typefaces to balance human-centric design with technical precision.

*   **Primary (Inter):** Used for all `display`, `headline`, `title`, and `body` scales. It provides a clean, neutral foundation that ensures legibility during high-speed mobility interactions.
*   **Monospace Accents (Space Grotesk):** Used exclusively for `label-md` and `label-sm`. This is our "telemetry" font. Use it for timestamps, coordinate data, battery percentages, and status codes.
*   **Editorial Scale:** Do not fear extreme contrast. A `display-lg` (3.5rem) status update should comfortably sit near a `label-sm` (0.6875rem) technical detail. This hierarchy signals authority and precision.

---

### 4. Elevation & Depth
Elevation is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Stack `surface_container_lowest` cards on top of `surface_container_low` sections to create a natural "lift."
*   **Ambient Shadows:** If a floating effect is required (e.g., a map overlay), use an extra-diffused shadow.
    *   *Spec:* `0px 24px 48px rgba(0, 0, 0, 0.4)` with a secondary "glow" shadow: `0px 0px 12px rgba(142, 255, 113, 0.08)`.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at **15% opacity**. This creates a "whisper" of a boundary that doesn't disrupt the visual flow.
*   **Glassmorphism Depth:** When using glass containers, apply a 0.5px "Ghost Border" to the top and left edges only. This simulates a light-catch on the edge of a glass pane, enhancing the high-tech feel.

---

### 5. Components

#### Buttons
*   **Primary:** Pill-shaped (`full` roundedness). Gradient fill (`primary` to `primary_container`). On hover, add a `primary` outer glow (8px blur).
*   **Secondary:** Glass-fill (`surface_container`) with a `primary` Ghost Border.
*   **Tertiary:** No background. `primary` text. Interaction state: A subtle `primary` underline that expands from the center on hover.

#### Cards & Lists
*   **Constraint:** Zero dividers. 
*   **Execution:** Separate list items using `12px` of vertical white space. On hover, the entire list item background shifts to `surface_container_high`.
*   **Data Density:** Use `Space Grotesk` for all numerical data within cards to maintain the "Observatory" aesthetic.

#### Input Fields
*   **State:** Use `surface_container_low` for the field body.
*   **Focus:** The border remains a "Ghost Border," but a 2px `primary` glow appears at the bottom of the field.
*   **Error:** Use `error` (#ff7351) for the text and a subtle `error_container` glow.

#### Status Indicators (State-Based)
Resilience is communicated through color. These should always be accompanied by a "pulse" animation:
*   **Active:** `primary` (#8eff71)
*   **Reduced:** `secondary` (#00e3fd)
*   **Minimal:** Orange (Use a custom blend of `primary` and `error`)
*   **Alert:** `error` (#ff7351)
*   **Syncing:** Tertiary (#88f6ff)

---

### 6. Do’s and Don’ts

**Do:**
*   **Do** use motion as a functional affordance. A subtle "pulse" on a status icon indicates live data.
*   **Do** use asymmetric layouts. Place a large headline on the left and a small technical label on the far right to create a "scanned" editorial look.
*   **Do** utilize `on_surface_variant` for secondary information to maintain a sophisticated contrast ratio.

**Don’t:**
*   **Don’t** use pure white (#FFFFFF) for text. Use `on_surface` (#f9f5fd) to prevent "light bleed" on dark backgrounds.
*   **Don’t** use standard 4px or 8px corners for everything. Mix `xl` (0.75rem) for large containers with `sm` (0.125rem) for technical badges to create visual interest.
*   **Don’t** use solid separators. If content feels cluttered, increase the spacing scale rather than adding a line.