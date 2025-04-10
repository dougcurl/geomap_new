const express = require('express');
const path = require('path');
const sql = require('mssql');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/kygeode/geomap_new', express.static(path.join(__dirname, 'public')));

// Database configuration for SQL Server
const dbConfig = {
  user: 'asp',
  password: 'Harrychapin1',
  server: 'kgssqlx.ad.uky.edu',
  database: 'CoGeReD',
  options: {
    encrypt: false, // Use this if you're on Windows Azure
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

// Test database connection
async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to SQL Server database');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

connectToDatabase();

// Using individual route files with module.exports = function(app, db) { ... }
const bookmarksRoutes = require('./routes/bookmarks');
//const identificationRoutes = require('./routes/identification');
//const legendRoutes = require('./routes/legend');

// Initialize routes
bookmarksRoutes(app, sql);
//identificationRoutes(app, sql);
//legendRoutes(app, sql);

// Catch-all route to serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});