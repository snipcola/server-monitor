export default {
    invite: '/invite',
    login: '/login',
    register: '/register',
    verifyEmail: '/verify-email',
    forgotPassword: '/forgot-password',
    submitForgotPassword: '/submit-forgot-password',
    dashboard: {
        servers: '/dashboard/servers',
        settings: '/dashboard/settings'
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
        server: {
            default: '/api/server',
            ip: '/api/server/ip',
            roblox: '/api/server/roblox',
            linux: '/api/server/linux',
            linuxShutdown: '/api/server/linux/shutdown',
            linuxRestart: '/api/server/linux/restart',
            fivem: '/api/server/fivem',
            fivemExecute: '/api/server/fivem/execute'
        },
        servers: {
            default: '/api/servers',
            ip: '/api/servers/ip',
            roblox: '/api/servers/roblox',
            linux: '/api/servers/linux',
            fivem: '/api/servers/fivem'
        }
    },
    guides: {
        linuxConnector: '/guides/linux-connector',
        fivemConnector: '/guides/fivem-connector'
    }
};