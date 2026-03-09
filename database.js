const sql = require('mssql');
require('dotenv').config();

// Database configurations
const kgsGenericConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30000
  }
};

const cogeredConfig = {
  user: process.env.COGERED_DB_USER,
  password: process.env.COGERED_DB_PASSWORD,
  server: process.env.COGERED_DB_SERVER,
  database: process.env.COGERED_DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30000
  }
};

// On-demand connection pools
const getKgsGenericPool = async () => {
  try {
    // Create the pool if it doesn't exist or if it's closed
    if (!global.kgsGenericPool) {
      global.kgsGenericPool = new sql.ConnectionPool(kgsGenericConfig);
      await global.kgsGenericPool.connect();
      //console.log('Connected to KGS_Generic database');
    } else if (global.kgsGenericPool.connected === false) {
      // Try to reconnect if the pool exists but the connection is closed
      await global.kgsGenericPool.connect();
      //console.log('Reconnected to KGS_Generic database');
    }
    
    return global.kgsGenericPool;
  } catch (err) {
    console.error('Error connecting to KGS_Generic database:', err);
    throw err;
  }
};

const getCogeredPool = async () => {
  try {
    // Create the pool if it doesn't exist or if it's closed
    if (!global.cogeredPool) {
      global.cogeredPool = new sql.ConnectionPool(cogeredConfig);
      await global.cogeredPool.connect();
      //console.log('Connected to CoGeReD database');
    } else if (global.cogeredPool.connected === false) {
      // Try to reconnect if the pool exists but the connection is closed
      await global.cogeredPool.connect();
      //console.log('Reconnected to CoGeReD database');
    }
    
    return global.cogeredPool;
  } catch (err) {
    //console.error('Error connecting to CoGeReD database:', err);
    throw err;
  }
};

module.exports = {
  getKgsGenericPool,
  getCogeredPool
};