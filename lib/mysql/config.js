export const databaseSettings = {
    host: process.env.NODE_ENV === 'development'
        ? '139.162.197.13'
        : 'localhost',
    port: '3306',
    user: 'admin',
    password: '9ns,rz$*V:/nAdcRd5wsB(kx(MAI4{',
    database: 'servermonitor'
};

export const poolSettings = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};