export const databaseSettings = {
    host: process.env.NODE_ENV === 'development'
        ? '172.104.136.151'
        : 'localhost',
    port: '3306',
    user: 'admin',
    password: '6KGyZs1NUE',
    database: 'servermonitor'
};

export const poolSettings = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};