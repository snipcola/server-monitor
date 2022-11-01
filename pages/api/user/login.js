const { setCookie } = require('cookies-next');
const { Response } = require('../../../lib/classes');

const { tables } = require('../../../lib/mysql/queries');
const { selectInTable } = require('../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();

    response.setResponse(res);

    if (req?.method === 'POST') {
        const { auth_token } = req?.body;

        if (!auth_token) return response.sendError('Invalid request.'); 

        const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'auth_token', [
            { name: 'auth_token', value: auth_token }
        ]);

        if (!authTokenExists) return response.sendError('Unauthorized.');

        const { auth_token: _auth_token } = userRows[0];

        if (!_auth_token) return response.sendError('Unexpected database response, try again.');

        setCookie('auth_token', _auth_token, { req, res, maxAge: 60 * 60 * 24 * 7 });
    }
    else return response.sendError(`Method '${req?.method}' not allowed.`);

    response.send();
};