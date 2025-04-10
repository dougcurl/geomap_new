// modules/panels.js

/**
 * Setup panel system and event handlers
 */
export async function setupPanels() {
    setupMenuToggle();
    setupPanelToggles();
    loadInitialContent();
}

function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const shellPanel = document.querySelector('calcite-shell-panel[position="end"]');
    
    if (menuToggle && shellPanel) {
        menuToggle.addEventListener('click', () => {
            shellPanel.hidden = !shellPanel.hidden;
            menuToggle.selected = !shellPanel.hidden;
            
            // Show About panel by default when opening
            if (!shellPanel.hidden) {
                showPanel('about-panel');
            }
        });
    } else {
        console.error('Menu toggle or shell panel not found', {
            menuToggle,
            shellPanel
        });
    }
}

function setupPanelToggles() {
    const menu = document.getElementById('main-menu');
    if (!menu) return;

    menu.addEventListener('click', (event) => {
        const menuItem = event.target.closest('calcite-menu-item');
        if (!menuItem) return;

        const panelId = menuItem.getAttribute('data-panel');
        if (panelId) {
            showPanel(`${panelId}-panel`);
        }
    });
}

function showPanel(panelId) {
    const shellPanel = document.querySelector('calcite-shell-panel[position="end"]');
    const targetPanel = document.getElementById(panelId);
    
    if (shellPanel && targetPanel) {
        // Show shell panel
        shellPanel.hidden = false;
        
        // Hide all panels
        document.querySelectorAll('calcite-panel').forEach(panel => {
            panel.hidden = true;
        });
        
        // Show target panel
        targetPanel.hidden = false;
    }
}

/**
 * Load initial panel content
 */
async function loadInitialContent() {
    // Load about panel content
    try {
        const aboutResponse = await fetch('about.asp?format=textonly');
        const aboutContent = await aboutResponse.text();
        const aboutPanel = document.getElementById('aboutPanelContent');
        if (aboutPanel) {
            aboutPanel.innerHTML = aboutContent;
        }
    } catch (error) {
        console.error('Error loading about content:', error);
    }

    // Load other initial content as needed
    // For example, quick layouts for the layers panel
    try {
        const layoutsResponse = await fetch('https://kgs.uky.edu/kygeode/geomap/bookmarkMap.asp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                bm_list: true
            })
        });
        const layoutsContent = await layoutsResponse.text();
        const layoutsContainer = document.getElementById('quickLayoutsPanelContent');
        if (layoutsContainer) {
            layoutsContainer.innerHTML = layoutsContent;
        }
    } catch (error) {
        console.error('Error loading quick layouts:', error);
    }
}

/**
 * Handle deep linking to specific panels
 */
export function handleDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const panel = urlParams.get('panel');
    if (panel) {
        showPanel(`${panel}-panel`);
    } else if (window.self === window.top) {
        // Show about panel by default when not in iframe
        showPanel('about-panel');
    }
}