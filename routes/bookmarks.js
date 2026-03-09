// routes/bookmarks.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getKgsGenericPool } = require('../database');


// Get all quick layouts (previously in bookmarkMap.asp with bm_list=true)
router.get('/quickLayouts', async (req, res) => {
  console.log('Received request for quick layouts');
  let pool;
  
  try {
    // Get a connection from the pool
    pool = await getKgsGenericPool();
    
    // Query for named layouts
    const result = await pool.request()
      .query('SELECT * FROM MapBookmarks WHERE LayoutName <> \'\' ORDER BY LayoutOrder, LayoutName');
    
    // Rest of your code remains the same
    
    if (!result.recordset || result.recordset.length === 0) {
      return res.json({ success: true, layouts: [] });
    }
    
    // Transform to client-friendly format
    const layouts = result.recordset.map(row => ({
      id: row.LayoutId,
      name: row.LayoutName || '',
      icon: row.LayoutIcon || '',
      link: row.LayoutLink || '',
      url: `https://kgs.uky.edu/kygeode/geomap/?layoutid=${row.LayoutId}`
    }));
    
    res.json({ success: true, layouts });
  } catch (err) {
    console.error('Error retrieving quick layouts:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message
    });
  }
});

// Create a new bookmark (previously in bookmarkMap.asp with createBM=true)
router.post('/create', async (req, res) => {
  try {
    const { bm_layers } = req.body;
    
    if (!bm_layers || !Array.isArray(bm_layers)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: bm_layers must be an array'
      });
    }
    
    const layerString = bm_layers.join('|');
    const pool = await sql.connect();
    
    // Check if bookmark already exists
    const existingResult = await pool.request()
      .input('layerString', sql.NVarChar, layerString)
      .query('SELECT * FROM MapBookmarks WHERE LayerString = @layerString');
    
    if (existingResult.recordset && existingResult.recordset.length > 0) {
      // Update existing bookmark
      const layoutId = existingResult.recordset[0].LayoutId;
      
      await pool.request()
        .input('layoutId', sql.Int, layoutId)
        .query('UPDATE MapBookmarks SET LayoutCount = LayoutCount + 1 WHERE LayoutId = @layoutId');
      
      return res.json({
        success: true,
        type: 'setbm',
        result: 'success',
        layoutid: layoutId
      });
    } else {
      // Create new bookmark
      const insertResult = await pool.request()
        .input('layerString', sql.NVarChar, layerString)
        .query(`
          INSERT INTO MapBookmarks (LayoutCount, LayoutUseCount, MapServiceName, LayerString) 
          VALUES (1, 1, 'geomap', @layerString);
          SELECT SCOPE_IDENTITY() AS LayoutId;
        `);
      
      const layoutId = insertResult.recordset[0].LayoutId;
      
      return res.json({
        success: true,
        type: 'setbm',
        result: 'success',
        layoutid: layoutId
      });
    }
  } catch (err) {
    console.error('Error creating bookmark:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message
    });
  }
});

// Get a bookmark by ID (previously in bookmarkMap.asp with layoutid parameter)
router.get('/:id', async (req, res) => {
  try {
    const layoutId = req.params.id;
    
    if (!layoutId || isNaN(parseInt(layoutId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid layout ID'
      });
    }
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('layoutId', sql.Int, layoutId)
      .query('SELECT * FROM MapBookmarks WHERE LayoutId = @layoutId');
    
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        type: 'getbm',
        result: 'error',
        errormsg: 'No bookmark found with this ID'
      });
    }
    
    // Increment usage count
    await pool.request()
      .input('layoutId', sql.Int, layoutId)
      .query('UPDATE MapBookmarks SET LayoutUseCount = LayoutUseCount + 1 WHERE LayoutId = @layoutId');
    
    res.json({
      success: true,
      type: 'getbm',
      result: 'success',
      layerstring: result.recordset[0].LayerString
    });
  } catch (err) {
    console.error('Error retrieving bookmark:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message
    });
  }
});

module.exports = router;