# Brand Logo System Design Notes

## Overview

This deliverable establishes the brand logo system for Alignment Integration on branch `brand-logo-system`.

All assets were created inside the `brand/` directory with zero modifications to any existing site code, stylesheets, or configuration files outside `brand/`.

---

## 1. Master mark

### Alignment Integration
- **File path**: `brand/alignmentandintegration/`
- **Palette**: Primary Spruce `#2d4a3e`, Second Green `#3a5a40`, Cream Paper `#f7f6f2`
- **Glyph Description**: Formalization of the site's locked circular sprout monogram. Redrawn with precise Bezier arcs and stroke geometry, preserving the dual-stroke stem, solid left leaf sprout, right leaf outline, and double accent node dots.
- **Construction**: Flat, geometric, minimal. Zero gradients, zero 3D bevels, zero mascots; clean SVG vector geometry that holds at 16px, 32px, 48px, and large deck cover sizes.

---

## 2. Recommendations for Future Rollout

1. **Favicon Integration**: When deploying the logo system to the live site, replace the inlined data-URI SVGs in the `<head>` of each page with the 16px-optimized `brand/alignmentandintegration/favicon.svg`.
2. **Header Monogram Synchronization**: Update the inline SVG header monograms across pages to point to `brand/alignmentandintegration/mark.svg` or consume the unified SVG asset system.
