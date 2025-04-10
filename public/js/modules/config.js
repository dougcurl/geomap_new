export const config = {
  map: {
      center: [-85.8, 38],
      zoom: 7,
      basemap: "gray-vector",
      viewPadding: {
          top: 50,
          bottom: 0
      },
      uiComponents: ["zoom", "locate", "attribution"]
  },

  apiKey: "AAPKc40d0f23216b4adda279ba7d2cd244b4-UxSjQgDUtHodeQIaypPAGvY0yIyevQDCPzeXPjhsDk6PUJiGKFBaMsxpuGdRy94",

  services: {
      geometry: "https://kgs.uky.edu/arcgis/rest/services/Utilities/Geometry/GeometryServer",
      print: "https://kgs.uky.edu/arcgis/rest/services/KGSProcesses/ExportWebMap/GPServer/Export%20Web%20Map"
  },

  // Layer scale thresholds
  scales: {
      tile: 9027,
      feature: 4000
  },

  // Panel configurations
  panels: {
      about: {
          title: "About",
          icon: "information"
      },
      tools: {
          title: "Tools",
          icon: "tools"
      },
      layers: {
          title: "Layers",
          icon: "layers"
      },
      legend: {
          title: "Legend",
          icon: "legend"
      },
      print: {
          title: "Print",
          icon: "print"
      }
  }
};

// Error messages
export const errors = {
  browser: `
      <p><b>Browser Support:</b> All modern and up-to-date browsers are supported (Chrome, Firefox, Microsoft Edge, Safari).
      Only WebGL-enabled browsers are supported (up-to-date browsers listed above have this feature). 
      Support for Internet Explorer 11 is deprecated.</p>
      
      <p>Microsoft recommends using Microsoft Edge. 
      <a href='https://developers.arcgis.com/javascript/latest/guide/system-requirements/' target='_blank'>
          View requirements for more information and supported browsers
      </a></p>

      <p>The previous version is available at 
      <a href='https://kgs.uky.edu/kgsmap/kgsgeoserver_dep' target='_blank'>
          https://kgs.uky.edu/kgsmap/kgsgeoserver_dep
      </a></p>
  `
};

// Layer naming conventions
export const layerPrefixes = {
  geologic: "geol_",
  geologicPoly: "_poly",
  raster: "rast_",
  kgs: "kgs_",
  ky: "ky_"
};