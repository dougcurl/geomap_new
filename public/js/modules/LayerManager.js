// src/js/modules/LayerManager.js
import MapImageLayer from 'https://js.arcgis.com/4.32/@arcgis/core/layers/MapImageLayer.js';
import TileLayer from 'https://js.arcgis.com/4.32/@arcgis/core//layers/TileLayer.js';
import FeatureLayer from 'https://js.arcgis.com/4.32/@arcgis/core/layers/FeatureLayer.js';
import ImageryLayer from 'https://js.arcgis.com/4.32/@arcgis/core/layers/ImageryLayer.js';
import GroupLayer from 'https://js.arcgis.com/4.32/@arcgis/core/layers/GroupLayer.js';
import { layerConfig, layerOrder, layerScales } from './LayerConfig.js';

/**
 * Manages the creation, organization and state of layers in the application
 */
export class LayerManager {
  constructor() {
    // Map of all layers by ID
    this.layers = new Map();
    
    // Map of group layers by ID 
    this.groupLayers = new Map();
    
    // Layers to include in legends
    this.legendLayers = [];
    this.surfLegendLayers = [];
  }

  /**
   * Initialize all layers from configuration
   * @param {Map} map - ArcGIS Map instance
   * @returns {Promise} Promise that resolves with legend layer configurations
   */
  async initializeLayers(map) {
    try {
      const initializedGroups = [];
      
      // Initialize each group in the specified order
      for (const groupId of layerOrder) {
        const groupConfig = this.getGroupConfig(groupId);
        if (groupConfig) {
          const group = await this.initializeLayerGroup(groupConfig);
          initializedGroups.push(group.groupLayer);
        }
      }

      // Add all groups to map in correct order
      map.addMany(initializedGroups);

      return {
        legendLayers: this.legendLayers,
        surfLegendLayers: this.surfLegendLayers
      };
    } catch (error) {
      console.error('Error initializing layers:', error);
      throw error;
    }
  }

  /**
   * Get group configuration by ID
   * @param {string} groupId - ID of the group to find
   * @returns {Object} Group configuration object
   */
  getGroupConfig(groupId) {
    return Object.values(layerConfig).find(config => config.id === groupId);
  }

  /**
   * Initialize a layer group and its children
   * @param {Object} groupConfig - Configuration for the group
   * @returns {Promise} Promise that resolves with the initialized group and its layers
   */
  async initializeLayerGroup(groupConfig) {
    try {
      const childLayers = [];

      // Initialize each child layer
      for (const layerConfig of groupConfig.layers) {
        let layer;
        
        switch (layerConfig.type) {
          case 'tile-feature':
            layer = await this.createTileFeatureLayer(layerConfig);
            childLayers.push(layer.groupLayer);
            break;
            
          case 'group':
            layer = await this.initializeLayerGroup(layerConfig);
            childLayers.push(layer.groupLayer);
            break;
            
          default:
            layer = await this.createLayer(layerConfig);
            childLayers.push(layer);
        }

        // Add to appropriate legend collection
        if (layerConfig.addToLegend) {
          this.addToLegend(layer, layerConfig.legendType);
        }
      }

      // Create the group layer
      const groupLayer = new GroupLayer({
        title: groupConfig.title,
        id: groupConfig.id,
        layers: childLayers,
        visible: groupConfig.visible ?? false,
        opacity: groupConfig.opacity ?? 1.0,
        url: groupConfig.url,
        legendEnabled: groupConfig.legendEnabled ?? false
      });

      this.groupLayers.set(groupConfig.id, groupLayer);

      return { groupLayer, childLayers };
    } catch (error) {
      console.error(`Error initializing layer group ${groupConfig.id}:`, error);
      throw error;
    }
  }

  /**
   * Create a basic layer based on configuration
   * @param {Object} config - Layer configuration
   * @returns {Promise<Layer>} Promise that resolves with the created layer
   */
  async createLayer(config) {
    const LayerClass = this.getLayerClass(config.type);
    
    const layerOptions = {
      url: config.url,
      id: config.id,
      title: config.title,
      visible: config.visible ?? false,
      opacity: config.opacity ?? 1.0
    };

    // Add sublayers if specified
    if (config.sublayers) {
      layerOptions.sublayers = config.sublayers;
    }

    // Add any additional options
    if (config.additionalOptions) {
      Object.assign(layerOptions, config.additionalOptions);
    }

    const layer = new LayerClass(layerOptions);

    try {
      await layer.load();
      this.layers.set(config.id, layer);
      return layer;
    } catch (error) {
      console.error(`Error loading layer ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Create a combined tile and feature layer
   * @param {Object} config - Layer configuration
   * @returns {Promise<Object>} Promise that resolves with the created layers
   */
  async createTileFeatureLayer(config) {
    try {
      // Create tile layer
      const tileLayer = await this.createLayer({
        type: 'tile',
        url: config.tileUrl,
        id: `${config.id}_tile`,
        title: config.title,
        visible: true,
        opacity: config.opacity,
        additionalOptions: {
          listMode: "hide-children",
          legendEnabled: false
        }
      });

      // Create feature layer
      const featureLayer = await this.createLayer({
        type: 'feature',
        url: config.featureUrl,
        id: `${config.id}_feature`,
        title: config.title,
        visible: true,
        opacity: config.opacity,
        additionalOptions: {
          minScale: config.scale,
          listMode: "hide"
        }
      });

      // Create group layer for both
      const groupLayer = new GroupLayer({
        title: config.title,
        id: config.id,
        layers: [tileLayer, featureLayer],
        opacity: config.opacity,
        visible: config.visible ?? false,
        listMode: "hide-children",
        url: config.tileUrl
      });

      if (config.downloadInfo) {
        groupLayer.downloadInfo = config.downloadInfo;
      }

      return {
        groupLayer,
        tileLayer,
        featureLayer
      };
    } catch (error) {
      console.error(`Error creating tile-feature layer ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Get the appropriate layer class based on type
   * @param {string} type - Layer type
   * @returns {typeof Layer} Layer class constructor
   */
  getLayerClass(type) {
    const layerClasses = {
      'map-image': MapImageLayer,
      'tile': TileLayer,
      'feature': FeatureLayer,
      'imagery': ImageryLayer,
      'group': GroupLayer
    };

    const LayerClass = layerClasses[type];
    if (!LayerClass) {
      throw new Error(`Unknown layer type: ${type}`);
    }

    return LayerClass;
  }

  /**
   * Add layer to appropriate legend collection
   * @param {Layer} layer - Layer to add
   * @param {string} type - Legend type ('surf' or 'main')
   */
  addToLegend(layer, type = 'main') {
    if (type === 'surf') {
      this.surfLegendLayers.push({ layer });
    } else {
      this.legendLayers.push({ layer });
    }
  }

  /**
   * Update layer visibility
   * @param {string} layerId - ID of layer to update
   * @param {boolean} visible - New visibility state
   */
  setLayerVisibility(layerId, visible) {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible = visible;
      
      // If making visible, ensure parent is visible
      if (visible && layer.parent) {
        layer.parent.visible = true;
      }
    }
  }

  /**
   * Update layer opacity
   * @param {string} layerId - ID of layer to update
   * @param {number} opacity - New opacity value
   */
  setLayerOpacity(layerId, opacity) {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.opacity = opacity;
    }
  }

  /**
   * Get a layer by ID
   * @param {string} layerId - ID of layer to get
   * @returns {Layer} The layer instance
   */
  getLayer(layerId) {
    return this.layers.get(layerId);
  }

  /**
   * Get a group layer by ID
   * @param {string} groupId - ID of group to get
   * @returns {GroupLayer} The group layer instance
   */
  getGroupLayer(groupId) {
    return this.groupLayers.get(groupId);
  }
}

// Export a function to initialize layers
export async function initializeLayers(map) {
  const layerManager = new LayerManager();
  return layerManager.initializeLayers(map);
}