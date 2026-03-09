// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Import routes
const bookmarksRouter = require('./routes/bookmarks');
const legendRouter = require('./routes/legend');
const geolDescRouter = require('./routes/geolDesc');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/kygeode/geomap_new', express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/kygeode/geomap_new/api/bookmarks', bookmarksRouter);
app.use('/kygeode/geomap_new/api/legend', legendRouter);
app.use('/kygeode/geomap_new/api/geolDesc', geolDescRouter);

// Catch-all route to serve the main app
app.get('/kygeode/geomap_new/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
/*
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
*/