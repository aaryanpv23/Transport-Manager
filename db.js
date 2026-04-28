const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // Usually 'root'
  password: 'aaryan@2310', // REPLACE with your actual MySQL password
  database: 'transportmanager' // REPLACE with your DB name
});

// Using promises allows us to use 'async/await' for cleaner code
module.exports = pool.promise();
