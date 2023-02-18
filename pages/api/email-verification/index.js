const { randomUUID } = require('crypto');
const { Response } = require('../../../lib/classes');

const { validateCaptcha, generateRandomNumber, seperateNumber, hashPassword, logError, getBody } = require('../../../lib/functions');
const { isIPAddress } = require('ip-address-validator');

const { lengths } = require('../../../lib/user/config');
const {
    validateLength,
    validateEmail,
    validateUsername,
    validatePassword,
    invalidLength,
    invalidEmail,
    invalidUsername,
    invalidPassword
}  = require('../../../lib/user/functions');

const { tables } = require('../../../lib/mysql/queries');
const { selectInTable, insertIntoTable, deleteFromTable } = require('../../../lib/mysql/functions');

const { sendgridSettings: { emails: { registered: registeredEmail } } } = require('../../../../config');
const { sendEmail } = require('../../../lib/sendgrid/functions');

export default async (req, res) => {
    const response = new Response();
    const method = req?.method;

    response.setResponse(res);

    switch (method) {
        case 'POST': {
            const { email, username, password, captcha, ip } = getBody(req?.body);

            if (!(email && username && password && ip)) return response.sendError('Invalid request.');
            if (!await validateCaptcha(captcha)) return response.sendError('Invalid captcha.');
            if (!isIPAddress(ip)) return response.sendError('Invalid IP Address.');
           
            const { exists: userExists } = await selectInTable(tables.users, null, [
                { name: 'UPPER(email)', value: email?.toUpperCase(), seperator: 'OR' },
                { name: 'UPPER(username)', value: username?.toUpperCase() }
            ]);

            const { exists: emailVerificationExists } = await selectInTable(tables.emailVerifications, null, [
                { name: 'UPPER(email)', value: email?.toUpperCase(), seperator: 'OR' },
                { name: 'UPPER(ip)', value: ip?.toUpperCase() }
            ]);

            if (userExists) return response.sendError('Already completed registration.');
            if (emailVerificationExists) return response.sendError('Already started registration, check your email address (incl. spam folder).');
            
            if (!validateLength(email, lengths.email)) response.addError(invalidLength('Email', lengths.email));
            else if (!validateEmail(email)) response.addError(invalidEmail);

            if (!validateLength(username, lengths.username)) response.addError(invalidLength('Username', lengths.username));
            else if (!validateUsername(username)) response.addError(invalidUsername);
            
            if (!validateLength(password, lengths.password)) response.addError(invalidLength('Password', lengths.password));
            else if (!validatePassword(password)) response.addError(invalidPassword);

            if (response.hasErrors()) return response.send();

            const { hashedPassword, hashedSalt } = hashPassword(password);

            const code = generateRandomNumber(6);
            const codeString = seperateNumber(code, '-');

            const registerEmail = registeredEmail(email, username, code, codeString);
            const { error: failedToSendEmail } = await sendEmail(registerEmail);

            if (failedToSendEmail) return response.sendError(logError(failedToSendEmail));
            
            const { error: failedEmailVerificationCreation } = await insertIntoTable(tables.emailVerifications, [
                { name: 'email', value: email },
                { name: 'username', value: username },
                { name: 'password', value: hashedPassword },
                { name: 'salt', value: hashedSalt },
                { name: 'ip', value: ip },
                { name: 'code', value: code }
            ]);

            if (failedEmailVerificationCreation) return response.sendError(logError(failedEmailVerificationCreation));

            break;
        };

        case 'DELETE': {
            const { email, captcha, code, ip } = getBody(req?.body);

            if (!(email && code && ip)) return response.sendError('Invalid request.'); 
            if (!await validateCaptcha(captcha)) return response.sendError('Invalid captcha.');
            if (!isIPAddress(ip)) return response.sendError('Invalid IP Address.');
            
            const { exists: userExists } = await selectInTable(tables.users, null, [
                { name: 'UPPER(email)', value: email?.toUpperCase() }
            ]);

            const {
                exists: emailVerificationExists,
                data: { error: emailVerificationError, rows: emailVerificationRows }
            } = await selectInTable(tables.emailVerifications, 'email, username, password, salt', [
                { name: 'UPPER(email)', value: email?.toUpperCase(), seperator: 'AND' },
                { name: 'UPPER(ip)', value: ip?.toUpperCase(), seperator: 'AND' },
                { name: 'UPPER(code)', value: parseInt(code?.replace(/\D/g, '')) }
            ]);

            if (emailVerificationError) return response.sendError(logError(emailVerificationError));

            if (userExists && emailVerificationExists) await deleteFromTable(tables.emailVerifications, [
                { name: 'email', value: email }
            ]);

            if (userExists) return response.sendError('Already completed registration.');
            if (!emailVerificationExists) return response.sendError('Invalid email address or code, or unauthorized.');

            const { email: _email, username, password, salt } = emailVerificationRows[0];

            if (!_email || !username || !password || !salt) return response.sendError('Unexpected database response, try again.');

            const { error: emailVerificationDeletionError } = await deleteFromTable(tables.emailVerifications, [
                { name: 'email', value: email }
            ]);
            
            const { error: failedUserCreation } = await insertIntoTable(tables.users, [
                { name: 'auth_token', value: randomUUID() },
                { name: 'email', value: _email },
                { name: 'username', value: username },
                { name: 'password', value: password },
                { name: 'salt', value: salt }
            ]);

            if (failedUserCreation) return response.sendError(logError(failedUserCreation));
            if (emailVerificationDeletionError) return response.sendError(logError(emailVerificationDeletionError));

            break;
        };

        default: return response.sendError(`Method '${req?.method}' not allowed.`);
    };

    response.send();
};