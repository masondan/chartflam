/**
 * FlamNav Web Component
 * Shared hamburger menu for all FlamTools apps.
 * Usage: <flam-nav current="promptflam"></flam-nav>
 */
class FlamNav extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._open = false;
	}

	static get observedAttributes() {
		return ['current'];
	}

	get current() {
		return this.getAttribute('current') || '';
	}

	connectedCallback() {
		this.render();
		this._onKeyDown = (e) => { if (e.key === 'Escape') this.close(); };
	}

	disconnectedCallback() {
		document.removeEventListener('keydown', this._onKeyDown);
	}

	toggle() {
		this._open ? this.close() : this.open();
	}

	open() {
		this._open = true;
		const drawer = this.shadowRoot.querySelector('.drawer');
		const overlay = this.shadowRoot.querySelector('.overlay');
		drawer.classList.add('open');
		overlay.classList.add('open');
		document.addEventListener('keydown', this._onKeyDown);
	}

	close() {
		this._open = false;
		const drawer = this.shadowRoot.querySelector('.drawer');
		const overlay = this.shadowRoot.querySelector('.overlay');
		drawer.classList.remove('open');
		overlay.classList.remove('open');
		document.removeEventListener('keydown', this._onKeyDown);
	}

	render() {
		const apps = [
			{ id: 'promptflam', name: 'PromptFlam', url: 'https://promptflam.flamtools.com' },
			{ id: 'picflam', name: 'PicFlam', url: 'https://picflam.flamtools.com' },
			{ id: 'audioflam', name: 'AudioFlam', url: 'https://audioflam.flamtools.com' },
			{ id: 'chartflam', name: 'ChartFlam', url: 'https://chartflam.flamtools.com' },
			{ id: 'mapflam', name: 'MapFlam', url: 'https://mapflam.flamtools.com' },
			{ id: 'storyflam', name: 'StoryFlam', url: 'https://storyflam.flamtools.com' },
			{ id: 'flamit', name: 'FlamIt', url: 'https://flamit.flamtools.com' }
		];

		const current = this.current;

		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: flex;
					align-items: center;
				}

				.menu-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 38px;
					height: 38px;
					border: none;
					border-radius: 50%;
					background: transparent;
					cursor: pointer;
					padding: 0;
					color: #555;
					transition: background-color 150ms ease;
				}

				.menu-btn:hover {
					background-color: rgba(0, 0, 0, 0.06);
				}

				.menu-btn svg {
					width: 22px;
					height: 22px;
				}

				.overlay {
					position: fixed;
					inset: 0;
					background: rgba(0, 0, 0, 0.3);
					z-index: 9998;
					opacity: 0;
					visibility: hidden;
					transition: opacity 250ms ease, visibility 250ms ease;
				}

				.overlay.open {
					opacity: 1;
					visibility: visible;
				}

				.drawer {
					position: fixed;
					top: 0;
					left: 0;
					bottom: 0;
					width: 220px;
					background: #fff;
					z-index: 9999;
					transform: translateX(-100%);
					transition: transform 250ms ease;
					display: flex;
					flex-direction: column;
					box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
				}

				.drawer.open {
					transform: translateX(0);
				}

				.drawer-header {
					padding: 20px 16px 12px;
					border-bottom: 1px solid #eee;
				}

				.drawer-header a {
					display: flex;
					align-items: center;
					gap: 8px;
					text-decoration: none;
					color: #5422b0;
					font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
					font-size: 15px;
					font-weight: 600;
				}

				.drawer-header img {
					width: 20px;
					height: 20px;
				}

				.drawer-list {
					list-style: none;
					margin: 0;
					padding: 8px 0;
					flex: 1;
					overflow-y: auto;
				}

				.drawer-list li a {
					display: block;
					padding: 10px 16px;
					text-decoration: none;
					font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
					font-size: 14px;
					font-weight: 450;
					color: #333;
					transition: background-color 150ms ease;
				}

				.drawer-list li a:hover {
					background-color: #f5f0fa;
				}

				.drawer-list li a.current {
					color: #5422b0;
					font-weight: 600;
					background-color: #f0e6f7;
				}

				.drawer-list li.separator {
					height: 1px;
					background: #eee;
					margin: 6px 16px;
				}
			</style>

			<button class="menu-btn" aria-label="Open navigation menu" type="button">
				<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
					<path d="M7.95 11.95H39.95"/>
					<path d="M7.95 23.95H39.95"/>
					<path d="M7.95 35.95H39.95"/>
				</svg>
			</button>

			<div class="overlay"></div>

			<div class="drawer" role="navigation" aria-label="FlamTools navigation">
				<div class="drawer-header">
					<a href="https://flamtools.com">
						<img src="https://flamtools.com/logos/logo-flamtools-favicon.svg" alt="" />
						FlamTools
					</a>
				</div>
				<ul class="drawer-list">
					${apps.map((app, i) => {
						const isCurrent = app.id === current;
						const separator = i === 4 ? '<li class="separator"></li>' : '';
						return `${separator}<li><a href="${app.url}"${isCurrent ? ' class="current"' : ''}>${app.name}</a></li>`;
					}).join('')}
				</ul>
			</div>
		`;

		this.shadowRoot.querySelector('.menu-btn').addEventListener('click', () => this.toggle());
		this.shadowRoot.querySelector('.overlay').addEventListener('click', () => this.close());
	}
}

customElements.define('flam-nav', FlamNav);
