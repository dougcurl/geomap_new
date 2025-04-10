// src/js/modules/bookmarks.js
export async function initializeBookmarks() {
    // Make bookmark functions globally available
    window.createBookmark = createBookmark;
    window.clearBookmark = clearBookmark;
    window.getBookmark = getBookmark;
    window.getQuickLayouts = getQuickLayouts;

    // Initialize quick layouts
    await getQuickLayouts();

    // Handle URL parameters for bookmarks
    handleBookmarkParams();
}

// Handle URL parameters for bookmarks and layout IDs
async function handleBookmarkParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const layoutId = urlParams.get('layoutid');
    const queryZoom = urlParams.get('queryzoom')?.toLowerCase() === 'yes';

    if (layoutId || queryZoom) {
        const wkid = urlParams.get('wkid') || '102100'; // Default to Web Mercator

        // Handle explicit extent coordinates
        if (urlParams.get('startleft') && urlParams.get('startright') && 
            urlParams.get('starttop') && urlParams.get('startbottom')) {
            await handleCustomExtent(urlParams, wkid);
        }
        // Handle standard extent parameters
        else if (urlParams.get('xmin') && urlParams.get('xmax') && 
                 urlParams.get('ymin') && urlParams.get('ymax')) {
            await handleStandardExtent(urlParams, wkid);
        }

        // Load bookmark if layout ID is provided
        if (layoutId) {
            setTimeout(() => {
                getBookmark(layoutId);
            }, 3000);
        }
    }

    // Handle point zoom parameters
    setTimeout(() => {
        zoomToPoint(
            urlParams.get('ptX'),
            urlParams.get('ptY'),
            urlParams.get('wkid'),
            urlParams.get('level')
        );
    }, 3000);
}

async function handleCustomExtent(urlParams, wkid) {
    try {
        const geometry = await projectExtent({
            left: urlParams.get('startleft'),
            right: urlParams.get('startright'),
            top: urlParams.get('starttop'),
            bottom: urlParams.get('startbottom'),
            wkid: wkid
        });
        
        if (geometry) {
            app.mapView.goTo(geometry);
        }
    } catch (error) {
        console.error('Error handling custom extent:', error);
    }
}

async function handleStandardExtent(urlParams, wkid) {
    try {
        const extent = {
            xmin: urlParams.get('xmin'),
            ymin: urlParams.get('ymin'),
            xmax: urlParams.get('xmax'),
            ymax: urlParams.get('ymax'),
            spatialReference: {
                wkid: parseInt(wkid)
            }
        };
        app.mapView.goTo(extent);
    } catch (error) {
        console.error('Error handling standard extent:', error);
    }
}

// Get quick layouts
async function getQuickLayouts() {
    try {
        const response = await fetch('https://kgs.uky.edu/kygeode/geomap/bookmarkMap.asp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                bm_list: true
            })
        });

        const quickLayoutsDiv = document.getElementById("quickLayoutPanelDiv");
        if (!quickLayoutsDiv) return;

        if (response.ok) {
            const data = await response.text();
            if (data === "error") {
                quickLayoutsDiv.innerHTML = "No layouts found";
            } else {
                quickLayoutsDiv.innerHTML = data;
            }
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error("Error getting quick layouts:", error);
        const quickLayoutsDiv = document.getElementById("quickLayoutPanelDiv");
        if (quickLayoutsDiv) {
            quickLayoutsDiv.innerHTML = "No layouts found";
        }
    }
}

// Point zoom utility
async function zoomToPoint(ptX, ptY, wkid, zoomLevel = 14) {
    if (!ptX || !ptY) return;

    try {
        const plotSymbol = {
            type: "simple-marker",
            style: "cross",
            color: [255, 255, 0, 0.9],
            size: "10px",
            outline: {
                color: [225, 0, 5, 0.9],
                width: 3
            }
        };

        if (wkid) {
            // Project point if not in web mercator
            const point = await projectPoint(ptX, ptY, wkid);
            if (point) {
                const graphic = {
                    geometry: point,
                    symbol: plotSymbol
                };
                
                app.mapView.graphics.add(graphic);
                app.mapView.center = point;
                app.mapView.zoom = parseInt(zoomLevel);
            }
        } else {
            // Assume decimal degrees
            const point = {
                type: "point",
                longitude: parseFloat(ptX),
                latitude: parseFloat(ptY)
            };
            
            const graphic = {
                geometry: point,
                symbol: plotSymbol
            };
            
            app.mapView.graphics.add(graphic);
            app.mapView.center = [parseFloat(ptX), parseFloat(ptY)];
            app.mapView.zoom = parseInt(zoomLevel);
        }
    } catch (error) {
        console.error('Error zooming to point:', error);
    }
}

async function createBookmark() {
    const bookmarkArea = document.getElementById("bookmarkLinkArea");
    bookmarkArea.innerHTML = "<div style='padding-left:10px;padding-top:10px;'>loading...</div>";

    // Collect visible layers
    const visibleLayers = [];
    app.map.allLayers.forEach(layer => {
        if (layer.visible) {
            if (!layer.id?.includes("_alwayson")) {
                // Handle layers with sublayers (like Grid or MPs)
                if (layer.id === "kgs_Grid" || layer.id === "kgs_MPs") {
                    let layerItems = "{";
                    layer.allSublayers.items.forEach(sublayer => {
                        if (sublayer.visible) {
                            layerItems += sublayer.id + "-";
                        }
                    });
                    layerItems += "}";
                    visibleLayers.push(layer.id + layerItems);
                } else {
                    visibleLayers.push(layer.id);
                }
            }
        }
    });

    try {
        const response = await fetch('https://kgs.uky.edu/kygeode/geomap/bookmarkMap.asp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                createBM: true,
                bm_layers: visibleLayers
            })
        });

        const data = await response.json();
        
        if (data.result === "error") {
            bookmarkArea.innerHTML = "<div style='padding-left:10px;padding-top:10px;'>Something went wrong creating a bookmark. Please try again.</div>";
            console.error("Bookmark creation error:", data.errormsg);
            alert("There was an error with the bookmark creation.");
            return;
        }

        const bmLink = `https://kgs.uky.edu/kygeode/geomap/?layoutid=${data.layoutid}`;
        const bmLinkExtent = `&xmin=${app.mapView.extent.xmin}&xmax=${app.mapView.extent.xmax}&ymin=${app.mapView.extent.ymin}&ymax=${app.mapView.extent.ymax}`;

        setTimeout(() => {
            bookmarkArea.innerHTML = `
                <div style='padding-left:10px;padding-top:10px;'>
                    <a href='${bmLink}' target='_blank'>
                        <span class='fal fa-external-link' data-fa-transform='grow-3'></span>
                    </a> 
                    <a href='${bmLink}' target='_blank'>Link to this layout (no extent)</a> 
                    <span style='cursor: pointer;padding:3px;' onClick="copyBMLink('bmLink')">
                        <button class='fal fa-copy' data-fa-transform='grow-4 right-10' title='Copy URL of layout to clipboard (no extent)'></button>
                    </span><br>
                    <a href='${bmLink}${bmLinkExtent}' target='_blank'>
                        <span class='fas fa-external-link-square' data-fa-transform='grow-3'></span>
                    </a> 
                    <a href='${bmLink}${bmLinkExtent}' target='_blank'>Link to this layout WITH extent</a> 
                    <span onClick="copyBMLink('bmLinkExtent')" style='cursor: pointer;padding:3px;'>
                        <button class='fal fa-copy' data-fa-transform='grow-4 right-10' title='Copy URL of layout with extent to clipboard'></button>
                    </span><br>
                    <div style='margin-top:10px;'>Link opens map in a new window. Once open, bookmark the page to save the layout.</div>
                    <div style='padding:3px;margin-top:10px;background-color:#FFFFEA'>
                        This bookmark is Layout ID <b>${data.layoutid}</b><br>
                        Along with the bookmark links above, write this ID down and you can enter this into the Layers --> Quick Map Layouts to quickly re-create this layout.
                    </div>
                </div>
                <div style='display:none;'>
                    <input type='textarea' value='${bmLink}' id='bmLink'>
                    <br>
                    <input type='textarea' value='${bmLink}${bmLinkExtent}' id='bmLinkExtent'>
                </div>`;
        }, 300);

    } catch (error) {
        bookmarkArea.innerHTML = "<div style='padding-left:10px;padding-top:10px;'>Something went wrong creating a bookmark. Please try again.</div>";
        console.error("Bookmark creation error:", error);
        alert("There was an error with the response of the bookmark page. Please try again.");
    }
}

function clearBookmark() {
    const bookmarkArea = document.getElementById("bookmarkLinkArea");
    if (bookmarkArea) {
        bookmarkArea.innerHTML = "";
    }
}

async function getBookmark(layoutid) {
    try {
        // First, turn off all layers
        app.map.allLayers.forEach(layer => {
            if (layer.url == null || 
                layer.url.includes("kgs.uky.edu") || 
                layer.url.includes("kygisserver.ky.gov") || 
                layer.url.includes("kyraster.ky.gov")) {
                if (!layer.id?.includes("_alwayson")) {
                    layer.visible = false;
                }
            }
        });

        const response = await fetch('https://kgs.uky.edu/kygeode/geomap/bookmarkMap.asp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                createBM: false,
                layoutid: layoutid
            })
        });

        const data = await response.json();

        if (data.result === "error") {
            alert("There was an error retrieving this bookmark layout. Check the ID entered or the LayoutID used in the bookmark link.");
            console.error(data.errormsg);
            return;
        }

        // Process layers string
        const layers_list = data.layerstring.split('|');
        const visible_layers_list = [];

        layers_list.forEach(item => {
            let subids = null;
            let subidArray = [];

            // Check for sublayers
            if (item.includes('{')) {
                subids = item.substring(item.lastIndexOf("{") + 1, item.lastIndexOf("}"));
                subidArray = subids.includes('-') ? subids.split('-') : [subids];
                item = item.substring(0, item.indexOf('{'));
            }

            visible_layers_list.push(item);

            // Set layer visibility
            app.map.allLayers.forEach(layer => {
                if (layer.id === item) {
                    layer.visible = true;
                    if (subids) {
                        subidArray.forEach(subid => {
                            if (layer.sublayers) {
                                layer.sublayers.forEach(sublayer => {
                                    if (sublayer.id === parseInt(subid)) {
                                        sublayer.visible = true;
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });

        // Recheck parent visibility
        visible_layers_list.forEach(item => {
            app.map.allLayers.forEach(layer => {
                if (layer.id === item && layer.parent?.visible === false) {
                    layer.visible = false;
                }
            });
        });

    } catch (error) {
        console.error("Error getting bookmark:", error);
        alert("There was an error with the response of the bookmark page. Please try again.");
    }
}

// Copy bookmark link utility function
window.copyBMLink = function(domID) {
    const copyText = document.getElementById(domID);
    if (!copyText) return;

    // Create auxiliary input for copying
    const aux = document.createElement("input");
    aux.setAttribute("value", copyText.value);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);

    alert("Copied the URL: " + copyText.value);
};