const { getCookie } = require('cookies-next');

const { Response } = require('../../../../lib/classes');
const { getBody, logError } = require('../../../../lib/functions');


const { getServers } = require('../../../../lib/server/functions');
const { lengths } = require('../../../../lib/user/config');

const { tables } = require('../../../../lib/mysql/queries');
const { selectInTable, insertIntoTable, deleteFromTable, updateInTable } = require('../../../../lib/mysql/functions');

const { isIPAddress } = require('ip-address-validator');

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
            const { nickname, ip_address } = getBody(req?.body);

            if (!auth_token || !nickname || !ip_address) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id, subscription', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            if (!validateLength(nickname, lengths.server_nickname)) response.addError(invalidLength('Nickname', lengths.server_nickname));
            else if (!validateServerNickname(nickname)) response.addError(invalidServerNickname);

            if (response.hasErrors()) return response.send();

            if (!isIPAddress(ip_address)) return response.sendError('Invalid Server IP Address.');

            const serversLimit = lengths.subscription.servers[user?.subscription];
            const servers = await getServers(user?.id);

            if (servers?.length >= serversLimit) return response.sendError('Server limit reached on your account.');

            const { exists: nicknameExists } = await selectInTable(tables.ipServers, null, [
                { name: 'owner_id', value: user?.id, seperator: 'AND' },
                { name: 'nickname', value: nickname }
            ]);

            if (nicknameExists) return response.sendError('You already chose that nickname for another server.');

            const { exists: ipAddressExists } = await selectInTable(tables.ipServers, null, [
                { name: 'owner_id', value: user?.id, seperator: 'AND' },
                { name: 'ip_address', value: ip_address }
            ]);

            if (ipAddressExists) return response.sendError('You already chose that IP Address for another server.');

            const { error: failedServerCreation } = await insertIntoTable(tables.ipServers, [
                { name: 'owner_id', value: user?.id },
                { name: 'nickname', value: nickname },
                { name: 'ip_address', value: ip_address }
            ]);

            if (failedServerCreation) return response.sendError(logError(failedServerCreation));
            
            break;
        };

        case 'DELETE': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { id } = getBody(req?.body);

            if (!auth_token || !id) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id, subscription', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            const { exists: serverExists } = await selectInTable(tables.ipServers, null, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (!serverExists) return response.sendError('Server does not exist.');

            const { error: failedServerDeletion } = await deleteFromTable(tables.ipServers, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (failedServerDeletion) return response.sendError(logError(failedServerDeletion));
            
            break;
        };

        case 'PUT': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { id, nickname, ip_address } = getBody(req?.body);

            if (!auth_token || !id || !nickname || !ip_address) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id, subscription', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            const { exists: serverExists } = await selectInTable(tables.ipServers, null, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (!serverExists) return response.sendError('Server does not exist.');

            if (!validateLength(nickname, lengths.server_nickname)) response.addError(invalidLength('Nickname', lengths.server_nickname));
            else if (!validateServerNickname(nickname)) response.addError(invalidServerNickname);

            if (response.hasErrors()) return response.send();

            if (!isIPAddress(ip_address)) return response.sendError('Invalid Server IP Address.');

            const { error: failedServerUpdate } = await updateInTable(tables.ipServers, [
                { name: 'nickname', value: nickname },
                { name: 'ip_address', value: ip_address }
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