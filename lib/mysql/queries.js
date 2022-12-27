const { plans } = require('../config');

export const tables = {
    users: 'Users',
    ipServers: 'IPServers',
    robloxServers: 'RobloxServers',
    keys: 'PlanKeys',
    emailVerifications: 'EmailVerifications',
    forgotPasswords: 'ForgotPasswords'
};

export const createUsers = `
CREATE TABLE IF NOT EXISTS ${tables.users} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    auth_token varchar(255) NOT NULL DEFAULT (UUID()),
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    salt varchar(255) NOT NULL,
    subscription ENUM(${plans?.map((p) => `'${p}'`).join(', ')}) NOT NULL DEFAULT 'FREE',
    plus_expiry datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    premium_expiry datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (auth_token),
    UNIQUE (email),
    UNIQUE (username),
    PRIMARY KEY (id)
);
`;

export const createIPServers = `
CREATE TABLE IF NOT EXISTS ${tables.ipServers} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    owner_id varchar(255),
    nickname varchar(255) NOT NULL,
    ip_address varchar(255) NOT NULL,
    monitoring ENUM('PENDING', 'FALSE', 'TRUE') NOT NULL DEFAULT 'PENDING',
    status ENUM('PENDING', 'OFFLINE', 'ONLINE') NOT NULL DEFAULT 'PENDING',
    response_time float(50) NOT NULL DEFAULT '0',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id)
        REFERENCES ${tables.users} (id)
        ON DELETE CASCADE
);
`;

export const createRobloxServers = `
CREATE TABLE IF NOT EXISTS ${tables.robloxServers} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    owner_id varchar(255),
    nickname varchar(255) NOT NULL,
    place_id varchar(255) NOT NULL,
    monitoring ENUM('PENDING', 'FALSE', 'TRUE') NOT NULL DEFAULT 'PENDING',
    name varchar(255) NOT NULL DEFAULT 'PENDING',
    description varchar(255) NOT NULL DEFAULT 'PENDING',
    creator_name varchar(255) NOT NULL DEFAULT 'PENDING',
    creator_type varchar(255) NOT NULL DEFAULT 'PENDING',
    price varchar(255) NOT NULL DEFAULT 'PENDING',
    copying_allowed varchar(255) NOT NULL DEFAULT 'PENDING',
    max_players varchar(255) NOT NULL DEFAULT 'PENDING',
    game_created varchar(255) NOT NULL DEFAULT 'PENDING',
    game_updated varchar(255) NOT NULL DEFAULT 'PENDING',
    genre varchar(255) NOT NULL DEFAULT 'PENDING',
    playing int(50) NOT NULL DEFAULT '0',
    visits int(50) NOT NULL DEFAULT '0',
    favorites int(50) NOT NULL DEFAULT '0',
    likes int(50) NOT NULL DEFAULT '0',
    dislikes int(50) NOT NULL DEFAULT '0',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id)
        REFERENCES ${tables.users} (id)
        ON DELETE CASCADE
);
`;

export const createKeys = `
CREATE TABLE IF NOT EXISTS ${tables.keys} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    plan_key varchar(255) NOT NULL DEFAULT (UUID()),
    subscription ENUM(${plans?.map((p) => `'${p}'`).join(', ')}) NOT NULL DEFAULT 'FREE',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (plan_key),
    PRIMARY KEY (id)
);
`;

export const createEmailVerifications = `
CREATE TABLE IF NOT EXISTS ${tables.emailVerifications} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    salt varchar(255) NOT NULL,
    ip varchar(255) NOT NULL,
    code varchar(255) NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
`;

export const createForgotPasswords = `
CREATE TABLE IF NOT EXISTS ${tables.forgotPasswords} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    email varchar(255) NOT NULL,
    ip varchar(255) NOT NULL,
    code varchar(255) NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
`;

export const deleteServers = `DROP TABLE IF EXISTS ${Object.values(tables)?.filter((t) => t?.toLowerCase()?.includes('servers')).join(', ')};`;
export const deleteRest = `DROP TABLE IF EXISTS ${Object.values(tables)?.filter((t) => !t?.toLowerCase()?.includes('servers'))?.join(', ')};`;

export const selectInTable  = (table, select, where) => `SELECT ${select ?? 'NULL'} FROM ${table}${where?.length > 0 ? ` WHERE ${where?.map(({ name, seperator }) => `${name} = ?${seperator ? ` ${seperator}` : ''}`)?.join(' ')}` : ''};`;
export const insertIntoTable  = (table, items) => `INSERT INTO ${table} (${items?.map(({ name }) => name)?.join(', ')}) VALUES (${items?.map(() => `?`)?.join(', ')});`;
export const deleteFromTable  = (table, where) => `DELETE FROM ${table} WHERE ${where?.map(({ name, seperator }) => `${name} = ?${seperator ? ` ${seperator}` : ''}`)?.join(' ')};`;
export const updateInTable  = (table, set, where) => `UPDATE ${table} SET ${set?.map(({ name }) => `${name} = ?`)?.join(', ')} WHERE ${where?.map(({ name, seperator }) => `${name} = ?${seperator ? ` ${seperator}` : ''}`)?.join(' ')};`;

export const createDatabase = [
    createUsers,
    createIPServers,
    createRobloxServers,
    createKeys,
    createEmailVerifications,
    createForgotPasswords
];

export const deleteDatabase = [
    deleteServers,
    deleteRest
];