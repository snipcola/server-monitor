const { getCookie } = require('cookies-next');

const { Response } = require('../../../../lib/classes');
const { getBody, logError, getRobloxGameInfo, getRobloxUniverseId } = require('../../../../lib/functions');

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
            const { nickname, place_id } = getBody(req?.body);

            if (!auth_token || !nickname || !place_id) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id, subscription', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            if (!validateLength(nickname, lengths.server_nickname)) response.addError(invalidLength('Nickname', lengths.server_nickname));
            else if (!validateServerNickname(nickname)) response.addError(invalidServerNickname);

            if (response.hasErrors()) return response.send();

            const universeId = await getRobloxUniverseId(place_id);

            if (!universeId) return response.sendError('Invalid Place Id.');

            const serversLimit = lengths.subscription.servers[user?.subscription];
            const servers = await getServers(user?.id);

            if (servers?.length >= serversLimit) return response.sendError('Server limit reached on your account.');
            if (servers?.find((s) => s?.nickname === nickname)) return response.sendError('You already chose that nickname for another server.');

            const { exists: placeIdExists } = await selectInTable(tables.robloxServers, null, [
                { name: 'owner_id', value: user?.id, seperator: 'AND' },
                { name: 'place_id', value: universeId }
            ]);

            if (placeIdExists) return response.sendError('You already chose that Place Id for another server.');

            const gameInfo = await getRobloxGameInfo(universeId);

            if (!gameInfo?.success) return response.sendError('Roblox API error, try again.');

            const { error: failedServerCreation } = await insertIntoTable(tables.robloxServers, [
                { name: 'owner_id', value: user?.id },
                { name: 'nickname', value: nickname },
                { name: 'place_id', value: place_id },
                { name: 'universe_id', value: universeId },
                { name: 'name', value: gameInfo?.name },
                { name: 'description', value: gameInfo?.description },
                { name: 'creator_name', value: gameInfo?.creator_name },
                { name: 'creator_type', value: gameInfo?.creator_type },
                { name: 'price', value: gameInfo?.price },
                { name: 'copying_allowed', value: gameInfo?.copying_allowed },
                { name: 'max_players', value: gameInfo?.max_players },
                { name: 'game_created', value: gameInfo?.game_created },
                { name: 'game_updated', value: gameInfo?.game_updated },
                { name: 'genre', value: gameInfo?.genre },
                { name: 'playing', value: gameInfo?.playing },
                { name: 'visits', value: gameInfo?.visits },
                { name: 'favorites', value: gameInfo?.favorites },
                { name: 'likes', value: gameInfo?.likes },
                { name: 'dislikes', value: gameInfo?.dislikes }
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

            const { exists: serverExists } = await selectInTable(tables.robloxServers, null, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (!serverExists) return response.sendError('Server does not exist.');

            const { error: failedServerDeletion } = await deleteFromTable(tables.robloxServers, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (failedServerDeletion) return response.sendError(logError(failedServerDeletion));
            
            break;
        };

        case 'PUT': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { id, nickname, place_id } = getBody(req?.body);

            if (!auth_token || !id || !nickname || !place_id) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'id', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];

            const { exists: serverExists } = await selectInTable(tables.robloxServers, null, [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: user?.id }
            ]);

            if (!serverExists) return response.sendError('Server does not exist.');

            const servers = await getServers(user?.id);

            if (servers?.find((s) => s?.nickname === nickname && s?.id !== nicknameId)) return response.sendError('You already chose that nickname for another server.');

            if (!validateLength(nickname, lengths.server_nickname)) response.addError(invalidLength('Nickname', lengths.server_nickname));
            else if (!validateServerNickname(nickname)) response.addError(invalidServerNickname);

            if (response.hasErrors()) return response.send();

            const universeId = await getRobloxUniverseId(place_id);

            if (!universeId) return response.sendError('Invalid Place Id.');

            const gameInfo = await getRobloxGameInfo(universeId);

            if (!gameInfo?.success) return response.sendError('Roblox API error, try again.');

            const { error: failedServerUpdate } = await updateInTable(tables.robloxServers, [
                { name: 'nickname', value: nickname },
                { name: 'place_id', value: place_id },
                { name: 'universe_id', value: universeId },
                { name: 'name', value: gameInfo?.name },
                { name: 'description', value: gameInfo?.description },
                { name: 'creator_name', value: gameInfo?.creator_name },
                { name: 'creator_type', value: gameInfo?.creator_type },
                { name: 'price', value: gameInfo?.price },
                { name: 'copying_allowed', value: gameInfo?.copying_allowed },
                { name: 'max_players', value: gameInfo?.max_players },
                { name: 'game_created', value: gameInfo?.game_created },
                { name: 'game_updated', value: gameInfo?.game_updated },
                { name: 'genre', value: gameInfo?.genre },
                { name: 'playing', value: gameInfo?.playing },
                { name: 'visits', value: gameInfo?.visits },
                { name: 'favorites', value: gameInfo?.favorites },
                { name: 'likes', value: gameInfo?.likes },
                { name: 'dislikes', value: gameInfo?.dislikes }
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