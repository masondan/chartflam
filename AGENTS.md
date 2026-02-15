# ChartFlam - Technical Reference

## Project Overview

**ChartFlam** is a free, mobile-first web app that enables content creators and journalists to quickly generate simple, social media-ready charts without technical expertise.

- **Objective**: Easy data visualization for non-technical users
- **Target**: Content creators, journalists, educators
- **Status**: Deployed and in active use; currently refining based on user feedback
- **Scope**: Non-commercial, limited-use educational tool
- **Deployment**: Cloudflare Pages (static site)

---

## Architecture & Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| Chart Rendering | Chart.js 4.4.0 |
| Color Picker | Coloris (external library) |
| Data Format | CSV parsing for bulk input |
| Styling | CSS custom properties, mobile-first responsive |
| Icons | SVG (inline currently; being refactored) |
| Build Process | None—open `index.html` in browser |
| Testing | Manual on Chrome/Safari (macOS), Chrome/Safari (iOS), Chrome (Android) |

---

## File Structure

```
chartflam/
├── index.html              # Single HTML entry point (1.6 KB)
├── app.js                  # All JavaScript logic (3,444 lines) **[see Issues below]**
├── styles.css              # All styles (31 KB)
├── manifest.json           # PWA manifest
├── pictogram-icons.js      # Pictogram icon data (593 lines)
├── icons.js                # EMPTY - to be removed or replaced
├── public/
│   ├── chartflam-logo.png
│   ├── chartflam-icon*.png
│   └── icons/              # SVG icons (folder structure TBD)
├── info/                   # Unused SVG drafts
└── AGENTS.md               # This file
```

---

## Application State & Core Concepts

### State Management
All application state is stored in a single centralized `state` object (`app.js`, line 7–92):
- **Chart data**: `chartData.labels`, `chartData.datasets`
- **Chart config**: type, title, caption, background color
- **Style properties**: per-chart-type (smoothing, gap, orientation, marker styles, etc.)
- **UI state**: active controls, form values, processing flags

### Chart Types Supported
1. **Pie** — Single-series categorical data
2. **Donut** — Pie variant with hollow center
3. **Bar** — Single or multi-series; vertical/horizontal; grouped/stacked
4. **Line** — Single or dual-line; smooth/sharp; with/without markers
5. **Pictogram** — Fixed 10-icon display; filled/unfilled ratio

### Data Input Methods
- **Manual**: Row-by-row label + value entry
- **CSV paste**: Bulk import; auto-detects multi-series (up to 3 columns)

### Core Rendering
- `renderChart()` — Single function that detects chart type and applies all style settings
- Chart.js instance stored in `state.chart`; destroyed and recreated on type/data change

---

## Code Conventions

### JavaScript
- Use ES6+ (`const`/`let`, arrow functions, template literals)
- Function naming: `camelCase`
- Structure `app.js` with section markers: `// ============ SECTION NAME ============`
- Debounce event handlers for performance (search, slider input): `debounce(func, 300)`
- Wrap risky operations in `try...catch` (CSV parsing, Chart.js rendering)
- Validation functions return `{ valid: boolean, value: any, error: string }`

### CSS
- CSS custom properties for theming (colors, spacing, radius)
- Mobile-first responsive design
- Semantic element naming: `.chart-display-container`, `.control-section`, etc.
- ARIA attributes on all interactive elements for accessibility

### HTML
- Semantic HTML5 tags
- Comprehensive ARIA attributes: `role`, `aria-label`, `aria-selected`, `aria-expanded`, etc.
- All interactive elements must be keyboard accessible
- Form inputs include validation feedback via `aria-invalid` attribute

---

## Known Issues & Technical Debt

### Critical (Remove Before Production Polish)
1. **51 console.log statements** throughout `app.js` — Remove all or wrap in debug flag
2. **Empty `icons.js` file** — Delete; refactor icons to `icon-mapping.js`
3. **Coloris button display hack** (lines 249–325) — MutationObserver workaround is fragile; library integration needs review

### Significant
4. **170+ direct DOM queries** — Tightly couples code to DOM; refactor to centralized helper or cache frequently-accessed elements
5. **CSV parsing scattered** — `updateDataFromCSV()`, `parseMultiLineCSV()`, `parseMultiSeriesBarCSV()` lack unified pattern; should use adapter or factory
6. **Inline SVG strings** — Currently embedded throughout HTML generation; refactor to external files with `icon-mapping.js`

### Moderate (Improve for Maintainability)
7. **Chart type-specific logic duplicated** — Title/caption styling, color initialization, legend updates repeated across chart types; extract to reusable helpers
8. **Slider/smoothing state management** — `updateSmoothing()`, `updateSmoothingSlider()`, `updateSmoothingVisibility()` tightly coupled; unclear separation of concerns
9. **No localStorage** — User charts lost on page refresh; persistence recommended
10. **No undo/redo** — Users cannot recover from mistakes easily

---

## Development Notes

### Adding a New Feature
1. Update `state` object if new property needed
2. Add event listener in `initEventListeners()` (line 580)
3. Create update function that modifies `state` and calls `renderChart()`
4. For chart-type-specific UI, update `initDataControls()`, `initStyleControls()`, or `initColorControls()`

### Working with Icons
Currently refactoring to external SVG files + mapping. See `/public/icons/` folder structure (TBD). Map filenames to usage in `icon-mapping.js` (to be created).

**Chart Type Icons (Main Selector):**
- `pie-chart.svg`, `donut-chart.svg`, `bar-chart.svg`, `line-chart.svg`, `pictogram.svg`

**Control Icons:** Use kebab-case filenames; full list in project documentation.

### Keyboard Shortcuts
Implemented but not exposed in UI (line 795–817):
- `?` → Help
- `s` → Download
- Arrow keys → Navigate controls
- Consider exposing in help modal for discoverability.

### Testing Checklist
- [ ] Desktop (Chrome, Safari on macOS)
- [ ] Mobile (Chrome on Android, Safari on iOS)
- [ ] Touch interactions (swipe, tap)
- [ ] Keyboard navigation (Tab, Enter, arrow keys)
- [ ] Screen reader (VoiceOver, TalkBack)
- [ ] All 5 chart types with 1–20 data points
- [ ] Multi-series (bar, line) with 2–3 series
- [ ] CSV import (valid + edge cases)
- [ ] Download PNG across browsers

---

## Refactoring Roadmap (Optional)

**Not Recommended**: Refactor to SvelteKit now. ChartFlam works, is deployed, and serves users well. Refactoring has diminishing ROI for a non-commercial, limited-use tool.

**Recommended Instead**:
1. **Fix critical issues** (console.logs, empty files, Coloris)
2. **Extract shared utilities** (icon loader, CSV parser, PNG download) for reuse in SvelteKit apps
3. **Default to SvelteKit** for future journalist-training tools to build consistent patterns
4. **Consider lightweight wrapper** only if you build a unified dashboard across all five apps (low priority now)

---

## File Contacts & Ownership

| File | Lines | Complexity | Notes |
|------|-------|-----------|-------|
| `app.js` | 3,444 | Very High | Monolithic; needs modularization for next phase |
| `styles.css` | ~1,000 | High | Well-structured; CSS vars handle theming |
| `pictogram-icons.js` | 593 | Low | Icon metadata; stable |
| `index.html` | 34 | Low | Minimal; mostly CDN links |

---

**Last Updated**: February 2026  
**Status**: Active development (refinement phase)
