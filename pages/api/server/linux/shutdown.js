const { getCookie } = require('cookies-next');

const { Response } = require('../../../../lib/classes');
const { getBody } = require('../../../../lib/functions');

const { tables } = require('../../../../lib/mysql/queries');
const { selectInTable } = require('../../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;

    response.setResponse(res);

    switch (method) {
        case 'POST': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { id } = getBody(req?.body);

            if (!auth_token || !id) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const { data: { rows: [{ host, port, api_key }] } } = await selectInTable(tables.linuxServers, 'host, port, api_key', [
                { name: 'id', value: id }
            ]);

            if (!host || !port || !api_key) return response.sendError('Invalid request.'); 

            let connected;

            try {
                connected = await (await (await fetch(`http://${host}:${port}/${api_key}/validate`))?.json())?.success
            }
            catch {
                return response.sendError('Failed to connect.');
            };

            if (!connected) return response.sendError('Invalid API Key.');

            let shutdown;

            try {
                shutdown = await (await (await fetch(`http://${host}:${port}/${api_key}/shutdown`))?.json())?.success
            }
            catch {
                return response.sendError('Failed to connect.');
            };

            if (!shutdown) return response.sendError('Failed to shutdown.');
            
            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};