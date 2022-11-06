export const plans = ['FREE', 'PLUS', 'PREMIUM'];

export const config = {
    errorLogs: true,
    secret: 'C783362BE411A1B3F9AEB4F57AFC2'
};

export const captchaConfig = {
    enabled: true,
    verifyUrl: 'https://www.google.com/recaptcha/api/siteverify?secret=',
    secretKey: '6LeJsxAiAAAAAIcZ8vdLLofu__8q4XNiMrxofTP2',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
};