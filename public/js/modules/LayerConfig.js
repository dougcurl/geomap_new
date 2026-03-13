/**
 * Layer configuration for the KGS Map Viewer
 * Layer order is from bottom to top 
 */

export const layerConfig = {
  rasterLayers: {
    id: 'group_raster',
    title: 'KYFromAbove Layers',
    url: 'https://kyfromabove.ky.gov/',
    visible: true,
    opacity: 1.0,
    legendEnabled: false,
    layers: [
      {
        type: 'map-image',
        id: 'rast_kySlope',
        title: 'KY Slope (from 10 meter DEM)',
        url: 'https://kgs.uky.edu/arcgis/rest/services/Base/KY_Slope/MapServer',
        visible: false,
        opacity: 1.0,
        sublayers: [{ id: 0, visible: true }]
      },
      {
        type: 'imagery',
        id: 'rast_kyImagery',
        title: 'KY NAIP Aerial 2022 (2 ft leaf on)',
        url: 'https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_NAIP_2022_2FT/ImageServer',
        visible: false,
        opacity: 1.0
      },
      {
        type: 'imagery',
        id: 'rast_kyImagery_KPED',
        title: 'KYAPED Aerial - leaf off (3 inch - 2020-2022)',
        url: 'https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_KYAPED_Phase3_3IN_WGS84WM/ImageServer',
        visible: false,
        opacity: 1.0
      },
      {
        type: 'imagery',
        id: 'rast_kyUSGSTopo2016',
        title: 'USGS Topographic Map Series (2016)',
        url: 'https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_USGS_Topographic_Maps_2016/ImageServer',
        visible: false,
        opacity: 1.0
      },
      {
        type: 'imagery',
        id: 'rast_kyUSGSTopo',
        title: 'USGS Topography DRG',
        url: 'https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_KRG/ImageServer',
        visible: false,
        opacity: 1.0
      },
      {
        type: 'imagery',
        id: 'rast_kyTopo',
        title: 'KY Topographic Map Series',
        url: 'https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_KyTopoMapSeries/ImageServer',
        visible: true,
        opacity: 1.0
      }
    ]
  },

  geologicLayers: {
    id: 'group_geo',
    title: 'Bedrock Geologic Map Layers',
    url: 'https://kgs.uky.edu/arcgis/rest/services/GeologicMapData',
    visible: true,
    opacity: 0.70,
    legendEnabled: false,
    layers: [
      {
        type: 'tile-feature',
        id: 'geol_24KGeoUnits_poly',
        title: '1:24,000 Geologic Units',
        tileUrl: 'https://kgs.uky.edu/arcgis/rest/services/GeologicMapData/KY24KGeologicFormations_WGS84/MapServer',
        featureUrl: 'https://kgs.uky.edu/arcgis/rest/services/GeologicMapData/KYGeoMap_Dyn_SmallScales/MapServer/6',
        visible: true,
        scale: 9027,
        addToLegend: true,
        downloadInfo: {
          url: 'https://kygs.maps.arcgis.com/home/item.html?id=6ed2218e73f945a29cf914af7668ff46',
          type: 'website'
        }
      },
      {
        type: 'tile-feature',
        id: 'geol_500KGeoUnits_poly',
        title: '1:500,000 Geologic Units',
        tileUrl: 'https://kgs.uky.edu/arcgis/rest/services/GeologicMapData/KY500KGeologicFormations_WGS84/MapServer',
        featureUrl: 'https://kgs.uky.edu/arcgis/rest/services/GeologicMapData/KYGeoMap_Dyn_SmallScales/MapServer/5',
        visible: false,
        scale: 9027
      },
      {
        type: 'map-image',
        id: 'geol_500KKarst_poly',
        title: '1:500,000 Karst Potential',
        url: 'https://kgs.uky.edu/arcgis/rest/services/GeologicMapData/KY500KKarstPotential_WGS84/MapServer',
        visible: false,
        opacity: 1.0
      }
    ]
  },

  waterLayers: {
    id: 'group_water',
    title: 'Water',
    url: 'https://www.uky.edu/KGS/water/',
    visible: false,
    legendEnabled: false,
    layers: [
      {
        type: 'map-image',
        id: 'kgs_WaterWells',
        title: 'Water Wells (KY Groundwater Repository)',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYWater/KYWaterWells_And_Springs/MapServer',
        visible: false,
        opacity: 0.8,
        sublayers: [
          { id: 1, visible: true },
          { id: 2, visible: true }
        ],
        addToLegend: true,
        downloadInfo: {
          url: 'https://kgs.uky.edu/kygeode/download/gwrepository/KYWaterWells_latest.zip',
          type: 'download',
          size: '25.4 MB',
          format: 'Shapefile and Excel (.zip)'
        }
      },
      {
        type: 'map-image',
        id: 'kgs_Springs',
        title: 'Springs (KY Groundwater Repository)',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYWater/KYWaterWells_And_Springs/MapServer',
        visible: false,
        opacity: 0.8,
        sublayers: [
          { id: 0, visible: true },
          { id: 3, visible: true }
        ],
        addToLegend: true,
        downloadInfo: {
          url: 'https://kgs.uky.edu/kygeode/download/gwrepository/KYSprings_latest.zip',
          type: 'download',
          size: '804 KB',
          format: 'Shapefile and Excel (.zip)'
        }
      },
      {
        type: 'map-image',
        id: 'kgs_DOFW',
        title: 'Subsurface Base of Fresh Groundwater in Cumberland Plateau',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYWater/BaseFreshGroundwater/MapServer',
        visible: false,
        opacity: 1.0,
        addToLegend: true,
        downloadInfo: {
          url: 'https://uknowledge.uky.edu/kgs_data/3/',
          type: 'website',
          size: '47 KB',
          format: 'Shapefile'
        }
      }
    ]
  },

  hazardLayers: {
    id: 'group_hazards',
    title: 'Hazards',
    url: 'https://www.uky.edu/KGS/landslide/',
    visible: false,
    legendEnabled: false,
    layers: [
      {
        type: 'tile',
        id: 'kgs_Sinkhole',
        title: 'KGS Sinkholes',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYWater/KYSinkholes_cached/MapServer',
        visible: false,
        opacity: 0.8,
        addToLegend: true,
        downloadInfo: {
          url: 'https://kygeoportal.ky.gov/geoportal/catalog/search/resource/details.page?uuid=%7BC5773977-859B-4FA7-941B-114144BC7A8F%7D',
          type: 'website'
        }
      },
      {
        type: 'map-image',
        id: 'kgs_SinkholeLiDAR',
        title: 'KGS LiDAR-derived Sinkholes',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYWater/LiDAR_Sinkholes/MapServer',
        visible: false,
        opacity: 0.8,
        addToLegend: true,
        downloadInfo: {
          url: 'https://kgs.uky.edu/kgsweb/download/gis/KYLiDARSinkholes.zip',
          type: 'download',
          size: '~170 MB',
          format: 'Shapefile - .zip'
        }
      },
      {
        type: 'group',
        id: 'group_landslide',
        title: 'KGS Landslide Inventory',
        visible: false,
        url: 'https://kgs.uky.edu/kgsmap/helpfiles/landslide_help.shtm',
        legendEnabled: false,
        downloadInfo: {
          url: 'https://uknowledge.uky.edu/kgs_data/7/',
          type: 'website',
          format: 'shapefile'
        },
        layers: [
          {
            type: 'map-image',
            id: 'kgs_landsl_inv',
            title: 'KGS landslide inventory data',
            url: 'https://kgs.uky.edu/arcgis/rest/services/Hazards/LandslideInformationMap/MapServer',
            visible: false,
            opacity: 0.8,
            sublayers: [{ id: 0, visible: true }],
            addToLegend: true
          }
        ]
      }
    ]
  },
  oilGasLayers: {
    id: 'group_og',
    title: 'Oil and Gas',
    url: 'https://www.uky.edu/KGS/emsweb/index.htm',
    visible: false,
    legendEnabled: false,
    layers: [
      {
        type: 'map-image',
        id: 'kgs_DevWells',
        title: 'KGS Deviated Oil and Gas Wells',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYOilGas/KYDeviatedWells_public/MapServer',
        visible: false,
        opacity: 0.8,
        downloadInfo: {
          url: 'https://kgs.uky.edu/kygeode/download/DeviatedWells.zip',
          type: 'download',
          size: '1.12 MB',
          format: 'Shapefile - .zip'
        }
      },
      {
        type: 'tile-feature',
        id: 'kgs_og_none',
        title: 'Oil and Gas Well By Type',
        tileUrl: 'https://kgs.uky.edu/arcgis/rest/services/KYOilGas_Cached/KYOilGasWells_RegSymbCached_WGS84/MapServer',
        featureUrl: 'https://kgs.uky.edu/arcgis/rest/services/KYOilGas/KYOilGasWells_static_WGS84/MapServer/1',
        visible: true,
        scale: 4000,
        addToLegend: true,
        downloadInfo: {
          url: 'https://www.uky.edu/KGS/emsweb/data/kyogshape.html',
          type: 'website'
        }
      },
      {
        type: 'group',
        id: 'kgs_OilGas',
        title: 'KGS Oil and Gas Wells',
        visible: false,
        opacity: 1.0,
        layers: [
          {
            type: 'map-image',
            id: 'kgs_og_api',
            title: 'Label Only - API Number',
            url: 'https://kgs.uky.edu/arcgis/rest/services/KYOilGas/KYOilGasWells_static_WGS84/MapServer',
            visible: false,
            sublayers: [{ id: 4, visible: true }]
          },
          {
            type: 'map-image',
            id: 'kgs_og_wellno',
            title: 'Label Only - Well Number',
            url: 'https://kgs.uky.edu/arcgis/rest/services/KYOilGas/KYOilGasWells_static_WGS84/MapServer',
            visible: false,
            sublayers: [{ id: 5, visible: true }]
          }
        ]
      }
    ]
  },      
  coalLayers: {
    id: 'group_coal',
    title: 'Coal',
    url: 'https://www.uky.edu/KGS/coal/',
    visible: false,
    legendEnabled: false,
    layers: [
      {
        type: 'map-image',
        id: 'kgs_CoalThickness',
        title: 'KGS Coal Thickness Measurements',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYCoal/KYCoalThickness/MapServer',
        visible: false,
        opacity: 0.8,
        addToLegend: true
      },
      {
        type: 'map-image',
        id: 'kgs_CoalBorehole',
        title: 'KGS Coal Boreholes',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYCoal/KYCoalBorehole/MapServer',
        visible: false,
        opacity: 0.8,
        addToLegend: true
      },
      {
        type: 'map-image',
        id: 'kgs_CoalPts',
        title: 'KGS Coal DVGQ Points',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYCoal/DVGQCoalPoints/MapServer',
        visible: false,
        opacity: 0.8,
        addToLegend: true
      }
    ]
  },      
  earlLayers: {
    id: 'group_earl',
    title: 'EARL Holdings',
    url: 'https://www.uky.edu/KGS/EARL/',
    visible: false,
    legendEnabled: false,
    layers: [
      {
        type: 'map-image',
        id: 'kgs_Cores',
        title: 'KGS Core Holdings',
        url: 'https://kgs.uky.edu/arcgis/rest/services/PointServices/KGSCoreHoldings/MapServer',
        visible: false,
        opacity: 0.8,
        sublayers: [
          { id: 0, visible: true },
          { id: 1, visible: true }
        ],
        addToLegend: true
      },
      {
        type: 'map-image',
        id: 'kgs_ogsamples',
        title: 'KGS Oil and Gas Samples',
        url: 'https://kgs.uky.edu/arcgis/rest/services/KYOilGas/KYOGSampleHoldings/MapServer',
        visible: false,
        opacity: 0.8,
        sublayers: [{ id: 2, visible: true }],
        addToLegend: true
      }
    ]
  },
  indexLayers: {
    id: 'group_index',
    title: 'KY Index Maps',
    url: 'https://kygeonet.ky.gov/',
    visible: false,
    legendEnabled: false,
    layers: [
      {
        type: 'map-image',
        id: 'kgs_PTCldX',
        title: 'KYAPED Point Cloud Tile Index',
        url: 'https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/KY_Data_Tiles_PointCloud_WGS84WM/MapServer',
        visible: false,
        opacity: 1.0,
        addToLegend: true
      },
      {
        type: 'map-image',
        id: 'kgs_KY5KDEM',
        title: 'KYAPED 5 Foot DEM Tile Index',
        url: 'https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/KY_Data_Tiles_DEM_WGS84WM/MapServer',
        visible: false,
        opacity: 1.0,
        addToLegend: true
      },
      {
        type: 'map-image',
        id: 'kgs_Grid',
        title: 'KY Topo and County',
        url: 'https://kgs.uky.edu/arcgis/rest/services/Base/KYQuadBoundaries/MapServer',
        visible: false,
        opacity: 1.0,
        addToLegend: true
      }
    ]
  }
};

// Define the order in which layers should be added to the map
export const layerOrder = [
  'group_raster',
  'group_geo',
  'group_water',
  'group_hazards', 
  'group_og',
  'group_coal',
  'group_earl',
  'group_index'
];

// Define layer scale dependencies 
export const layerScales = {
  tile: 9027,
  feature: 4000
};

// Define layer prefixes for type identification
export const layerPrefixes = {
  geologic: 'geol_',
  geologicPoly: '_poly',
  raster: 'rast_',
  kgs: 'kgs_', 
  ky: 'ky_'
};