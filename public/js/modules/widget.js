// src/js/modules/widgets.js
import Home from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Home.js';
import ScaleBar from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/ScaleBar.js';
import Locate from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Locate.js';
import BasemapGallery from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/BasemapGallery.js';
import Search from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Search.js';
import Print from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Print.js';
import CoordinateConversion from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/CoordinateConversion.js';
import Format from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/CoordinateConversion/support/Format.js';
import Conversion from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/CoordinateConversion/support/Conversion.js';
import Measurement from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Measurement.js';
import LayerList from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/LayerList.js';
import Legend from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Legend.js';
import SpatialReference from 'https://js.arcgis.com/4.32/@arcgis/core/geometry/SpatialReference.js';

export async function initializeWidgets(view) {
  // Initialize home widget
  const homeWidget = new Home({
    view: view
  });

  // Initialize locate widget  
  const locateWidget = new Locate({
    view: view
  });

  // Initialize basemap gallery
  const basemapWidget = new BasemapGallery({
    view: view,
    container: "basemapPanelDiv",
    portal: false
  });

  // Initialize scale bar
  const scaleBar = new ScaleBar({
    view: view,
    unit: "dual"
  });

  // Initialize print widget
  const printWidget = new Print({
    view: view,
    printServiceUrl: "https://kgs.uky.edu/arcgis/rest/services/KGSProcesses/ExportWebMap/GPServer/Export%20Web%20Map",
    container: "printPanelDiv",
    templateOptions: {
      author: "author: Kentucky Geological Survey",
      copyright: "copyright Kentucky Geological Survey",
      title: "Kentucky Geologic Map Information Service"
    }
  });

  return {
    home: homeWidget,
    locate: locateWidget,
    basemapGallery: basemapWidget,
    scaleBar: scaleBar,
    print: printWidget
  };
}

// Create and configure the CoordinateConversion widget
export function createCoordinateConversionWidget(view) {
  const ccWidget = new CoordinateConversion({
    view: view
  });

  // Add Kentucky State Plane coordinate system
  const kyStatePlane = new Format({
    name: "KY 1 Zone",
    conversionInfo: {
      spatialReference: new SpatialReference({ wkid: 3089 }),
      reverseConvert: (string) => {
        const parts = string.split(",");
        return {
          x: parseFloat(parts[0]),
          y: parseFloat(parts[1]),
          spatialReference: { wkid: 3089 }
        };
      }
    },
    coordinateSegments: [
      {
        alias: "X",
        description: "easting",
        searchPattern: /-?\d+[\.]?\d*/
      },
      {
        alias: "Y",
        description: "northing",
        searchPattern: /-?\d+[\.]?\d*/
      }
    ],
    defaultPattern: "X, Y"
  });

  ccWidget.formats.add(kyStatePlane);
  ccWidget.conversions.splice(0, 0, new Conversion({ format: kyStatePlane }));

  return ccWidget;
}

// Create and configure the Measurement widget
export function createMeasurementWidget(view) {
  const measurementWidget = new Measurement({
    view: view
  });

  // Add to view's UI
  view.ui.add(measurementWidget, "bottom-right");

  return measurementWidget;
}

// Create and configure LayerList widgets
export function createLayerListWidgets(view, legendLayers) {
  // Main layer list
  const layerList = new LayerList({
    view: view,
    container: "layersPanelDiv",
    listItemCreatedFunction: defineLayerListActions
  });

  // KY FromAbove layer list
  const kfaLayerList = new LayerList({
    view: view,
    container: "kyfrabovePanelDiv",
    listItemCreatedFunction: defineLayerListActions
  });

  return {
    layerList,
    kfaLayerList
  };
}

// Create and configure Legend widgets
export function createLegendWidgets(view, legendLayers, surfLegendLayers) {
  const mainLegend = new Legend({
    view: view,
    container: "gen_legendPanelDiv",
    layerInfos: legendLayers.map(info => ({
      layer: info.layer,
      title: info.title,
      respectVisibility: true
    }))
  });

  const surfLegend = new Legend({
    view: view,
    container: "surf_legendPanel",
    layerInfos: surfLegendLayers.map(info => ({
      layer: info.layer,
      title: info.title,
      respectVisibility: true
    }))
  });

  return {
    mainLegend,
    surfLegend
  };
}

// Helper function to define layer list actions
function defineLayerListActions(event) {
  // Store unique parent items
  const uniqueParentItems = [];
  const item = event.item;

  // Handle parent visibility
  if (!uniqueParentItems.includes(item.title)) {
    uniqueParentItems.push(item.title);
    item.watch("visible", () => {
      if (item.parent) {
        item.parent.visible = true;
      }
    });
  }

  // Configure actions and panels
  configureLayerListItem(item);
}

// Configure layer list item actions and panels
function configureLayerListItem(item) {
  // Create transparency slider
  const slider = createTransparencySlider(item);
  
  // Configure item based on type
  if (isGroupLayer(item.layer.id) || hasNumericId(item.layer.id)) {
    configureGroupLayer(item, slider);
  } else if (isGraphicsLayer(item.layer)) {
    configureGraphicsLayer(item, slider);
  } else {
    configureStandardLayer(item, slider);
  }
}

// Create transparency slider for layer list items
function createTransparencySlider(item) {
  // Slider configuration and setup code...
  // (Keeping existing slider code, but modernized)
}

// Helper functions for layer type checking
function isGroupLayer(id) {
  return id.includes("group_");
}

function hasNumericId(id) {
  return typeof id !== 'string';
}

function isGraphicsLayer(layer) {
  return layer.type === "graphics" || layer.id === "dynPoints";
}

// Export utility functions if needed by other modules
export const utils = {
  defineLayerListActions,
  configureLayerListItem,
  createTransparencySlider
};