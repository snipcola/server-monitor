const { logError } = require('../../../../lib/functions');

const { createDatabase, deleteDatabase, tables, selectInTable: selectQuery } = require('../../../../lib/mysql/queries');
const { multiQueryDatabase } = require('../../../../lib/mysql/functions');

const { config } = require('../../../../lib/config');
const { Response } = require('../../../../lib/classes');

export default async (req, res) => {
    const response = new Response();
    const { action, secret } = req?.query;

    response.setResponse(res);

    if (req?.method === 'GET') {
        const query = {
            create: createDatabase,
            delete: deleteDatabase
        };

        if (action === 'view' && secret === config?.secret) {
            const queries = Object.values(tables)?.map((t) => selectQuery(t, '*'));
            const { rows: databaseRows, error: databaseError } = await multiQueryDatabase(queries);

            if (databaseError) return response.sendError(logError(databaseError));
            
            response.setData({ database: databaseRows?.map((rows, idx) => ({ table: Object.values(tables)[idx] ?? false, rows })) });
        }
        else {
            if (!query[action] || secret !== config?.secret) return response.sendError('Invalid/unauthorized request.');
        
            const { rows, error } = await multiQueryDatabase(query[action]);

            if (error) return response.sendError(logError(error));

            response.setData({ affectedRows: rows?.length });
        };
    }
    else return response.sendError(`Method '${req?.method}' not allowed.`);

    response.send();
};