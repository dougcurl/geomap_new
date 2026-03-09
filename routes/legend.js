const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get legend data (previously in legend.asp)
router.get('/', async (req, res) => {
  try {
    const { mapXmin, mapYmin, mapXmax, mapYmax } = req.query;
    
    // Validate coordinates
    if (!mapXmin || !mapYmin || !mapXmax || !mapYmax || 
        isNaN(parseFloat(mapXmin)) || isNaN(parseFloat(mapYmin)) || 
        isNaN(parseFloat(mapXmax)) || isNaN(parseFloat(mapYmax))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid map extent coordinates'
      });
    }
    
    const pool = await sql.connect();
    
    // Query for 24K units
    const sql24K = `
      SELECT ma.AreaDescription, su.*, ma.AreaType, ma.start_left, ma.start_right, ma.start_top, ma.start_bottom 
      FROM (MapAreas AS ma INNER JOIN DescriptionSource AS ds ON ma.MapAreaId = ds.MapAreaId) INNER JOIN
      (GeologicUnit AS gu INNER JOIN StratigraphicUnit AS su ON gu.DVGQCode = su.FMcode) ON ds.SourceId = gu.SourceId
      WHERE ((((ma.AreaType)='7.5-minute quadrangle') OR (ma.AreaType)='Combined Quadrangle') AND 
      ((ma.start_left)<=${mapXmax}) AND ((ma.start_right)>=${mapXmin}) AND 
      ((ma.start_top)>=${mapYmin}) AND ((ma.start_bottom)<=${mapYmax}) AND ((ma.MapAreaId) Is Not Null))
      ORDER BY su.UpperHorizon, su.LowerHorizon DESC, su.FMCODE
    `;
    
    const result24K = await pool.request().query(sql24K);
    
    // Query for 500K units
    const sql500K = `
      SELECT ma.AreaDescription, su.*, ma.AreaType, ma.start_left, ma.start_right, ma.start_top, ma.start_bottom 
      FROM (MapAreas AS ma INNER JOIN DescriptionSource AS ds ON ma.MapAreaId = ds.MapAreaId) INNER JOIN
      (GeologicUnit AS gu INNER JOIN StratigraphicUnit AS su ON gu.DVGQCode = su.FMcode) ON ds.SourceId = gu.SourceId
      WHERE (((ma.AreaType)='Region') AND 
      ((ma.start_left)<=${mapXmax}) AND ((ma.start_right)>=${mapXmin}) AND 
      ((ma.start_top)>=${mapYmin}) AND ((ma.start_bottom)<=${mapYmax}) AND ((ma.MapAreaId) Is Not Null))
      ORDER BY su.UpperHorizon, su.LowerHorizon DESC, su.FMCODE
    `;
    
    const result500K = await pool.request().query(sql500K);
    
    // Process results into appropriate format
    const legendData = {
      geo_units: {
        '24K': processGeoUnits(result24K.recordset),
        '500K': processGeoUnits(result500K.recordset)
      },
      dom_litho: {
        '24K': processDomLitho(result24K.recordset),
        '500K': processDomLitho(result500K.recordset)
      }
    };
    
    res.json({
      success: true,
      legendData
    });
  } catch (err) {
    console.error('Error retrieving legend data:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message
    });
  }
});

// Helper function to process geo units data
function processGeoUnits(records) {
  const units = [];
  const uniqueCodes = new Set();
  
  records.forEach(record => {
    if (!uniqueCodes.has(record.FMcode)) {
      uniqueCodes.add(record.FMcode);
      
      units.push({
        code: record.FMcode,
        name: record.UnitName,
        label: record.UnitLabel,
        colorR: record.BR,
        colorG: record.BG,
        colorB: record.BB,
        maxAge: record.MaximumAge,
        minAge: record.MinimumAge
      });
    }
  });
  
  return units;
}

// Helper function to process dominant lithology data
function processDomLitho(records) {
  const lithoUnits = [];
  const uniqueLitho = new Set();
  
  records.forEach(record => {
    if (record.DominantLithology && !uniqueLitho.has(record.DominantLithology)) {
      uniqueLitho.add(record.DominantLithology);
      
      lithoUnits.push({
        lithology: record.DominantLithology,
        colorR: record.LR,
        colorG: record.LG,
        colorB: record.LB
      });
    }
  });
  
  return lithoUnits;
}

module.exports = router;