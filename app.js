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
      backgroundColor: ['#8A2BE2', '#4B0082', '#FFD700'],
      borderColor: ['#8A2BE2', '#4B0082', '#FFD700'],
      borderWidth: 1
    }]
  },
  chartTitle: 'Sample Chart',
  chartCaption: '',
  chartBackgroundColor: '#FFFFFF',
  smoothingValue: 0,
  chart: null,
  isProcessing: false,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50
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

// Save state to history for undo/redo
function saveStateToHistory() {
  // Remove any states after current index (when user made changes after undo)
  state.history = state.history.slice(0, state.historyIndex + 1);
  
  // Create a deep copy of current state
  const stateCopy = {
    chartType: state.currentChartType,
    data: JSON.parse(JSON.stringify(state.chartData)),
    title: state.chartTitle,
    caption: state.chartCaption,
    bgColor: state.chartBackgroundColor,
    smoothing: state.smoothingValue
  };
  
  state.history.push(stateCopy);
  state.historyIndex++;
  
  // Limit history size
  if (state.history.length > state.maxHistorySize) {
    state.history.shift();
    state.historyIndex--;
  }
  
  updateUndoRedoButtons();
}

// Restore state from history
function restoreState(historyState) {
  state.currentChartType = historyState.chartType;
  state.chartData = JSON.parse(JSON.stringify(historyState.data));
  state.chartTitle = historyState.title;
  state.chartCaption = historyState.caption;
  state.chartBackgroundColor = historyState.bgColor;
  state.smoothingValue = historyState.smoothing;
  
  // Update UI
  document.getElementById('title-input').value = state.chartTitle;
  document.getElementById('caption-input').value = state.chartCaption;
  document.getElementById('bg-color').value = state.chartBackgroundColor;
  document.getElementById('smoothing-slider').value = state.smoothingValue;
  document.getElementById('smoothing-value').textContent = state.smoothingValue;
  
  // Update chart type selector
  document.querySelectorAll('.chart-icon').forEach(icon => {
    icon.classList.remove('active');
  });
  document.querySelector(`[data-chart="${state.currentChartType}"]`)?.classList.add('active');
  
  // Re-render
  initManualInput();
  initColorControls();
  renderChart();
  updateSmoothingVisibility();
}

// Undo last action
function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    restoreState(state.history[state.historyIndex]);
    showFeedback('Undo successful', 'success');
  }
}

// Redo last undone action
function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    restoreState(state.history[state.historyIndex]);
    showFeedback('Redo successful', 'success');
  }
}

// Update undo/redo button states
function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  
  if (undoBtn) {
    undoBtn.disabled = state.historyIndex <= 0;
    undoBtn.setAttribute('aria-disabled', state.historyIndex <= 0);
  }
  
  if (redoBtn) {
    redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    redoBtn.setAttribute('aria-disabled', state.historyIndex >= state.history.length - 1);
  }
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
        
        <!-- Undo/Redo Controls -->
        <div class="history-controls">
          <button id="undo-btn" class="btn-icon" title="Undo (Ctrl/Cmd + Z)" aria-label="Undo last action" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7v6h6"></path>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
            </svg>
          </button>
          <button id="redo-btn" class="btn-icon" title="Redo (Ctrl/Cmd + Shift + Z)" aria-label="Redo last action" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 7v6h-6"></path>
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
            </svg>
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
        <details class="control-section" open>
          <summary aria-expanded="true" aria-controls="data-content">Data</summary>
          <div id="data-content" class="control-content">
            <div class="data-tabs" role="tablist" aria-label="Data input method">
              <button class="tab-btn active" data-tab="manual" role="tab" aria-selected="true" aria-controls="manual-input">Manual</button>
              <button class="tab-btn" data-tab="csv" role="tab" aria-selected="false" aria-controls="csv-input">CSV</button>
            </div>
            <div id="manual-input" class="tab-content active" role="tabpanel" aria-labelledby="manual-tab">
              <div id="manual-rows" role="list" aria-label="Data entries"></div>
              <button class="btn-add" id="add-row-btn" aria-label="Add new data row">+ Add Row</button>
            </div>
            <div id="csv-input" class="tab-content" role="tabpanel" aria-labelledby="csv-tab">
              <textarea id="csv-textarea" 
                        placeholder="Paste CSV data here&#10;Format: label,value&#10;Example:&#10;Category A,30&#10;Category B,50&#10;Category C,20"
                        aria-label="CSV data input"
                        maxlength="5000"></textarea>
              <button class="btn btn-secondary" id="apply-csv-btn" aria-label="Apply CSV data to chart">Apply CSV Data</button>
            </div>
          </div>
        </details>

        <!-- Colors -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="colors-content">Colors</summary>
          <div id="colors-content" class="control-content">
            <div id="color-controls" role="group" aria-label="Segment colors"></div>
            <div class="input-group">
              <label for="bg-color">Background Color:</label>
              <input type="color" 
                     id="bg-color" 
                     value="${state.chartBackgroundColor}"
                     aria-label="Chart background color">
            </div>
          </div>
        </details>

        <!-- Smoothing (for pie/donut only) -->
        <div class="control-section-inline" id="smoothing-control" role="group" aria-label="Corner smoothing control">
          <label for="smoothing-slider">Corner Smoothing:</label>
          <input type="range" 
                 id="smoothing-slider" 
                 min="0" 
                 max="20" 
                 value="${state.smoothingValue}"
                 aria-label="Corner smoothing amount"
                 aria-valuemin="0"
                 aria-valuemax="20"
                 aria-valuenow="${state.smoothingValue}">
          <span id="smoothing-value" aria-live="polite">${state.smoothingValue}</span>
        </div>

        <!-- Titles -->
        <details class="control-section">
          <summary aria-expanded="false" aria-controls="titles-content">Titles & Caption</summary>
          <div id="titles-content" class="control-content">
            <div class="input-group">
              <label for="title-input">Chart Title:</label>
              <input type="text" 
                     id="title-input" 
                     value="${state.chartTitle}" 
                     placeholder="Enter chart title"
                     maxlength="${validation.maxTitleLength}"
                     aria-label="Chart title"
                     aria-describedby="title-hint">
              <small id="title-hint" class="input-hint">Max ${validation.maxTitleLength} characters</small>
            </div>
            <div class="input-group">
              <label for="caption-input">Caption/Source:</label>
              <input type="text" 
                     id="caption-input" 
                     value="${state.chartCaption}" 
                     placeholder="Enter caption or source"
                     maxlength="${validation.maxCaptionLength}"
                     aria-label="Chart caption or source"
                     aria-describedby="caption-hint">
              <small id="caption-hint" class="input-hint">Max ${validation.maxCaptionLength} characters</small>
            </div>
          </div>
        </details>

        <!-- Download Button -->
        <button class="btn btn-primary" 
                id="download-btn" 
                aria-label="Download chart as PNG image">
          Download PNG
        </button>
      </div>
    </div>
  `;

  // Initialize components
  initEventListeners();
  initManualInput();
  initColorControls();
  renderChart();
  updateSmoothingVisibility();
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

  // Data tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchDataTab(e.currentTarget.dataset.tab);
    });
  });

  // Add row button
  document.getElementById('add-row-btn').addEventListener('click', () => {
    if (state.chartData.labels.length >= validation.maxDataPoints) {
      showFeedback(`Maximum ${validation.maxDataPoints} data points allowed`, 'error');
      return;
    }
    addManualRow();
    saveStateToHistory();
  });

  // Apply CSV button
  document.getElementById('apply-csv-btn').addEventListener('click', () => {
    updateDataFromCSV();
    saveStateToHistory();
  });

  // CSV textarea (with debouncing)
  const csvTextarea = document.getElementById('csv-textarea');
  csvTextarea.addEventListener('input', debounce(updateDataFromCSV, 500));

  // Background color
  document.getElementById('bg-color').addEventListener('change', () => {
    updateBackgroundColor();
    saveStateToHistory();
  });

  // Smoothing slider
  const smoothingSlider = document.getElementById('smoothing-slider');
  smoothingSlider.addEventListener('input', debounce(() => {
    updateSmoothing();
    saveStateToHistory();
  }, 100));

  // Title and caption (with debouncing)
  document.getElementById('title-input').addEventListener('input', debounce(() => {
    updateTitle();
    saveStateToHistory();
  }, 300));
  
  document.getElementById('caption-input').addEventListener('input', debounce(() => {
    updateCaption();
    saveStateToHistory();
  }, 300));

  // Download button
  document.getElementById('download-btn').addEventListener('click', downloadChart);
  
  // Undo/Redo buttons
  document.getElementById('undo-btn').addEventListener('click', undo);
  document.getElementById('redo-btn').addEventListener('click', redo);
  
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
  
  // Save initial state to history
  saveStateToHistory();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifier = isMac ? e.metaKey : e.ctrlKey;
  
  // Undo: Ctrl/Cmd + Z
  if (modifier && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
  
  // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
  if (modifier && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
    e.preventDefault();
    redo();
  }
  
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
    state.chartData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    state.chartData.datasets[0].data = [12, 19, 15, 25, 22];
  } else if (type === 'pictogram') {
    state.chartData.labels = ['Completed', 'Remaining'];
    state.chartData.datasets[0].data = [67, 33];
  } else {
    state.chartData.labels = ['Category A', 'Category B', 'Category C'];
    state.chartData.datasets[0].data = [30, 50, 20];
  }
  
  // Ensure colors match data length
  ensureColorsMatchData();
  
  // Re-initialize inputs and render
  initManualInput();
  initColorControls();
  renderChart();
  updateSmoothingVisibility();
  
  // Save to history
  saveStateToHistory();
  
  // Announce change to screen readers
  showFeedback(`Switched to ${type} chart`, 'success');
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
  
  // Destroy existing chart
  if (state.chart) {
    state.chart.destroy();
  }

  // Chart configuration
  const config = {
    type: state.currentChartType === 'donut' ? 'doughnut' : state.currentChartType,
    data: state.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          position: 'bottom',
          display: true,
          labels: {
            padding: 15,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            }
          }
        },
        title: {
          display: false
        }
      }
    }
  };

  // Apply smoothing for pie/donut charts
  if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
    config.options.elements = {
      arc: {
        borderRadius: state.smoothingValue
      }
    };
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
// DATA INPUT - MANUAL
// ============================================
function initManualInput() {
  const container = document.getElementById('manual-rows');
  container.innerHTML = '';
  
  state.chartData.labels.forEach((label, index) => {
    addManualRow(label, state.chartData.datasets[0].data[index]);
  });
}

function addManualRow(label = '', value = '') {
  const container = document.getElementById('manual-rows');
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
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
    saveStateToHistory();
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
      initColorControls();
    }
  } catch (error) {
    console.error('Error parsing CSV:', error);
    alert('Error parsing CSV data. Please check the format.');
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
      <span class="color-label">${label}:</span>
      <input type="color" class="color-picker" value="${state.chartData.datasets[0].backgroundColor[index]}" data-index="${index}">
    `;
    
    container.appendChild(control);
    
    // Add event listener
    const colorPicker = control.querySelector('.color-picker');
    colorPicker.addEventListener('change', (e) => {
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
  const colors = ['#8A2BE2', '#4B0082', '#FFD700', '#DC143C', '#4f0388', '#00CED1', '#FF6347', '#32CD32'];
  
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
function updateBackgroundColor() {
  state.chartBackgroundColor = document.getElementById('bg-color').value;
  document.querySelector('.chart-canvas-wrapper').style.backgroundColor = state.chartBackgroundColor;
}

function updateSmoothing() {
  state.smoothingValue = parseInt(document.getElementById('smoothing-slider').value);
  document.getElementById('smoothing-value').textContent = state.smoothingValue;
  renderChart();
}

function updateSmoothingVisibility() {
  const smoothingControl = document.getElementById('smoothing-control');
  if (state.currentChartType === 'pie' || state.currentChartType === 'donut') {
    smoothingControl.style.display = 'flex';
  } else {
    smoothingControl.style.display = 'none';
  }
}

function updateTitle() {
  state.chartTitle = document.getElementById('title-input').value;
  const titleEl = document.getElementById('chart-title');
  titleEl.textContent = state.chartTitle;
  titleEl.style.display = state.chartTitle ? 'block' : 'none';
}

function updateCaption() {
  state.chartCaption = document.getElementById('caption-input').value;
  const captionEl = document.getElementById('chart-caption');
  captionEl.textContent = state.chartCaption;
  captionEl.style.display = state.chartCaption ? 'block' : 'none';
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
    pie: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>`,
    donut: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v4"></path>
      <path d="M12 18v4"></path>
    </svg>`,
    bar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>`,
    line: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>`,
    pictogram: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>`
  };
  
  return icons[type] || icons.pie;
}

// ============================================
// APP INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', initApp);
