const { getCookie } = require('cookies-next');
const { randomUUID } = require('crypto');

const { plans } = require('../../../lib/config');
const { Response } = require('../../../lib/classes');
const { validateCaptcha, hashPassword, logError, daysUntil, getBody } = require('../../../lib/functions');

const { lengths, returnColumns } = require('../../../lib/user/config');
const {
    validateLength,
    validateUsername,
    validatePassword,
    invalidLength,
    invalidUsername,
    invalidPassword
}  = require('../../../lib/user/functions');

const { tables } = require('../../../lib/mysql/queries');
const { selectInTable, updateInTable, deleteFromTable } = require('../../../lib/mysql/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;
    
    response.setResponse(res);

    switch (method) {
        case 'GET': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';

            if (!auth_token) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, returnColumns?.join(', '), [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const user = userRows[0];
            const columns = Object.keys(user);
            const matchingColumns = columns?.map((c) => returnColumns.includes(c));

            if (matchingColumns?.includes(false)) return response.sendError('Unexpected database response, try again.');

            response.setData({ user });

            break;
        };
        
        case 'PUT': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';
            const { username, current_password, desired_password, captcha, plan } = getBody(req?.body);

            if (!auth_token || !(username || plan || (current_password && desired_password))) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists, data: { rows: userRows } } = await selectInTable(tables.users, 'password, salt, plus_expiry, premium_expiry', [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            if (username) {
                if (!validateLength(username, lengths.username)) response.addError(invalidLength('Username', lengths.username));
                else if (!validateUsername(username)) response.addError(invalidUsername);

                if (response.hasErrors()) return response.send();
                
                const { exists: userExists } = await selectInTable(tables.users, null, [
                    { name: 'UPPER(username)', value: username?.toUpperCase() }
                ]);
    
                if (userExists) return response.sendError('Username taken.');

                const { error: updateUserError } = await updateInTable(tables.users, [
                    { name: 'username', value: username }
                ], [
                    { name: 'auth_token', value: auth_token }
                ]);
    
                if (updateUserError) return response.sendError(logError(updateUserError));
            }
            else if (current_password && desired_password) {
                if (!await validateCaptcha(captcha)) return response.sendError('Invalid captcha.');

                if (!validateLength(desired_password, lengths.password)) response.addError(invalidLength('Password', lengths.password));
                else if (!validatePassword(desired_password)) response.addError(invalidPassword);

                if (response.hasErrors()) return response.send();

                const { password, salt } = userRows[0];

                if (!(password && salt)) return response.sendError('Unexpected database response, try again.');

                const { hashedPassword: providedPassword } = hashPassword(current_password, salt);
    
                if (providedPassword !== password) return response.sendError('Invalid Password.');

                const { hashedPassword, hashedSalt } = hashPassword(desired_password);

                const { error: updateUserError } = await updateInTable(tables.users, [
                    { name: 'auth_token', value: randomUUID() },
                    { name: 'password', value: hashedPassword },
                    { name: 'salt', value: hashedSalt }
                ], [
                    { name: 'auth_token', value: auth_token }
                ]);
    
                if (updateUserError) return response.sendError(logError(updateUserError));
            }
            else if (plan) {
                const foundPlan = plans?.find((p) => p?.toLowerCase() === plan?.toLowerCase());

                if (!foundPlan) return response.sendError('Invalid plan.');

                const updatePlan = async () => await updateInTable(tables.users, [
                    { name: 'subscription', value: foundPlan }
                ], [
                    { name: 'auth_token', value: auth_token }
                ]);

                if (!foundPlan?.toLowerCase()?.includes('free')) {
                    const { plus_expiry, premium_expiry } = userRows[0];

                    if (!(plus_expiry && premium_expiry)) return response.sendError('Unexpected database response, try again.');

                    const planExpires = daysUntil(foundPlan?.toLowerCase()?.includes('premium')
                        ? premium_expiry
                        : plus_expiry);

                    if (planExpires < 1) return response.sendError('No time remaining on plan.'); 
                };

                const { error: updatePlanError } = await updatePlan();

                if (updatePlanError) return response.sendError(logError(updatePlanError));
            };

            break;
        };

        case 'DELETE': {
            const auth_token = getCookie('auth_token', { req, res }) ?? '';

            if (!auth_token) return response.sendError('Invalid request.'); 

            const { exists: authTokenExists } = await selectInTable(tables.users, null, [
                { name: 'auth_token', value: auth_token }
            ]);

            if (!authTokenExists) return response.sendError('Unauthorized.');

            const { error: deleteUserError } = await deleteFromTable(tables.users, [
                { name: 'auth_token', value: auth_token }
            ]);

            if (deleteUserError) return response.sendError(logError(deleteUserError));

            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};