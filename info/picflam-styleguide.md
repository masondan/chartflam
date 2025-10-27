# Design Reference for PicFlam

This document serves as a reference for key design elements used in PicFlam, ensuring consistency across the 'Flam' family of apps.

## Color Palette

### Branding
- Body Background: `#dfc2f9` (Pale purple)

### UI Colors
- App Container Background: `#eeeeee`
- Footer Background: `#555555`
- Footer Text/Icon: `#ffffff`
- Drawer Background: `#555555`
- Drawer Text: `#ffffff`
- Drawer Border: `#eeeeee` / `rgba(255, 255, 255, 0.15)`
- Button/Icon Default: `#666` / `#555`
- Button Hover: `#000`
- Active/Accent: `#ffffff` (for borders)
- Inactive/Icon: `#9a9a9a`
- Light Backgrounds: `#f7f7f7`
- Active Button Background: `#e0e0e0`
- Delete Button: `rgba(0, 0, 0, 0.5)` / `rgba(0, 0, 0, 0.7)` (hover)

### Solid Colors (for backgrounds)
- White: `#FFFFFF`
- Black: `#000000`
- Green: `#007C1F`
- Blue: `#00679D`
- Red: `#B20715`

### Gradients (for backgrounds)
All gradients are linear at 135 degrees unless specified:
- Purple: `linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%)`
- Blue: `linear-gradient(135deg, #15509B 0%, #20244F 100%)`
- Pink: `linear-gradient(135deg, #A8076B 0%, #62045F 100%)`
- Red-Orange: `linear-gradient(135deg, #EA5C56 0%, #3C0C40 100%)`
- Teal: `linear-gradient(135deg, #0A8F9D 0%, #202B54 100%)`
- Orange-Brown: `linear-gradient(135deg, #D17A29 0%, #41363C 100%)`

### Rainbow Gradient
- Conic rainbow: `conic-gradient(from 90deg, violet, indigo, blue, green, yellow, orange, red, violet)`

## Typography

### Fonts
Primary font stack imported via Google Fonts:
- Inter (body/default)
- Alfa Slab One
- Arvo (400, 700)
- Arapey (regular, italic)
- Lora (400-700, italic)
- Playfair Display (400-900, italic)
- Roboto Slab (100-900)
- Saira Condensed (100-900)
- Saira Stencil One
- Special Elite

Special uses:
- Arapey: Used on footer T1/T2 buttons (font-family: "Arapey", serif; font-weight: 400; letter-spacing: 0.2px)

## Icons

### Library
- **react-icons** (v5.5.0) - Comprehensive icon library with multiple sets

### Common Icon Sets Used
- **fi** (Feather Icons): FiPlus, FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight, FiCheck, FiChevronLeft, FiEdit3, FiMic, FiUpload, FiSearch, FiX
- **fa** (FontAwesome): FaTrash
- **lu** (Lucide): LuDrum, LuRectangleVertical, LuSquare, LuRectangleHorizontal
- **pi** (Phosphor): PiStar, PiResize, PiHighlighter, PiTag
- **rx** (Radix UI): RxFontFamily, RxTextAlignLeft, RxTextAlignCenter, RxTextAlignRight, RxOpacity
- **md** (Material Design): MdOutlineColorLens, MdOutlineFormatLineSpacing
- **im** (IcoMoon): ImQuotesLeft, ImFont
- **bi** (BoxIcons): BiSolidQuoteLeft, BiExpandVertical, BiFontSize
- **io5** (Ionicons): IoTextOutline, IoArrowBackCircle, IoArrowForwardCircle
- **tb** (Tabler): TbCancel, TbTextResize
- **bs** (Bootstrap): BsSliders
- **lia** (Line Awesome): LiaExpandSolid, LiaCompressArrowsAltSolid, LiaExpandArrowsAltSolid
- **ai** (Ant Design): AiOutlineInfoCircle
- **sl** (Simple Line Icons): SlClose

## Styles

### Layout
- Box-sizing: border-box (global reset)
- Flexbox-heavy layout with column/row directions
- Mobile-first responsive design with desktop overrides at 768px+
- Desktop container: max-width 480px, centered with box-shadow

### Borders & Shadows
- Border-radius: 0 (canvas), 16px (drawers), 50% (buttons/swatches), 8px (color picker)
- Box-shadow: `0 4px 15px rgba(0, 0, 0, 0.1)` (canvas), `0 -4px 15px rgba(0, 0, 0, 0.1)` (drawers)
- Border: 1-2px solid various colors (see palette)

### Animations & Transitions
- Fade-in: opacity 0 to 1 (0.3s ease-out)
- Slide-up: translateY 100% to 0
- Padding transitions: 0.3s ease for text editing modes
- Color transitions: 0.2s ease on hover

### Common Patterns
- Drawers: Overlay with gradient background, content slides up from bottom
- Buttons: No border/background by default, cursor pointer, tap highlight transparent
- Inputs: No outline/border, resize none for textareas</content>
</xai:function_call">### Design Reference Created

I've created `DESIGN.md` in the project root, documenting the key palettes, colors, styles, and icons extracted from PicFlam's codebase. This includes:

- **Color Palette**: Branding, UI colors, solid colors, gradients, and the rainbow effect
- **Typography**: Font imports and special uses
- **Icons**: The react-icons library and specific sets/icons used
- **Styles**: Layout patterns, borders/shadows, animations, and common CSS practices


