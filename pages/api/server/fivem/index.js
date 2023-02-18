const { getCookie } = require('cookies-next');

const { Response } = require('../../../../lib/classes');
const { getBody, logError } = require('../../../../lib/functions');

const { getServers } = require('../../../../lib/server/functions');
const { lengths } = require('../../../../lib/user/config');

const { tables } = require('../../../../lib/mysql/queries');
const { selectInTable, insertIntoTable, deleteFromTable, updateInTable } = require('../../../../lib/mysql/functions');

const {
    validateLength,
    invalidLength,
    validateServerNickname,
    invalidServerNickname
}  = require('../../../../lib/user/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;

    response.setResponse(res);

    switch (method) {
        case 'POST': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { nickname, host, port, api_key } = getBody(req?.body);

            if (!auth_token || !nickname || !host || !port || !api_key) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            if (!validateLength(nickname, lengths.server_nickname)) response.addError(invalidLength('Nickname', lengths.server_nickname));
            else if (!validateServerNickname(nickname)) response.addError(invalidServerNickname);

            if (response.hasErrors()) return response.send();

            const servers = await getServers(user?.id);

            if (servers?.find((s) => s?.nickname === nickname)) return response.sendError('You already chose that nickname for another server.');

            const { exists: hostExists } = await selectInTable(tables.fivemServers, null, [
                { name: 'owner_id', value: user?.id, seperator: 'AND' },
                { name: 'host', value: host }
            ]);

            if (hostExists) return response.sendError('You already chose that host for another server.');

            let connected;

            try {
                connected = await (await (await fetch(`http://${host}:${port}/${api_key}/validate`))?.json())?.success
            }
            catch {
                return response.sendError('Failed to connect.');
            };

            if (!connected) return response.sendError('Invalid API Key.');

            const { error: failedServerCreation } = await insertIntoTable(tables.fivemServers, [
                { name: 'owner_id', value: user?.id },
                { name: 'nickname', value: nickname },
                { name: 'host', value: host },
                { name: 'port', value: port },
                { name: 'api_key', value: api_key }
            ]);

            if (failedServerCreation) return response.sendError(logError(failedServerCreation));
            
            break;
        };

        case 'DELETE': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { id } = getBody(req?.body);

            if (!auth_token || !id) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            const { exists: serverExists } = await selectInTable(tables.fivemServers, null, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (!serverExists) return response.sendError('Server does not exist.');

            const { error: failedServerDeletion } = await deleteFromTable(tables.fivemServers, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (failedServerDeletion) return response.sendError(logError(failedServerDeletion));
            
            break;
        };

        case 'PUT': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { id, nickname, host, port, api_key } = getBody(req?.body);

            if (!auth_token || !id || !nickname || !host || !port || !api_key) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            const { exists: serverExists } = await selectInTable(tables.fivemServers, null, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (!serverExists) return response.sendError('Server does not exist.');

            const servers = await getServers(user?.id);

            if (servers?.find((s) => s?.nickname === nickname && s?.id !== id)) return response.sendError('You already chose that nickname for another server.');
            if (servers?.find((s) => s?.host === host && s?.id !== id)) return response.sendError('You already chose that Host for another server.');

            if (!validateLength(nickname, lengths.server_nickname)) response.addError(invalidLength('Nickname', lengths.server_nickname));
            else if (!validateServerNickname(nickname)) response.addError(invalidServerNickname);

            if (response.hasErrors()) return response.send();

            let connected;

            try {
                connected = await (await (await fetch(`http://${host}:${port}/${api_key}/validate`))?.json())?.success
            }
            catch {
                return response.sendError('Failed to connect.');
            };

            if (!connected) return response.sendError('Invalid API Key.');

            const { error: failedServerUpdate } = await updateInTable(tables.fivemServers, [
                { name: 'nickname', value: nickname },
                { name: 'host', value: host },
                { name: 'port', value: port },
                { name: 'api_key', value: api_key },
                { name: 'manufacturer', value: 'PENDING' },
                { name: 'model', value: 'PENDING' },
                { name: 'serial', value: 'PENDING' },
                { name: 'bios_vendor', value: 'PENDING' },
                { name: 'bios_serial', value: 'PENDING' },
                { name: 'os_kernel', value: 'PENDING' },
                { name: 'os_build', value: 'PENDING' },
                { name: 'cpu_usage', value: 0 },
                { name: 'cpu_temperature', value: 0 },
                { name: 'ram_usage', value: 0 },
                { name: 'disk_used', value: 0 }
            ], [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (failedServerUpdate) return response.sendError(logError(failedServerUpdate));
            
            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};