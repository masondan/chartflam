// ChartFlam App - Vanilla JavaScript
// Clean, efficient implementation with no duplicate functions

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  currentChartType: 'pie',
  chartData: {
    labels: ['Category A', 'Category B', 'Category C'],
    datasets: [{
      data: [30, 50, 20],
      backgroundColor: ['#6A5ACD', '#FFDAB9', '#66C0B4'],
      borderColor: ['#6A5ACD', '#FFDAB9', '#66C0B4'],
      borderWidth: 1
    }]
  },
  chartTitle: 'Sample Chart',
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
  axisVisible: true,
  axisColor: '#555555',
  axisSize: 12,
  axisBold: false,
  chart: null,
  isProcessing: false
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

// ============================================
// INITIALIZATION
// ============================================
function initApp() {
  console.log('Initializing ChartFlam app');
  console.log('Chart.js loaded:', typeof Chart !== 'undefined');
  showSplash();
}

// ============================================
// SPLASH SCREEN
// ============================================
function showSplash() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash">
      <img src="public/chartflam-logo.png" alt="ChartFlam Logo">
      <h1>ChartFlam</h1>
      <p>Create simple charts for social media</p>
      <button class="btn-enter" id="splash-btn">Get Started</button>
    </div>
  `;
  
  // Add event listener (modern approach)
  document.getElementById('splash-btn').addEventListener('click', startApp);
}

// ============================================
// MAIN APP
// ============================================
function startApp() {
  console.log('Starting main app');
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="app-container">
      <!-- Chart Type Selector Container -->
      <div class="chart-selector-container">
        <div class="chart-selector" role="tablist" aria-label="Chart type selector">
          <button class="chart-icon active" data-chart="pie" title="Pie Chart" role="tab" aria-selected="true" aria-label="Pie Chart">
            ${getSVGIcon('pie')}
          </button>
          <button class="chart-icon" data-chart="donut" title="Donut Chart" role="tab" aria-selected="false" aria-label="Donut Chart">
            ${getSVGIcon('donut')}
          </button>
          <button class="chart-icon" data-chart="bar" title="Bar Chart" role="tab" aria-selected="false" aria-label="Bar Chart">
            ${getSVGIcon('bar')}
          </button>
          <button class="chart-icon" data-chart="line" title="Line Chart" role="tab" aria-selected="false" aria-label="Line Chart">
            ${getSVGIcon('line')}
          </button>
          <button class="chart-icon" data-chart="pictogram" title="Pictogram" role="tab" aria-selected="false" aria-label="Pictogram Chart">
            ${getSVGIcon('pictogram')}
          </button>
        </div>
        </div>

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
                     placeholder="Chart Title"
                     maxlength="${validation.maxTitleLength}">
              
              <div class="font-control-row">
                <select id="title-font" class="font-select">
                  <option value="" disabled selected>Choose Font</option>
                  <option value="Inter">Inter (Default)</option>
                  <option value="Alfa Slab One">Alfa Slab One</option>
                  <option value="Lora">Lora Serif</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Saira Condensed">Saira Condensed</option>
                  <option value="Special Elite">Special Elite</option>
                </select>
                <button class="text-control-btn" id="title-align-cycle" title="Text alignment">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z"></path></svg>
                </button>
                <button class="text-control-btn ${state.titleBold ? 'active' : ''}" id="title-bold" title="Bold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path></svg>
                </button>
                <button class="text-control-btn ${state.titleItalic ? 'active' : ''}" id="title-italic" title="Italic">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path></svg>
                </button>
              </div>
              
              <div class="text-controls">
                <button class="text-control-btn active" id="title-size-toggle" data-type="size" title="Font size">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"></path></svg>
                </button>
                <button class="text-control-btn" id="title-lineheight-toggle" data-type="lineheight" title="Line spacing">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 3.00012L2.00008 5.00012L4.00004 5.00004L4.00004 19L2 19.0001L2.00008 21.0001L8.00004 21V19H6.00004L6.00004 5.00004L8 5.00012L8.00008 3.00012L2 3.00012ZM10.2 18H12.3541L13.5541 15H18.4459L19.6459 18H21.8L17 6H15L10.2 18ZM16 8.88517L17.6459 13H14.3541L16 8.88517Z"></path></svg>
                </button>
                <input type="range" 
                       id="title-slider" 
                       class="text-slider"
                       min="16" 
                       max="48" 
                       value="${state.titleSize}">
                <input type="color" id="title-color" class="color-picker" value="${state.titleColor}">
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
                <select id="caption-font" class="font-select">
                  <option value="" disabled selected>Choose Font</option>
                  <option value="Inter">Inter (Default)</option>
                  <option value="Alfa Slab One">Alfa Slab One</option>
                  <option value="Lora">Lora Serif</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Saira Condensed">Saira Condensed</option>
                  <option value="Special Elite">Special Elite</option>
                </select>
                <button class="text-control-btn" id="caption-align-cycle" title="Text alignment">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z"></path></svg>
                </button>
                <button class="text-control-btn ${state.captionBold ? 'active' : ''}" id="caption-bold" title="Bold">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path></svg>
                </button>
                <button class="text-control-btn ${state.captionItalic ? 'active' : ''}" id="caption-italic" title="Italic">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path></svg>
                </button>
              </div>
              
              <div class="text-controls">
                <button class="text-control-btn active" id="caption-size-toggle" data-type="size" title="Font size">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"></path></svg>
                </button>
                <button class="text-control-btn" id="caption-lineheight-toggle" data-type="lineheight" title="Line spacing">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 3.00012L2.00008 5.00012L4.00004 5.00004L4.00004 19L2 19.0001L2.00008 21.0001L8.00004 21V19H6.00004L6.00004 5.00004L8 5.00012L8.00008 3.00012L2 3.00012ZM10.2 18H12.3541L13.5541 15H18.4459L19.6459 18H21.8L17 6H15L10.2 18ZM16 8.88517L17.6459 13H14.3541L16 8.88517Z"></path></svg>
                </button>
                <input type="range" 
                       id="caption-slider" 
                       class="text-slider"
                       min="12" 
                       max="24" 
                       value="14">
                <input type="color" id="caption-color" class="color-picker" value="#555555">
              </div>
            </div>
          </div>
        </details>

        <!-- Legend -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="legend-content">Legend</summary>
          <div id="legend-content" class="control-content">
            <div class="legend-control-row">
              <button class="text-control-btn" id="legend-visible-toggle" title="Show/hide legend">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path></svg>
              </button>
              <button class="text-control-btn ${state.legendPosition === 'bottom' ? 'active' : ''}" id="legend-position-down" title="Legend below chart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"></path></svg>
              </button>
              <button class="text-control-btn ${state.legendPosition === 'top' ? 'active' : ''}" id="legend-position-up" title="Legend above chart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"></path></svg>
              </button>
              <span class="legend-size-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"></path></svg>
              </span>
              <input type="range" 
                     id="legend-size-slider" 
                     class="text-slider"
                     min="10" 
                     max="18" 
                     value="${state.legendSize}">
              <input type="color" id="legend-color" class="color-picker" value="${state.legendColor}">
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
  
  // Rainbow button opens color picker
  bgRainbow.addEventListener('click', () => {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = state.chartBackgroundColor === 'transparent' ? '#FFFFFF' : state.chartBackgroundColor;
    colorInput.click();
    colorInput.addEventListener('input', (e) => {
      state.chartBackgroundColor = e.target.value;
      document.querySelector('.chart-canvas-wrapper').style.backgroundColor = e.target.value;
      document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
      bgRainbow.classList.add('active');
      
      // Update pie gaps
      if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
        state.chartData.datasets[0].borderColor = e.target.value;
        renderChart();
      }
    });
  });

  // Title controls
  document.getElementById('title-input').addEventListener('input', debounce(() => {
    updateTitle();
  }, 300));

  document.getElementById('title-font').addEventListener('change', (e) => {
    state.titleFont = e.target.value;
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

  document.getElementById('caption-font').addEventListener('change', (e) => {
    state.captionFont = e.target.value;
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
  // Add event listeners for bar orientation buttons if they exist
  const verticalBtn = document.getElementById('bar-vertical-btn');
  const horizontalBtn = document.getElementById('bar-horizontal-btn');
  if (verticalBtn) verticalBtn.addEventListener('click', () => setBarOrientation('vertical'));
  if (horizontalBtn) horizontalBtn.addEventListener('click', () => setBarOrientation('horizontal'));
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
  // Prevent re-rendering if the same chart type is selected
  if (type === state.currentChartType) return;

  state.currentChartType = type;
  
  // Update active state and ARIA attributes
  document.querySelectorAll('.chart-icon').forEach(icon => {
    const isActive = icon.dataset.chart === type;
    icon.classList.toggle('active', isActive);
    icon.setAttribute('aria-selected', isActive);
  });
  
  // Update validation rules based on chart type
  validation.allowNegative = (type === 'bar' || type === 'line');
  
  // Update placeholder data based on type
  if (type === 'bar' || type === 'line') {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const data = [12, 19, 15, 25, 22];
    state.chartData.labels = labels;
    state.chartData.datasets[0].data = data;
    // For bar charts, set the single color immediately
    if (type === 'bar') {
      const singleColor = '#6A5ACD';
      state.chartData.datasets[0].backgroundColor = Array(labels.length).fill(singleColor);
      state.chartData.datasets[0].borderColor = Array(labels.length).fill(singleColor);
    }
  } else if (type === 'pictogram') {
    state.chartData.labels = ['Completed', 'Remaining'];
    state.chartData.datasets[0].data = [67, 33];
  } else { // pie, donut
    state.chartData.labels = ['Category A', 'Category B', 'Category C'];
    state.chartData.datasets[0].data = [30, 50, 20];
  }
  
  // Ensure colors match data length
  ensureColorsMatchData();
  
  // Re-initialize inputs and render
  initDataControls();
  initManualInput();
  initStyleControls();
  initColorControls();
  initLegendAxisControls();
  renderChart();
  updateSmoothingVisibility();
}

// ============================================
// CHART RENDERING
// ============================================
function renderChart() {
  console.log('Rendering chart, type:', state.currentChartType);
  
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

    // Set bar styles
    state.chartData.datasets[0].borderRadius = state.barBorderRadius;
    state.chartData.datasets[0].categoryPercentage = state.barCategoryPercentage;
    state.chartData.datasets[0].borderWidth = 0; // Fix for faint line artifact

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
    config.options.scales = {
      x: { ...axisOptions },
      y: { ...axisOptions }
    };

    // Hide legend by default for bar charts
    config.options.plugins.legend.display = false;
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
function initDataControls() {
  const container = document.getElementById('data-content');
  if (!container) return;

  if (state.currentChartType === 'bar') {
    container.innerHTML = `
      <textarea id="csv-textarea" 
                placeholder="Paste CSV data here&#10;Format: label,value&#10;Example:&#10;Jan,12&#10;Feb,19&#10;Mar,15"
                aria-label="CSV data input"
                maxlength="5000"></textarea>
      <div class="bar-controls">
        <button class="text-control-btn active" id="bar-vertical-btn" title="Vertical bars">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12H7V21H3V12ZM17 8H21V21H17V8ZM10 2H14V21H10V2Z"></path></svg>
        </button>
        <button class="text-control-btn" id="bar-horizontal-btn" title="Horizontal bars">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3V7H3V3H12ZM16 17V21H3V17H16ZM22 10V14H3V10H22Z"></path></svg>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="data-tabs" role="tablist" aria-label="Data input method">
        <button class="tab-btn active" data-tab="manual" role="tab" aria-selected="true" aria-controls="manual-input">Manual</button>
        <button class="tab-btn" data-tab="csv" role="tab" aria-selected="false" aria-controls="csv-input">CSV</button>
      </div>
      <div id="manual-input" class="tab-content active" role="tabpanel" aria-labelledby="manual-tab">
        <div id="manual-rows" role="list" aria-label="Data entries"></div>
        <button class="btn-add" id="add-row-btn" aria-label="Add new data row">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V7H13V11H17V13H13V17H11V13H7V11H11ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"></path></svg>
        </button>
      </div>
      <div id="csv-input" class="tab-content" role="tabpanel" aria-labelledby="csv-tab">
        <textarea id="csv-textarea" 
                  placeholder="Paste CSV data here&#10;Format: label,value&#10;Example:&#10;Category A,30&#10;Category B,50&#10;Category C,20"
                  aria-label="CSV data input"
                  maxlength="5000"></textarea>
        <button class="btn btn-secondary" id="apply-csv-btn" aria-label="Apply CSV data to chart">Apply CSV Data</button>
      </div>
    `;
  }
  // Re-attach listeners for dynamically created elements
  const csvTextarea = document.getElementById('csv-textarea');
  if(csvTextarea) csvTextarea.addEventListener('input', debounce(updateDataFromCSV, 500));

  if (state.currentChartType !== 'bar') {
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V21H19V19H21ZM17 19V21H15V19H17ZM13 19V21H11V19H13ZM9 19V21H7V19H9ZM5 19V21H3V19H5ZM21 15V17H19V15H21ZM5 15V17H3V15H5ZM5 11V13H3V11H5ZM16 3C18.6874 3 20.8817 5.12366 20.9954 7.78322L21 8V13H19V8C19 6.40893 17.7447 5.09681 16.1756 5.00512L16 5H11V3H16ZM5 7V9H3V7H5ZM5 3V5H3V3H5ZM9 3V5H7V3H9Z"></path></svg>
        </button>
        <button class="text-control-btn" data-type="gap" title="Bar Spacing">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6V4H18V2ZM16.9497 9.44975L12 4.5L7.05273 9.44727L11 9.44826V14.5501L7.05078 14.55L12.0005 19.5L16.9502 14.5503L13 14.5502V9.44876L16.9497 9.44975ZM18 20V22H6V20H18Z"></path></svg>
        </button>
        <button class="text-control-btn" data-type="resize" title="Chart Depth">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V19H20V5ZM13 17V15H16V12H18V17H13ZM11 7V9H8V12H6V7H11Z"></path></svg>
        </button>
        <input type="range" id="smoothing-slider" class="text-slider" min="0" max="20" value="${state.smoothingValue}">
      </div>
    `;
  } else if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
    container.innerHTML = `
      <div class="text-controls">
        <button class="smooth-toggle active" data-type="corner" aria-label="Corner smoothing" title="Corner smoothing">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V21H19V19H21ZM17 19V21H15V19H17ZM13 19V21H11V19H13ZM9 19V21H7V19H9ZM5 19V21H3V19H5ZM21 15V17H19V15H21ZM5 15V17H3V15H5ZM5 11V13H3V11H5ZM16 3C18.6874 3 20.8817 5.12366 20.9954 7.78322L21 8V13H19V8C19 6.40893 17.7447 5.09681 16.1756 5.00512L16 5H11V3H16ZM5 7V9H3V7H5ZM5 3V5H3V3H5ZM9 3V5H7V3H9Z"></path></svg>
        </button>
        <button class="smooth-toggle" data-type="gap" aria-label="Slice gap" title="Slice gap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6V4H18V2ZM16.9497 9.44975L12 4.5L7.05273 9.44727L11 9.44826V14.5501L7.05078 14.55L12.0005 19.5L16.9502 14.5503L13 14.5502V9.44876L16.9497 9.44975ZM18 20V22H6V20H18Z"></path></svg>
        </button>
        <button class="smooth-toggle" data-type="hole" id="donut-hole-toggle" aria-label="Donut hole size" title="Donut hole size">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.04932 13H4.06184C4.55393 16.9463 7.92032 20 11.9999 20C16.0796 20 19.4459 16.9463 19.938 13H21.9506C21.4488 18.0533 17.1853 22 11.9999 22C6.81459 22 2.55104 18.0533 2.04932 13ZM2.04932 11C2.55104 5.94668 6.81459 2 11.9999 2C17.1853 2 21.4488 5.94668 21.9506 11H19.938C19.4459 7.05369 16.0796 4 11.9999 4C7.92032 4 4.55393 7.05369 4.06184 11H2.04932ZM11.9999 14C10.8954 14 9.99994 13.1046 9.99994 12C9.99994 10.8954 10.8954 10 11.9999 10C13.1045 10 13.9999 10.8954 13.9999 12C13.9999 13.1046 13.1045 14 11.9999 14Z"></path></svg>
        </button>
        <input type="range" id="smoothing-slider" class="text-slider" min="0" max="20" value="${state.smoothingValue}">
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
  if(smoothingSlider) {
    smoothingSlider.addEventListener('input', debounce(() => {
      updateSmoothing();
    }, 100));
  }
}

// ============================================
// DATA INPUT - MANUAL
// ============================================
function initManualInput() {
  const container = document.getElementById('manual-rows');
  if (!container) return; // Exit if manual input isn't on the page
  
  container.innerHTML = '';
  
  state.chartData.labels.forEach((label, index) => {
    addManualRow(label, state.chartData.datasets[0].data[index]);
  });
}

function addManualRow(label = '', value = '') {
  const container = document.getElementById('manual-rows');
  if (!container) return;
  
  const row = document.createElement('div');
  row.className = 'manual-row';
  row.setAttribute('role', 'listitem');
  
  const rowId = `row-${Date.now()}`;
  
  row.innerHTML = `
    <input type="text" 
           class="row-label" 
           placeholder="Label" 
           value="${label}"
           maxlength="${validation.maxLabelLength}"
           aria-label="Data label"
           aria-describedby="${rowId}-hint"
           required>
    <input type="number" 
           class="row-value" 
           placeholder="Value" 
           value="${value}" 
           step="0.1"
           min="${validation.allowNegative ? '' : validation.minValue}"
           max="${validation.maxValue}"
           aria-label="Data value"
           required>
    <button class="btn-remove" 
            title="Remove row" 
            aria-label="Remove this data entry">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path>
      </svg>
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
  try {
    const csvText = document.getElementById('csv-textarea').value.trim();
    if (!csvText) return;

    const lines = csvText.split('\n');
    const labels = [];
    const data = [];

    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parseFloat(parts[1].trim());
        if (label && !isNaN(value)) {
          labels.push(label);
          data.push(value);
        }
      }
    });

    if (labels.length > 0) {
      state.chartData.labels = labels;
      state.chartData.datasets[0].data = data;
      ensureColorsMatchData();
      renderChart();
      initManualInput();
      initDataControls();
      initColorControls();
    }
  } catch (error) {
    console.error('Error parsing CSV:', error);
    showFeedback('Error parsing CSV. Check format.', 'error');
  }
}

// ============================================
// COLOR CONTROLS
// ============================================
function initColorControls() {
  const container = document.getElementById('color-controls');
  container.innerHTML = '';
  
  state.chartData.labels.forEach((label, index) => {
    const control = document.createElement('div');
    control.className = 'color-control';
    
    control.innerHTML = `
      <span class="color-label">${label}</span>
      <input type="color" class="color-picker" value="${state.chartData.datasets[0].backgroundColor[index]}" data-index="${index}">
    `;
    
    container.appendChild(control);
    
    // Add event listener
    const colorPicker = control.querySelector('.color-picker');
    colorPicker.addEventListener('input', (e) => {
      updateSegmentColor(index, e.target.value);
    });
  });
}

function updateSegmentColor(index, color) {
  state.chartData.datasets[0].backgroundColor[index] = color;
  state.chartData.datasets[0].borderColor[index] = color;
  renderChart();
}

function ensureColorsMatchData() {
  const dataLength = state.chartData.labels.length;
  const colors = ['#6A5ACD', '#FFDAB9', '#66C0B4', '#E6E6FA', '#DDA0DD', '#ADD8E6', '#FAEBD7', '#C0C0C0'];
  
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
function updateBackgroundColor(bgType) {
  let backgroundColor;
  
  switch(bgType) {
    case 'white':
      backgroundColor = '#FFFFFF';
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
    if (bgType === 'white') {
      state.chartData.datasets[0].borderColor = '#FFFFFF';
    } else {
      state.chartData.datasets[0].borderColor = 'transparent';
    }
    renderChart();
  }
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
  const holeToggle = document.getElementById('donut-hole-toggle');
  
  const isPieOrDonut = state.currentChartType === 'pie' || state.currentChartType === 'donut';
  styleControl.style.display = isPieOrDonut || state.currentChartType === 'bar' ? '' : 'none';
  
  if (isPieOrDonut && holeToggle) {
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
  const visibleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path></svg>';
  const hiddenIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.34268 18.7819L7.41083 18.2642L8.1983 15.3254C7.00919 14.8874 5.91661 14.2498 4.96116 13.4534L2.80783 15.6067L1.39362 14.1925L3.54695 12.0392C2.35581 10.6103 1.52014 8.87466 1.17578 6.96818L3.14386 6.61035C3.90289 10.8126 7.57931 14.0001 12.0002 14.0001C16.4211 14.0001 20.0976 10.8126 20.8566 6.61035L22.8247 6.96818C22.4803 8.87466 21.6446 10.6103 20.4535 12.0392L22.6068 14.1925L21.1926 15.6067L19.0393 13.4534C18.0838 14.2498 16.9912 14.8874 15.8021 15.3254L16.5896 18.2642L14.6578 18.7819L13.87 15.8418C13.2623 15.9459 12.6376 16.0001 12.0002 16.0001C11.3629 16.0001 10.7381 15.9459 10.1305 15.8418L9.34268 18.7819Z"></path></svg>';
  btn.innerHTML = state.legendVisible ? visibleIcon : hiddenIcon;
}

// ============================================
// AXIS CONTROLS (for Bar Chart)
// ============================================
function initLegendAxisControls() {
  const details = document.querySelector('summary[aria-controls="legend-content"]').parentElement;
  const summary = details.querySelector('summary');
  const container = document.getElementById('legend-content');
  if (!container || !summary) return;

  if (state.currentChartType === 'bar') {
    summary.textContent = 'Axis';
    container.innerHTML = `
      <div class="text-controls">
        <button class="text-control-btn ${state.axisVisible ? 'active' : ''}" id="axis-visible-toggle" title="Show/hide axis">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path></svg>
        </button>
        <span class="legend-size-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"></path></svg>
        </span>
        <input type="range" id="axis-size-slider" class="text-slider" min="8" max="18" value="${state.axisSize}">
        <button class="text-control-btn ${state.axisBold ? 'active' : ''}" id="axis-bold-btn" title="Bold axis text">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path></svg>
        </button>
        <input type="color" id="axis-color-picker" class="color-picker" value="${state.axisColor}">
      </div>
    `;
    // Attach listeners for new controls
    document.getElementById('axis-visible-toggle').addEventListener('click', (e) => {
      state.axisVisible = !state.axisVisible;
      e.currentTarget.classList.toggle('active');
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
        <button class="text-control-btn" id="legend-visible-toggle" title="Show/hide legend">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path></svg>
        </button>
        <button class="text-control-btn ${state.legendPosition === 'bottom' ? 'active' : ''}" id="legend-position-down" title="Legend below chart">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"></path></svg>
        </button>
        <button class="text-control-btn ${state.legendPosition === 'top' ? 'active' : ''}" id="legend-position-up" title="Legend above chart">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"></path></svg>
        </button>
        <span class="legend-size-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"></path></svg>
        </span>
        <input type="range" id="legend-size-slider" class="text-slider" min="10" max="18" value="${state.legendSize}">
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
function downloadChart() {
  if (!state.chart) {
    alert('No chart to download');
    return;
  }

  // Create a temporary canvas with fixed size
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = 1080;
  tempCanvas.height = 1080;
  
  // Fill background
  tempCtx.fillStyle = state.chartBackgroundColor;
  tempCtx.fillRect(0, 0, 1080, 1080);
  
  // Calculate positions
  let yOffset = 60;
  
  // Draw title if present
  if (state.chartTitle) {
    tempCtx.fillStyle = '#333333';
    tempCtx.font = 'bold 48px Inter, sans-serif';
    tempCtx.textAlign = 'center';
    tempCtx.fillText(state.chartTitle, 540, yOffset);
    yOffset += 80;
  }
  
  // Draw chart
  const chartImage = new Image();
  chartImage.onload = function() {
    const chartSize = 900;
    const chartX = (1080 - chartSize) / 2;
    tempCtx.drawImage(chartImage, chartX, yOffset, chartSize, chartSize);
    
    // Draw caption if present
    if (state.chartCaption) {
      tempCtx.fillStyle = '#555555';
      tempCtx.font = '28px Inter, sans-serif';
      tempCtx.textAlign = 'center';
      tempCtx.fillText(state.chartCaption, 540, 1020);
    }
    
    // Download
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `chartflam-${state.currentChartType}-${timestamp}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };
  
  chartImage.src = state.chart.toBase64Image();
}

// ============================================
// SVG ICONS
// ============================================
function getSVGIcon(type) {
  const icons = {
    pie: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2.4578V4.58152C6.06817 5.76829 4 8.64262 4 12C4 16.4183 7.58172 20 12 20C15.3574 20 18.2317 17.9318 19.4185 15H21.5422C20.2679 19.0571 16.4776 22 12 22C6.47715 22 2 17.5228 2 12C2 7.52236 4.94289 3.73207 9 2.4578ZM12 2C17.5228 2 22 6.47715 22 12C22 12.3375 21.9833 12.6711 21.9506 13H11V2.04938C11.3289 2.01672 11.6625 2 12 2ZM13 4.06189V11H19.9381C19.4869 7.38128 16.6187 4.51314 13 4.06189Z"></path></svg>`,
    donut: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.9999 2.04938L11 5.07088C7.6077 5.55612 5 8.47352 5 12C5 15.866 8.13401 19 12 19C13.5723 19 15.0236 18.4816 16.1922 17.6064L18.3289 19.7428C16.605 21.1536 14.4014 22 12 22C6.47715 22 2 17.5228 2 12C2 6.81468 5.94662 2.55115 10.9999 2.04938ZM21.9506 13.0001C21.7509 15.0111 20.9555 16.8468 19.7433 18.3283L17.6064 16.1922C18.2926 15.2759 18.7595 14.1859 18.9291 13L21.9506 13.0001ZM13.0011 2.04948C17.725 2.51902 21.4815 6.27589 21.9506 10.9999L18.9291 10.9998C18.4905 7.93452 16.0661 5.50992 13.001 5.07103L13.0011 2.04948Z"></path></svg>`,
    bar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12H7V21H3V12ZM17 8H21V21H17V8ZM10 2H14V21H10V2Z"></path></svg>`,
    line: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3V19H21V21H3V3H5ZM20.2929 6.29289L21.7071 7.70711L16 13.4142L13 10.415L8.70711 14.7071L7.29289 13.2929L13 7.58579L16 10.585L20.2929 6.29289Z"></path></svg>`,
    pictogram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z"></path></svg>`
  };

  return icons[type] || icons.pie;
}

// ============================================
// APP INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', initApp);
