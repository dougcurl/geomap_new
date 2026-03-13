import { identify } from 'https://js.arcgis.com/5.0/@arcgis/core/rest/identify.js';
import IdentifyParameters from 'https://js.arcgis.com/5.0/@arcgis/core/rest/support/IdentifyParameters.js';

export async function initializeIdentify(view) {
    view.on("click", (event) => {
        executeIdentify(event, view);
    });
}

async function executeIdentify(event, view) {
    try {
        // First try hitTest for FeatureLayers
        const hitResponse = await view.hitTest(event);
        const hitFeatures = hitResponse.results
            ?.filter(r => r.graphic?.layer?.type === 'feature')
            ?.map(r => r.graphic);

        if (hitFeatures?.length > 0) {
            view.openPopup({
                features: hitFeatures,
                location: event.mapPoint
            });
            return;
        }

        // For MapImageLayers, use esri/rest/identify
        const identifyPromises = [];

        view.map.allLayers.forEach(layer => {
            if (layer.type === 'map-image' && layer.visible) {
                const params = new IdentifyParameters({
                    geometry: event.mapPoint,
                    mapExtent: view.extent,
                    width: view.width,
                    height: view.height,
                    tolerance: 3,
                    returnGeometry: true,
                    layerOption: 'visible'
                });

                identifyPromises.push(
                    identify(layer.url, params)
                        .then(result => result.results?.map(r => r.feature) ?? [])
                        .catch(() => [])
                );
            }
        });

        const results = await Promise.all(identifyPromises);
        const allFeatures = results.flat();

        if (allFeatures.length > 0) {
            view.openPopup({
                features: allFeatures,
                location: event.mapPoint,
                title: "Identify Results"
            });
        } else {
            view.closePopup();
        }

    } catch (error) {
        console.error("Error in identify:", error);
    }
}