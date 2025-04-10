// src/js/modules/layerEvents.js
import { watch } from 'https://js.arcgis.com/4.32/@arcgis/core/reactiveUtils.js';
import { identifyFeatures } from './identify.js';

// Set up layer event handlers
export function setupLayerEvents(map, view) {
  const layers = map.allLayers;

  layers.forEach(layer => {
    // Skip basemap layers
    if (layer.type === "base-tile") return;

    // Watch visibility changes
    watchLayerVisibility(layer);

    // Watch opacity changes
    watchLayerOpacity(layer);

    // Handle specific layer types
    if (isGeologicLayer(layer)) {
      setupGeologicLayerEvents(layer);
    }

    if (isIdentifiableLayer(layer)) {
      setupIdentifyEvents(layer, view);
    }
  });
}

// Watch layer visibility changes
function watchLayerVisibility(layer) {
  watch(() => layer.visible, (visible) => {
    // If layer is made visible, ensure parent is visible
    if (visible && layer.parent) {
      layer.parent.visible = true;
    }

    // Update legends if needed
    if (isGeologicLayer(layer)) {
      displayGeologicLegend();
    }
    if (isSurficialLayer(layer)) {
      displaySurficialLegend();
    }

    // Update layer list
    reorderLayerList();
  });
}

// Watch layer opacity changes
function watchLayerOpacity(layer) {
  watch(() => layer.opacity, (opacity) => {
    // Update transparency slider if it exists
    const slider = document.querySelector(`#slider-${layer.id}`);
    if (slider) {
      slider.value = opacity;
    }

    // Update any dependent layers
    updateDependentLayers(layer, opacity);
  });
}

// Handle geologic layer specific events
function setupGeologicLayerEvents(layer) {
  // Watch feature selection
  watch(() => layer.selectedFeatures, (features) => {
    if (features?.length > 0) {
      highlightGeologicFeature(features[0]);
    }
  });

  // Handle symbology updates
  layer.when(() => {
    layer.on("symbology-change", (event) => {
      updateGeologicSymbology(layer, event);
    });
  });
}

// Setup identify events for layers
function setupIdentifyEvents(layer, view) {
  layer.when(() => {
    // Handle click events
    view.on("click", (event) => {
      identifyFeatures(layer, event.mapPoint, view);
    });

    // Handle hover events if enabled
    if (layer.hoverable) {
      view.on("pointer-move", (event) => {
        hoverIdentifyFeatures(layer, event.mapPoint, view);
      });
    }
  });
}

// Handle layer loading states
export function setupLoadingStates(layers) {
  layers.forEach(layer => {
    watch(() => layer.loading, (loading) => {
      updateLoadingIndicator(layer, loading);
    });

    // Handle load errors
    layer.on("error", (error) => {
      handleLayerError(layer, error);
    });
  });
}

// Utility functions
function isGeologicLayer(layer) {
  return layer.id?.includes('geol_');
}

function isSurficialLayer(layer) {
  return layer.id?.includes('surfgeo_');
}

function isIdentifiableLayer(layer) {
  return layer.id?.includes('kgs_') || 
         layer.id?.includes('geol_') || 
         layer.id?.includes('ky_');
}

// Update loading indicator
function updateLoadingIndicator(layer, loading) {
  const loadingElement = document.getElementById('loadingImg');
  if (loading) {
    loadingElement.style.display = 'block';
  } else {
    // Check if any other layers are still loading
    const stillLoading = layer.parent?.allLayers.some(l => l.loading);
    if (!stillLoading) {
      loadingElement.style.display = 'none';
    }
  }
}

// Handle layer errors
function handleLayerError(layer, error) {
  console.error(`Error in layer ${layer.id}:`, error);
  
  // Show user-friendly error message
  const errorMessage = `Layer "${layer.title}" failed to load. Try disabling and re-enabling the layer.`;
  
  // You might want to show this in your UI somewhere
  showLayerError(layer, errorMessage);
}

// Show layer error in UI
function showLayerError(layer, message) {
  // Create or update error indicator in layer list
  const layerItem = document.querySelector(`[data-layer-id="${layer.id}"]`);
  if (layerItem) {
    const errorIndicator = document.createElement('div');
    errorIndicator.className = 'layer-error';
    errorIndicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    layerItem.appendChild(errorIndicator);
  }
}

// Update dependent layers
function updateDependentLayers(layer, opacity) {
  if (layer.id?.includes('_group')) {
    // Update all child layers
    layer.layers.forEach(childLayer => {
      childLayer.opacity = opacity;
    });
  }
}

// Highlight geologic feature
function highlightGeologicFeature(feature) {
  if (!feature) return;

  const view = app.mapView;
  view.graphics.removeAll();

  const highlightGraphic = createHighlightGraphic(feature);
  view.graphics.add(highlightGraphic);
}

// Create highlight graphic
function createHighlightGraphic(feature) {
  const highlightSymbol = {
    type: "simple-fill",
    color: [255, 255, 0, 0.3],
    outline: {
      color: [255, 255, 0, 0.8],
      width: 2
    }
  };

  return {
    geometry: feature.geometry,
    symbol: highlightSymbol
  };
}

// Export utility functions
export const utils = {
  isGeologicLayer,
  isSurficialLayer,
  isIdentifiableLayer,
  updateLoadingIndicator,
  handleLayerError,
  highlightGeologicFeature
};