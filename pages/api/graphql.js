export default async (_, res) => res.send('Soon to be removed due to API 2.');

/* const { ApolloServer, gql } = require('apollo-server-micro');
const { ApolloServerPluginLandingPageDisabled } = require('apollo-server-core');
const links = require('../../lib/links');

const siteConfig = {
    domain: 'server-monitor.org',
    captchasEnabled: true,
    logErrors: false
};

const captchaConfig = {
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify?secret=',
    secretKey: '6LeJsxAiAAAAAIcZ8vdLLofu__8q4XNiMrxofTP2',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
};

const sendgridConfig = {
    apiKey: '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',
    email: {
        email: `no-reply@${siteConfig.domain}`,
        name: 'Server Monitor'
    },
};

const sendgridEmails = {
    registered: (email, username, code, codeString) => ({
        to: email,
        from: sendgridConfig.email,
        subject: `Your verification code is ${codeString}`,
        html: `Hello ${username},<br/><br/>Thanks for registering an account with us.<br/><br/>Your verification code is: <b>${codeString}</b> (or <a href="https://dev.${siteConfig.domain}/verify-email?email=${email}&code=${code}">click here</a>).<br/><br/>Note: if you did not register on our website, ignore this message.<br/><br/>This is an automated reply.<br/><br/>Server Monitor`
    }),
    forgotPassword: (email, username, code, codeString) => ({
        to: email,
        from: sendgridConfig.email,
        subject: `Your reset code is ${codeString}`,
        html: `Hello ${username},<br/><br/>You've submitted a request to reset your password.<br/><br/>Your reset code is: <b>${codeString}</b> (or <a href="https://dev.${siteConfig.domain}/forgot-password?email=${email}&code=${code}">click here</a>).<br/><br/>Note: if you did not request to reset your password, ignore this message.<br/><br/>This is an automated reply.<br/><br/>Server Monitor`
    }),
    deleted: (email, username) => ({
        to: email,
        from: sendgridConfig.email,
        subject: `Goodbye ${username}`,
        html: `Goodbye ${username},<br/><br/>You've deleted your account along with all data.<br/><br/>We hope you've enjoyed your stay at Server Monitor.<br/>If you ever change your mind, <a href="https://dev.${siteConfig.domain}/register">register another account with us.</a>.<br/><br/>Note: if you did not delete your account, please contact support.<br/>We are unable to reverse the deletion or restore any data.<br/><br/>This is an automated reply.<br/><br/>Server Monitor`
    }),
};

const sendgrid = require('@sendgrid/mail');

const Cors = require('micro-cors');
const cors = Cors();

const { prisma } = require('../../lib/prisma');

const crypto = require('crypto');
const axios = require('axios');

const { isIPAddress } = require('ip-address-validator');

const moment = require('moment/moment');

const GetPlanTime = (expiry) => moment(expiry).diff(moment(), 'days') ?? 0;

sendgrid.setApiKey(sendgridConfig.apiKey);

const typeDefs = gql(`
    type RegisterUserResponse {
        registered: Boolean
        redirect: String
        errors: [String]!
    }

    type ValidateUserResponse {
        validated: Boolean
        auth_token: String
        errors: [String]!
    }

    type ValidateEmailResponse {
        validated: Boolean
        errors: [String]!
    }

    type SubmitForgotPasswordResponse {
        completed: Boolean
        redirect: String
        errors: [String]!
    }

    type ForgotPasswordResponse {
        reset: Boolean
        errors: [String]!
    }

    type ChangePasswordResponse {
        changed: Boolean
        errors: [String]!
    }

    type UpdateUserResponse {
        updated: Boolean
        errors: [String]!
    }

    type RedeemKeyResponse {
        redeemed: Boolean
        errors: [String]!
    }

    type SwitchPlanResponse {
        switched: Boolean
        errors: [String]!
    }

    type CreateIPServerResponse {
        created: Boolean
        errors: [String]!
    }

    type EditIPServerResponse {
        edited: Boolean
        errors: [String]!
    }

    type DeleteServerResponse {
        deleted: Boolean
        errors: [String]!
    }

    type DeleteAccountResponse {
        deleted: Boolean
        errors: [String]!
    }

    type Mutation {
        registerUser(email: String, username: String, password: String, ip: String, captcha: String): RegisterUserResponse
        validateUser(email: String, password: String, captcha: String): ValidateUserResponse
        validateEmail(email: String, code: String, captcha: String, ip: String): ValidateEmailResponse
        submitForgotPassword(email: String, captcha: String, ip: String): SubmitForgotPasswordResponse
        forgotPassword(email: String, password: String, code: String, captcha: String, ip: String): ForgotPasswordResponse
        changePassword(auth_token: String, current_password: String, desired_password: String, captcha: String): ChangePasswordResponse
        updateUser(auth_token: String, username: String): UpdateUserResponse
        switchPlan(auth_token: String, plan: String): SwitchPlanResponse
        redeemKey(auth_token: String, key: String): RedeemKeyResponse
        createIPServer(auth_token: String, nickname: String, ip_address: String): CreateIPServerResponse
        editIPServer(auth_token: String, id: String, nickname: String, ip_address: String): EditIPServerResponse
        deleteServer(auth_token: String, id: String, db_name: String): DeleteServerResponse
        deleteAccount(auth_token: String): DeleteAccountResponse
    }

    type Query {
        _dummy: String
    }
`);

const lengths = {
    email: {
        min: 5,
        max: 100
    },
    username: {
        min: 4,
        max: 20
    },
    password: {
        min: 6,
        max: 50
    },
    server_nickname: {
        min: 3,
        max: 25
    }
};

const planLimits = {
    servers: {
        'FREE': 2,
        'PLUS': 7,
        'PREMIUM': 15
    }
};

const apiErrorText = 'API error, please try again.';

const resolvers = {
    Mutation: {
        registerUser: (_prnt, { email, username, password, ip, captcha }, ctx) => {
            const errors = [];

            const apiError = (err) => errors.push(siteConfig.logErrors ? err : apiErrorText) && ({ registered: false, errors });

            return axios.post(`${captchaConfig.verifyUrl}${captchaConfig.secretKey}&response=${captcha}`, {}, { headers: captchaConfig.headers })
                .then((captchaResponse) => {
                    if (siteConfig.captchasEnabled && !captchaResponse.data?.success) errors.push('The captcha was invalid.');
                    
                    return ctx.prisma.user.findFirst({ where: { OR: [ { email: { equals: email, mode: 'insensitive' } }, { username: { equals: username, mode: 'insensitive' } } ] } })
                        .then((u) => {
                            if (u) errors.push('Username or email already exists.');

                            return ctx.prisma.emailVerification.findFirst({ where: { AND: [ { email: { equals: email, mode: 'insensitive' } }, { ip } ] } })
                                .then((e) => {
                                    if (e) errors.push(`You've already registered, check your email to verify your account.`);

                                    if (email.length < lengths.email.min || email.length > lengths.email.max) errors.push(`Length of the email must be between ${lengths.email.min} - ${lengths.email.max}.`);
                                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('An invalid email was provided.');

                                    if (username.length < lengths.username.min || username.length > lengths.username.max) errors.push(`Length of the username must be between ${lengths.username.min} - ${lengths.username.max}.`);
                                    else if (!/^[a-zA-Z0-9]*$/.test(username)) errors.push('Username can only contains letters and numbers.');

                                    if (password.length < lengths.password.min || password.length > lengths.password.max) errors.push(`Length of the password must be between ${lengths.password.min} - ${lengths.password.max}.`);
                                    else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) errors.push('Password must contain one uppercase letter, one lowercase letter, one number, and one special character (@, #, \\, $, &, !, ?).');

                                    if (errors.length == 0) {
                                        const salt = crypto.randomBytes(16).toString('hex');
                                        const hashed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
                                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                                        const codeString = `${code.slice(0, 3)}-${code.slice(3)}`;

                                        return ctx.prisma.emailVerification.create({ data: { username, email, password: hashed, salt, ip, code } })
                                            .then(() => sendgrid.send(sendgridEmails.registered(email, username, code, codeString))
                                                .then(() => ({ registered: true, redirect: `${links.verifyEmail}?email=${email}`, errors }))
                                                .catch((err) => apiError(err)))
                                            .catch((err) => apiError(err));
                                    }
                                    else return { registered: false, errors };
                                })
                                .catch((err) => apiError(err));
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        validateUser: (_prnt, { email, password, captcha }, ctx) => {
            const apiError = (err) => ({ validated: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });
            const emailPasswordError = 'Email or password is invalid.';

            return axios.post(`${captchaConfig.verifyUrl}${captchaConfig.secretKey}&response=${captcha}`, {}, { headers: captchaConfig.headers })
                .then((captchaResponse) => {
                    if (siteConfig.captchasEnabled && !captchaResponse.data?.success) return { validated: false, errors: [ 'The captcha was invalid.' ] };

                    return ctx.prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
                        .then((user) => {
                            if (user?.salt) {
                                const hashed = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');

                                return ctx.prisma.user.update({ where: { email }, data: { auth_token: crypto.randomUUID() } })
                                    .then((updatedUser) => (hashed === user?.password) ? { validated: updatedUser?.auth_token ? true : false, auth_token: updatedUser?.auth_token, errors: [] } : { validated: false, errors: [emailPasswordError] })
                                    .catch((err) => apiError(err));
                            }
                            else return { validated: false, errors: [emailPasswordError] };
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        validateEmail: (_prnt, { email, code, captcha, ip }, ctx) => {
            const apiError = (err) => ({ validated: false, errors: [siteConfig.logErrors ? err : apiErrorText] });
            const emailCodeError = 'Email or code is invalid.';

            return axios.post(`${captchaConfig.verifyUrl}${captchaConfig.secretKey}&response=${captcha}`, {}, { headers: captchaConfig.headers })
                .then((captchaResponse) => {
                    if (siteConfig.captchasEnabled && !captchaResponse.data?.success) return { validated: false, errors: [ 'The captcha was invalid.' ] };

                    return ctx.prisma.emailVerification.findFirst({ where: { AND: [ { email: { equals: email, mode: 'insensitive' } }, { code: code.replace(/\D/g,'') }, { ip } ] } })
                        .then((emailVerification) => {
                            if (emailVerification) {
                                return ctx.prisma.emailVerification.deleteMany({ where: { email: emailVerification.email } })
                                    .then(() => ctx.prisma.user.create({ data: { username: emailVerification.username, email: emailVerification.email, password: emailVerification.password, salt: emailVerification.salt } })
                                        .then(() => ({ validated: true, errors: [] }))
                                        .catch((err) => apiError(err)))
                                    .catch((err) => apiError(err));
                            }
                            else return { validated: false, errors: [emailCodeError] };
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        submitForgotPassword: (_prnt, { email, captcha, ip}, ctx) => {
            const apiError = (err) => ({ completed: false, errors: [siteConfig.logErrors ? err : apiErrorText] });

            return axios.post(`${captchaConfig.verifyUrl}${captchaConfig.secretKey}&response=${captcha}`, {}, { headers: captchaConfig.headers })
                .then((captchaResponse) => {
                    if (siteConfig.captchasEnabled && !captchaResponse.data?.success) return({ completed: false, errors: ['The captcha was invalid.'] });
                    
                    return ctx.prisma.user.findFirst({ where: { OR: [ { email: { equals: email, mode: 'insensitive' } } ] } })
                        .then((u) => {
                            if (!u) return ({ completed: false, errors: ['Email does not exist.'] });

                            return ctx.prisma.forgotPassword.findFirst({ where: { AND: [ { email: { equals: email, mode: 'insensitive' } }, { ip } ] } })
                                .then((e) => {
                                    if (e) return ({ completed: false, errors: [`You've already received an email, check your email to finish resetting your password.`] });

                                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                                    const codeString = `${code.slice(0, 3)}-${code.slice(3)}`;

                                    return ctx.prisma.forgotPassword.create({ data: { email, ip, code } })
                                        .then(() => sendgrid.send(sendgridEmails.forgotPassword(email, u.username, code, codeString))
                                            .then(() => ({ completed: true, redirect: `${links.forgotPassword}?email=${email}`, errors: [] }))
                                            .catch((err) => apiError(err)))
                                        .catch((err) => apiError(err));
                                })
                                .catch((err) => apiError(err));
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        forgotPassword: (_prnt, { email, password, code, captcha, ip }, ctx) => {
            const apiError = (err) => ({ reset: false, errors: [siteConfig.logErrors ? err : apiErrorText] });
            const emailCodeError = 'Email or code is invalid.';

            return axios.post(`${captchaConfig.verifyUrl}${captchaConfig.secretKey}&response=${captcha}`, {}, { headers: captchaConfig.headers })
                .then((captchaResponse) => {
                    if (siteConfig.captchasEnabled && !captchaResponse.data?.success) return { reset: false, errors: [ 'The captcha was invalid.' ] };

                    if (password.length < lengths.password.min || password.length > lengths.password.max) return ({ reset: false, errors: [`Length of the password must be between ${lengths.password.min} - ${lengths.password.max}.`] });
                    else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) return ({ reset: false, errors: ['Password must contain one uppercase letter, one lowercase letter, one number, and one special character (@, #, \\, $, &, !, ?).'] });

                    return ctx.prisma.forgotPassword.findFirst({ where: { AND: [ { email: { equals: email, mode: 'insensitive' } }, { code: code.replace(/\D/g,'') }, { ip } ] } })
                        .then((forgotPassword) => {
                            if (forgotPassword) {
                                const salt = crypto.randomBytes(16).toString('hex');
                                const hashed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

                                return ctx.prisma.forgotPassword.deleteMany({ where: { email: forgotPassword.email } })
                                    .then(() => ctx.prisma.user.update({ where: { email: forgotPassword.email }, data: { password: hashed, salt } })
                                        .then(() => ({ reset: true, errors: [] }))
                                        .catch((err) => apiError(err)))
                                    .catch((err) => apiError(err));
                            }
                            else return { reset: false, errors: [emailCodeError] };
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        updateUser: (_prnt, { auth_token, username }, ctx) => {
            const apiError = (err) => ({ updated: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });

            if (username.length < lengths.username.min || username.length > lengths.username.max) return { updated: false, errors: [`Length of the username must be between ${lengths.username.min} - ${lengths.username.max}.`] };
            else if (!/^[a-zA-Z0-9]*$/.test(username)) return { updated: false, errors: ['Username can only contains letters and numbers.'] };

            return ctx.prisma.user.findFirst({ where: { username: { equals: username, mode: 'insensitive' } } })
                .then((u) => {
                    if (u) return { updated: false, errors: ['That username is already taken.'] };

                    return ctx.prisma.user.update({ where: { auth_token }, data: { username } })
                        .then(() =>  ({ updated: true, errors: [] }))
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        changePassword: (_prnt, { auth_token, current_password, desired_password, captcha }, ctx) => {
            const apiError = (err) => ({ changed: false, errors: [siteConfig.logErrors ? err : apiErrorText] });

            return axios.post(`${captchaConfig.verifyUrl}${captchaConfig.secretKey}&response=${captcha}`, {}, { headers: captchaConfig.headers })
                .then((captchaResponse) => {
                    if (siteConfig.captchasEnabled && !captchaResponse.data?.success) return { changed: false, errors: ['The captcha was invalid.'] };

                    return ctx.prisma.user.findFirst({ where: { auth_token } })
                        .then((u) => {
                            if (!u) return { changed: false, errors: ['Couldn\'t find user in database.'] };

                            const currentSalt = u?.salt;
                            const currentHashed = crypto.pbkdf2Sync(current_password, currentSalt, 1000, 64, 'sha512').toString('hex');

                            if (currentHashed !== u?.password) return ({ changed: false, errors: ['The password provided was incorrect.'] });

                            if (desired_password.length < lengths.password.min || desired_password.length > lengths.password.max) return ({ changed: false, errors: [`Length of the password must be between ${lengths.password.min} - ${lengths.password.max}.`] });
                            else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(desired_password)) return ({ changed: false, errors: ['Password must contain one uppercase letter, one lowercase letter, one number, and one special character (@, #, \\, $, &, !, ?).'] });

                            const salt = crypto.randomBytes(16).toString('hex');
                            const hashed = crypto.pbkdf2Sync(desired_password, salt, 1000, 64, 'sha512').toString('hex');

                            return ctx.prisma.user.update({ where: { auth_token }, data: { salt, password: hashed, auth_token: crypto.randomUUID() } })
                                .then(() => ({ changed: true, errors: [] }))
                                .catch((err) => apiError(err))
                        }).catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        switchPlan: (_prnt, { auth_token, plan }, ctx) => {
            const apiError = (err) => ({ switched: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });
            const plans = ['FREE', 'PLUS', 'PREMIUM'];

            if (!plans.includes(plan)) return { switched: false, errors: ['That plan does not exist.'] };

            return plan === 'FREE'
                ? ctx.prisma.user.update({ where: { auth_token }, data: { subscription: plan } })
                    .then(() =>  ({ switched: true, errors: [] }))
                    .catch((err) => apiError(err))
                : ctx.prisma.user.findFirst({ where: { auth_token } })
                    .then((u) => {
                        if (!u) return { switched: false, errors: ['An internal error occurred. Could not find user.'] };

                        return GetPlanTime(u[`${plan.toLowerCase()}_expiry`]) >= 0
                            ? ctx.prisma.user.update({ where: { auth_token }, data: { subscription: plan } })
                                .then(() =>  ({ switched: true, errors: [] }))
                                .catch((err) => apiError(err))
                            : { switched: false, errors: ['You do not have any remaining time on that plan.'] };
                    })
                    .catch((err) => apiError(err));
        },
        redeemKey: (_prnt, { auth_token, key }, ctx) => {
            const apiError = (err) => ({ redeemed: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });

            return ctx.prisma.key.findFirst({ where: { key } })
                .then((k) => {
                    if (!k) return { redeemed: false, errors: ['Key does not exist.'] };

                    return ctx.prisma.user.findFirst({ where: { auth_token } })
                        .then((u) => {
                            if (!u) return { redeemed: false, errors: ['An internal error occurred. Could not find user.'] };

                            const premiumExpiry = u?.premium_expiry;
                            const plusExpiry = u?.plus_expiry;

                            const getPlanTime = (expiry) => moment(expiry).diff(moment(), 'days') ?? 0;
                            const isExpired = (expiry) => expiry ? getPlanTime(expiry) <= 0 : true;

                            const premiumExpired = isExpired(premiumExpiry);
                            const plusExpired = isExpired(plusExpiry);

                            const updateExpiry = k?.subscription === 'PREMIUM'
                                ? ctx.prisma.user.update({ where: { auth_token }, data: { premium_expiry: moment(premiumExpired ? moment.now() : premiumExpiry).add(1, 'M').format('YYYY-MM-DDTHH:mm:ss[Z]'), subscription: k?.subscription } })
                                : ctx.prisma.user.update({ where: { auth_token }, data: { plus_expiry: moment(plusExpired ? moment.now() : plusExpiry).add(1, 'M').format('YYYY-MM-DDTHH:mm:ss[Z]'), subscription: k?.subscription } });

                            return updateExpiry
                                .then(() => ctx.prisma.key.delete({ where: { id: k?.id } })
                                    .then(() =>  ({ redeemed: true, errors: [] }))
                                    .catch((err) => apiError(err)))
                                .catch((err) => apiError(err));
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        createIPServer: (_prnt, { auth_token, nickname, ip_address }, ctx) => {
            const apiError = (err) => ({ created: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });

            if (nickname.length < lengths.server_nickname.min || nickname.length > lengths.server_nickname.max) return { created: false, errors: [`Length of the nickname must be between ${lengths.server_nickname.min} - ${lengths.server_nickname.max}.`] };
            else if (!/^[a-zA-Z0-9 ]*$/.test(nickname)) return { created: false, errors: ['Nickname can only contains letters, spaces, and numbers.'] };

            if (!isIPAddress(ip_address)) return { created: false, errors: [`The IP Address provided is invalid.`] };

            return ctx.prisma.user.findFirst({ where: { auth_token }, include: { ip_servers: true } })
                .then((u) => {
                    if (!u) return { created: false, errors: ['An internal error occurred. Could not find user.'] };

                    const subscription = u?.subscription;
                    const servers = u?.ip_servers?.length;
                    const serversLimit = planLimits.servers[subscription] ?? 0;

                    if (servers >= serversLimit) return { created: false, errors: [`You have reached the server limit for your account.`] };

                    return ctx.prisma.IPServer.findFirst({ where: { OR: [{ ownerId: u?.id, nickname: { equals: nickname, mode: 'insensitive' } }, { ownerId: u?.id, ip_address }] } })
                        .then((s) => {
                            if (s) return { created: false, errors: ['You already have a server with that nickname or ip address.'] };

                            return ctx.prisma.IPServer.create({ data: { ownerId: u?.id, nickname, ip_address } })
                                .then(() => ({ created: true, errors: [] }))
                                .catch((err) => apiError(err));
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        editIPServer: (_prnt, { auth_token, id, nickname, ip_address }, ctx) => {
            const apiError = (err) => ({ edited: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });

            return ctx.prisma.user.findFirst({ where: { auth_token } })
                .then((u) => {
                    if (!u) return { edited: false, errors: ['An internal error occurred. Could not find user.'] };

                    return ctx.prisma.IPServer.findFirst({ where: { ownerId: u?.id, id } })
                        .then((s) => {
                            if (!s) return { edited: false, errors: ['An internal error occurred. Could not find server.'] };

                            return ctx.prisma.IPServer.findFirst({ where: { OR: [{ ownerId: u?.id, nickname: { equals: nickname, mode: 'insensitive' } }, { ownerId: u?.id, ip_address }], NOT: { id } } })
                                .then((s) => {
                                    if (s) return { edited: false, errors: ['You already have a server with that nickname or ip address.'] };

                                    if (nickname.length < lengths.server_nickname.min || nickname.length > lengths.server_nickname.max) return { edited: false, errors: [`Length of the nickname must be between ${lengths.server_nickname.min} - ${lengths.server_nickname.max}.`] };
                                    else if (!/^[a-zA-Z0-9 ]*$/.test(nickname)) return { edited: false, errors: ['Nickname can only contains letters, spaces, and numbers.'] };

                                    if (!isIPAddress(ip_address)) return { edited: false, errors: [`The IP Address provided is invalid.`] };

                                    return ctx.prisma.IPServer.update({ where: { id }, data: { nickname, ip_address, status: 'PENDING' } })
                                        .then(() => ({ edited: true, errors: [] }))
                                        .catch((err) => apiError(err));
                                })
                                .catch((err) => apiError(err));
                        })
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        },
        deleteServer: (_prnt, { auth_token, id, db_name }, ctx) => {
            const apiError = (err) => ({ deleted: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });

            return ctx.prisma.user.findFirst({ where: { auth_token } })
                .then((u) => {
                    if (!u) return { deleted: false, errors: ['An internal error occurred. Could not find user.'] };

                    const server = ctx.prisma[db_name];

                    return server
                        ? server.findFirst({ where: { ownerId: u?.id, id } })
                            .then((s) => {
                                if (!s) return { deleted: false, errors: ['The specified server does not exist.'] };

                                return server.delete({ where: { id } })
                                    .then(() => ({ deleted: true, errors: [] }))
                                    .catch((err) => apiError(err));
                            })
                            .catch((err) => apiError(err))
                        : apiError(err);
                })
                .catch((err) => apiError(err));
        },
        deleteAccount: (_prnt, { auth_token }, ctx) => {
            const apiError = (err) => ({ deleted: false, errors: [ siteConfig.logErrors ? err : apiErrorText ] });

            return ctx.prisma.user.findFirst({ where: { auth_token } })
                .then((u) => {
                    if (!u) return { deleted: false, errors: ['An internal error occurred. Could not find user.'] };

                    return ctx.prisma.user.delete({ where: { auth_token } })
                        .then(() => sendgrid.send(sendgridEmails.deleted(u?.email, u?.username))
                            .then(() => ({ deleted: true, errors: [] }))
                            .catch((err) => apiError(err)))
                        .catch((err) => apiError(err));
                })
                .catch((err) => apiError(err));
        }
    }
};

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    persistedQueries: false,
    context: () => ({ prisma }),
    plugins: process.env.NODE_ENV === 'production' ? [ApolloServerPluginLandingPageDisabled()] : []
});

const startServer = apolloServer.start();

export default cors(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.end();
        return false;
    };

    await startServer;
    await apolloServer.createHandler({ path: '/api/graphql' })(req, res);
});

export const config = {
    api: {
        bodyParser: false
    }
}; */