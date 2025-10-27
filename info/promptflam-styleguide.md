

# Flam Family Design System Reference

This document serves as a centralized reference for the design system used in PromptFlam and future "Flam" family apps. It includes color palettes, typography, icons, and UI styles to ensure visual consistency across projects.

---

## 1. Color Palette

Colors are defined as CSS variables in `:root` for easy reuse and theming.

### 1.1. Core Palette

| Variable | Hex | Usage |
| :--- | :--- | :--- |
| `--bg-light` | `#eeeeee` | Main body background |
| `--bg-medium` | `#cccccc` | Borders, dividers, and UI accents |
| `--text-dark` | `#333333` | Main text, body copy |
| `--text-medium` | `#555555` | Secondary text, subheadings |
| `--text-light` | `#9a9a9a` | Placeholder text |

### 1.2. UI & State Colors

| Color | Hex | Usage |
| :--- | :--- | :--- |
| Header/Footer BG | `#555555` | App header and footer background |
| Favourite (Active) | `#DC143C` | Active state for favourite buttons |
| Copy (Active) | `#4f0388` | "Copied" confirmation state |
| Tooltip BG | `#e6e2fff2` | Background for the main tooltip |
| White | `#FFFFFF` | Card backgrounds, input fields |
| Black | `#000000` | Used for text on light backgrounds |

### 1.3. Splash Screen Palette

| Color | Hex / Definition | Usage |
| :--- | :--- | :--- |
| Splash Gradient | `linear-gradient(135deg, #8A2BE2, #4B0082)` | Background for the splash screen |
| Enter Button | `#FFD700` | Primary call-to-action on splash screen |
| Enter Button (Hover) | `#FFC107` | Hover state for the splash screen button |

---

## 2. Typography

### 2.1. Font Family

The primary font for all UI text is **Inter**, sourced from Google Fonts.

- **Primary Font:** `'Inter', sans-serif`
- **Import URL:** `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`

### 2.2. Font Weights

| Weight | Usage |
| :--- | :--- |
| `400` (Regular) | Body text, paragraphs, general UI text |
| `600` (Semi-Bold) | Used for the splash screen "Enter" button |
| `700` (Bold) | Headings and titles |

### 2.3. Font Sizes

| Size | Usage |
| :--- | :--- |
| `0.9rem` | Footer text |
| `1.0rem` | Default body and input text size |
| `1.1rem` | Splash screen button text |
| `1.2rem` | Splash screen descriptive text |
| `1.3rem` | Subcategory titles |
| `1.8rem` | Main category titles |
| `16px` | Used specifically for textareas to prevent auto-zoom on mobile devices |

---

## 3. Icons

Icons are primarily SVG-based, embedded inline for flexibility. Use `currentColor` for stroke/fill to inherit text color. Source: Custom SVGs (inspired by Lucide/Heroicons equivalents).

### 3.1. General Icons

**Search**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>
```

**Dropdown Arrow**

```xml
<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#333333' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>
    <polyline points='6 9 12 15 18 9'></polyline>
</svg>
```

**Favourite (Heart) - Unfilled**

```xml
<svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
</svg>
```

**Favourite (Heart) - Filled**

```xml
<svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
```

**Edit**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
</svg>
```

**Copy**

```xml
<svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" />
</svg>
```

**Back to Top**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="m8 14 4-4 4 4"/>
</svg>
```

**Share**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
</svg>
```

**Close (X)**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
```

**Info**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
</svg>
```

### 3.2. Tooltip Icons

**Arrow Next**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -960 960 960" fill="currentColor">
    <path d="m480-320 160-160-160-160-56 56 64 64H320v80h168l-64 64zm0 240q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320" />
</svg>
```

**Arrow Previous**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -960 960 960" fill="currentColor">
    <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160zm0 240q-83 0-156-31.5T197-197t-85.5-127T80-480t31.5-156T197-763t127-85.5T480-880t156 31.5T763-763t85.5 127T880-480t-31.5 156T763-197t-127 85.5T480-80m0-80q134 0 227-93t93-227-93-227-227-93-227 93-93 227 93 227 227 93m0-320" />
</svg>
```

### 3.3. Footer Icon

**"Made With" Icon**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="m2 2 8 8m12-8-8 8" />
    <ellipse cx="12" cy="9" rx="10" ry="5" />
    <path d="M7 13.4v7.9m5-7.3v8m5-8.6v7.9M2 9v8a10 5 0 0 0 20 0V9" />
</svg>
```

---

## 4. Layout & UI Styles

### 4.1. Layout

- **Max Content Width:** `960px`
- **Standard Padding:** `1rem` / `1.5rem` / `2rem` are used consistently for container and element spacing.

### 4.2. Border Radius

| Radius | Usage |
| :--- | :--- |
| `6px` | Buttons, input fields |
| `8px` | UI cards, splash screen button |
| `12px` | Tooltip modal |
| `50%` | Circular buttons |

### 4.3. Box Shadows

Shadows are used to create depth for cards, dropdowns, and buttons.

- **Cards:** `0 2px 5px rgba(0, 0, 0, 0.05)`
- **Dropdowns:** `0 4px 8px rgba(0, 0, 0, 0.1)`
- **Splash Screen Button:** `0 4px 12px rgba(0, 0, 0, 0.2)`
- **Splash Screen Logo:** `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`

---

## Usage Notes

- **CSS Variables:** Define these in `:root` for easy theming and consistency.
- **Icons:** Copy-paste SVG code directly into HTML/JS. Adjust sizes/colors as needed via attributes or CSS.
- **Fonts:** Include the Google Fonts link in `<head>` for Inter.
- **Links:** For reusable icons, consider creating a shared icon component or library in future apps.
- **Updates:** Update this file as the design system evolves to maintain family consistency.

