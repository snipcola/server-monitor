const crypto = require('crypto');
const moment = require('moment/moment');
const { isIPAddress } = require('ip-address-validator');

const { default: links } = require('./links');
const { captchaConfig: { enabled, verifyUrl, secretKey, headers }, config: { errorLogs } } = require('./config');

export const validateCaptcha = (captcha) => enabled
    ? fetch(`${verifyUrl}${secretKey}&response=${captcha}`, { method: 'POST', headers })
        .then(async (res) => (await res?.json())?.success)
        .catch(() => false)
    : true;

export const generateRandomNumber = (length) => {
    const number = [...Array(length - 1)].map(() => `0`).join('');

    const minimum = parseInt(`1${number}`);
    const maximum = parseInt(`${length}${number}`);

    return Math.floor(minimum + Math.random() * maximum);
};

export const seperateNumber = (number, seperator) => {
    const numberString = number?.toString();
    const length = numberString?.length;

    return `${numberString.slice(0, (length / 2))}${seperator}${numberString.slice((length / 2))}`;
};

export const hashPassword = (password, salt) => {
    const hashedSalt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt ?? hashedSalt, 1000, 64, 'sha512').toString('hex');

    return { hashedPassword, hashedSalt };
};

export const logError = (err) => errorLogs ? (err?.message ?? err) : 'Unexpected API/Database error, try again.';

export const daysUntil = (date) => moment(date).diff(moment(), 'days') ?? 0;

export const addToDate = (date, ...time) => new Date(moment(date === 'now' ? moment.now() : date).add(...time).format('YYYY-MM-DDTHH:mm:ss[Z]'));

export const apiRequest = (url, method, body, setState, set, callback, callbackOnSuccess) => {
    if (setState) setState({ errors: [], elementsDisabled: true, ...(set ? { [set]: false } : {}) });

    fetch(url, { method, ...(body ? { body: JSON.stringify(body) } : {}) })
        .then(async (res) => {
            const { data, errors } = await res?.json();

            if (setState) setState({ elementsDisabled: false, errors, ...(set ? { [set]: data?.success } : {}) });
            if (callback && (callbackOnSuccess ? (callbackOnSuccess && data?.success) : true)) callback(data);
        })
        .catch(() => setState && setState({ elementsDisabled: false, errors: ['API error, try again.'] }));
};

export const setUser = (setState, router, link, callback) => apiRequest(links.api.user.default, 'GET', null, null, null, (data) => {
    if (setState && data?.user) setState({ user: data?.user });
    else if (router && link) router.push(link);

    if (callback) callback(data?.user);
});

export const logout = (Router) => apiRequest(links.api.user.logout, 'POST', null, null, null, () => Router.push(links.login));

export const parseJson = (json) => {
    try { return JSON.parse(json); }
    catch { return {} };
};

export const getBody = (body) => typeof body === 'object'
    ? body
    : parseJson(body);

export const validateIP = (ip, port) => port ? isIPAddress(ip) && ((parseInt(port) && parseInt(port) >= 1 && parseInt(port) <= 65535) ? true : false) : isIPAddress(ip);