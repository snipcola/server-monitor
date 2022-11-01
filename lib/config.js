export const plans = ['FREE', 'PLUS', 'PREMIUM'];

export const config = {
    errorLogs: true,
    secret: '344722D98D11A344BDDC9A11796B4'
};

export const captchaConfig = {
    enabled: true,
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify?secret=',
    secretKey: '6LeJsxAiAAAAAIcZ8vdLLofu__8q4XNiMrxofTP2',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
};