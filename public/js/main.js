import Map from 'https://js.arcgis.com/5.0/@arcgis/core/Map.js';
import MapView from 'https://js.arcgis.com/5.0/@arcgis/core/views/MapView.js';
import ScaleBar from 'https://js.arcgis.com/5.0/@arcgis/core/widgets/ScaleBar.js';
import Home from 'https://js.arcgis.com/5.0/@arcgis/core/widgets/Home.js';
import Locate from 'https://js.arcgis.com/5.0/@arcgis/core/widgets/Locate.js';
import esriConfig from 'https://js.arcgis.com/5.0/@arcgis/core/config.js';

import { config } from './modules/config.js';
import { LayerManager } from './modules/LayerManager.js';
import { setupTools } from './modules/tools.js';
import { setupPanels } from './modules/panels.js';
import { setupLegend } from './modules/legend.js';
import { initializeIdentify } from './modules/identify.js';
import { initializeWidgets } from './modules/widget.js';

// Application state
class AppState {
    constructor() {
        this.ready = false;
        this.view = null;
        this.map = null;
        this.layerManager = null;
        this.widgets = {};
    }
}

// Create global app state
const app = new AppState();
window.app = app; // Make available globally

/**
 * Initialize core map components
 */
async function initializeMapComponents() {
    try {
        // Configure API key and fonts
        esriConfig.apiKey = config.apiKey;
        esriConfig.fontsUrl = "https://static.arcgis.com/fonts";

        // Create base map
        const map = new Map({
            basemap: config.map.basemap
        });

        // Create map view
        const view = new MapView({
            container: "viewDiv",
            map: map,
            center: config.map.center,
            zoom: config.map.zoom,
            padding: config.map.viewPadding,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    position: "top-right",
                    buttonEnabled: true
                }
            }
        });

        view.padding = {
            top: 50,  // Adjust based on your header height
            bottom: 0,
            left: 0,
            right: 0
        };
        
        // Force a resize after creation to ensure proper layout
        view.when(() => {
            window.setTimeout(() => {
                view.extent = view.extent;
            }, 100);
        });

        // Store in app state
        app.map = map;
        app.view = view;

        // Initialize layer manager
        app.layerManager = new LayerManager();
        const { legendLayers, surfLegendLayers } = await app.layerManager.initializeLayers(map);

        // Initialize core widgets
        await initializeWidgets(view);

        // Setup event handlers
        setupMapEvents(view);

        return {
            legendLayers,
            surfLegendLayers
        };

    } catch (error) {
        console.error('Error initializing map components:', error);
        throw error;
    }
}

/**
 * Setup map event handlers
 */
function setupMapEvents(view) {
    // Update scale display
    view.watch('scale', (scale) => {
        const scaleDisplay = document.getElementById('scaleDisplay');
        if (scaleDisplay) {
            scaleDisplay.textContent = `1:${scale.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        }
    });

    // Show/hide loading indicator
    const loader = document.getElementById('loader');
    view.watch('updating', (updating) => {
        if (loader) {
            loader.hidden = !updating;
        }
    });
}

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Check browser compatibility
        if (!checkBrowserSupport()) {
            showError(config.errors.browser);
            return;
        }

        // Initialize map components
        const { legendLayers, surfLegendLayers } = await initializeMapComponents();

        // Initialize UI components
        await setupPanels();
        await setupTools(app.view);
        await setupLegend(app.view, legendLayers, surfLegendLayers);
        await initializeIdentify(app.view);

        // Mark app as ready
        app.ready = true;

    } catch (error) {
        console.error('Error initializing application:', error);
        showError(`Error initializing application: ${error.message}`);
    }
}

/**
 * Check browser compatibility
 */
function checkBrowserSupport() {
    return !navigator.userAgent.includes('MSIE') && 
           !navigator.userAgent.includes('Trident/');
}

/**
 * Display error message
 */
function showError(message) {
    const viewDiv = document.getElementById('viewDiv');
    if (viewDiv) {
        viewDiv.innerHTML = `
            <calcite-notice kind="danger" scale="l">
                <div slot="title">Error</div>
                <div slot="message">${message}</div>
                <calcite-button slot="actions" onclick="location.reload()" appearance="outline">
                    Reload Application
                </calcite-button>
            </calcite-notice>
        `;
    }
}

// Initialize application
initializeApp();

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    if (app.ready) {
        const notice = document.createElement('calcite-notice');
        notice.kind = 'danger';
        notice.scale = 'l';
        notice.innerHTML = `
            <div slot="title">Error</div>
            <div slot="message">An unexpected error occurred. Please try refreshing the page.</div>
            <calcite-button slot="actions" onclick="location.reload()" appearance="outline">
                Reload
            </calcite-button>
        `;
        document.body.appendChild(notice);
    }
});

// Export app for modules that need access to global state
export { app };