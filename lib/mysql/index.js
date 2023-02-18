const mysql = require('mysql2/promise');
const { databaseSettings, poolSettings } = require('../../../config');

if (!global.pool) global.pool = mysql.createPool({ ...databaseSettings, ...poolSettings });

export const pool = global.pool;