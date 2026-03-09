const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get geological description (previously in geolDescId.asp)
router.get('/', async (req, res) => {
  try {
    const { fmcode, gq_num, map_type, map_level } = req.query;
    
    if (!fmcode || !map_type || !map_level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }
    
    let description = '';
    const pool = await sql.connect();
    
    if (map_level.toUpperCase() === '24K') {
      // Build query for 24K descriptions
      const query = `
        SELECT view_gqunits_description_stratranks.* 
        FROM view_gqunits_description_stratranks 
        WHERE (((DVGQCode)='${fmcode}') AND ((SourceCode)='GQ-${gq_num}')) 
        ORDER BY SourceCode DESC, UpperHorizon, LowerHorizon DESC
      `;
      
      const result = await pool.request().query(query);
      
      if (result.recordset && result.recordset.length > 0) {
        description = processDescriptions(result.recordset, map_type);
      } else {
        description = "<ul style='margin-top: 5px; margin-bottom: 5px;'><li><b>no description(s) found for geologic unit(s) at this location</b></ul>";
      }
    } else {
      // Build query for 500K descriptions
      const query = `
        SELECT gu.*, ds.*, su_dvgq.*, su_strat.UpperHorizon AS strat_UH
        FROM (StratigraphicUnit AS su_dvgq RIGHT JOIN (DescriptionSource AS ds RIGHT JOIN GeologicUnit AS gu ON ds.SourceId = gu.SourceId) ON su_dvgq.FMcode = gu.DVGQCode)
        LEFT JOIN StratigraphicUnit AS su_strat ON gu.StratCode = su_strat.FMcode
        WHERE ((su_dvgq.FMcode)='${fmcode}') OR ((su_dvgq.FMcode)='-99999') AND ((ds.MapAreaId)='R001') 
        ORDER BY ds.SourceCode DESC, su_dvgq.UpperHorizon, su_dvgq.LowerHorizon DESC
      `;
      
      const result = await pool.request().query(query);
      
      if (result.recordset && result.recordset.length > 0) {
        description = process500KDescriptions(result.recordset, map_type);
      } else {
        description = "<ul style='margin-top: 5px; margin-bottom: 5px;'><li><b>no description(s) found for geologic unit(s) at this location</b></ul>";
      }
    }
    
    // Send the HTML description directly (like the original ASP page)
    res.send(`<div style='padding-left:15px;'>${description}</div>`);
    
  } catch (err) {
    console.error('Error retrieving geologic description:', err);
    res.status(500).send("<div class='error'>Error retrieving description data</div>");
  }
});

// Process description records into HTML (implement this function)
function processDescriptions(records, mapType) {
  // Implement this based on your ASP page logic
  let html = '';
  
  // Example implementation - you'll need to adapt this to match your existing logic
  records.forEach(record => {
    html += `<div>
      <h3>${record.UnitName}</h3>
      <p>${record.Description || 'No description available'}</p>
    </div>`;
  });
  
  return html;
}

// Process 500K description records (implement this function)
function process500KDescriptions(records, mapType) {
  // Implement based on your ASP page logic
  // Similar to the processDescriptions function
  return "500K descriptions processing not yet implemented";
}

module.exports = router;