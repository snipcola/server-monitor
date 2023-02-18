const { getCookie } = require('cookies-next');

const { Response } = require('../../../../lib/classes');

const { tables } = require('../../../../lib/mysql/queries');
const { selectInTable } = require('../../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;
    
    response.setResponse(res);

    switch (method) {
        case 'GET': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';

            if (!auth_token) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];
            
            const { data: { rows: serversRows } } = await selectInTable(tables.linuxServers, '*', [
                { name: 'owner_id', value: user?.id }
            ]);

            response.addData({ servers: serversRows.map((s) => ({ type: 'linux', ...s })) });

            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};