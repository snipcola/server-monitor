const { sendgrid } = require('../sendgrid');

export const sendEmail = (email) => sendgrid.send(email)
    .then(() => ({ success: true }))
    .catch((error) => ({ error }));