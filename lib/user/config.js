export const lengths = {
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
    }
};

export const regex = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9]*$/,
    password: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/
};

export const returnColumns = [
    'email',
    'username',
    'subscription',
    'plus_expiry',
    'premium_expiry'
];