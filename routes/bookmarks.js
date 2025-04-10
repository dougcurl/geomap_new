module.exports = function(app, db) {
    // Create bookmark
    app.post('/api/bookmarks/create', (req, res) => {
      const { layers } = req.body;
      const layerString = layers.join('|');
      
      // Check if bookmark already exists
      db.get('SELECT * FROM MapBookmarks WHERE LayerString = ?', [layerString], (err, row) => {
        if (err) {
          return res.json({ result: 'error', errormsg: err.message });
        }
        
        if (row) {
          // Update existing bookmark
          db.run('UPDATE MapBookmarks SET LayoutCount = LayoutCount + 1 WHERE LayoutId = ?', 
            [row.LayoutId], 
            function(err) {
              if (err) {
                return res.json({ result: 'error', errormsg: err.message });
              }
              
              res.json({ result: 'success', layoutId: row.LayoutId });
            });
        } else {
          // Create new bookmark
          db.run('INSERT INTO MapBookmarks (LayoutCount, MapServiceName, LayerString) VALUES (1, ?, ?)', 
            ['geomap', layerString], 
            function(err) {
              if (err) {
                return res.json({ result: 'error', errormsg: err.message });
              }
              
              res.json({ result: 'success', layoutId: this.lastID });
            });
        }
      });
    });
    
    // Get bookmark
    app.get('/api/bookmarks/:id', (req, res) => {
      const layoutId = req.params.id;
      
      db.get('SELECT * FROM MapBookmarks WHERE LayoutId = ?', [layoutId], (err, row) => {
        if (err) {
          return res.json({ result: 'error', errormsg: err.message });
        }
        
        if (!row) {
          return res.json({ result: 'error', errormsg: 'Bookmark not found' });
        }
        
        // Update use count
        db.run('UPDATE MapBookmarks SET LayoutUseCount = LayoutUseCount + 1 WHERE LayoutId = ?', [layoutId]);
        
        res.json({ result: 'success', layerString: row.LayerString });
      });
    });

    app.get('/api/bookmarks/quickLayouts', async (req, res) => {
      try {
        const pool = await sql.connect();
        const result = await pool.request()
          .query('SELECT * FROM MapBookmarks WHERE LayoutName <> \'\' ORDER BY LayoutOrder, LayoutName');
        
        res.json({ 
          success: true, 
          layouts: result.recordset 
        });
      } catch (err) {
        console.error('Error fetching quick layouts:', err);
        res.status(500).json({ 
          success: false, 
          error: 'Database error', 
          details: err.message 
        });
      }
    });
  };