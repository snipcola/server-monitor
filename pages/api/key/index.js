const { getCookie } = require('cookies-next');

const { Response } = require('../../../lib/classes');
const { daysUntil, addToDate } = require('../../../lib/functions');

const { tables } = require('../../../lib/mysql/queries');
const { selectInTable, deleteFromTable, updateInTable } = require('../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;

    response.setResponse(res);

    switch (method) {
        case 'DELETE': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { key } = req?.body;

            if (!auth_token || !key) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'plus_expiry, premium_expiry', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const { exists: keyExists, data: { rows: keyRows } } = await selectInTable(tables.keys, 'subscription', [
                { name: 'plan_key', value: key }
            ]);

            if (!keyExists) return response.sendError('Invalid key.');

            const { subscription } = keyRows[0];

            const { plus_expiry: plusExpiry, premium_expiry: premiumExpiry } = userRows[0];

            if (!(plusExpiry && premiumExpiry) || !subscription) return response.sendError('Unexpected database response, try again.');

            const isExpired = (expiry) => daysUntil(expiry) < 1 ? true : false;

            const plusExpired = isExpired(plusExpiry);
            const premiumExpired = isExpired(premiumExpiry);

            const { error: deleteKeyError } = await deleteFromTable(tables.keys, [
                { name: 'plan_key', value: key }
            ]);

            if (deleteKeyError) return response.sendError(logError(deleteKeyError));
            
            const updateUser = async () => await updateInTable(tables.users, subscription?.toLowerCase()?.includes('premium') ? [
                { name: 'premium_expiry', value: addToDate(premiumExpired ? 'now' : premiumExpiry, 1, 'M') }
            ] : [
                { name: 'plus_expiry', value: addToDate(plusExpired ? 'now' : plusExpiry, 1, 'M') }
            ], [
                { name: 'auth_token', value: auth_token }
            ]);

            const { error: updateUserError } = await updateUser();

            if (updateUserError) return response.sendError(logError(updateUserError));

            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};