export async function setupPanels() {
    setupActionBar();
    setupMobileToggle();
    loadInitialContent();
}

function setupActionBar() {
    const actions = document.querySelectorAll('calcite-action-bar calcite-action');
    
    actions.forEach(action => {
        action.addEventListener('click', () => {
            const panelId = action.id.replace('action-', '') + '-panel';
            
            // Update active state on actions
            actions.forEach(a => a.active = false);
            action.active = true;
            
            // Show the matching panel, hide others
            document.querySelectorAll('calcite-shell-panel calcite-panel').forEach(p => {
                p.hidden = p.id !== panelId;
            });
        });
    });
}

function setupMobileToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const mainPanel = document.getElementById('main-panel');

    if (menuToggle && mainPanel) {
        menuToggle.addEventListener('click', () => {
            mainPanel.classList.toggle('mobile-open');
            menuToggle.active = mainPanel.classList.contains('mobile-open');
        });
    }
}

function showPanel(panelId) {
    // Update action bar active state
    const actionId = 'action-' + panelId.replace('-panel', '');
    document.querySelectorAll('calcite-action-bar calcite-action').forEach(a => {
        a.active = a.id === actionId;
    });
    
    // Show matching panel
    document.querySelectorAll('calcite-shell-panel calcite-panel').forEach(p => {
        p.hidden = p.id !== panelId;
    });
}

async function loadInitialContent() {
    try {
        //need to make an about page to load content into, but this is the idea for loading content into panels on app load
        const aboutResponse = await fetch('about.html');
        const aboutContent = await aboutResponse.text();
        const aboutPanel = document.getElementById('aboutPanelContent');
        if (aboutPanel) aboutPanel.innerHTML = aboutContent;
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

export function handleDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const panel = urlParams.get('panel');
    showPanel(panel ? `${panel}-panel` : 'about-panel');
}