const { randomUUID } = require('crypto');

const { Response } = require('../../../lib/classes');

const { validateCaptcha, generateRandomNumber, seperateNumber, logError, hashPassword, getBody } = require('../../../lib/functions');
const { isIPAddress } = require('ip-address-validator');

const { lengths } = require('../../../lib/user/config');
const {
    validateLength,
    validatePassword,
    invalidLength,
    invalidPassword
}  = require('../../../lib/user/functions');

const { tables } = require('../../../lib/mysql/queries');
const { selectInTable, insertIntoTable, deleteFromTable, updateInTable } = require('../../../lib/mysql/functions');

const { sendgridSettings: { emails: { forgotPassword: forgotPasswordEmail } } } = require('../../../../config');
const { sendEmail } = require('../../../lib/sendgrid/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;

    response.setResponse(res);

    switch (method) {
        case 'POST': {
            const { email, captcha, ip } = getBody(req?.body);

            if (!(email && ip)) return response.sendError('Invalid request.');
            if (!await validateCaptcha(captcha)) return response.sendError('Invalid captcha.');
            if (!isIPAddress(ip)) return response.sendError('Invalid IP Address.');
            
            const { exists: userExists, data: { rows: userRows } } = await selectInTable(tables.users, 'username', [
                { name: 'UPPER(email)', value: email?.toUpperCase() }
            ]);

            const { exists: forgotPasswordExists } = await selectInTable(tables.forgotPasswords, null, [
                { name: 'UPPER(email)', value: email?.toUpperCase(), seperator: 'AND' },
                { name: 'UPPER(ip)', value: ip?.toUpperCase() }
            ]);

            if (!userExists) return response.sendError('Invalid email address.');
            if (forgotPasswordExists) return response.sendError('Already started reset, check your email address (incl. spam folder).')

            const code = generateRandomNumber(6);
            const codeString = seperateNumber(code, '-');

            const resetEmail = forgotPasswordEmail(email, userRows[0]?.username, code, codeString);
            const { error: failedToSendEmail } = await sendEmail(resetEmail);

            if (failedToSendEmail) return response.sendError(logError(failedToSendEmail));
            
            const { error: failedForgotPasswordCreation } = await insertIntoTable(tables.forgotPasswords, [
                { name: 'email', value: email },
                { name: 'ip', value: ip },
                { name: 'code', value: code }
            ]);

            if (failedForgotPasswordCreation) return response.sendError(logError(failedForgotPasswordCreation));

            break;
        };

        case 'DELETE': {
            const { email, password, captcha, code, ip } = getBody(req?.body);

            if (!(email && password && code && ip)) return response.sendError('Invalid request.');
            if (!await validateCaptcha(captcha)) return response.sendError('Invalid captcha.');
            if (!isIPAddress(ip)) return response.sendError('Invalid IP Address.');
            
            const { exists: forgotPasswordExists } = await selectInTable(tables.forgotPasswords, null, [
                { name: 'UPPER(email)', value: email?.toUpperCase(), seperator: 'AND' },
                { name: 'UPPER(ip)', value: ip?.toUpperCase(), seperator: 'AND' },
                { name: 'UPPER(code)', value: code?.replace(/\D/g, '') }
            ]);

            if (!forgotPasswordExists) return response.sendError('Invalid email or ip address, or unauthorized.');

            if (!validateLength(password, lengths.password)) response.addError(invalidLength('Password', lengths.password));
            else if (!validatePassword(password)) response.addError(invalidPassword);

            if (response.hasErrors()) return response.send();

            const { hashedPassword, hashedSalt } = hashPassword(password);

            const { error: forgotPasswordDeletionError } = await deleteFromTable(tables.forgotPasswords, [
                { name: 'UPPER(email)', value: email?.toUpperCase() }
            ]);

            const { error: userUpdateError } = await updateInTable(tables.users, [
                { name: 'auth_token', value: randomUUID() },
                { name: 'password', value: hashedPassword },
                { name: 'salt', value: hashedSalt }
            ], [
                { name: 'UPPER(email)', value: email?.toUpperCase() }
            ]);

            if (forgotPasswordDeletionError) return response.sendError(logError(forgotPasswordDeletionError));
            if (userUpdateError) return response.sendError(logError(userUpdateError));

            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};