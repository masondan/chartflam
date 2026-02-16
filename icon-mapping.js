// ============================================
// ICON MAPPING
// Central repository for all SVG icon references
// ============================================

const ICON_MAPPING = {
  // Chart Type Selector (Main Navigation)
  chartPie: {
    path: 'public/icons/icon-pie-chart.svg',
    alt: 'Pie Chart',
    usage: 'Chart type selector'
  },
  chartDonut: {
    path: 'public/icons/icon-donut-chart.svg',
    alt: 'Donut Chart',
    usage: 'Chart type selector'
  },
  chartBar: {
    path: 'public/icons/icon-bar-chart.svg',
    alt: 'Bar Chart',
    usage: 'Chart type selector'
  },
  chartLine: {
    path: 'public/icons/icon-line-chart.svg',
    alt: 'Line Chart',
    usage: 'Chart type selector'
  },
  chartPictogram: {
    path: 'public/icons/icon-pictogram.svg',
    alt: 'Pictogram',
    usage: 'Chart type selector'
  },

  // Data Controls – Add/Remove
  add: {
    path: 'public/icons/icon-add.svg',
    alt: 'Add new data row',
    usage: 'Add row button'
  },
  trash: {
    path: 'public/icons/icon-trash.svg',
    alt: 'Remove row',
    usage: 'Remove row button'
  },

  // Data Controls – Bar Chart
  verticalBars: {
    path: 'public/icons/icon-vertical-bars.svg',
    alt: 'Vertical bars',
    usage: 'Bar orientation toggle'
  },
  horizontalBars: {
    path: 'public/icons/icon-horizontal-bars.svg',
    alt: 'Horizontal bars',
    usage: 'Bar orientation toggle'
  },
  groupedBars: {
    path: 'public/icons/icon-grouped-bars.svg',
    alt: 'Grouped bars',
    usage: 'Bar chart mode toggle'
  },
  stackedBars: {
    path: 'public/icons/icon-stacked-bars.svg',
    alt: 'Stacked bars',
    usage: 'Bar chart mode toggle'
  },

  // Style Controls – Pie/Donut
  cornerSmoothing: {
    path: 'public/icons/icon-corner-smoothing.svg',
    alt: 'Corner smoothing',
    usage: 'Pie/donut style control'
  },
  sliceGap: {
    path: 'public/icons/icon-horizontal-space.svg',
    alt: 'Slice gap',
    usage: 'Pie/donut style control'
  },
  donutHoleSize: {
    path: 'public/icons/icon-donut-hole-size.svg',
    alt: 'Donut hole size',
    usage: 'Donut style control'
  },

  // Style Controls – Bar Chart
  barRounding: {
    path: 'public/icons/icon-corner-smoothing.svg',
    alt: 'Bar Rounding',
    usage: 'Bar style control'
  },
  barSpacing: {
    path: 'public/icons/icon-horizontal-space.svg',
    alt: 'Bar Spacing',
    usage: 'Bar style control'
  },
  chartDepth: {
    path: 'public/icons/icon-chart-size.svg',
    alt: 'Chart Depth',
    usage: 'Bar style control'
  },

  // Style Controls – Line Chart
  lineSmoothing: {
    path: 'public/icons/icon-line-smoothing.svg',
    alt: 'Line Smoothing',
    usage: 'Line style control'
  },
  lineWidth: {
    path: 'public/icons/icon-line-width.svg',
    alt: 'Line Width',
    usage: 'Line style control'
  },
  chartResize: {
    path: 'public/icons/icon-chart-size.svg',
    alt: 'Chart Resize',
    usage: 'Line style control'
  },
  circleMarkers: {
    path: 'public/icons/icon-circle-markers.svg',
    alt: 'Circle markers',
    usage: 'Line marker style toggle'
  },
  diamondMarkers: {
    path: 'public/icons/icon-diamond-markers.svg',
    alt: 'Diamond markers',
    usage: 'Line marker style toggle'
  },
  squareMarkers: {
    path: 'public/icons/icon-square-markers.svg',
    alt: 'Square markers',
    usage: 'Line marker style toggle'
  },
  markerVisibility: {
    path: 'public/icons/icon-visibility.svg',
    alt: 'Toggle marker visibility',
    usage: 'Line marker control'
  },

  // Title & Caption Controls
  textAlignment: {
    path: 'public/icons/icon-align-left.svg',
    alt: 'Text alignment',
    usage: 'Text alignment toggle (cycles through left, center, right)'
  },
  bold: {
    path: 'public/icons/icon-bold.svg',
    alt: 'Bold',
    usage: 'Text styling toggle'
  },
  italic: {
    path: 'public/icons/icon-italic.svg',
    alt: 'Italic',
    usage: 'Text styling toggle'
  },
  fontSize: {
    path: 'public/icons/icon-font-size.svg',
    alt: 'Font size',
    usage: 'Text control'
  },
  lineSpacing: {
    path: 'public/icons/icon-line-spacing.svg',
    alt: 'Line spacing',
    usage: 'Text control'
  },

  // Legend & Axis Controls
  visibility: {
    path: 'public/icons/icon-visibility.svg',
    alt: 'Show/hide',
    usage: 'Legend and axis visibility toggle'
  },
  noVisibility: {
    path: 'public/icons/icon-no-visibility.svg',
    alt: 'Hidden',
    usage: 'Legend and axis hidden state'
  },
  alignTop: {
    path: 'public/icons/icon-align-top.svg',
    alt: 'Legend above chart',
    usage: 'Legend position toggle'
  },
  alignBottom: {
    path: 'public/icons/icon-align-bottom.svg',
    alt: 'Legend below chart',
    usage: 'Legend position toggle'
  },

  // Color Controls
  reset: {
    path: 'public/icons/icon-reset.svg',
    alt: 'Reset to base colours',
    usage: 'Color reset button'
  },

  // Pictogram Controls
  horizontalSpace: {
    path: 'public/icons/icon-horizontal-space.svg',
    alt: 'Horizontal space between icons',
    usage: 'Pictogram spacing control'
  },
  verticalSpace: {
    path: 'public/icons/icon-vertical-space.svg',
    alt: 'Vertical space between icons',
    usage: 'Pictogram spacing control'
  }
};

/**
 * Get SVG icon as an <img> tag
 * @param {string} iconKey - Key from ICON_MAPPING
 * @param {string} cssClass - Optional CSS class
 * @returns {string} HTML img tag
 */
// SVG cache for inline rendering
const SVG_CACHE = {};

/**
 * Load SVG file and cache it for inline rendering
 * @param {string} iconKey - Key from ICON_MAPPING
 * @returns {Promise<void>}
 */
async function loadSVGIcon(iconKey) {
  if (!ICON_MAPPING[iconKey]) {
    console.error(`Icon not found: ${iconKey}`);
    return;
  }

  if (SVG_CACHE[iconKey]) {
    return; // Already cached
  }

  const icon = ICON_MAPPING[iconKey];
  try {
    const response = await fetch(icon.path);
    const svgContent = await response.text();
    SVG_CACHE[iconKey] = svgContent;
  } catch (error) {
    console.error(`Failed to load SVG icon: ${iconKey}`, error);
    SVG_CACHE[iconKey] = ''; // Cache empty string to avoid repeated attempts
  }
}

/**
 * Preload all SVG icons
 * Call this during app initialization
 * @returns {Promise<void>}
 */
async function preloadAllSVGIcons() {
  const loadPromises = Object.keys(ICON_MAPPING).map(key => loadSVGIcon(key));
  await Promise.all(loadPromises);
}

function getSVGIcon(iconKey, cssClass = '') {
  if (!ICON_MAPPING[iconKey]) {
    console.error(`Icon not found: ${iconKey}`);
    return '';
  }

  const icon = ICON_MAPPING[iconKey];
  const classAttr = cssClass ? ` class="${cssClass}"` : '';
  
  // Return cached inline SVG if available, otherwise fallback to img tag
  if (SVG_CACHE[iconKey]) {
    const svgWithClass = SVG_CACHE[iconKey].replace(
      '<svg',
      `<svg${classAttr}`
    );
    return svgWithClass;
  }

  // Fallback for uncached icons
  return `<img src="${icon.path}" alt="${icon.alt}"${classAttr} aria-hidden="true">`;
}

/**
 * Get SVG icon path for src attribute
 * @param {string} iconKey - Key from ICON_MAPPING
 * @returns {string} Path to SVG file
 */
function getIconPath(iconKey) {
  if (!ICON_MAPPING[iconKey]) {
    console.error(`Icon not found: ${iconKey}`);
    return '';
  }
  return ICON_MAPPING[iconKey].path;
}
