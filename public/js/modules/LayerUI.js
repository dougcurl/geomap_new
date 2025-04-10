import LayerList from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/LayerList.js';
import { watch } from 'https://js.arcgis.com/4.32/@arcgis/core/reactiveUtils.js';
import Slider from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Slider.js';

export class LayerUI {
  constructor(view, layerManager) {
    this.view = view;
    this.layerManager = layerManager;
    this.layerList = null;
    this.kfaLayerList = null;
    this.uniqueParentItems = [];
  }

  /**
   * Initialize layer UI components
   */
  async initialize() {
    // Create main layer list
    this.layerList = new LayerList({
      view: this.view,
      container: "layersPanelDiv",
      listItemCreatedFunction: (event) => this.defineLayerListActions(event)
    });

    // Create KyFromAbove layer list
    this.kfaLayerList = new LayerList({
      view: this.view,
      container: "kyfrabovePanelDiv",
      listItemCreatedFunction: (event) => this.defineLayerListActions(event)
    });

    // Listen for layer list trigger actions
    this.layerList.on("trigger-action", (event) => this.handleLayerAction(event));
    this.kfaLayerList.on("trigger-action", (event) => this.handleLayerAction(event));

    // Setup initial visibility watchers
    this.setupLayerVisibilityWatchers();
  }

  /**
   * Define actions and controls for layer list items
   */
  defineLayerListActions(event) {
    const item = event.item;
    
    // Watch parent visibility
    this.setupParentVisibility(item);

    // Create transparency slider
    const slider = this.createTransparencySlider(item);

    // Configure actions based on layer type
    if (this.isGroupOrNumericLayer(item)) {
      this.configureGroupActions(item, slider);
    } else if (this.isGraphicsLayer(item)) {
      this.configureGraphicsActions(item);
    } else {
      this.configureStandardActions(item, slider);
    }
  }

  /**
   * Create transparency slider for a layer
   */
  createTransparencySlider(item) {
    const slider = new Slider({
      min: 0,
      max: 1,
      precision: 2,
      values: [item.layer.opacity],
      label: "Layer Transparency",
      layout: "horizontal-reversed",
      visibleElements: {
        labels: true,
        rangeLabels: true
      }
    });

    slider.tickConfigs = [{
      mode: "percent",
      values: [10, 50, 90]
    }];

    slider.labelFormatFunction = (value, type) => {
      switch(type) {
        case "min":
          return '\xa0\xa0transparent';
        case "max":
          return "opaque";
        case "value":
          if (value > 0.98 && value < 1) {
            return `${(value * 100).toFixed(0)}%`;
          } else if (value === 1) {
            return "opaque";
          } else {
            return `${(value * 100).toFixed(0)}% opaque`;
          }
        default:
          return value;
      }
    };

    slider.on("thumb-drag", (event) => {
      item.layer.opacity = event.value;
    });

    return slider;
  }

  /**
   * Configure actions for group layers
   */
  configureGroupActions(item, slider) {
    item.panel = {
      content: slider,
      title: "Layer Transparency",
      className: "esri-icon-sliders-horizontal"
    };

    const actions = [{
      title: "Layer information",
      className: "esri-icon-description",
      id: "information"
    }];

    if (item.layer.downloadInfo) {
      actions.push(this.createDownloadAction(item.layer.downloadInfo));
    }

    item.actionsSections = [actions];
  }

  /**
   * Configure actions for graphics layers
   */
  configureGraphicsActions(item) {
    item.actionsSections = [
      [{
        title: "Remove layer",
        className: "esri-icon-close-circled",
        id: "remove-layer"
      }]
    ];
    
    // Graphics layers don't support legends
    item.panel = null;
  }

  /**
   * Configure actions for standard layers
   */
  configureStandardActions(item, slider) {
    const includesLegend = !this.isGeologicLegendLayer(item.layer.id);

    item.panel = {
      content: includesLegend ? [slider, "legend"] : slider,
      title: "Layer Transparency",
      className: "esri-icon-sliders-horizontal",
      open: false
    };

    const actions = [{
      title: "Layer information",
      className: "esri-icon-description",
      id: "information"
    }];

    if (item.layer.downloadInfo) {
      actions.push(this.createDownloadAction(item.layer.downloadInfo));
    }

    item.actionsSections = [actions];
  }

  /**
   * Create download action based on download info
   */
  createDownloadAction(downloadInfo) {
    const isDownload = downloadInfo.type === 'download';
    const size = downloadInfo.size ? ` (${downloadInfo.size})` : '';
    const format = downloadInfo.format ? ` (${downloadInfo.format})` : '';

    return {
      title: isDownload ? `Download Data${size}${format}` : 'View Data Source',
      className: isDownload ? 'esri-icon-download' : 'esri-icon-launch-link-external',
      id: isDownload ? 'download' : 'website'
    };
  }

  /**
   * Handle layer action triggers
   */
  handleLayerAction(event) {
    const id = event.action.id;
    const layer = event.item.layer;

    switch(id) {
      case 'information':
        if (layer.url) {
          window.open(layer.url);
        }
        break;

      case 'download':
        if (layer.downloadInfo?.url) {
          const message = `Are you sure you want to download this file?\n\n${layer.downloadInfo.url}`;
          if (confirm(message)) {
            window.location = layer.downloadInfo.url;
          }
        }
        break;

      case 'website':
        if (layer.downloadInfo?.url) {
          window.open(layer.downloadInfo.url);
        }
        break;

      case 'remove-layer':
        this.view.map.remove(layer);
        setTimeout(() => {
          this.reorderLayerList();
        }, 500);
        break;
    }
  }

  // Utility functions
  isGroupOrNumericLayer(item) {
    // First check if the ID exists and is a string
    const id = item.layer?.id;
    if (typeof id === 'string') {
        return id.includes('group_');
    }
    // If ID is not a string, check if it's numeric
    return typeof id === 'number';
}

  isGraphicsLayer(item) {
    return item.layer.type === "graphics" || item.layer.id === "dynPoints";
  }

  isGeologicLegendLayer(id) {
    const excludedIds = [
      'geol_24KGeoUnits_poly',
      'geol_24KLitho_poly',
      'geol_500KLitho_poly',
      'geol_500KGeoUnits_poly'
    ];
    return excludedIds.includes(id);
  }

  setupParentVisibility(item) {
    if (!this.uniqueParentItems.includes(item.title)) {
      this.uniqueParentItems.push(item.title);
      watch(() => item.visible, () => {
        if (item.parent) {
          item.parent.visible = true;
        }
      });
    }
  }

  setupLayerVisibilityWatchers() {
    if (!this.layerManager?.layers) return;
    
    Array.from(this.layerManager.layers.values()).forEach(layer => {
        watch(() => layer.visible, (visible) => {
            if (visible && layer.parent) {
                layer.parent.visible = true;
            }
        });
    });
  }
}