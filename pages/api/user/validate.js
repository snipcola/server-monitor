const { randomUUID } = require('crypto');
const { Response } = require('../../../lib/classes');

const { validateCaptcha, logError, hashPassword } = require('../../../lib/functions');

const { tables } = require('../../../lib/mysql/queries');
const { selectInTable, updateInTable } = require('../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();

    response.setResponse(res);

    if (req?.method === 'POST') {
        const { email, password, captcha } = JSON.parse(req?.body);

        if (!(email && password)) return response.sendError('Invalid request.'); 
        if (!await validateCaptcha(captcha)) return response.sendError('Invalid captcha.');
        
        const { exists: userExists, data: { error: userError, rows: userRows } } = await selectInTable(tables.users, 'password, salt', [
            { name: 'UPPER(email)', value: email?.toUpperCase() }
        ]);

        if (userError) return response.sendError(logError(userError));
        if (!userExists) return response.sendError('Invalid email address.');
        if (userRows.length < 1) return response.sendError('Unexpected database error, try again')
        
        const { password: validPassword, salt } = userRows[0];
        const { hashedPassword } = hashPassword(password ?? '', salt);

        if (validPassword !== hashedPassword) return response.sendError('Invalid password.');

        const auth_token = randomUUID();

        const { error: updateUserError } = await updateInTable(tables.users, [
            { name: 'auth_token', value: auth_token }
        ], [
            { name: 'UPPER(email)', value: email?.toUpperCase() }
        ]);

        if (updateUserError) return response.sendError(logError(updateUserError));

        response.setData({ auth_token: auth_token });
    }
    else return response.sendError(`Method '${req?.method}' not allowed.`);

    response.send();
};