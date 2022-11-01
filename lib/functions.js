const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment/moment');

const { captchaConfig: { enabled, verifyUrl, secretKey, headers }, config: { errorLogs } } = require('./config');

export const validateCaptcha = (captcha) => enabled
    ? axios
        .post(`${verifyUrl}${secretKey}&response=${captcha}`, {}, { headers })
        .then((res) => res?.data?.success ? true : false)
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