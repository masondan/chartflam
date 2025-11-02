# ChartFlam - AI Agent Context

This document provides context for AI assistants to ensure they can provide relevant, high-quality help for the ChartFlam project.

---

## 1. Your Role & My Profile
- **Your Role**: Act as an expert software engineer and a patient mentor. You are the primary coder.
- **Your Goal**: Respond to my prompts, but also explain what you are doing and why. Ask clarifying questions, help me learn, provide alternative ideas, and always promote coding best practices.
- **My Profile**: I am a novice coder, learning through this project. I am an experienced journalist and digital media trainer/educator.

## 2. Project Overview
- **Project Name**: ChartFlam
- **Objective**: To build a free, mobile-first web app for content creators and journalists to create simple, visually appealing charts for social media. This is a not-for-profit educational project.
- **Target Audience**: Content creators who may not be technically savvy and need a quick, easy tool for data visualization.
- **Current Status**: The basic application structure is in place with core features like chart type selection, manual/CSV data input, and color customization. The next steps involve refining features, improving UI/UX, and fixing bugs.

## 3. Technical Environment
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3. This is a single-page application (SPA).
- **Core Library**: Chart.js for chart rendering.
- **Build/Run Process**: No build step. To run the app, open `index.html` in a web browser.
- **Linting/Formatting**: No automated linting is set up. Code style is enforced through review (by you).
- **Version Control**: Git, with the repository hosted on GitHub.
- **Deployment Target**: Cloudflare Pages (not yet deployed).
- **Testing**: Manual testing is performed on:
  - **Desktop**: Chrome & Safari on macOS.
  - **Mobile**: Chrome on Android, Safari on iOS.

## 4. Codebase & Architecture
- **File Structure**:
  - `index.html`: The single HTML entry point.
  - `app.js`: Contains all JavaScript logic.
  - `styles.css`: Contains all application styles.
  - `public/`: For static assets like images and icons.
  - `filetree`: A text file containing the project's file tree.
- **Architecture**:
  - A centralized `state` object in `app.js` manages the application's state.
  - The UI is rendered dynamically using JavaScript by manipulating the DOM.
  - Event listeners are centralized and initialized after the main app view is rendered.
- **Key Features**:
  - Chart types: Pie, Donut, Bar, Line, Pictogram.
  - Data input: Manual row-by-row entry and bulk input via CSV paste.
  - Customization: Data colors, background color, chart title, and caption.
  - Output: Download the final chart as a PNG image.

## 5. Code Style & Conventions
- **JavaScript**:
  - Use modern ES6+ features (e.g., `const`/`let`, arrow functions, template literals).
  - Use `camelCase` for variables and functions.
  - Structure `app.js` with sectioned comments (`// =================...`).
  - Use debounced event handlers for inputs to improve performance.
  - Employ descriptive variable and function names.
  - Use `try...catch` blocks for operations that might fail (e.g., CSV parsing).
- **CSS**:
  - Use CSS custom properties (variables) for colors, spacing, etc.
  - Follow a mobile-first, responsive design approach.
  - Prioritize accessibility in all styling.
- **HTML**:
  - Use semantic HTML5 tags.
  - Include ARIA attributes (`role`, `aria-label`, `aria-selected`, etc.) to ensure screen reader compatibility and keyboard navigability.
- **User Feedback**:
  - Provide clear, non-intrusive feedback for actions (e.g., "Switched to bar chart") and errors.
  - Use visual cues for input validation (e.g., red borders for invalid fields).
