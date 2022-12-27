export default {
    status: '/status',
    discord: '/discord',
    twitter: '/twitter',
    youtube: '/youtube',
    invite: '/invite',
    login: '/login',
    register: '/register',
    verifyEmail: '/verify-email',
    forgotPassword: '/forgot-password',
    submitForgotPassword: '/submit-forgot-password',
    termsOfService: '/legal/terms-of-service',
    privacyPolicy: '/legal/privacy-policy',
    dashboard: {
        servers: '/dashboard/servers',
        settings: '/dashboard/settings',
        billing: '/dashboard/billing',
        redeem: '/dashboard/redeem',
        integrations: '/dashboard/integrations'
    },
    api: {
        emailVerification: '/api/email-verification',
        forgotPassword: '/api/forgot-password',
        user: {
            default: '/api/user',
            validate: '/api/user/validate',
            login: '/api/user/login',
            logout: '/api/user/logout'
        },
        key: '/api/key',
        server: {
            default: '/api/server',
            ip: '/api/server/ip',
            roblox: '/api/server/roblox'
        },
        servers: {
            default: '/api/servers',
            ip: '/api/servers/ip',
            roblox: '/api/servers/roblox'
        }
    },
    legal: {
        termsOfService: '/legal/terms-of-service',
        privacyPolicy: '/legal/privacy-policy'
    }
};