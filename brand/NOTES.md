# Brand Logo System Design Notes

## Overview

This deliverable establishes the complete brand logo system for Alignment Integration and the PAL Product family (PAL Products parent mark, Student Pal, Therapist Pal, and Personal Pal) on branch `brand-logo-system`.

All assets have been created inside the `brand/` directory with zero modifications to any existing site code, stylesheets, or configuration files outside `brand/`.

---

## 1. Design Grammar & Architectural Family Rules

The PAL product marks share a single, disciplined visual construction grammar that mirrors the engineering sheet aesthetic of `alignmentandintegration.com`:

1. **Shared Container Grammar**: Each product mark features a continuous `48x48` viewBox enclosed within a subtle 10px corner radius (`rx="10"`) rounded frame, constructed with a consistent 2.5px stroke weight.
2. **Signature Accent Node**: Every mark carries a circular terminal accent dot (`r=2.5`), directly echoing the circular node geometry of the Alignment Integration master sprout monogram (`r=2.6` / `r=2.4`).
3. **Flat, Geometric, Minimal**: Zero gradients, zero 3D bevels, zero mascots. Built purely with clean SVG vector geometry that holds visual clarity at 16px, 32px, 48px, and large deck cover sizes.

---

## 2. Glyph Meanings & Product Specifics

### Alignment Integration (Master Mark)
- **File path**: `brand/alignmentandintegration/`
- **Palette**: Primary Spruce `#2d4a3e`, Second Green `#3a5a40`, Cream Paper `#f7f6f2`
- **Glyph Description**: Formalization of the site's locked circular sprout monogram. Redrawn with precise Bezier arcs and stroke geometry, preserving the dual-stroke stem, solid left leaf sprout, right leaf outline, and double accent node dots.

### PAL Products (Parent Family Mark)
- **File path**: `brand/pal/`
- **Palette**: Ink `#1c1d1c` (Neutral parent color)
- **Glyph Description**: A structural, monoline capital "P" integrated with the alignment vertical axis and a right accent node (`r=2.5`). Designed to stand independently in dropdowns or on pitch deck covers.

### Student Pal
- **File path**: `brand/student-pal/`
- **Palette**: Violet `#5a3d9e` (Deep `#432b78`)
- **Glyph Description**: An open book / upward trajectory chevron curve paired with a top spark node (`cx=24, cy=14, r=2.5`), symbolizing learning, discovery, growth, and academic trajectory. Replaces the temporary "SP" square favicon placeholder.

### Therapist Pal
- **File path**: `brand/therapist-pal/`
- **Palette**: Calm Teal `#1f5f5b` (Deep `#14403d`)
- **Glyph Description**: Dual interlocking sanctuary arches (representing listening ears and empathetic embrace) surrounding a central grounding balance node (`cx=24, cy=24, r=2.5`), symbolizing safety, equilibrium, and professional care.

### Personal Pal
- **File path**: `brand/personal-pal/`
- **Palette**: Deep Rose `#7d3650` (Deep `#592437`)
- **Glyph Description**: A geometric seedling heart formed by two sweeping leaf curves with an inner core accent node (`cx=24, cy=18, r=2.5`), symbolizing inner reflection, self-care, and personal alignment.

---

## 3. Conflicts Found & Resolved

- **Student Pal Hue Conflict**:
  - The live web app at `student-pal.netlify.app` uses indigo `#5b53e0` internally.
  - The main site specification (`design.md` and marketing site) locks Student Pal's primary hue to `#5a3d9e` (deep `#432b78`).
  - **Resolution**: Following prompt rules, the site palette (`#5a3d9e`) wins for all master brand deliverables.

---

## 4. Recommendations for Future Rollout

1. **Favicon Integration**: When deploying the new logo system to the live site, replace the inlined data-URI SVGs in the `<head>` of each page with their respective 16px-optimized `favicon.svg` files (`brand/<name>/favicon.svg`).
2. **Header Monogram Synchronization**: Update the inline SVG header monograms across audience pages to point to `brand/alignmentandintegration/mark.svg` or consume the unified SVG asset system.
