# CROCS visual system draft

Drafted and revised October 3, 2026. This is a design direction for the research website and refrigerator inventory prototype. It documents implemented choices separately from proposed desktop work. It is not a claim that a desktop app has been built.

## Design read

Use the opening refrigerator mark as the shared visual anchor: a simple light fridge drawn with a strong dark outline, rounded corners, small hardware details, and a hard offset shadow. The interface should feel direct, practical, and easy to inspect. Food photos remain content, not brand decoration.

The [ElevenLabs style reference on Refero](https://styles.refero.design/style/031056ff-7af1-46db-8daa-115f731c5d26) is a starting point for the interface language: warm paper, quiet neutral panels, thin dividers, generous space, lighter headings, and dark primary actions. These are visual principles, not a copy of ElevenLabs branding. CROCS keeps its own refrigerator symbol, food photography, research content, and urgency language. Its accent colors serve food and date states, not decorative product spheres.

## Source and current behavior

The opening mark is drawn in CSS in `04_Development/app/src/styles/global.css`, inside `.fridge-mark`. Its outer body is 118 by 172 pixels, with a 4 pixel border, 16 pixel radius, and an 8 pixel dark offset shadow. The handles, divider, and pale interior shelves are separate elements. A small rendering of that same CSS mark now appears in the research page header. The install icon in `04_Development/app/public/icons/fridge.svg` is still a simpler white line icon on an aubergine tile; its redesign remains open.

The research website uses a wider responsive layout. The linked prototype previously kept `.app-shell` and `.intro-screen` at a maximum width of 420 pixels, even on a desktop monitor. As of October 3, 2026, laptop widths of at least 960 pixels use persistent side navigation and wider Home, Fridge, and Scan workspaces. Secondary review and edit screens use a comfortable reading width. Phone widths retain the original bottom navigation. This is a responsive interface for the same browser-local prototype, not a synchronized multi-device inventory.

## Foundations

| Role | Current value | Use |
| --- | --- | --- |
| Ink | `#171613` | Main text, icon outline, primary actions |
| Paper | `#fdfbf7` | Primary background and reversed button text |
| Quiet surface | `#f5f2eb` | Supporting panels and cards |
| Strong surface | `#ece7de` | Hover and selected neutral surfaces |
| Hairline | `#ddd7cd` | Section and component borders |
| Muted text | `#625e57` | Descriptions and dated captions |
| Urgent | `#c9341c` | Items needing attention, never the only urgency cue |
| Aubergine | `#5a173a` | Existing install icon background and limited secondary accent |

The application names Inter followed by system sans faces; it does not bundle ElevenLabs' display font. Use lighter weights and size for large headings, while keeping labels and food names legible. Reserve uppercase for short metadata labels. Keep body copy readable at phone width.

Use an 8 pixel spacing rhythm with 4 pixel adjustments where necessary. The current app uses 24 pixel screen padding, 16 pixel stack gaps, 16 pixel general control radii, and pill primary actions. Flat cards and hairline borders provide separation. The research site uses a 1040 pixel maximum content width with 24 pixel side margins on larger screens and 20 pixel side margins on phones. Preserve those as the initial Figma tokens; proposed deviations should be marked as proposals.

## Shared component families for Figma

1. **Refrigerator mark:** black on white, monochrome reversed, and small icon sizes. Preserve the door split, handles, rounded silhouette, and hard shadow when size allows. At small sizes, omit interior shelf detail before sacrificing clarity.
2. **Buttons and links:** primary dark pill, secondary paper pill with hairline border, text link, and visible focus. Show default, hover, focus, disabled, and loading states where applicable. Use the same labels as the product.
3. **Fields:** search and manual item inputs with persistent labels, helper text, error text, and keyboard focus. Do not rely on placeholder text as the only label.
4. **Inventory item:** food name, image or fallback icon, quantity, and date urgency. Provide fresh, use soon, and needs review variants with text as well as color.
5. **Navigation:** phone bottom navigation for Home, Fridge, Scan, and Settings; desktop side navigation with the same destinations and active states.
6. **Research site:** section heading, dated status, body copy, divider, prototype screenshot, and launch link. The mark should identify the site without competing with the project explanation.

## Responsive layout direction

### Phone, current target

Use a single column at 390 pixels as the Figma reference. Preserve the bottom navigation, prominent Scan action, readable inventory groups, and one item at a time in the scanner. The website remains full width within its side margins. The three tall prototype screenshots should be designed for easier mobile browsing while retaining links to the full images.

### Tablet, proposal

Explore a wider inventory list and a visible summary without enlarging the scanner beyond a comfortable reading measure. Keep scan and review interactions focused. Do not reinterpret two columns as two separate inventories.

### Desktop, implemented first pass

At laptop widths, the app uses a 232 pixel navigation column. Home places the use first list beside the scan action and recent items. Fridge pairs the searchable inventory with a count and local storage summary. Scan pairs the simulated camera and manual entry controls with the current batch. Camera and permission dialogs are centered within the laptop viewport. Other flows use a wider reading measure without turning forms into very long rows. This layout uses the existing inventory model and does not imply that account sync or a shared backend exists. A richer item detail panel can be explored in later iterations.

## Accessibility and verification

Keep 44 pixel or larger touch targets in the phone design, visible focus indicators, meaningful labels, and text descriptions of urgency. Avoid placing essential information only in color or photography. Check both 390 pixel and desktop frames for clipped labels, long names, empty and error states, and readable contrast. After any coded changes, rerun mobile and desktop browser checks plus Lighthouse. Record what changed and when; do not present Figma proposals as implemented features.
