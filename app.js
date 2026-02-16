// ChartFlam App - Vanilla JavaScript
// Clean, efficient implementation with no duplicate functions

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentChartType: 'pie',
    chartData: {
        labels: ['Slice A', 'Slice B', 'Slice C'],
        datasets: [{
            data: [30, 50, 20],
            backgroundColor: ['#6A5ACD', '#FFDAB9', '#66C0B4'],
            borderColor: ['#6A5ACD', '#FFDAB9', '#66C0B4'],
            borderWidth: 1
        }]
    },
    chartTitle: '',
    chartCaption: '',
    chartBackgroundColor: '#FFFFFF',
    smoothingValue: 5,
    gapValue: 4,
    donutCutoutPercentage: 50,
    activeControl: 'corner',
    titleFont: 'Inter',
    titleColor: '#555555',
    titleBold: true,
    titleItalic: false,
    titleSize: 24,
    titleLineHeight: 1.2,
    titleAlign: 'center',
    activeTitleControl: 'size',
    captionFont: 'Inter',
    captionColor: '#555555',
    captionBold: false,
    captionItalic: false,
    captionSize: 14,
    captionLineHeight: 1.4,
    captionAlign: 'center',
    activeCaptionControl: 'size',
    legendVisible: true,
    legendPosition: 'bottom',
    legendSize: 12,
    legendColor: '#555555',
    // New bar chart properties
    barOrientation: 'vertical',
    barBorderRadius: 10,
    barCategoryPercentage: 0.8, // Controls bar thickness (closer together)
    barAspectRatio: 1, // Default aspect ratio (1:1)
    barBaseColor: '#6A5ACD', // Base color for all bars
    axisVisible: true,
    axisColor: '#555555',
    axisSize: 12,
    axisBold: false,
    // Multi-series bar chart properties
    barCount: 1, // 1, 2, or 3 series
    barColors: ['#5422b0', '#AB0000', '#004269'], // Series colors
    barNames: ['Series 1', 'Series 2', 'Series 3'], // Series names from CSV header
    barChartMode: 'grouped', // 'grouped' or 'stacked'
    // New line chart properties
    lineChartLineColor: '#5422b0',
    lineChartMarkerColor: '#5422b0',
    lineMarkerVisible: true,
    lineMarkerStyle: 'circle',
    lineMarkerSize: 5,
    lineTension: 0,
    lineWidth: 3,
    // Multi-line chart properties
    lineCount: 1,
    lineColors: ['#5422b0', '#AB0000'],
    markerColors: ['#5422b0', '#AB0000'],
    lineNames: ['Line 1', 'Line 2'],
    // Pictogram properties
    pictogramTotal: 10, // Fixed at 10 icons (2 rows x 5 icons)
    pictogramFilled: 6.7,
    pictogramCurrentIcon: 'gas',
    pictogramIconSvg: '',
    pictogramFilledColor: '#8628DC',
    pictogramUnfilledColor: '#e2c4ff',
    pictogramHorizontalSpacing: 50, // Slider 0-100: 0=-50px(overlap), 50=0px(none,centered), 100=+50px(loose)
    pictogramVerticalSpacing: 50, // Slider 0-100: 0=-50px(overlap), 50=0px(none,centered), 100=+50px(loose)
    pictogramActiveSpacingControl: 'horizontal', // 'horizontal' or 'vertical'
    pictogramIconCategories: [],
    pictogramAllIcons: [],
    chart: null,
    isProcessing: false,
    // CSV data for each chart type
    csvDataCache: {
        bar: '',
        line: ''
    }
};

// ============================================
// VALIDATION RULES
// ============================================
const validation = {
    maxLabelLength: 50,
    maxTitleLength: 100,
    maxCaptionLength: 200,
    maxDataPoints: 20,
    minDataPoints: 1,
    maxValue: 1000000,
    minValue: 0, // For pie/donut charts
    allowNegative: false // Will be set based on chart type
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function to prevent excessive re-renders
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show user feedback message
function showFeedback(message, type = 'info') {
    const existingFeedback = document.querySelector('.feedback-message');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = `feedback-message feedback-${type}`;
    feedback.textContent = message;
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'polite');

    document.body.appendChild(feedback);

    // Animate in
    setTimeout(() => feedback.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Validate numeric input
function validateNumber(value, allowNegative = false) {
    const num = parseFloat(value);

    if (isNaN(num)) {
        return { valid: false, error: 'Please enter a valid number' };
    }

    if (!allowNegative && num < validation.minValue) {
        return { valid: false, error: `Value must be at least ${validation.minValue}` };
    }

    if (num > validation.maxValue) {
        return { valid: false, error: `Value cannot exceed ${validation.maxValue}` };
    }

    return { valid: true, value: num };
}

// Validate text input
function validateText(text, maxLength, fieldName = 'Text') {
    if (!text || text.trim().length === 0) {
        return { valid: false, error: `${fieldName} cannot be empty` };
    }

    if (text.length > maxLength) {
        return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
    }

    return { valid: true, value: text.trim() };
}

// Initialize custom font dropdown
function initCustomFontDropdown(dropdownId, buttonId, onSelect) {
    const dropdown = document.getElementById(dropdownId);
    const btn = document.getElementById(buttonId);
    const menu = dropdown.querySelector('.font-dropdown-menu');
    const options = menu.querySelectorAll('.font-option');

    // Toggle menu
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        closeAllFontDropdowns();
        if (!isOpen) {
            menu.classList.add('open');
            // Check if there's enough space below
            setTimeout(() => {
                const btnRect = btn.getBoundingClientRect();
                const menuHeight = menu.scrollHeight;
                const spaceBelow = window.innerHeight - btnRect.bottom;
                
                if (spaceBelow < menuHeight + 10) {
                    // Not enough space below, position above
                    menu.classList.add('above');
                } else {
                    menu.classList.remove('above');
                }
            }, 0);
        }
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const fontValue = option.dataset.value;
            const fontText = option.textContent;
            btn.textContent = fontText;
            menu.classList.remove('open');
            onSelect(fontValue);
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            menu.classList.remove('open');
        }
    });
}

function closeAllFontDropdowns() {
    document.querySelectorAll('.font-dropdown-menu').forEach(menu => {
        menu.classList.remove('open');
    });
}

// Set processing state
function setProcessing(isProcessing) {
    state.isProcessing = isProcessing;
    const downloadBtn = document.getElementById('download-btn');

    if (downloadBtn) {
        downloadBtn.disabled = isProcessing;
        downloadBtn.textContent = isProcessing ? 'Processing...' : 'Download PNG';
        downloadBtn.setAttribute('aria-busy', isProcessing);
    }
}

// Show background color picker
function showBackgroundColorPicker(rainbowButton) {
    let colorInput = rainbowButton.querySelector('input[data-coloris]');
    
    if (!colorInput) {
        colorInput = document.createElement('input');
        colorInput.type = 'text';
        colorInput.setAttribute('data-coloris', '');
        colorInput.style.position = 'absolute';
        colorInput.style.opacity = '0';
        colorInput.style.width = '100%';
        colorInput.style.height = '100%';
        colorInput.style.top = '0';
        colorInput.style.left = '0';
        colorInput.style.cursor = 'pointer';
        
        colorInput.addEventListener('input', (e) => {
            state.chartBackgroundColor = e.target.value;
            document.querySelector('.chart-canvas-wrapper').style.backgroundColor = e.target.value;
            document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
            rainbowButton.classList.add('active');
            updateBackgroundColor(e.target.value, true);
        });
        
        rainbowButton.style.position = 'relative';
        rainbowButton.appendChild(colorInput);
        
        // Give the browser time to position the input before clicking
        setTimeout(() => {
            colorInput.value = state.chartBackgroundColor === 'transparent' ? '#FFFFFF' : state.chartBackgroundColor;
            colorInput.click();
        }, 10);
    } else {
        colorInput.value = state.chartBackgroundColor === 'transparent' ? '#FFFFFF' : state.chartBackgroundColor;
        colorInput.click();
    }
}

// ============================================
// INITIALIZATION
// ============================================
async function initApp() {
     console.log('Initializing ChartFlam app');
     console.log('Chart.js loaded:', typeof Chart !== 'undefined');
     
     // Preload all SVG icons for inline rendering
     await preloadAllSVGIcons();
     
     // Initialize Coloris color picker
     initColoris();
     
     // Load pictogram icons
     loadPictogramIcons();
     startApp();
 }

// Fix Coloris button to show color instead of text
function fixColorisButton(field) {
    console.log('fixColorisButton called for field:', field);
    const button = field.querySelector('button');
    const input = field.querySelector('input[data-coloris]');
    
    console.log('Button:', button, 'Input:', input);
    
    if (button && input) {
        const color = input.value;
        console.log('Setting button color to:', color);
        // Set background color
        button.style.backgroundColor = color;
        // Clear any text content
        button.textContent = '';
        button.setAttribute('aria-label', `Color ${color}`);
        console.log('Button after fix - backgroundColor:', button.style.backgroundColor, 'textContent:', button.textContent);
    }
}

// Initialize Coloris with branded palette
function initColoris() {
    if (typeof Coloris !== 'undefined') {
        Coloris({
            themeMode: 'light',
            alpha: false,
            formatToggle: false,
            closeButton: false,
            clearButton: false,
            format: 'hex',
            swatches: [
                '#6A5ACD', // Slate Blue
                '#FFDAB9', // Peach Puff
                '#66C0B4', // Medium Aquamarine
                '#E6E6FA', // Lavender
                '#DDA0DD', // Plum
                '#ADD8E6', // Light Blue
                '#FAEBD7', // Antique White
                '#C0C0C0', // Silver
                '#8A2BE2', // Blue Violet
                '#FFD700', // Gold
                '#DC143C', // Crimson
                '#555555'  // Dark Gray
            ]
        });
        
        // Watch for Coloris field creation and fix button display
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if this node or its children have clr-field class
                        if (node.classList && node.classList.contains('clr-field')) {
                            console.log('Found .clr-field via classList:', node);
                            fixColorisButton(node);
                        }
                        // Also check children
                        const fields = node.querySelectorAll && node.querySelectorAll('.clr-field');
                        if (fields && fields.length > 0) {
                            console.log('Found', fields.length, '.clr-field children');
                            fields.forEach(field => fixColorisButton(field));
                        }
                    }
                });
            });
        });
        
        // Start observing the document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Coloris initialized with MutationObserver');
    } else {
        console.warn('Coloris library not loaded');
    }
}

// ============================================
// ============================================
// MAIN APP
// ============================================
function startApp() {
    console.log('Starting main app');
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header" role="banner">
        <img src="public/icons/logo-chartflam-logotype.png" alt="ChartFlam" class="app-logo">
        <nav class="chart-selector" role="tablist" aria-label="Chart type selector">
          <button class="chart-icon active" data-chart="pie" title="Pie Chart" role="tab" aria-selected="true" aria-label="Pie Chart">
            ${getSVGIcon('chartPie')}
          </button>
          <button class="chart-icon" data-chart="bar" title="Bar Chart" role="tab" aria-selected="false" aria-label="Bar Chart">
            ${getSVGIcon('chartBar')}
          </button>
          <button class="chart-icon" data-chart="line" title="Line Chart" role="tab" aria-selected="false" aria-label="Line Chart">
            ${getSVGIcon('chartLine')}
          </button>
          <button class="chart-icon" data-chart="pictogram" title="Pictogram" role="tab" aria-selected="false" aria-label="Pictogram Chart">
            ${getSVGIcon('chartPictogram')}
          </button>
        </nav>
      </header>

      <!-- Chart Display Container -->
      <div class="chart-display-container" role="region" aria-label="Chart preview">
        <div class="chart-canvas-wrapper" style="background-color: ${state.chartBackgroundColor};">
          <h3 id="chart-title" class="chart-title" style="display: ${state.chartTitle ? 'block' : 'none'};" aria-live="polite">${state.chartTitle}</h3>
          <div class="chart-canvas-container" role="img" aria-label="Chart visualization">
            <canvas id="chart-canvas" aria-label="Interactive chart"></canvas>
          </div>
          <p id="chart-caption" class="chart-caption" style="display: ${state.chartCaption ? 'block' : 'none'};" aria-live="polite">${state.chartCaption}</p>
        </div>
      </div>

      <!-- Pie/Donut Toggle (Pie Chart Only) -->
      <div class="pie-donut-toggle" id="pie-donut-toggle" role="group" aria-label="Chart variant selector">
        <button class="variant-btn active" data-variant="pie" aria-pressed="true">Pie Chart</button>
        <button class="variant-btn" data-variant="donut" aria-pressed="false">Donut Chart</button>
      </div>

      <!-- Controls Container -->
      <div class="controls-container" role="region" aria-label="Chart controls">
        <!-- Data Input -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="data-content">Data</summary>
          <div id="data-content" class="control-content"></div>
        </details>

        <!-- Colours -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="colours-content">Colours</summary>
          <div id="colours-content" class="control-content">
            <div id="color-controls" role="group" aria-label="Segment colours"></div>
            <div class="color-control bg-control">
              <span class="color-label">Background</span>
              <div class="bg-options">
                <button class="bg-option active" data-bg="white" aria-label="White background">
                  <span class="bg-circle bg-white"></span>
                </button>
                <button class="bg-option" data-bg="transparent" aria-label="Transparent background">
                  <span class="bg-circle bg-transparent"></span>
                </button>
                <button class="bg-option" data-bg="rainbow" aria-label="Rainbow gradient background">
                  <span class="bg-circle bg-rainbow"></span>
                </button>
              </div>
            </div>
          </div>
        </details>

        <!-- Style (for pie/donut/bar) -->
        <details class="control-section" id="style-control">
          <summary aria-expanded="false" aria-controls="style-content">Style</summary>
          <div id="style-content" class="control-content"></div>
        </details>

        <!-- Title -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="title-content">Title</summary>
          <div id="title-content" class="control-content">
            <div class="text-subsection">
              <input type="text" 
                     id="title-input" 
                     class="text-input-field"
                     value="${state.chartTitle}" 
                     placeholder="Add chart title"
                     maxlength="${validation.maxTitleLength}">
              
              <div class="font-control-row">
                <div class="custom-font-dropdown" id="title-font-dropdown">
                  <button class="font-dropdown-btn" id="title-font-btn">Inter (Default)</button>
                  <div class="font-dropdown-menu">
                    <div class="font-option" data-value="Inter" style="font-family: 'Inter', sans-serif;">Inter (Default)</div>
                    <div class="font-option" data-value="Alfa Slab One" style="font-family: 'Alfa Slab One', cursive;">Alfa Slab One</div>
                    <div class="font-option" data-value="Lora" style="font-family: 'Lora', serif;">Lora Serif</div>
                    <div class="font-option" data-value="Playfair Display" style="font-family: 'Playfair Display', serif;">Playfair Display</div>
                    <div class="font-option" data-value="Saira Condensed" style="font-family: 'Saira Condensed', sans-serif;">Saira Condensed</div>
                    <div class="font-option" data-value="Special Elite" style="font-family: 'Special Elite', cursive;">Special Elite</div>
                  </div>
                </div>
                <button class="text-control-btn" id="title-align-cycle" title="Text alignment">
                  ${getSVGIcon('textAlignment')}
                </button>
                <button class="text-control-btn ${state.titleBold ? 'active' : ''}" id="title-bold" title="Bold">
                  ${getSVGIcon('bold')}
                </button>
                <button class="text-control-btn ${state.titleItalic ? 'active' : ''}" id="title-italic" title="Italic">
                  ${getSVGIcon('italic')}
                </button>
              </div>
              
              <div class="text-controls">
                <button class="text-control-btn active" id="title-size-toggle" data-type="size" title="Font size">
                  ${getSVGIcon('fontSize')}
                </button>
                <button class="text-control-btn" id="title-lineheight-toggle" data-type="lineheight" title="Line spacing">
                  ${getSVGIcon('lineSpacing')}
                </button>
                <input type="range" 
                       id="title-slider" 
                       class="text-slider"
                       min="16" 
                       max="48" 
                       value="${state.titleSize}">
                <input type="text" id="title-color" class="color-picker" data-coloris value="${state.titleColor}">
              </div>
            </div>
          </div>
        </details>

        <!-- Caption & Source -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="caption-content">Caption & Source</summary>
          <div id="caption-content" class="control-content">
            <div class="text-subsection">
              <input type="text" 
                     id="caption-input" 
                     class="text-input-field"
                     value="${state.chartCaption}" 
                     placeholder="Caption and Data Source"
                     maxlength="${validation.maxCaptionLength}">
              
              <div class="font-control-row">
                <div class="custom-font-dropdown" id="caption-font-dropdown">
                  <button class="font-dropdown-btn" id="caption-font-btn">Inter (Default)</button>
                  <div class="font-dropdown-menu">
                    <div class="font-option" data-value="Inter" style="font-family: 'Inter', sans-serif;">Inter (Default)</div>
                    <div class="font-option" data-value="Alfa Slab One" style="font-family: 'Alfa Slab One', cursive;">Alfa Slab One</div>
                    <div class="font-option" data-value="Lora" style="font-family: 'Lora', serif;">Lora Serif</div>
                    <div class="font-option" data-value="Playfair Display" style="font-family: 'Playfair Display', serif;">Playfair Display</div>
                    <div class="font-option" data-value="Saira Condensed" style="font-family: 'Saira Condensed', sans-serif;">Saira Condensed</div>
                    <div class="font-option" data-value="Special Elite" style="font-family: 'Special Elite', cursive;">Special Elite</div>
                  </div>
                </div>
                <button class="text-control-btn" id="caption-align-cycle" title="Text alignment">
                  ${getSVGIcon('textAlignment')}
                </button>
                <button class="text-control-btn ${state.captionBold ? 'active' : ''}" id="caption-bold" title="Bold">
                  ${getSVGIcon('bold')}
                </button>
                <button class="text-control-btn ${state.captionItalic ? 'active' : ''}" id="caption-italic" title="Italic">
                  ${getSVGIcon('italic')}
                </button>
              </div>
              
              <div class="text-controls">
                <button class="text-control-btn active" id="caption-size-toggle" data-type="size" title="Font size">
                  ${getSVGIcon('fontSize')}
                </button>
                <button class="text-control-btn" id="caption-lineheight-toggle" data-type="lineheight" title="Line spacing">
                  ${getSVGIcon('lineSpacing')}
                </button>
                <input type="range" 
                       id="caption-slider" 
                       class="text-slider"
                       min="12" 
                       max="24" 
                       value="14">
                <input type="text" id="caption-color" class="color-picker" data-coloris value="#555555">
              </div>
            </div>
          </div>
        </details>

        <!-- Legend -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="legend-content">Legend</summary>
          <div id="legend-content" class="control-content">
            <div class="legend-control-row">
              <span class="legend-size-icon">
                ${getSVGIcon('fontSize')}
              </span>
              <input type="range" 
                     id="legend-size-slider" 
                     class="text-slider"
                     min="10" 
                     max="18" 
                     value="${state.legendSize}">
              <button class="text-control-btn ${state.legendPosition === 'bottom' ? 'active' : ''}" id="legend-position-down" title="Legend below chart">
                ${getSVGIcon('alignBottom')}
              </button>
              <button class="text-control-btn ${state.legendPosition === 'top' ? 'active' : ''}" id="legend-position-up" title="Legend above chart">
                ${getSVGIcon('alignTop')}
              </button>
              <button class="text-control-btn" id="legend-visible-toggle" title="Show/hide legend">
                ${getSVGIcon('visibility')}
              </button>
              <input type="text" id="legend-color" class="color-picker" data-coloris value="${state.legendColor}">
            </div>
          </div>
        </details>

        <!-- Download Button -->
        <button class="btn btn-primary" 
                id="download-btn" 
                aria-label="Download chart as PNG image">
          Download
        </button>
      </div>
    </div>
  `;

    // Defer initialization to ensure the DOM is ready
    setTimeout(() => {
        initEventListeners();
        initDataControls();
        initManualInput();
        initStyleControls();
        initColorControls();
        initLegendAxisControls();
        updateSmoothingVisibility();
        renderChart();
        setupDropdownBehavior();
        
        // Show/hide pie-donut toggle based on initial chart type
        const pieDonutToggle = document.getElementById('pie-donut-toggle');
        if (pieDonutToggle) {
            if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
                pieDonutToggle.style.display = 'flex';
            } else {
                pieDonutToggle.style.display = 'none';
            }
        }
    }, 0);
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Chart type selector
    document.querySelectorAll('.chart-icon').forEach((icon, index) => {
        icon.addEventListener('click', (e) => {
            const chartType = e.currentTarget.dataset.chart;
            selectChartType(chartType);
        });

        // Keyboard navigation for chart selector
        icon.addEventListener('keydown', (e) => {
            const icons = Array.from(document.querySelectorAll('.chart-icon'));
            const currentIndex = icons.indexOf(e.currentTarget);

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % icons.length;
                icons[nextIndex].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + icons.length) % icons.length;
                icons[prevIndex].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                icon.click();
            }
        });
    });

    // Pie/Donut toggle (attach listeners)
    const pieDonutToggle = document.getElementById('pie-donut-toggle');
    if (pieDonutToggle) {
        const variantBtns = pieDonutToggle.querySelectorAll('.variant-btn');
        variantBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const variant = btn.dataset.variant;
                variantBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                variantBtns.forEach(b => {
                    if (b !== btn) b.setAttribute('aria-pressed', 'false');
                });
                selectChartType(variant);
            });
        });
    }

    // Background color options
    const bgWhite = document.querySelector('.bg-option[data-bg="white"]');
    const bgTransparent = document.querySelector('.bg-option[data-bg="transparent"]');
    const bgRainbow = document.querySelector('.bg-option[data-bg="rainbow"]');

    bgWhite.addEventListener('click', () => {
        document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
        bgWhite.classList.add('active');
        updateBackgroundColor('white');
    });

    bgTransparent.addEventListener('click', () => {
        document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
        bgTransparent.classList.add('active');
        updateBackgroundColor('transparent');
    });

    bgRainbow.addEventListener('click', () => {
        showBackgroundColorPicker(bgRainbow);
    });

    // Title controls
    document.getElementById('title-input').addEventListener('input', debounce(() => {
        updateTitle();
    }, 300));

    // Custom font dropdown for Title
    initCustomFontDropdown('title-font-dropdown', 'title-font-btn', (selectedFont) => {
        state.titleFont = selectedFont;
        // Reset to normal weight for non-Inter fonts
        if (state.titleFont !== 'Inter') {
            state.titleBold = false;
            document.getElementById('title-bold').classList.remove('active');
        }
        updateTitleStyle();
    });

    document.getElementById('title-color').addEventListener('input', () => {
        state.titleColor = document.getElementById('title-color').value;
        updateTitleStyle();
    });

    // Title alignment cycle button
    document.getElementById('title-align-cycle').addEventListener('click', () => {
        const alignments = ['center', 'left', 'right'];
        const currentIndex = alignments.indexOf(state.titleAlign);
        const nextIndex = (currentIndex + 1) % alignments.length;
        state.titleAlign = alignments[nextIndex];
        updateAlignmentIcon();
        updateTitleStyle();
    });

    // Title bold/italic
    document.getElementById('title-bold').addEventListener('click', () => {
        const btn = document.getElementById('title-bold');
        state.titleBold = !state.titleBold;
        btn.classList.toggle('active');
        updateTitleStyle();
    });

    document.getElementById('title-italic').addEventListener('click', () => {
        const btn = document.getElementById('title-italic');
        state.titleItalic = !state.titleItalic;
        btn.classList.toggle('active');
        updateTitleStyle();
    });

    // Title size/lineheight toggles
    const titleToggles = document.querySelectorAll('#title-size-toggle, #title-lineheight-toggle');
    titleToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            titleToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeTitleControl = btn.dataset.type;
            updateTitleSlider();
        });
    });

    // Title slider
    document.getElementById('title-slider').addEventListener('input', debounce(() => {
        updateTitleSlider();
    }, 100));

    // Caption controls
    document.getElementById('caption-input').addEventListener('input', debounce(() => {
        updateCaption();
    }, 300));

    // Custom font dropdown for Caption
    initCustomFontDropdown('caption-font-dropdown', 'caption-font-btn', (selectedFont) => {
        state.captionFont = selectedFont;
        updateCaptionStyle();
    });

    document.getElementById('caption-color').addEventListener('input', () => {
        state.captionColor = document.getElementById('caption-color').value;
        updateCaptionStyle();
    });

    // Caption alignment cycle button
    document.getElementById('caption-align-cycle').addEventListener('click', () => {
        const alignments = ['center', 'left', 'right'];
        const currentIndex = alignments.indexOf(state.captionAlign);
        const nextIndex = (currentIndex + 1) % alignments.length;
        state.captionAlign = alignments[nextIndex];
        updateCaptionAlignmentIcon();
        updateCaptionStyle();
    });

    // Caption bold/italic
    document.getElementById('caption-bold').addEventListener('click', () => {
        const btn = document.getElementById('caption-bold');
        state.captionBold = !state.captionBold;
        btn.classList.toggle('active');
        updateCaptionStyle();
    });

    document.getElementById('caption-italic').addEventListener('click', () => {
        const btn = document.getElementById('caption-italic');
        state.captionItalic = !state.captionItalic;
        btn.classList.toggle('active');
        updateCaptionStyle();
    });

    // Caption size/lineheight toggles
    const captionToggles = document.querySelectorAll('#caption-size-toggle, #caption-lineheight-toggle');
    captionToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            captionToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeCaptionControl = btn.dataset.type;
            updateCaptionSlider();
        });
    });

    // Caption slider
    document.getElementById('caption-slider').addEventListener('input', debounce(() => {
        updateCaptionSlider();
    }, 100));

    // Legend controls
    document.getElementById('legend-visible-toggle').addEventListener('click', () => {
        state.legendVisible = !state.legendVisible;
        updateLegendVisibilityIcon();
        renderChart();
    });

    document.getElementById('legend-position-down').addEventListener('click', () => {
        state.legendPosition = 'bottom';
        document.getElementById('legend-position-down').classList.add('active');
        document.getElementById('legend-position-up').classList.remove('active');
        renderChart();
    });

    document.getElementById('legend-position-up').addEventListener('click', () => {
        state.legendPosition = 'top';
        document.getElementById('legend-position-up').classList.add('active');
        document.getElementById('legend-position-down').classList.remove('active');
        renderChart();
    });

    document.getElementById('legend-size-slider').addEventListener('input', debounce(() => {
        state.legendSize = parseInt(document.getElementById('legend-size-slider').value);
        updateLegendStyle();
    }, 100));

    document.getElementById('legend-color').addEventListener('input', () => {
        state.legendColor = document.getElementById('legend-color').value;
        updateLegendStyle();
    });

    // Download button
    document.getElementById('download-btn').addEventListener('click', downloadChart);

    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Update details elements aria-expanded on toggle
    document.querySelectorAll('details').forEach(details => {
        details.addEventListener('toggle', (e) => {
            const summary = e.target.querySelector('summary');
            if (summary) {
                summary.setAttribute('aria-expanded', e.target.open);
            }
        });
    });
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Download: Ctrl/Cmd + S
    if (modifier && e.key === 's') {
        e.preventDefault();
        downloadChart();
    }

    // Chart type shortcuts: 1-5
    if (!e.target.matches('input, textarea') && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const chartTypes = ['pie', 'donut', 'bar', 'line', 'pictogram'];
        const index = parseInt(e.key) - 1;
        if (chartTypes[index]) {
            selectChartType(chartTypes[index]);
        }
    }
}

// ============================================
// CHART TYPE SELECTION
// ============================================
function selectChartType(type) {
    console.log('selectChartType called with:', type, 'from:', state.currentChartType);

    // Prevent re-rendering if the same chart type is selected
    if (type === state.currentChartType) return;

    // Store previous chart type
    const previousType = state.currentChartType;
    
    // SAVE current CSV data to cache before switching
    if ((previousType === 'bar' || previousType === 'line') && state.chartData.labels.length > 0) {
        const currentCsv = chartDataToCSV();
        state.csvDataCache[previousType] = currentCsv;
        console.log('Saved CSV cache for', previousType, ':', currentCsv);
    }
    
    state.currentChartType = type;

    // Update active state and ARIA attributes
    document.querySelectorAll('.chart-icon').forEach(icon => {
        // Pie button should be active for both pie and donut charts
        const isActive = icon.dataset.chart === type || (icon.dataset.chart === 'pie' && type === 'donut');
        icon.classList.toggle('active', isActive);
        icon.setAttribute('aria-selected', isActive);
    });

    // Update validation rules based on chart type
    validation.allowNegative = (type === 'bar' || type === 'line');

    // Update placeholder data based on type
    if (type === 'bar' || type === 'line') {
        // Check if we have cached CSV data for this chart type
        const cachedCsv = state.csvDataCache[type];
        
        if (cachedCsv && cachedCsv.trim()) {
            // Restore data from cache
            console.log('Restoring from CSV cache for', type, ':', cachedCsv);
            const lines = cachedCsv.split('\n').filter(line => line.trim());
            
            // For line charts, check if cached data is multi-line
            if (type === 'line') {
                const firstLine = lines[0].split(',');
                if (firstLine.length >= 3) {
                    // Multi-line data - will be parsed by updateDataFromCSV
                    // For now just set placeholder, actual parsing happens in initDataControls
                    state.chartData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
                    state.chartData.datasets = [{
                        data: [12, 19, 15, 25, 22],
                        backgroundColor: 'transparent',
                        borderColor: state.lineColors[0],
                        borderWidth: state.lineWidth
                    }];
                } else {
                    // Single-line cached data
                    const labels = [];
                    const data = [];
                    lines.forEach(line => {
                        const parts = line.split(',');
                        if (parts.length >= 2) {
                            const value = parseFloat(parts[1].trim());
                            if (!isNaN(value)) {
                                labels.push(parts[0].trim());
                                data.push(value);
                            }
                        }
                    });
                    if (labels.length > 0) {
                        state.chartData.labels = labels;
                        state.chartData.datasets = [{
                            data: data,
                            backgroundColor: 'transparent',
                            borderColor: state.lineColors[0],
                            borderWidth: state.lineWidth
                        }];
                    }
                }
            } else {
                // Bar chart - parse as before
                const labels = [];
                const data = [];
                lines.forEach(line => {
                    const parts = line.split(',');
                    if (parts.length >= 2) {
                        labels.push(parts[0].trim());
                        data.push(parseFloat(parts[1].trim()));
                    }
                });
                state.chartData.labels = labels;
                state.chartData.datasets[0].data = data;
            }
        } else {
            // Use placeholder data
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
            const data = [12, 19, 15, 25, 22];
            state.chartData.labels = labels;
            if (type === 'line') {
                state.chartData.datasets = [{
                    data: data,
                    backgroundColor: 'transparent',
                    borderColor: state.lineColors[0],
                    borderWidth: state.lineWidth
                }];
            } else {
                state.chartData.datasets[0].data = data;
            }
        }
        
        // For bar/line charts, set the single color immediately
        if (type === 'bar') {
            // Reset to single series when switching to bar chart
            state.barCount = 1;
            state.barNames = ['Series 1', 'Series 2', 'Series 3'];
            const singleColor = state.barColors[0];
            state.chartData.datasets = [{
                data: state.chartData.datasets[0]?.data || [12, 19, 15, 25, 22],
                backgroundColor: Array(state.chartData.labels.length).fill(singleColor),
                borderColor: Array(state.chartData.labels.length).fill(singleColor),
                borderWidth: 0,
                borderRadius: state.barBorderRadius,
                categoryPercentage: state.barCategoryPercentage
            }];
        } else if (type === 'line') {
            state.activeControl = 'smoothing'; // Set default active control for line style
            state.lineCount = 1; // Reset to single line when switching to line chart
            state.lineNames = ['Line 1', 'Line 2'];
            // Ensure single dataset for line chart
            state.chartData.datasets = [{
                data: state.chartData.datasets[0]?.data || [12, 19, 15, 25, 22],
                backgroundColor: 'transparent',
                borderColor: state.lineColors[0],
                borderWidth: state.lineWidth,
                pointBackgroundColor: state.markerColors[0],
                pointBorderColor: state.markerColors[0]
            }];
        }
    } else if (type === 'pictogram') {
        state.chartData.labels = ['Completed', 'Remaining'];
        state.chartData.datasets[0].data = [67, 33];
    } else { // pie, donut
        state.chartData.labels = ['Slice A', 'Slice B', 'Slice C'];
        state.chartData.datasets[0].data = [30, 50, 20];
        // Reset to default colors for pie/donut
        state.chartData.datasets[0].backgroundColor = ['#6A5ACD', '#FFDAB9', '#66C0B4'];
        state.chartData.datasets[0].borderColor = ['#6A5ACD', '#FFDAB9', '#66C0B4'];
    }

    // Ensure colors match data length
    ensureColorsMatchData();

    // Handle switching between pictogram and other chart types
    if (type === 'pictogram' && state.chart) {
        // Switching TO pictogram: destroy Chart.js instance
        state.chart.destroy();
        state.chart = null;
    } else if (previousType === 'pictogram' && type !== 'pictogram') {
        // Switching FROM pictogram: clear the canvas
        const canvas = document.getElementById('chart-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Reset canvas size for Chart.js
            const container = document.querySelector('.chart-canvas-container');
            const width = container.clientWidth;
            canvas.width = width;
            canvas.height = width; // Reset to square aspect ratio
        }
    }

    // Show/hide pie-donut toggle
    const pieDonutToggle = document.getElementById('pie-donut-toggle');
    if (pieDonutToggle) {
        if (type === 'pie' || type === 'donut') {
            pieDonutToggle.style.display = 'flex';
            // Update active button based on current type
            pieDonutToggle.querySelectorAll('.variant-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
                if (btn.dataset.variant === type) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                }
            });
        } else {
            pieDonutToggle.style.display = 'none';
        }
    }

    // Re-initialize inputs and render
    if (type === 'pictogram') {
        initPictogramControls();
        initPictogramColorsControls();
        renderPictogramChart();
    } else {
        initDataControls();
        initManualInput();
        initStyleControls();
        initColorControls();
        initLegendAxisControls();
        renderChart();
    }
    updateSmoothingVisibility();
}

// ============================================
// CHART RENDERING
// ============================================
function renderChart() {
    console.log('Rendering chart, type:', state.currentChartType);

    // Handle pictogram rendering separately
    if (state.currentChartType === 'pictogram') {
        renderPictogramChart();
        return;
    }

    const canvas = document.getElementById('chart-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Set canvas size explicitly for Chart.js
    const container = document.querySelector('.chart-canvas-container');
    const width = container.clientWidth;
    canvas.width = width;

    // Destroy existing chart
    if (state.chart) {
        state.chart.destroy();
    }

    // Chart configuration
    let chartType = state.currentChartType === 'donut' ? 'doughnut' : state.currentChartType;
    if (chartType === 'pictogram') chartType = 'pie';
    const config = {
        type: chartType,
        data: state.chartData,
        options: {
            responsive: true,
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }
            },
            plugins: {
                legend: {
                    position: state.legendPosition,
                    display: state.legendVisible,
                    labels: {
                        padding: 15,
                        font: {
                            size: state.legendSize,
                            family: "'Inter', sans-serif"
                        },
                        color: state.legendColor,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: (chart) => {
                            const datasets = chart.data.datasets;
                            return chart.data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: datasets[0].backgroundColor[i],
                                strokeStyle: '#FFFFFF',
                                lineWidth: 3,
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                title: {
                    display: false
                }
            }
        }
    };

    // Apply bar chart specific styles
    if (state.currentChartType === 'bar') {
        // Set orientation
        config.options.indexAxis = state.barOrientation === 'vertical' ? 'x' : 'y';

        // Set aspect ratio
        config.options.aspectRatio = state.barAspectRatio;

        // Apply bar styles to all datasets (single or multi-series)
        state.chartData.datasets.forEach((dataset, index) => {
            dataset.borderRadius = state.barBorderRadius;
            dataset.borderWidth = 0; // Fix for faint line artifact
            // Don't overwrite colors here - they're managed by color controls
        });

        // Configure axes
        const axisOptions = {
            display: state.axisVisible,
            grid: {
                display: false // Remove grid lines
            },
            ticks: {
                color: state.axisColor,
                font: {
                    size: state.axisSize,
                    weight: state.axisBold ? 'bold' : 'normal'
                }
            }
        };
        
        // Configure stacked mode for multi-series
        if (state.barCount > 1 && state.barChartMode === 'stacked') {
            config.options.scales = {
                x: { ...axisOptions, stacked: true },
                y: { ...axisOptions, stacked: true }
            };
        } else {
            config.options.scales = {
                x: { ...axisOptions },
                y: { ...axisOptions }
            };
        }

        // Show legend for multi-series bar charts
        if (state.barCount > 1) {
            config.options.plugins.legend.display = state.legendVisible;
            config.options.plugins.legend.labels = {
                padding: 15,
                font: {
                    size: state.legendSize,
                    family: "'Inter', sans-serif"
                },
                color: state.legendColor,
                usePointStyle: true,
                pointStyle: 'rect'
            };
        } else {
            // Hide legend for single-series bar charts
            config.options.plugins.legend.display = false;
        }
    } else if (state.currentChartType === 'line') {
        // Set aspect ratio to square
        config.options.aspectRatio = state.barAspectRatio; // Re-use bar aspect ratio state

        // Apply styling to all datasets (single or multi-line)
        state.chartData.datasets.forEach((dataset, index) => {
            // Use lineColors array for multi-line support
            dataset.borderColor = state.lineColors[index] || state.lineColors[0];
            dataset.pointBackgroundColor = state.markerColors[index] || state.markerColors[0];
            dataset.pointBorderColor = state.markerColors[index] || state.markerColors[0];
            dataset.tension = state.lineTension;
            dataset.borderWidth = state.lineWidth;
            dataset.pointRadius = state.lineMarkerVisible ? state.lineMarkerSize : 0;
            dataset.pointHoverRadius = state.lineMarkerVisible ? state.lineMarkerSize + 2 : 0;
            dataset.pointStyle = state.lineMarkerStyle;
            dataset.fill = false;
        });

        // Configure axes for line chart
        const axisOptions = {
            display: state.axisVisible,
            ticks: {
                color: state.axisColor,
                font: {
                    size: state.axisSize,
                    weight: state.axisBold ? 'bold' : 'normal'
                }
            }
        };
        config.options.scales = {
            x: { ...axisOptions, grid: { display: false } }, // No vertical grid lines
            y: {
                ...axisOptions,
                grid: { display: true, color: '#e0e0e0' }, // Horizontal grid lines
                beginAtZero: true // Ensure Y-axis always starts at zero for accurate data representation
            }
        };

        // Auto-enable legend for multi-line charts, hide for single-line
        if (state.lineCount === 2) {
            config.options.plugins.legend.display = true;
            config.options.plugins.legend.labels = {
                padding: 15,
                font: {
                    size: state.legendSize,
                    family: "'Inter', sans-serif"
                },
                color: state.legendColor,
                usePointStyle: true,
                pointStyle: 'line'
            };
        } else {
            config.options.plugins.legend.display = false;
        }

    }
    // Apply smoothing and gap for pie/donut charts
    if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
        config.options.elements = {
            arc: {
                borderRadius: state.smoothingValue
            }
        };
        // Set border width and color for gap effect
        state.chartData.datasets[0].borderWidth = state.gapValue;
        state.chartData.datasets[0].borderColor = state.chartBackgroundColor;
    }

    // Apply donut hole size
    if (state.currentChartType === 'donut') {
        config.options.cutout = `${state.donutCutoutPercentage}%`;
    }

    // Create new chart
    try {
        state.chart = new Chart(ctx, config);
        console.log('Chart created successfully');
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// ============================================
// DATA CONTROLS
// Dynamically builds the data input section based on chart type
// ============================================

// Helper function to convert chart data to CSV format
function chartDataToCSV() {
    const labels = state.chartData.labels;
    const csvLines = [];
    
    // Handle multi-line charts
    if (state.currentChartType === 'line' && state.lineCount === 2 && state.chartData.datasets.length === 2) {
        // Add header row with line names
        csvLines.push(`Label,${state.lineNames[0]},${state.lineNames[1]}`);
        
        const data1 = state.chartData.datasets[0].data;
        const data2 = state.chartData.datasets[1].data;
        
        for (let i = 0; i < labels.length; i++) {
            csvLines.push(`${labels[i]},${data1[i]},${data2[i]}`);
        }
    } else if (state.currentChartType === 'bar' && state.barCount > 1) {
        // Handle multi-series bar charts
        const headerParts = ['Category'];
        for (let s = 0; s < state.barCount; s++) {
            headerParts.push(state.barNames[s]);
        }
        csvLines.push(headerParts.join(','));
        
        for (let i = 0; i < labels.length; i++) {
            const rowParts = [labels[i]];
            for (let s = 0; s < state.barCount; s++) {
                rowParts.push(state.chartData.datasets[s].data[i]);
            }
            csvLines.push(rowParts.join(','));
        }
    } else {
        // Single dataset (single-series bar, pie, donut, single-line)
        const data = state.chartData.datasets[0].data;
        for (let i = 0; i < labels.length; i++) {
            csvLines.push(`${labels[i]},${data[i]}`);
        }
    }
    
    return csvLines.join('\n');
}

function initDataControls() {
    const container = document.getElementById('data-content');
    if (!container) return;

    if (state.currentChartType === 'bar' || state.currentChartType === 'line') {
        // Get cached CSV data for this chart type
        const cachedCsv = state.csvDataCache[state.currentChartType] || '';
        
        // Different placeholder text for bar vs line charts
        const placeholder = state.currentChartType === 'line' 
            ? "Paste CSV data here&#10;One line: label,value&#10;Two lines: label,value,value"
            : "Paste CSV data with header row&#10;Category,Series&#10;label,value&#10;Include up to three series&#10;label,value,value,value";
        
        // Generate CSV from current chart data to use as placeholder
        const csvData = chartDataToCSV();
        const placeholderText = cachedCsv || csvData;
        
        container.innerHTML = `
      <textarea id="csv-textarea" 
                placeholder="${placeholderText.replace(/"/g, '&quot;')}"
                aria-label="CSV data input"
                maxlength="5000"></textarea>
    `;
        if (state.currentChartType === 'bar') {
            const isMultiSeries = state.barCount > 1;
            const groupedActive = state.barChartMode === 'grouped' ? 'active' : '';
            const stackedActive = state.barChartMode === 'stacked' ? 'active' : '';
            const disabledClass = isMultiSeries ? '' : 'disabled';
            
            container.innerHTML += `
        <div class="bar-controls">
          <button class="text-control-btn ${state.barOrientation === 'vertical' ? 'active' : ''}" id="bar-vertical-btn" title="Vertical bars">
            ${getSVGIcon('verticalBars')}
          </button>
          <button class="text-control-btn ${state.barOrientation === 'horizontal' ? 'active' : ''}" id="bar-horizontal-btn" title="Horizontal bars">
            ${getSVGIcon('horizontalBars')}
          </button>
          <span class="bar-controls-separator"></span>
          <button class="text-control-btn ${groupedActive} ${disabledClass}" id="bar-grouped-btn" title="Grouped bars" ${isMultiSeries ? '' : 'disabled'}>
            ${getSVGIcon('groupedBars')}
          </button>
          <button class="text-control-btn ${stackedActive} ${disabledClass}" id="bar-stacked-btn" title="Stacked bars" ${isMultiSeries ? '' : 'disabled'}>
            ${getSVGIcon('stackedBars')}
          </button>
          <button class="tab-btn" id="apply-csv-btn" aria-label="Apply CSV data to chart">Apply CSV Data</button>
        </div>
      `;

            // Add event listeners for bar orientation buttons
            document.getElementById('bar-vertical-btn').addEventListener('click', () => setBarOrientation('vertical'));
            document.getElementById('bar-horizontal-btn').addEventListener('click', () => setBarOrientation('horizontal'));
            document.getElementById('bar-grouped-btn').addEventListener('click', () => setBarChartMode('grouped'));
            document.getElementById('bar-stacked-btn').addEventListener('click', () => setBarChartMode('stacked'));
            document.getElementById('apply-csv-btn').addEventListener('click', updateDataFromCSV);
        } else if (state.currentChartType === 'line') {
            container.innerHTML += `
        <button class="tab-btn" id="apply-csv-btn" style="width: 100%; margin-top: var(--spacing-sm);" aria-label="Apply CSV data to chart">Apply CSV Data</button>
      `;

            // Add Apply button listener
            document.getElementById('apply-csv-btn').addEventListener('click', updateDataFromCSV);
        }
    } else {
        container.innerHTML = `
      <div class="data-tabs" role="tablist" aria-label="Data input method">
        <button class="tab-btn active" data-tab="manual" role="tab" aria-selected="true" aria-controls="manual-input">Manual</button>
        <button class="tab-btn" data-tab="csv" role="tab" aria-selected="false" aria-controls="csv-input">CSV</button>
      </div>
      <div id="manual-input" class="tab-content active" role="tabpanel" aria-labelledby="manual-tab">
        <div id="manual-rows" role="list" aria-label="Data entries"></div>
        <button class="btn-add" id="add-row-btn" aria-label="Add new data row">
          ${getSVGIcon('add')}
        </button>
      </div>
      <div id="csv-input" class="tab-content" role="tabpanel" aria-labelledby="csv-tab">
        <textarea id="csv-textarea" 
                  placeholder="Paste CSV data here&#10;Format: label,value&#10;Example:&#10;Slice A,30&#10;Slice B,50&#10;Slice C,20"
                  aria-label="CSV data input"
                  maxlength="5000"></textarea>
        <button class="tab-btn" id="apply-csv-btn" style="width: 100%; margin-top: var(--spacing-sm);" aria-label="Apply CSV data to chart">Apply CSV Data</button>
      </div>
    `;
    }
    // Re-attach listeners for dynamically created elements
    // Note: CSV parsing now only happens on Apply button click (no auto-parsing)
    // Manual input still updates automatically via validateAndUpdateManualData

    if (state.currentChartType !== 'bar' && state.currentChartType !== 'line') {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', (e) => switchDataTab(e.currentTarget.dataset.tab)));
        document.getElementById('add-row-btn').addEventListener('click', () => {
            if (state.chartData.labels.length >= validation.maxDataPoints) {
                showFeedback(`Maximum ${validation.maxDataPoints} data points allowed`, 'error');
                return;
            }
            addManualRow();
        });
        document.getElementById('apply-csv-btn').addEventListener('click', updateDataFromCSV);
    }
}

// ============================================
// STYLE CONTROLS
// Dynamically builds the style section based on chart type
// ============================================
function initStyleControls() {
    const container = document.getElementById('style-content');
    if (!container) return;

    if (state.currentChartType === 'bar') {
        container.innerHTML = `
      <div class="text-controls">
        <button class="text-control-btn active" data-type="corner" title="Bar Rounding">
          ${getSVGIcon('barRounding')}
        </button>
        <button class="text-control-btn" data-type="gap" title="Bar Spacing">
          ${getSVGIcon('barSpacing')}
        </button>
        <button class="text-control-btn" data-type="resize" title="Chart Depth">
          ${getSVGIcon('chartDepth')}
        </button>
        <input type="range" id="smoothing-slider" class="text-slider" min="0" max="20" value="${state.smoothingValue}">
      </div>
    `;
    } else if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
         container.innerHTML = `
       <div class="text-controls">
         <button class="smooth-toggle ${state.activeControl === 'corner' ? 'active' : ''}" data-type="corner" aria-label="Corner smoothing" title="Corner smoothing">
           ${getSVGIcon('cornerSmoothing')}
         </button>
         <button class="smooth-toggle ${state.activeControl === 'gap' ? 'active' : ''}" data-type="gap" aria-label="Slice gap" title="Slice gap">
           ${getSVGIcon('sliceGap')}
         </button>
         <button class="smooth-toggle ${state.activeControl === 'hole' ? 'active' : ''}" data-type="hole" id="donut-hole-toggle" aria-label="Donut hole size" title="Donut hole size">
           ${getSVGIcon('donutHoleSize')}
         </button>
         <input type="range" id="smoothing-slider" class="text-slider" min="0" max="20" value="${state.smoothingValue}">
       </div>
     `;
    } else if (state.currentChartType === 'line') {
        container.innerHTML = `
      <div class="text-controls">
        <button class="text-control-btn active" data-type="smoothing" title="Line Smoothing">
          ${getSVGIcon('lineSmoothing')}
        </button>
        <button class="text-control-btn" data-type="linewidth" title="Line Width">
          ${getSVGIcon('lineWidth')}
        </button>
        <button class="text-control-btn" data-type="resize" title="Chart Resize">
          ${getSVGIcon('chartResize')}
        </button>
        <input type="range" id="smoothing-slider" class="text-slider" min="0" max="5" value="${state.lineTension * 10}">
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin: var(--spacing-md) 0; padding-top: var(--spacing-md);"></div>
      <div class="text-controls">
        <button class="text-control-btn active" id="marker-style-circle" title="Circle markers">
          ${getSVGIcon('circleMarkers')}
        </button>
        <button class="text-control-btn" id="marker-style-diamond" title="Diamond markers">
          ${getSVGIcon('diamondMarkers')}
        </button>
        <button class="text-control-btn" id="marker-style-square" title="Square markers">
          ${getSVGIcon('squareMarkers')}
        </button>
        <input type="range" id="marker-size-slider" class="text-slider" min="0" max="15" value="${state.lineMarkerSize}">
        <button class="text-control-btn" id="marker-visibility-toggle" title="Toggle marker visibility">
          ${getSVGIcon('markerVisibility')}
        </button>
      </div>
    `;
    } else {
        container.innerHTML = '';
    }

    // Re-attach listeners for dynamically created elements
    const styleToggles = document.querySelectorAll('#style-content button[data-type]');
    styleToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            styleToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeControl = btn.dataset.type;
            updateSmoothingSlider();
        });
    });

    const smoothingSlider = document.getElementById('smoothing-slider');
    if (smoothingSlider) {
        smoothingSlider.addEventListener('input', debounce(() => {
            updateSmoothing();
        }, 100));
    }

    // Add event listeners for line chart marker controls (if present)
    if (state.currentChartType === 'line') {
        const markerVisibilityToggle = document.getElementById('marker-visibility-toggle');
        const markerStyleCircle = document.getElementById('marker-style-circle');
        const markerStyleDiamond = document.getElementById('marker-style-diamond');
        const markerStyleSquare = document.getElementById('marker-style-square');
        const markerSizeSlider = document.getElementById('marker-size-slider');

        if (markerVisibilityToggle) {
            markerVisibilityToggle.addEventListener('click', toggleMarkerVisibility);
        }

        if (markerStyleCircle) {
            markerStyleCircle.addEventListener('click', () => setMarkerStyle('circle'));
        }

        if (markerStyleDiamond) {
            markerStyleDiamond.addEventListener('click', () => setMarkerStyle('rectRot'));
        }

        if (markerStyleSquare) {
            markerStyleSquare.addEventListener('click', () => setMarkerStyle('rect'));
        }

        if (markerSizeSlider) {
            markerSizeSlider.addEventListener('input', (e) => {
                state.lineMarkerSize = parseInt(e.target.value, 10);
                renderChart();
            });
        }

        // Set initial state for marker controls based on visibility
        const markerControls = ['marker-style-circle', 'marker-style-diamond', 'marker-style-square', 'marker-size-slider'];
        if (!state.lineMarkerVisible) {
            markerControls.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = true;
            });
        }
    }
}

// ============================================
// DATA INPUT - MANUAL
// ============================================
function initManualInput() {
    const container = document.getElementById('manual-rows');
    if (!container) return; // Exit if manual input isn't on the page

    container.innerHTML = '';

    // Create rows with placeholder text showing the actual data (for all chart types)
    state.chartData.labels.forEach((label, index) => {
        addManualRow(label, state.chartData.datasets[0].data[index], true);
    });
}

function addManualRow(label = '', value = '', usePlaceholder = false) {
    const container = document.getElementById('manual-rows');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'manual-row';
    row.setAttribute('role', 'listitem');

    const rowId = `row-${Date.now()}`;

    // If usePlaceholder is true, show data as placeholder text with empty value
    const labelValue = usePlaceholder ? '' : label;
    const valueLabelValue = usePlaceholder ? '' : value;
    const labelPlaceholder = usePlaceholder ? label : 'Label';
    const valuePlaceholder = usePlaceholder ? value : 'Value';

    row.innerHTML = `
    <input type="text" 
           class="row-label" 
           placeholder="${labelPlaceholder}" 
           value="${labelValue}"
           maxlength="${validation.maxLabelLength}"
           aria-label="Data label"
           aria-describedby="${rowId}-hint"
           required>
    <input type="number" 
           class="row-value" 
           placeholder="${valuePlaceholder}" 
           value="${valueLabelValue}" 
           step="0.1"
           min="${validation.allowNegative ? '' : validation.minValue}"
           max="${validation.maxValue}"
           aria-label="Data value"
           required>
    <button class="btn-remove" 
             title="Remove row" 
             aria-label="Remove this data entry">
      ${getSVGIcon('trash')}
    </button>
    <small id="${rowId}-hint" class="sr-only">Max ${validation.maxLabelLength} characters</small>
  `;

    container.appendChild(row);

    // Add event listeners to inputs (with debouncing and validation)
    const labelInput = row.querySelector('.row-label');
    const valueInput = row.querySelector('.row-value');
    const removeBtn = row.querySelector('.btn-remove');

    labelInput.addEventListener('input', debounce(() => {
        validateAndUpdateManualData();
    }, 300));

    valueInput.addEventListener('input', debounce(() => {
        validateAndUpdateManualData();
    }, 300));

    removeBtn.addEventListener('click', () => {
        if (state.chartData.labels.length <= validation.minDataPoints) {
            showFeedback(`At least ${validation.minDataPoints} data point required`, 'error');
            return;
        }
        row.remove();
        validateAndUpdateManualData();
    });

    // Focus on the new label input
    if (!label) {
        labelInput.focus();
    }
}

function validateAndUpdateManualData() {
    const rows = document.querySelectorAll('.manual-row');
    const labels = [];
    const data = [];
    let hasErrors = false;

    rows.forEach(row => {
        const labelInput = row.querySelector('.row-label');
        const valueInput = row.querySelector('.row-value');

        const label = labelInput.value.trim();
        const value = valueInput.value;

        // Clear previous error states
        labelInput.classList.remove('input-error');
        valueInput.classList.remove('input-error');

        // Validate label
        if (label) {
            const labelValidation = validateText(label, validation.maxLabelLength, 'Label');
            if (!labelValidation.valid) {
                labelInput.classList.add('input-error');
                labelInput.setAttribute('aria-invalid', 'true');
                hasErrors = true;
            } else {
                labelInput.setAttribute('aria-invalid', 'false');
                labels.push(labelValidation.value);
            }
        }

        // Validate value
        if (value !== '') {
            const numberValidation = validateNumber(value, validation.allowNegative);
            if (!numberValidation.valid) {
                valueInput.classList.add('input-error');
                valueInput.setAttribute('aria-invalid', 'true');
                hasErrors = true;
            } else {
                valueInput.setAttribute('aria-invalid', 'false');
                if (label) { // Only add data if label is also valid
                    data.push(numberValidation.value);
                }
            }
        }
    });

    // Only update if we have valid data and no errors
    if (labels.length > 0 && labels.length === data.length && !hasErrors) {
        state.chartData.labels = labels;
        state.chartData.datasets[0].data = data;
        ensureColorsMatchData();
        renderChart();
        initColorControls();
    }
}


// ============================================
// DATA INPUT - CSV
// ============================================
function switchDataTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-input`).classList.add('active');
}

function updateDataFromCSV() {
    const textarea = document.getElementById('csv-textarea');
    if (!textarea) return;
    
    const csvText = textarea.value.trim();
    if (!csvText) {
        // Reset to default data when CSV is empty
        if (state.currentChartType === 'bar') {
            state.chartData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
            state.chartData.datasets = [{
                data: [12, 19, 15, 25, 22],
                backgroundColor: Array(5).fill(state.barColors[0]),
                borderColor: Array(5).fill(state.barColors[0]),
                borderWidth: 0,
                borderRadius: state.barBorderRadius,
                categoryPercentage: state.barCategoryPercentage
            }];
            state.barCount = 1;
            state.barNames = ['Series 1', 'Series 2', 'Series 3'];
            initDataControls(); // Refresh to update grouped/stacked button states
        } else if (state.currentChartType === 'line') {
            state.chartData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
            state.chartData.datasets = [{
                data: [12, 19, 15, 25, 22],
                backgroundColor: 'transparent',
                borderColor: state.lineColors[0],
                borderWidth: state.lineWidth
            }];
            state.lineCount = 1;
            state.lineNames = ['Line 1', 'Line 2'];
        } else {
            state.chartData.labels = ['Slice A', 'Slice B', 'Slice C'];
            state.chartData.datasets[0].data = [30, 50, 20];
        }
        ensureColorsMatchData();
        renderChart();
        initManualInput();
        initColorControls();
        return;
    }

    try {
        const lines = csvText.split('\n').filter(line => line.trim());
        
        // Detect column count from first data row
        const firstLine = lines[0].split(',').map(p => p.trim());
        const columnCount = firstLine.length;
        
        // For line charts, detect if multi-line format (3+ columns)
        if (state.currentChartType === 'line' && columnCount >= 3) {
            parseMultiLineCSV(lines, textarea);
            return;
        }
        
        // For bar charts, detect if multi-series format (3+ columns)
        if (state.currentChartType === 'bar' && columnCount >= 3) {
            parseMultiSeriesBarCSV(lines, textarea);
            return;
        }
        
        // Single-series parsing (existing logic)
        const labels = [];
        const data = [];

        lines.forEach((line, index) => {
            const parts = line.split(',').map(p => p.trim());
            
            if (parts.length >= 2) {
                const label = parts[0];
                const valueText = parts[1];
                const value = parseFloat(valueText);
                
                // Auto-detect header row: if first row has non-numeric second column, skip it
                if (index === 0 && isNaN(value)) {
                    console.log('Skipped header row:', line);
                    return;
                }
                
                // Add valid data rows
                if (label && !isNaN(value)) {
                    labels.push(label);
                    data.push(value);
                } else {
                    console.warn('Skipped invalid row:', line);
                }
            }
        });

        if (labels.length === 0) {
            console.error('No valid data parsed from CSV');
            showFeedback('No valid data found. Format: label,value', 'error');
            return;
        }

        // Successfully parsed data
        console.log('CSV parsed successfully:', labels.length, 'rows');
        state.chartData.labels = labels;
        
        if (state.currentChartType === 'bar') {
            // Single-series bar chart: create fresh dataset and reset to single series
            state.chartData.datasets = [{
                data: data,
                backgroundColor: Array(labels.length).fill(state.barColors[0]),
                borderColor: Array(labels.length).fill(state.barColors[0]),
                borderWidth: 0,
                borderRadius: state.barBorderRadius,
                categoryPercentage: state.barCategoryPercentage
            }];
            state.barCount = 1;
            state.barNames = ['Series 1', 'Series 2', 'Series 3'];
            initDataControls(); // Refresh to update grouped/stacked button states
        } else if (state.currentChartType === 'line') {
            // Line chart: create fresh dataset
            state.chartData.datasets = [{
                data: data,
                backgroundColor: 'transparent',
                borderColor: state.lineColors[0],
                borderWidth: state.lineWidth
            }];
            state.lineCount = 1;
        }
        
        ensureColorsMatchData();
        renderChart();
        initManualInput();
        initColorControls();
        
        // Save cleaned CSV data to cache and update textarea
        const cleanedCsv = chartDataToCSV();
        if (state.currentChartType === 'bar' || state.currentChartType === 'line') {
            state.csvDataCache[state.currentChartType] = cleanedCsv;
            console.log('Updated CSV cache for', state.currentChartType);
        }
        
        // Update textarea with cleaned data
        textarea.value = cleanedCsv;
        
    } catch (error) {
        console.error('Error parsing CSV:', error);
        showFeedback('Error parsing CSV. Format: label,value', 'error');
    }
}

function parseMultiLineCSV(lines, textarea) {
    const labels = [];
    const data1 = [];
    const data2 = [];
    let lineNames = ['Line 1', 'Line 2'];
    
    lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length >= 3) {
            const label = parts[0];
            const value1 = parseFloat(parts[1]);
            const value2 = parseFloat(parts[2]);
            
            // Auto-detect header row: if first row has non-numeric columns, use as line names
            if (index === 0 && (isNaN(value1) || isNaN(value2))) {
                lineNames = [parts[1], parts[2]];
                console.log('Using header row for line names:', lineNames);
                return;
            }
            
            // Add valid data rows
            if (label && !isNaN(value1) && !isNaN(value2)) {
                labels.push(label);
                data1.push(value1);
                data2.push(value2);
            } else {
                console.warn('Skipped invalid row:', line);
            }
        }
    });
    
    if (labels.length === 0) {
        console.error('No valid data parsed from multi-line CSV');
        showFeedback('No valid data found. Format: label,value,value', 'error');
        return;
    }
    
    // Successfully parsed multi-line data
    console.log('Multi-line CSV parsed successfully:', labels.length, 'rows, 2 lines');
    state.chartData.labels = labels;
    state.lineCount = 2;
    state.lineNames = lineNames;
    
    // Create two datasets for the two lines
    state.chartData.datasets = [
        {
            label: lineNames[0],
            data: data1,
            borderColor: state.lineColors[0],
            backgroundColor: 'transparent',
            borderWidth: state.lineWidth,
            tension: state.lineTension,
            pointBackgroundColor: state.markerColors[0],
            pointBorderColor: state.markerColors[0],
            pointRadius: state.lineMarkerVisible ? state.lineMarkerSize : 0,
            pointHoverRadius: state.lineMarkerVisible ? state.lineMarkerSize + 2 : 0,
            pointStyle: state.lineMarkerStyle
        },
        {
            label: lineNames[1],
            data: data2,
            borderColor: state.lineColors[1],
            backgroundColor: 'transparent',
            borderWidth: state.lineWidth,
            tension: state.lineTension,
            pointBackgroundColor: state.markerColors[1],
            pointBorderColor: state.markerColors[1],
            pointRadius: state.lineMarkerVisible ? state.lineMarkerSize : 0,
            pointHoverRadius: state.lineMarkerVisible ? state.lineMarkerSize + 2 : 0,
            pointStyle: state.lineMarkerStyle
        }
    ];
    
    ensureColorsMatchData();
    renderChart();
    initManualInput();
    initColorControls();
    
    // Save cleaned CSV data to cache
    const cleanedCsv = chartDataToCSV();
    state.csvDataCache.line = cleanedCsv;
    textarea.value = cleanedCsv;
}

function parseMultiSeriesBarCSV(lines, textarea) {
    const labels = [];
    const seriesData = [[], [], []]; // Up to 3 series
    let seriesNames = ['Series 1', 'Series 2', 'Series 3'];
    let seriesCount = 2; // Default to 2 series
    
    lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length >= 3) {
            const label = parts[0];
            const value1 = parseFloat(parts[1]);
            const value2 = parseFloat(parts[2]);
            const value3 = parts.length >= 4 ? parseFloat(parts[3]) : NaN;
            
            // Auto-detect header row: if first row has non-numeric columns, use as series names
            if (index === 0 && (isNaN(value1) || isNaN(value2))) {
                seriesNames[0] = parts[1];
                seriesNames[1] = parts[2];
                if (parts.length >= 4 && parts[3]) {
                    seriesNames[2] = parts[3];
                    seriesCount = 3;
                }
                console.log('Using header row for series names:', seriesNames);
                return;
            }
            
            // Detect series count from data rows
            if (!isNaN(value3) && parts.length >= 4) {
                seriesCount = 3;
            }
            
            // Add valid data rows
            if (label && !isNaN(value1) && !isNaN(value2)) {
                labels.push(label);
                seriesData[0].push(value1);
                seriesData[1].push(value2);
                if (!isNaN(value3)) {
                    seriesData[2].push(value3);
                }
            } else {
                console.warn('Skipped invalid row:', line);
            }
        }
    });
    
    if (labels.length === 0) {
        console.error('No valid data parsed from multi-series bar CSV');
        showFeedback('No valid data found. Format: label,value,value', 'error');
        return;
    }
    
    // Successfully parsed multi-series data
    console.log('Multi-series bar CSV parsed successfully:', labels.length, 'rows,', seriesCount, 'series');
    state.chartData.labels = labels;
    state.barCount = seriesCount;
    state.barNames = seriesNames;
    
    // Create datasets for each series with color arrays (for per-category coloring)
    state.chartData.datasets = [];
    for (let i = 0; i < seriesCount; i++) {
        state.chartData.datasets.push({
            label: seriesNames[i],
            data: seriesData[i],
            backgroundColor: Array(labels.length).fill(state.barColors[i]),
            borderColor: Array(labels.length).fill(state.barColors[i]),
            borderWidth: 0,
            borderRadius: state.barBorderRadius
        });
    }
    
    // Auto-enable legend for multi-series
    state.legendVisible = true;
    
    ensureColorsMatchData();
    renderChart();
    initDataControls(); // Refresh to enable grouped/stacked buttons
    initColorControls();
    
    // Save cleaned CSV data to cache
    const cleanedCsv = chartDataToCSV();
    state.csvDataCache.bar = cleanedCsv;
    textarea.value = cleanedCsv;
}

// ============================================
// COLOR CONTROLS
// ============================================
function initColorControls() {
    const coloursContent = document.getElementById('colours-content');
    if (!coloursContent) {
        console.warn('colours-content element not found');
        return;
    }

    // Rebuild the entire colours-content structure for non-pictogram charts
    coloursContent.innerHTML = `
    <div id="color-controls" role="group" aria-label="Segment colours"></div>
    <div class="color-control bg-control">
      <span class="color-label">Background</span>
      <div class="bg-options">
        <button class="bg-option active" data-bg="white" aria-label="White background">
          <span class="bg-circle bg-white"></span>
        </button>
        <button class="bg-option" data-bg="transparent" aria-label="Transparent background">
          <span class="bg-circle bg-transparent"></span>
        </button>
        <button class="bg-option" data-bg="rainbow" aria-label="Rainbow gradient background">
          <span class="bg-circle bg-rainbow"></span>
        </button>
      </div>
    </div>
  `;

    const container = document.getElementById('color-controls');
    container.innerHTML = '';

    if (state.currentChartType === 'line') {
        // Build dynamic color controls based on line count
        let linesHtml = `<div class="color-control"><span class="color-label">Lines</span><div class="line-color-pickers">`;
        let markersHtml = `<div class="color-control"><span class="color-label">Markers</span><div class="line-color-pickers">`;
        
        // Always show first line color picker
        linesHtml += `<input type="text" class="color-picker" data-coloris id="line-color-picker-0" value="${state.lineColors[0]}">`;
        markersHtml += `<input type="text" class="color-picker" data-coloris id="marker-color-picker-0" value="${state.markerColors[0]}">`;
        
        // Show second color picker only for multi-line
        if (state.lineCount === 2) {
            linesHtml += `<input type="text" class="color-picker" data-coloris id="line-color-picker-1" value="${state.lineColors[1]}">`;
            markersHtml += `<input type="text" class="color-picker" data-coloris id="marker-color-picker-1" value="${state.markerColors[1]}">`;
        }
        
        linesHtml += `</div></div>`;
        markersHtml += `</div></div>`;
        
        container.innerHTML = linesHtml + markersHtml;
        
        // Add event listeners for line color pickers
        document.getElementById('line-color-picker-0').addEventListener('input', (e) => {
            state.lineColors[0] = e.target.value;
            state.lineChartLineColor = e.target.value; // Keep legacy state in sync
            if (state.chartData.datasets[0]) {
                state.chartData.datasets[0].borderColor = e.target.value;
            }
            renderChart();
        });
        
        document.getElementById('marker-color-picker-0').addEventListener('input', (e) => {
            state.markerColors[0] = e.target.value;
            state.lineChartMarkerColor = e.target.value; // Keep legacy state in sync
            if (state.chartData.datasets[0]) {
                state.chartData.datasets[0].pointBackgroundColor = e.target.value;
                state.chartData.datasets[0].pointBorderColor = e.target.value;
            }
            renderChart();
        });
        
        // Add listeners for second line if present
        if (state.lineCount === 2) {
            document.getElementById('line-color-picker-1').addEventListener('input', (e) => {
                state.lineColors[1] = e.target.value;
                if (state.chartData.datasets[1]) {
                    state.chartData.datasets[1].borderColor = e.target.value;
                }
                renderChart();
            });
            
            document.getElementById('marker-color-picker-1').addEventListener('input', (e) => {
                state.markerColors[1] = e.target.value;
                if (state.chartData.datasets[1]) {
                    state.chartData.datasets[1].pointBackgroundColor = e.target.value;
                    state.chartData.datasets[1].pointBorderColor = e.target.value;
                }
                renderChart();
            });
        }
    } else if (state.currentChartType === 'bar') {
        // Bar chart: Base color row + individual category rows with series color pickers

        // Build base color control with series color pickers
        let baseColorHtml = `<div class="color-control"><span class="color-label" style="font-weight: 600;">Base Colour</span><div class="bar-series-color-pickers">`;
        for (let i = 0; i < state.barCount; i++) {
            baseColorHtml += `<input type="text" class="color-picker" data-coloris id="bar-base-color-${i}" value="${state.barColors[i]}">`;
        }
        baseColorHtml += `</div></div>`;
        container.innerHTML = baseColorHtml;

        // Add event listeners for base color pickers
        for (let i = 0; i < state.barCount; i++) {
            document.getElementById(`bar-base-color-${i}`).addEventListener('input', (e) => {
                state.barColors[i] = e.target.value;
                // Apply base color to all bars in this series (always use array)
                const numCategories = state.chartData.labels.length;
                state.chartData.datasets[i].backgroundColor = Array(numCategories).fill(e.target.value);
                state.chartData.datasets[i].borderColor = Array(numCategories).fill(e.target.value);
                renderChart();
                // Update individual row pickers for this series
                document.querySelectorAll(`.bar-color-picker-series-${i}`).forEach(picker => {
                    picker.value = e.target.value;
                    picker.style.backgroundColor = e.target.value;
                });
            });
        }

        // Add individual category rows with reset button and series color pickers
        state.chartData.labels.forEach((label, categoryIndex) => {
            const control = document.createElement('div');
            control.className = 'color-control';

            let colorPickersHtml = '';
            for (let seriesIndex = 0; seriesIndex < state.barCount; seriesIndex++) {
                // Always read from the color array for each dataset
                const bgColor = state.chartData.datasets[seriesIndex].backgroundColor;
                const currentColor = Array.isArray(bgColor) ? bgColor[categoryIndex] : bgColor;
                colorPickersHtml += `<input type="text" class="color-picker bar-color-picker bar-color-picker-series-${seriesIndex}" data-coloris value="${currentColor}" data-category="${categoryIndex}" data-series="${seriesIndex}">`;
            }

            control.innerHTML = `
        <span class="color-label">${label}</span>
        <div class="bar-color-controls">
          <button class="bar-reset-btn" data-category="${categoryIndex}" title="Reset to base colours" aria-label="Reset ${label} to base colours">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M5.46257 4.43262C7.21556 2.91688 9.5007 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C9.84982 4 7.89777 4.84827 6.46023 6.22842L5.46257 4.43262ZM18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 9.86386 2.66979 7.88416 3.8108 6.25944L7 12H4C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z"></path>
            </svg>
          </button>
          <div class="bar-series-color-pickers">${colorPickersHtml}</div>
        </div>
      `;

            container.appendChild(control);

            // Add event listeners for individual color pickers
            control.querySelectorAll('.bar-color-picker').forEach(picker => {
                picker.addEventListener('input', (e) => {
                    const catIdx = parseInt(e.target.dataset.category);
                    const serIdx = parseInt(e.target.dataset.series);
                    // Update the specific bar color in the array
                    if (Array.isArray(state.chartData.datasets[serIdx].backgroundColor)) {
                        state.chartData.datasets[serIdx].backgroundColor[catIdx] = e.target.value;
                        state.chartData.datasets[serIdx].borderColor[catIdx] = e.target.value;
                    }
                    renderChart();
                });
            });

            // Add event listener for reset button
            const resetBtn = control.querySelector('.bar-reset-btn');
            resetBtn.addEventListener('click', () => {
                const catIdx = parseInt(resetBtn.dataset.category);
                control.querySelectorAll('.bar-color-picker').forEach((picker, serIdx) => {
                    const baseColor = state.barColors[serIdx];
                    picker.value = baseColor;
                    picker.style.backgroundColor = baseColor;
                    // Reset this category's color in the array for this series
                    if (Array.isArray(state.chartData.datasets[serIdx].backgroundColor)) {
                        state.chartData.datasets[serIdx].backgroundColor[catIdx] = baseColor;
                        state.chartData.datasets[serIdx].borderColor[catIdx] = baseColor;
                    }
                });
                renderChart();
            });
        });
    } else {
        // Pie/donut charts
        state.chartData.labels.forEach((label, index) => {
            const control = document.createElement('div');
            control.className = 'color-control';

            control.innerHTML = `
        <span class="color-label">${label}</span>
        <input type="text" class="color-picker" data-coloris value="${state.chartData.datasets[0].backgroundColor[index]}" data-index="${index}">
      `;

            container.appendChild(control);

            // Add event listener
            const colorPicker = control.querySelector('.color-picker');
            colorPicker.addEventListener('input', (e) => {
                updateSegmentColor(index, e.target.value);
            });
        });
    }

    // Set background colors on color picker inputs
    setTimeout(() => {
        const colorInputs = document.querySelectorAll('input[data-coloris]');
        console.log('Setting background colors for', colorInputs.length, 'color inputs');
        
        colorInputs.forEach(input => {
            const color = input.value;
            input.style.backgroundColor = color;
            console.log('Set input background to:', color);
            
            // Also listen for changes to update the background
            input.addEventListener('input', (e) => {
                e.target.style.backgroundColor = e.target.value;
            });
        });
    }, 100);

    // Re-attach background color listeners
    const bgWhite = document.querySelector('.bg-option[data-bg="white"]');
    const bgTransparent = document.querySelector('.bg-option[data-bg="transparent"]');
    const bgRainbow = document.querySelector('.bg-option[data-bg="rainbow"]');

    if (bgWhite) {
        bgWhite.addEventListener('click', () => {
            document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
            bgWhite.classList.add('active');
            updateBackgroundColor('white');
        });
    }

    if (bgTransparent) {
        bgTransparent.addEventListener('click', () => {
            document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
            bgTransparent.classList.add('active');
            updateBackgroundColor('transparent');
        });
    }

    if (bgRainbow) {
        bgRainbow.addEventListener('click', () => {
            showBackgroundColorPicker(bgRainbow);
        });
    }
}

function updateSegmentColor(index, color) {
    state.chartData.datasets[0].backgroundColor[index] = color;
    state.chartData.datasets[0].borderColor[index] = color;
    renderChart();
}

function ensureColorsMatchData() {
    const dataLength = state.chartData.labels.length;
    const colors = ['#6A5ACD', '#FFDAB9', '#66C0B4', '#E6E6FA', '#DDA0DD', '#ADD8E6', '#FAEBD7', '#C0C0C0'];

    // Line charts use single color strings, not arrays
    if (state.currentChartType === 'line') {
        // Handle both single and multi-line charts
        state.chartData.datasets.forEach((dataset, index) => {
            // Each line gets its own color from lineColors array
            dataset.borderColor = state.lineColors[index] || state.lineColors[0];
            dataset.pointBackgroundColor = state.markerColors[index] || state.markerColors[0];
            dataset.pointBorderColor = state.markerColors[index] || state.markerColors[0];
        });
        return;
    }

    // For pie/donut/bar charts, backgroundColor should be an array
    if (!Array.isArray(state.chartData.datasets[0].backgroundColor)) {
        state.chartData.datasets[0].backgroundColor = [state.chartData.datasets[0].backgroundColor];
        state.chartData.datasets[0].borderColor = [state.chartData.datasets[0].borderColor];
    }

    while (state.chartData.datasets[0].backgroundColor.length < dataLength) {
        const colorIndex = state.chartData.datasets[0].backgroundColor.length % colors.length;
        state.chartData.datasets[0].backgroundColor.push(colors[colorIndex]);
        state.chartData.datasets[0].borderColor.push(colors[colorIndex]);
    }

    state.chartData.datasets[0].backgroundColor = state.chartData.datasets[0].backgroundColor.slice(0, dataLength);
    state.chartData.datasets[0].borderColor = state.chartData.datasets[0].borderColor.slice(0, dataLength);
}

// ============================================
// CHART STYLING
// ============================================
function updateBackgroundColor(bgType, isCustomColor = false) {
    let backgroundColor;

    if (isCustomColor) {
        backgroundColor = bgType;
    } else {
        switch (bgType) {
            case 'white':
                break;
            case 'transparent':
                backgroundColor = 'transparent';
                break;
            case 'rainbow':
                backgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
                break;
            default:
                backgroundColor = '#FFFFFF';
        }
    }

    state.chartBackgroundColor = backgroundColor;
    const wrapper = document.querySelector('.chart-canvas-wrapper');

    if (bgType === 'rainbow') {
        wrapper.style.background = backgroundColor;
        wrapper.style.backgroundColor = '';
    } else {
        wrapper.style.backgroundColor = backgroundColor;
        wrapper.style.background = '';
    }

    // Update border color for pie/donut gaps
    if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
        // Use the actual background color for the border, or transparent if the bg is transparent
        state.chartData.datasets[0].borderColor = backgroundColor === 'transparent' ? 'transparent' : backgroundColor;
    }

    renderChart();
}

function updateSmoothing() {
    const value = parseInt(document.getElementById('smoothing-slider').value);

    if (state.currentChartType === 'bar') {
        switch (state.activeControl) {
            case 'corner':
                state.barBorderRadius = value;
                break;
            case 'gap':
                state.barCategoryPercentage = value / 100;
                break;
            case 'resize':
                state.barAspectRatio = value / 100;
                break;
        }
    } else { // Pie/Donut logic
        if (state.activeControl === 'corner') state.smoothingValue = value;
        if (state.activeControl === 'gap') state.gapValue = value;
        if (state.activeControl === 'hole') state.donutCutoutPercentage = value;
    }

    if (state.currentChartType === 'line') {
        switch (state.activeControl) {
            case 'smoothing':
                state.lineTension = value / 10; // Scale 0-5 to 0-0.5
                break;
            case 'linewidth':
                state.lineWidth = value;
                break;
            case 'resize':
                state.barAspectRatio = value / 100;
                break;
        }
    }

    renderChart();
}

function updateSmoothingSlider() {
    const slider = document.getElementById('smoothing-slider');
    if (!slider) return;

    if (state.currentChartType === 'bar') {
        switch (state.activeControl) {
            case 'corner':
                slider.min = 0;
                slider.max = 40; // More range for bar corners
                slider.value = state.barBorderRadius;
                break;
            case 'gap':
                slider.min = 40; // Corresponds to 0.4 - wider minimum
                slider.max = 100; // Corresponds to 1.0
                slider.value = state.barCategoryPercentage * 100;
                break;
            case 'resize':
                slider.min = 100; // Corresponds to 1.0 aspect ratio
                slider.max = 200; // Corresponds to 2.0 aspect ratio (up to 16:8)
                slider.value = state.barAspectRatio * 100;
                break;
        }
    } else if (state.currentChartType === 'line') {
        switch (state.activeControl) {
            case 'smoothing':
                slider.min = 0;
                slider.max = 5; // Represents 0.0 to 0.5 tension
                slider.value = state.lineTension * 10;
                break;
            case 'linewidth':
                slider.min = 1;
                slider.max = 15;
                slider.value = state.lineWidth;
                break;
            case 'resize': // Re-uses bar chart aspect ratio logic
                slider.min = 100;
                slider.max = 200;
                slider.value = state.barAspectRatio * 100;
        }
    } else { // Pie/Donut logic
        switch (state.activeControl) {
            case 'corner':
                slider.min = 0;
                slider.max = 20;
                slider.value = state.smoothingValue;
                break;
            case 'gap':
                slider.min = 0;
                slider.max = 20;
                slider.value = state.gapValue;
                break;
            case 'hole':
                slider.min = 0;
                slider.max = 90;
                slider.value = state.donutCutoutPercentage;
                break;
        }
    }
}

function updateSmoothingVisibility() {
    const styleControl = document.getElementById('style-control');
    const legendControl = document.querySelector('summary[aria-controls="legend-content"]')?.parentElement;
    const holeToggle = document.getElementById('donut-hole-toggle');

    // Hide style, legend, and axis controls for pictogram
    if (state.currentChartType === 'pictogram') {
        styleControl.style.display = 'none';
        if (legendControl) legendControl.style.display = 'none';
        return;
    }

    // Show legend for other chart types
    if (legendControl) legendControl.style.display = '';

    const isStyleVisible = ['pie', 'donut', 'bar', 'line'].includes(state.currentChartType);
    styleControl.style.display = isStyleVisible ? '' : 'none';

    if ((state.currentChartType === 'pie' || state.currentChartType === 'donut') && holeToggle) {
        holeToggle.style.display = state.currentChartType === 'donut' ? 'flex' : 'none';

        // If hole was active and we switch to pie, reset active control
        if (state.currentChartType === 'pie' && state.activeControl === 'hole') {
            state.activeControl = 'corner';
            document.querySelector('.smooth-toggle[data-type="corner"]').classList.add('active');
            document.querySelector('.smooth-toggle[data-type="hole"]').classList.remove('active');
            updateSmoothingSlider();
        }
    }
}

function setBarOrientation(orientation) {
    if (state.barOrientation === orientation) return;

    state.barOrientation = orientation;

    const verticalBtn = document.getElementById('bar-vertical-btn');
    const horizontalBtn = document.getElementById('bar-horizontal-btn');

    if (orientation === 'vertical') {
        verticalBtn.classList.add('active');
        horizontalBtn.classList.remove('active');
    } else {
        horizontalBtn.classList.add('active');
        verticalBtn.classList.remove('active');
    }
    renderChart();
}

function setBarChartMode(mode) {
    if (state.barChartMode === mode || state.barCount <= 1) return;

    state.barChartMode = mode;

    const groupedBtn = document.getElementById('bar-grouped-btn');
    const stackedBtn = document.getElementById('bar-stacked-btn');

    if (mode === 'grouped') {
        groupedBtn.classList.add('active');
        stackedBtn.classList.remove('active');
    } else {
        stackedBtn.classList.add('active');
        groupedBtn.classList.remove('active');
    }
    renderChart();
}

function setMarkerStyle(style) {
    state.lineMarkerStyle = style;

    // Update active button
    document.querySelectorAll('#marker-style-circle, #marker-style-diamond, #marker-style-square').forEach(btn => {
        btn.classList.remove('active');
    });

    let activeBtnId;
    if (style === 'circle') activeBtnId = 'marker-style-circle';
    else if (style === 'rectRot') activeBtnId = 'marker-style-diamond';
    else if (style === 'rect') activeBtnId = 'marker-style-square';

    if (activeBtnId) document.getElementById(activeBtnId).classList.add('active');

    renderChart();
}

function toggleMarkerVisibility() {
    state.lineMarkerVisible = !state.lineMarkerVisible;
    const toggleBtn = document.getElementById('marker-visibility-toggle');

    const visibleIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path></svg>`;
    const hiddenIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968ZM5.9356 7.3497C4.60673 8.56015 3.6378 10.1672 3.22278 12.0002C4.14022 16.0521 7.7646 19.0002 12.0003 19.0002C13.5997 19.0002 15.112 18.5798 16.4243 17.8384L14.396 15.8101C13.7023 16.2472 12.8808 16.5002 12.0003 16.5002C9.51498 16.5002 7.50026 14.4854 7.50026 12.0002C7.50026 11.1196 7.75317 10.2981 8.19031 9.60442L5.9356 7.3497ZM12.9139 14.328L9.67246 11.0866C9.5613 11.3696 9.50026 11.6777 9.50026 12.0002C9.50026 13.3809 10.6196 14.5002 12.0003 14.5002C12.3227 14.5002 12.6309 14.4391 12.9139 14.328ZM20.8068 16.5925L19.376 15.1617C20.0319 14.2268 20.5154 13.1586 20.7777 12.0002C19.8603 7.94818 16.2359 5.00016 12.0003 5.00016C11.1544 5.00016 10.3329 5.11773 9.55249 5.33818L7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8038 15.2628 20.8068 16.5925ZM11.7229 7.50857C11.8146 7.50299 11.9071 7.50016 12.0003 7.50016C14.4855 7.50016 16.5003 9.51488 16.5003 12.0002C16.5003 12.0933 16.4974 12.1858 16.4919 12.2775L11.7229 7.50857Z"></path></svg>`;
    toggleBtn.innerHTML = state.lineMarkerVisible ? visibleIcon : hiddenIcon;

    // Disable/enable other marker controls
    const markerControls = ['marker-style-circle', 'marker-style-diamond', 'marker-style-square', 'marker-size-slider'];
    markerControls.forEach(id => {
        document.getElementById(id).disabled = !state.lineMarkerVisible;
    });

    renderChart();
}

function updateTitle() {
    state.chartTitle = document.getElementById('title-input').value;
    const titleEl = document.querySelector('.chart-title');
    if (titleEl) {
        titleEl.textContent = state.chartTitle;
        titleEl.style.display = state.chartTitle ? 'block' : 'none';
        updateTitleStyle();
    }
}

function updateTitleStyle() {
    const titleEl = document.querySelector('.chart-title');
    if (!titleEl) return;

    const fontFamily = state.titleFont || 'Inter';
    titleEl.style.fontFamily = `'${fontFamily}', sans-serif`;
    titleEl.style.color = state.titleColor;
    titleEl.style.fontWeight = state.titleBold ? '700' : '400';
    titleEl.style.fontStyle = state.titleItalic ? 'italic' : 'normal';
    titleEl.style.fontSize = `${state.titleSize}px`;
    titleEl.style.lineHeight = state.titleLineHeight;
    titleEl.style.textAlign = state.titleAlign;
}

function updateAlignmentIcon() {
    const alignBtn = document.getElementById('title-align-cycle');
    const alignIcons = {
        left: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 19H17V21H3V19ZM3 14H21V16H3V14ZM3 9H17V11H3V9Z"></path></svg>',
        center: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z"></path></svg>',
        right: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM7 19H21V21H7V19ZM3 14H21V16H3V14ZM7 9H21V11H7V9Z"></path></svg>'
    };
    alignBtn.innerHTML = alignIcons[state.titleAlign];
}

function updateTitleSlider() {
    const slider = document.getElementById('title-slider');
    const value = parseInt(slider.value);

    if (!state.activeTitleControl) state.activeTitleControl = 'size';

    if (state.activeTitleControl === 'size') {
        state.titleSize = value;
        slider.min = 16;
        slider.max = 48;
        slider.value = state.titleSize;
    } else {
        const lineHeightMap = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
        const index = Math.min(Math.floor((value - 16) / 5.33), 5);
        state.titleLineHeight = lineHeightMap[index];
        slider.min = 16;
        slider.max = 48;
    }

    updateTitleStyle();
}

function updateCaption() {
    state.chartCaption = document.getElementById('caption-input').value;
    const captionEl = document.querySelector('.chart-caption');
    if (captionEl) {
        captionEl.textContent = state.chartCaption;
        captionEl.style.display = state.chartCaption ? 'block' : 'none';
        updateCaptionStyle();
    }
}

function updateCaptionStyle() {
    const captionEl = document.querySelector('.chart-caption');
    if (!captionEl) return;

    const fontFamily = state.captionFont || 'Inter';
    captionEl.style.fontFamily = `'${fontFamily}', sans-serif`;
    captionEl.style.color = state.captionColor;
    captionEl.style.fontWeight = state.captionBold ? '700' : '400';
    captionEl.style.fontStyle = state.captionItalic ? 'italic' : 'normal';
    captionEl.style.fontSize = `${state.captionSize}px`;
    captionEl.style.lineHeight = state.captionLineHeight;
    captionEl.style.textAlign = state.captionAlign;
}

function updateCaptionAlignmentIcon() {
    const alignBtn = document.getElementById('caption-align-cycle');
    const alignIcons = {
        left: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 19H17V21H3V19ZM3 14H21V16H3V14ZM3 9H17V11H3V9Z"></path></svg>',
        center: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z"></path></svg>',
        right: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM7 19H21V21H7V19ZM3 14H21V16H3V14ZM7 9H21V11H7V9Z"></path></svg>'
    };
    alignBtn.innerHTML = alignIcons[state.captionAlign];
}

function updateCaptionSlider() {
    const slider = document.getElementById('caption-slider');
    const value = parseInt(slider.value);

    if (!state.activeCaptionControl) state.activeCaptionControl = 'size';

    if (state.activeCaptionControl === 'size') {
        state.captionSize = value;
        slider.min = 12;
        slider.max = 24;
        slider.value = state.captionSize;
    } else {
        const lineHeightMap = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
        const index = Math.min(Math.floor((value - 12) / 2), 5);
        state.captionLineHeight = lineHeightMap[index];
        slider.min = 12;
        slider.max = 24;
    }

    updateCaptionStyle();
}

// ============================================
// LEGEND CONTROLS
// ============================================
function updateLegendStyle() {
    renderChart();
}

function updateLegendVisibilityIcon() {
    const btn = document.getElementById('legend-visible-toggle');
    btn.innerHTML = state.legendVisible ? getSVGIcon('visibility') : getSVGIcon('noVisibility');
}

// ============================================
// AXIS CONTROLS (for Bar Chart)
// ============================================
function initLegendAxisControls() {
    const details = document.querySelector('summary[aria-controls="legend-content"]').parentElement;
    const summary = details.querySelector('summary');
    const container = document.getElementById('legend-content');
    if (!container || !summary) return;

    if (state.currentChartType === 'bar' || state.currentChartType === 'line') {
        summary.textContent = 'Axis';
        container.innerHTML = `
      <div class="text-controls">
        <span class="legend-size-icon">
          ${getSVGIcon('fontSize')}
        </span>
        <input type="range" id="axis-size-slider" class="text-slider" min="8" max="18" value="${state.axisSize}">
        <button class="text-control-btn ${state.axisBold ? 'active' : ''}" id="axis-bold-btn" title="Bold axis text">
          ${getSVGIcon('bold')}
        </button>
        <button class="text-control-btn" id="axis-visible-toggle" title="Show/hide axis">
          ${state.axisVisible ? getSVGIcon('visibility') : getSVGIcon('noVisibility')}
        </button>
        <input type="color" id="axis-color-picker" class="color-picker" value="${state.axisColor}">
      </div>
    `;
        // Attach listeners for new controls
        document.getElementById('axis-visible-toggle').addEventListener('click', (e) => {
            state.axisVisible = !state.axisVisible;
            const btn = e.currentTarget;
            btn.innerHTML = state.axisVisible ? getSVGIcon('visibility') : getSVGIcon('noVisibility');
            renderChart();
        });
        document.getElementById('axis-size-slider').addEventListener('input', debounce((e) => {
            state.axisSize = parseInt(e.target.value);
            renderChart();
        }, 100));
        document.getElementById('axis-bold-btn').addEventListener('click', (e) => {
            state.axisBold = !state.axisBold;
            e.currentTarget.classList.toggle('active');
            renderChart();
        });
        document.getElementById('axis-color-picker').addEventListener('input', (e) => {
            state.axisColor = e.target.value;
            renderChart();
        });

    } else {
        summary.textContent = 'Legend';
        container.innerHTML = `
      <div class="legend-control-row">
        <span class="legend-size-icon">
          ${getSVGIcon('fontSize')}
        </span>
        <input type="range" id="legend-size-slider" class="text-slider" min="10" max="18" value="${state.legendSize}">
        <button class="text-control-btn ${state.legendPosition === 'bottom' ? 'active' : ''}" id="legend-position-down" title="Legend below chart">
          ${getSVGIcon('alignBottom')}
        </button>
        <button class="text-control-btn ${state.legendPosition === 'top' ? 'active' : ''}" id="legend-position-up" title="Legend above chart">
          ${getSVGIcon('alignTop')}
        </button>
        <button class="text-control-btn" id="legend-visible-toggle" title="Show/hide legend">
          ${state.legendVisible ? getSVGIcon('visibility') : getSVGIcon('noVisibility')}
        </button>
        <input type="color" id="legend-color" class="color-picker" value="${state.legendColor}">
      </div>
    `;
        // Re-attach listeners for original controls
        document.getElementById('legend-visible-toggle').addEventListener('click', () => { state.legendVisible = !state.legendVisible; updateLegendVisibilityIcon(); renderChart(); });
        document.getElementById('legend-position-down').addEventListener('click', () => { state.legendPosition = 'bottom'; document.getElementById('legend-position-down').classList.add('active'); document.getElementById('legend-position-up').classList.remove('active'); renderChart(); });
        document.getElementById('legend-position-up').addEventListener('click', () => { state.legendPosition = 'top'; document.getElementById('legend-position-up').classList.add('active'); document.getElementById('legend-position-down').classList.remove('active'); renderChart(); });
        document.getElementById('legend-size-slider').addEventListener('input', debounce(() => { state.legendSize = parseInt(document.getElementById('legend-size-slider').value); updateLegendStyle(); }, 100));
        document.getElementById('legend-color').addEventListener('input', () => { state.legendColor = document.getElementById('legend-color').value; updateLegendStyle(); });
    }
}



// ============================================
// DROPDOWN BEHAVIOR
// ============================================
function setupDropdownBehavior() {
    const allDetails = document.querySelectorAll('.control-section');

    allDetails.forEach(detail => {
        detail.addEventListener('toggle', (e) => {
            if (e.target.open) {
                allDetails.forEach(other => {
                    if (other !== e.target && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });
}

// ============================================
// DOWNLOAD
// ============================================

// Download pictogram at high resolution (1080px wide)
async function downloadPictogramHighRes() {
    const exportWidth = 1080;
    const iconsPerRow = 5;
    const totalIcons = 10;
    const rows = 2;

    // Convert spacing slider values (0-100) to pixel values (-50 to +50)
    const horizontalSpacing = state.pictogramHorizontalSpacing - 50;
    const verticalSpacing = state.pictogramVerticalSpacing - 50;

    // Calculate icon sizing at export resolution
    const padding = 40;
    const availableWidth = exportWidth - (padding * 2);
    const iconWidth = (availableWidth - (horizontalSpacing * (iconsPerRow - 1))) / iconsPerRow;
    const iconHeight = iconWidth;

    // Calculate canvas height
    const canvasHeight = (rows * iconHeight) + ((rows - 1) * verticalSpacing) + (padding * 2);

    // Calculate total export height
    let totalHeight = 120; // Top padding
    if (state.chartTitle) totalHeight += 80;
    totalHeight += canvasHeight;
    if (state.chartCaption) totalHeight += 80;
    totalHeight += 60; // Bottom padding

    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    exportCanvas.width = exportWidth;
    exportCanvas.height = totalHeight;

    // Fill background (skip for transparent to preserve PNG transparency)
    if (state.chartBackgroundColor !== 'transparent') {
        ctx.fillStyle = state.chartBackgroundColor;
        ctx.fillRect(0, 0, exportWidth, totalHeight);
    }

    // Track vertical position
    let yOffset = 60;

    // Draw title if present
    if (state.chartTitle) {
        ctx.fillStyle = state.titleColor;
        ctx.font = `${state.titleBold ? 'bold' : 'normal'} ${state.titleItalic ? 'italic' : 'normal'} 48px ${state.titleFont}, sans-serif`;
        ctx.textAlign = state.titleAlign;
        const titleX = state.titleAlign === 'left' ? 40 : (state.titleAlign === 'right' ? exportWidth - 40 : exportWidth / 2);
        ctx.fillText(state.chartTitle, titleX, yOffset);
        yOffset += 80;
    }

    // Build icon positions
    const positions = [];
    for (let i = 0; i < totalIcons; i++) {
        const row = Math.floor(i / iconsPerRow);
        const col = i % iconsPerRow;

        positions.push({
            x: padding + (col * (iconWidth + horizontalSpacing)),
            y: yOffset + padding + (row * (iconHeight + verticalSpacing)),
            width: iconWidth,
            height: iconHeight
        });
    }

    // Calculate full vs partial icons
    const filled = state.pictogramFilled;
    const fullIcons = Math.floor(filled);
    const partialAmount = filled % 1;

    // Render each icon at high resolution
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        let color;

        if (i < fullIcons) {
            // Full filled icon
            color = state.pictogramFilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
        } else if (i === fullIcons && partialAmount > 0) {
            // Partial filled icon - use clipping
            ctx.save();
            ctx.beginPath();
            ctx.rect(pos.x, pos.y, pos.width * partialAmount, pos.height);
            ctx.clip();
            color = state.pictogramFilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
            ctx.restore();

            // Draw the unfilled portion
            ctx.save();
            ctx.beginPath();
            ctx.rect(pos.x + (pos.width * partialAmount), pos.y, pos.width * (1 - partialAmount), pos.height);
            ctx.clip();
            color = state.pictogramUnfilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
            ctx.restore();
        } else {
            // Unfilled icon
            color = state.pictogramUnfilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
        }
    }

    // Draw caption if present
    if (state.chartCaption) {
        yOffset += canvasHeight + 40;
        ctx.fillStyle = state.captionColor;
        ctx.font = `${state.captionBold ? 'bold' : 'normal'} ${state.captionItalic ? 'italic' : 'normal'} 28px ${state.captionFont}, sans-serif`;
        ctx.textAlign = state.captionAlign;
        const captionX = state.captionAlign === 'left' ? 40 : (state.captionAlign === 'right' ? exportWidth - 40 : exportWidth / 2);
        ctx.fillText(state.chartCaption, captionX, yOffset);
    }

    // Download
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `chartflam-pictogram-${timestamp}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
}

function downloadChart() {
    const canvas = document.getElementById('chart-canvas');

    // For pictogram, use canvas directly; for others, check state.chart
    if (state.currentChartType !== 'pictogram' && !state.chart) {
        alert('No chart to download');
        return;
    }

    if (!canvas) {
        alert('Canvas not found');
        return;
    }

    // For pictograms, render at high resolution
    if (state.currentChartType === 'pictogram') {
        downloadPictogramHighRes();
        return;
    }

    // For Chart.js charts, get actual canvas dimensions to preserve aspect ratio
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasHeight / canvasWidth;

    // Calculate export dimensions (1080px wide, height based on aspect ratio)
    const exportWidth = 1080;
    const chartWidth = 1000; // Chart area width
    const chartHeight = chartWidth * canvasAspectRatio;

    // Calculate total canvas height needed
    let totalHeight = 120; // Top padding
    if (state.chartTitle) totalHeight += 80;
    totalHeight += chartHeight;
    if (state.chartCaption) totalHeight += 80;
    totalHeight += 60; // Bottom padding

    // Create export canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = exportWidth;
    tempCanvas.height = totalHeight;

    // Fill background (skip for transparent to preserve PNG transparency)
    if (state.chartBackgroundColor !== 'transparent') {
        tempCtx.fillStyle = state.chartBackgroundColor;
        tempCtx.fillRect(0, 0, exportWidth, totalHeight);
    }

    // Track vertical position
    let yOffset = 60;

    // Draw title if present
    if (state.chartTitle) {
        tempCtx.fillStyle = state.titleColor;
        tempCtx.font = `${state.titleBold ? 'bold' : 'normal'} ${state.titleItalic ? 'italic' : 'normal'} 48px ${state.titleFont}, sans-serif`;
        tempCtx.textAlign = state.titleAlign;
        const titleX = state.titleAlign === 'left' ? 40 : (state.titleAlign === 'right' ? exportWidth - 40 : exportWidth / 2);
        tempCtx.fillText(state.chartTitle, titleX, yOffset);
        yOffset += 80;
    }

    // Get chart image source (with clean/no tooltips)
    // Temporarily disable interaction to get clean export
    const originalOptions = state.chart.options.plugins.tooltip.enabled;
    state.chart.options.plugins.tooltip.enabled = false;
    state.chart.update();
    
    const chartImageSrc = state.chart.toBase64Image();
    
    // Restore original tooltip setting
    state.chart.options.plugins.tooltip.enabled = originalOptions;
    state.chart.update();

    // Draw chart
    const chartImage = new Image();
    chartImage.onload = function () {
        const chartX = (exportWidth - chartWidth) / 2;
        tempCtx.drawImage(chartImage, chartX, yOffset, chartWidth, chartHeight);

        yOffset += chartHeight + 40;

        // Draw caption if present
        if (state.chartCaption) {
            tempCtx.fillStyle = state.captionColor;
            tempCtx.font = `${state.captionBold ? 'bold' : 'normal'} ${state.captionItalic ? 'italic' : 'normal'} 28px ${state.captionFont}, sans-serif`;
            tempCtx.textAlign = state.captionAlign;
            const captionX = state.captionAlign === 'left' ? 40 : (state.captionAlign === 'right' ? exportWidth - 40 : exportWidth / 2);
            tempCtx.fillText(state.chartCaption, captionX, yOffset);
        }

        // Download
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `chartflam-${state.currentChartType}-${timestamp}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };

    chartImage.src = chartImageSrc;
}

// ============================================
// SVG ICONS
// ============================================


// ============================================
// PICTOGRAM CHART FUNCTIONS
// ============================================

// Load pictogram icons from global variable (loaded from pictogram-icons.js)
function loadPictogramIcons() {
    try {
        // Check if PICTOGRAM_ICONS is available (loaded from pictogram-icons.js)
        if (typeof PICTOGRAM_ICONS === 'undefined') {
            console.error('PICTOGRAM_ICONS not found. Make sure pictogram-icons.js is loaded.');
            return;
        }

        const icons = PICTOGRAM_ICONS;

        if (!icons || icons.length === 0) {
            console.error('No icons data available');
            return;
        }

        // Store all icons
        state.pictogramAllIcons = icons;

        // Group by categories
        const categories = {};
        icons.forEach(icon => {
            if (!categories[icon.category]) {
                categories[icon.category] = [];
            }
            categories[icon.category].push(icon);
        });
        state.pictogramIconCategories = categories;

        // Set default icon (gas)
        const defaultIcon = icons.find(icon => icon.name === 'gas');
        if (defaultIcon) {
            state.pictogramIconSvg = sanitizeSvg(defaultIcon.svg);
            console.log('Default icon (gas) loaded successfully');
        }

        console.log('Pictogram icons loaded:', Object.keys(categories).length, 'categories,', icons.length, 'total icons');
    } catch (error) {
        console.error('Error in loadPictogramIcons:', error);
    }
}

// Sanitize SVG - remove width/height, ensure viewBox
function sanitizeSvg(svgString) {
    // Parse the SVG string
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) return svgString;

    // Remove width and height attributes
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    // Ensure viewBox exists (use default if not present)
    if (!svg.hasAttribute('viewBox')) {
        svg.setAttribute('viewBox', '0 0 24 24');
    }

    // Return cleaned SVG
    return svg.outerHTML;
}

// Render SVG to canvas
function renderSvgToCanvas(ctx, svgString, x, y, width, height, color) {
    return new Promise((resolve, reject) => {
        // Replace currentColor with actual color
        const coloredSvg = svgString.replace(/currentColor/g, color);

        // Create image from SVG
        const img = new Image();
        const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            ctx.drawImage(img, x, y, width, height);
            URL.revokeObjectURL(url);
            resolve();
        };

        img.onerror = reject;
        img.src = url;
    });
}

// Calculate pictogram layout
function calculatePictogramLayout() {
    const canvas = document.getElementById('chart-canvas');
    const canvasWidth = canvas.width;
    const iconsPerRow = 5; // Fixed at 5 icons per row
    const totalIcons = 10; // Fixed at 10 icons total (2 rows)
    const rows = 2; // Always 2 rows

    // Convert spacing slider values (0-100) to pixel values (-50 to +50)
    // Slider at 50 = 0px spacing (centered), Slider at 0 = -50px (overlap), Slider at 100 = +50px (loose)
    const horizontalSpacing = state.pictogramHorizontalSpacing - 50;
    const verticalSpacing = state.pictogramVerticalSpacing - 50;

    // Icon sizing with padding
    const padding = 20;
    const availableWidth = canvasWidth - (padding * 2);
    const iconWidth = (availableWidth - (horizontalSpacing * (iconsPerRow - 1))) / iconsPerRow;
    const iconHeight = iconWidth; // Keep square

    // Calculate canvas height needed
    const canvasHeight = (rows * iconHeight) + ((rows - 1) * verticalSpacing) + (padding * 2);

    console.log('Layout: iconWidth=', iconWidth.toFixed(1), 'hSpacing=', horizontalSpacing.toFixed(1), 'vSpacing=', verticalSpacing.toFixed(1), 'height=', canvasHeight.toFixed(1));

    // Build positions array
    const positions = [];
    for (let i = 0; i < totalIcons; i++) {
        const row = Math.floor(i / iconsPerRow);
        const col = i % iconsPerRow;

        positions.push({
            x: padding + (col * (iconWidth + horizontalSpacing)),
            y: padding + (row * (iconHeight + verticalSpacing)),
            width: iconWidth,
            height: iconHeight
        });
    }

    return { positions, canvasHeight };
}

// Main pictogram render function
let renderPictogramRetryCount = 0;
async function renderPictogramChart() {
    console.log('renderPictogramChart called');

    // Check if icons are loaded
    if (!state.pictogramIconSvg) {
        renderPictogramRetryCount++;
        if (renderPictogramRetryCount > 50) { // Max 5 seconds (50 * 100ms)
            console.error('Failed to load pictogram icons after multiple retries');
            renderPictogramRetryCount = 0;
            return;
        }
        console.warn('Pictogram SVG not loaded yet, waiting... (retry', renderPictogramRetryCount, ')');
        setTimeout(renderPictogramChart, 100);
        return;
    }

    // Reset retry count on successful load
    renderPictogramRetryCount = 0;

    const canvas = document.getElementById('chart-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas width
    const container = document.querySelector('.chart-canvas-container');
    const width = container.clientWidth;
    canvas.width = width;

    // Calculate layout
    const { positions, canvasHeight } = calculatePictogramLayout();

    // Set canvas height
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate full vs partial icons
    const filled = state.pictogramFilled;
    const fullIcons = Math.floor(filled);
    const partialAmount = filled % 1;

    console.log('Rendering', state.pictogramTotal, 'icons,', filled, 'filled');

    // Render each icon
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        let color;

        if (i < fullIcons) {
            // Full filled icon
            color = state.pictogramFilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
        } else if (i === fullIcons && partialAmount > 0) {
            // Partial filled icon - use clipping
            ctx.save();
            ctx.beginPath();
            ctx.rect(pos.x, pos.y, pos.width * partialAmount, pos.height);
            ctx.clip();
            color = state.pictogramFilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
            ctx.restore();

            // Draw the unfilled portion
            ctx.save();
            ctx.beginPath();
            ctx.rect(pos.x + (pos.width * partialAmount), pos.y, pos.width * (1 - partialAmount), pos.height);
            ctx.clip();
            color = state.pictogramUnfilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
            ctx.restore();
        } else {
            // Unfilled icon
            color = state.pictogramUnfilledColor;
            await renderSvgToCanvas(ctx, state.pictogramIconSvg, pos.x, pos.y, pos.width, pos.height, color);
        }
    }
}

// Initialize pictogram controls
function initPictogramControls() {
    const dataContent = document.getElementById('data-content');

    dataContent.innerHTML = `
    <div class="pictogram-data-row" style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
      <span style="font-weight: 600; min-width: 80px;">Filled icons</span>
      <input type="range" id="pictogram-filled-slider" min="0" max="10" step="0.1" value="${state.pictogramFilled}" style="flex: 1;">
      <input type="number" id="pictogram-filled-input" min="0" max="10" step="0.1" value="${state.pictogramFilled}" class="pictogram-input-box">
    </div>
    
    <div class="pictogram-data-row" style="display: flex; align-items: center; gap: var(--spacing-sm);">
      <button class="smooth-toggle ${state.pictogramActiveSpacingControl === 'horizontal' ? 'active' : ''}" id="spacing-horizontal-toggle" title="Horizontal spacing">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M0.5 12L5.44975 7.05029L6.86396 8.46451L4.32843 11H10V13H4.32843L6.86148 15.5331L5.44727 16.9473L0.5 12ZM14 13H19.6708L17.1358 15.535L18.55 16.9493L23.5 11.9996L18.5503 7.0498L17.136 8.46402L19.6721 11H14V13Z"></path></svg>
      </button>
      <button class="smooth-toggle ${state.pictogramActiveSpacingControl === 'vertical' ? 'active' : ''}" id="spacing-vertical-toggle" title="Vertical spacing">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9995 0.499512L16.9492 5.44926L15.535 6.86347L12.9995 4.32794V9.99951H10.9995L10.9995 4.32794L8.46643 6.86099L7.05222 5.44678L11.9995 0.499512ZM10.9995 13.9995L10.9995 19.6704L8.46448 17.1353L7.05026 18.5496L12 23.4995L16.9497 18.5498L15.5355 17.1356L12.9995 19.6716V13.9995H10.9995Z"></path></svg>
      </button>
      <input type="range" id="pictogram-spacing-slider" min="0" max="100" value="${state.pictogramActiveSpacingControl === 'horizontal' ? state.pictogramHorizontalSpacing : state.pictogramVerticalSpacing}" style="flex: 1;">
      <div id="pictogram-icon-display" class="pictogram-input-box" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: white;">
        <div id="pictogram-icon-preview" style="width: 30px; height: 30px;"></div>
      </div>
    </div>
  `;

    // Render icon preview
    renderIconPreview();

    // Event listeners
    document.getElementById('pictogram-filled-slider').addEventListener('input', debounce((e) => {
        const value = parseFloat(e.target.value);
        state.pictogramFilled = value;
        document.getElementById('pictogram-filled-input').value = value;
        renderPictogramChart();
    }, 200));

    document.getElementById('pictogram-filled-input').addEventListener('input', debounce((e) => {
        let value = parseFloat(e.target.value);
        if (value < 0) value = 0;
        if (value > 10) value = 10;
        state.pictogramFilled = value;
        document.getElementById('pictogram-filled-slider').value = value;
        renderPictogramChart();
    }, 300));

    document.getElementById('spacing-horizontal-toggle').addEventListener('click', () => {
        state.pictogramActiveSpacingControl = 'horizontal';
        document.getElementById('spacing-horizontal-toggle').classList.add('active');
        document.getElementById('spacing-vertical-toggle').classList.remove('active');
        document.getElementById('pictogram-spacing-slider').value = state.pictogramHorizontalSpacing;
    });

    document.getElementById('spacing-vertical-toggle').addEventListener('click', () => {
        state.pictogramActiveSpacingControl = 'vertical';
        document.getElementById('spacing-vertical-toggle').classList.add('active');
        document.getElementById('spacing-horizontal-toggle').classList.remove('active');
        document.getElementById('pictogram-spacing-slider').value = state.pictogramVerticalSpacing;
    });

    document.getElementById('pictogram-spacing-slider').addEventListener('input', debounce((e) => {
        const value = parseInt(e.target.value);
        if (state.pictogramActiveSpacingControl === 'horizontal') {
            state.pictogramHorizontalSpacing = value;
        } else {
            state.pictogramVerticalSpacing = value;
        }
        renderPictogramChart();
    }, 300));

    document.getElementById('pictogram-icon-display').addEventListener('click', openIconSearchDrawer);
}

// Render icon preview in data controls
let iconPreviewRetryCount = 0;
function renderIconPreview() {
    const preview = document.getElementById('pictogram-icon-preview');
    if (!preview) {
        console.warn('Icon preview element not found');
        return;
    }

    if (!state.pictogramIconSvg) {
        iconPreviewRetryCount++;
        if (iconPreviewRetryCount > 50) {
            console.error('Failed to load icon for preview after multiple retries');
            iconPreviewRetryCount = 0;
            return;
        }
        console.warn('No icon SVG loaded yet (retry', iconPreviewRetryCount, ')');
        setTimeout(renderIconPreview, 100);
        return;
    }

    // Reset retry count
    iconPreviewRetryCount = 0;

    const coloredSvg = state.pictogramIconSvg.replace(/currentColor/g, state.pictogramFilledColor);
    preview.innerHTML = coloredSvg;
    console.log('Icon preview rendered');
}

// Initialize pictogram colors controls
function initPictogramColorsControls() {
    const coloursContent = document.getElementById('colours-content');
    if (!coloursContent) {
        console.warn('colours-content element not found');
        return;
    }

    coloursContent.innerHTML = `
    <div style="margin-bottom: var(--spacing-md); padding-bottom: var(--spacing-md); border-bottom: 1px solid #e0e0e0;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="color-label">Icons</span>
        <div style="display: flex; gap: var(--spacing-sm);">
          <input type="text" class="color-picker" data-coloris id="pictogram-filled-color-picker" value="${state.pictogramFilledColor}" title="Filled color">
          <input type="text" class="color-picker" data-coloris id="pictogram-unfilled-color-picker" value="${state.pictogramUnfilledColor}" title="Unfilled color">
        </div>
      </div>
    </div>
    
    <div class="color-control bg-control">
      <span class="color-label">Background</span>
      <div class="bg-options">
        <button class="bg-option active" data-bg="white" aria-label="White background">
          <span class="bg-circle bg-white"></span>
        </button>
        <button class="bg-option" data-bg="transparent" aria-label="Transparent background">
          <span class="bg-circle bg-transparent"></span>
        </button>
        <button class="bg-option" data-bg="rainbow" aria-label="Rainbow gradient background">
          <span class="bg-circle bg-rainbow"></span>
        </button>
      </div>
    </div>
  `;

    // Event listeners for icon colors (debounced to prevent flickering)
    const filledPicker = document.getElementById('pictogram-filled-color-picker');
    const unfilledPicker = document.getElementById('pictogram-unfilled-color-picker');
    
    filledPicker.addEventListener('input', debounce((e) => {
        state.pictogramFilledColor = e.target.value;
        e.target.style.backgroundColor = e.target.value; // Update background
        renderIconPreview();
        renderPictogramChart();
    }, 150));

    unfilledPicker.addEventListener('input', debounce((e) => {
        state.pictogramUnfilledColor = e.target.value;
        e.target.style.backgroundColor = e.target.value; // Update background
        renderPictogramChart();
    }, 150));

    // Set initial background colors
    setTimeout(() => {
        filledPicker.style.backgroundColor = state.pictogramFilledColor;
        unfilledPicker.style.backgroundColor = state.pictogramUnfilledColor;
        console.log('Set pictogram color backgrounds:', state.pictogramFilledColor, state.pictogramUnfilledColor);
    }, 100);

    // Background color options (reuse existing logic)
    const bgWhite = document.querySelector('.bg-option[data-bg="white"]');
    const bgTransparent = document.querySelector('.bg-option[data-bg="transparent"]');
    const bgRainbow = document.querySelector('.bg-option[data-bg="rainbow"]');

    bgWhite.addEventListener('click', () => {
        document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
        bgWhite.classList.add('active');
        updateBackgroundColor('white');
    });

    bgTransparent.addEventListener('click', () => {
        document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
        bgTransparent.classList.add('active');
        updateBackgroundColor('transparent');
    });

    bgRainbow.addEventListener('click', () => {
        showBackgroundColorPicker(bgRainbow);
    });
}

// Open icon search drawer
function openIconSearchDrawer() {
    // Create drawer overlay
    const drawer = document.createElement('div');
    drawer.id = 'icon-search-drawer';
    drawer.innerHTML = `
    <div class="drawer-header">
      <button id="close-drawer" class="btn-close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      <div class="category-dropdown">
        <label for="category-select">Icon Category</label>
        <select id="category-select">
          <option value="">All Categories</option>
          ${Object.keys(state.pictogramIconCategories).map(cat =>
        `<option value="${cat}">${cat}</option>`
    ).join('')}
        </select>
      </div>
    </div>
    <div class="drawer-content" id="drawer-icon-grid">
      ${renderIconGrid()}
    </div>
  `;

    document.body.appendChild(drawer);

    // Event listeners
    document.getElementById('close-drawer').addEventListener('click', closeIconSearchDrawer);
    document.getElementById('category-select').addEventListener('change', (e) => {
        const category = e.target.value;
        if (category) {
            const categoryHeader = document.querySelector(`[data-category="${category}"]`);
            if (categoryHeader) {
                const drawer = document.getElementById('icon-search-drawer');
                const headerHeight = document.querySelector('.drawer-header').offsetHeight;
                const categoryTop = categoryHeader.offsetTop;
                // Scroll with offset to account for sticky header
                drawer.scrollTop = categoryTop - headerHeight - 10;
            }
        }
    });

    // Add click listeners to icons
    document.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => {
            const iconName = item.dataset.iconName;
            selectPictogramIcon(iconName);
        });
    });
}

// Close icon search drawer
function closeIconSearchDrawer() {
    const drawer = document.getElementById('icon-search-drawer');
    if (drawer) {
        drawer.remove();
    }
}

// Render icon grid HTML
function renderIconGrid() {
    let html = '';

    Object.keys(state.pictogramIconCategories).forEach(category => {
        html += `<div class="icon-category-header" data-category="${category}">${category}</div>`;
        html += '<div class="icon-grid">';

        state.pictogramIconCategories[category].forEach(icon => {
            html += `
        <div class="icon-item" data-icon-name="${icon.name}" title="${icon.name}">
          ${icon.svg}
        </div>
      `;
        });

        html += '</div>';
    });

    // Add bottom padding so last categories can scroll to top
    html += '<div style="height: 80vh;"></div>';

    return html;
}

// Select pictogram icon
function selectPictogramIcon(iconName) {
    const icon = state.pictogramAllIcons.find(i => i.name === iconName);
    if (icon) {
        state.pictogramCurrentIcon = iconName;
        state.pictogramIconSvg = sanitizeSvg(icon.svg);
        renderIconPreview();
        renderPictogramChart();
        closeIconSearchDrawer();
    }
}

// ============================================
// APP INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', initApp);
