const { randomUUID } = require('crypto');
const { getCookie, deleteCookie } = require('cookies-next');

const { Response } = require('../../../lib/classes');

const { tables } = require('../../../lib/mysql/queries');
const { updateInTable } = require('../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();

    response.setResponse(res);

    if (req?.method === 'POST') {
        const auth_token = getCookie('auth_token', { req, res });

        if (!auth_token) return response.sendError('Invalid request.'); 

        const { error: updateUserError } = await updateInTable(tables.users, [
            { name: 'auth_token', value: randomUUID() }
        ], [
            { name: 'auth_token', value: auth_token }
        ]);

        if (updateUserError) return response.sendError(logError(updateUserError));

        deleteCookie('auth_token', { req, res });
    }
    else return response.sendError(`Method '${req?.method}' not allowed.`);

    response.send();
};