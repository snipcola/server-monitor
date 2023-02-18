const sendgrid = require('@sendgrid/mail');
const { sendgridSettings: { config: { apiKey } } } = require('../../../config');

sendgrid.setApiKey(apiKey);

export { sendgrid };