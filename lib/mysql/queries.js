export const tables = {
    users: 'Users',
    ipServers: 'IPServers',
    robloxServers: 'RobloxServers',
    linuxServers: 'LinuxServers',
    fivemServers: 'FiveMServers',
    emailVerifications: 'EmailVerifications',
    forgotPasswords: 'ForgotPasswords',
    discordAdmins: 'DiscordAdmins',
    discordStatusChannels: 'DiscordStatusChannels'
};

export const createUsers = `
CREATE TABLE IF NOT EXISTS ${tables.users} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    auth_token varchar(255) NOT NULL DEFAULT (UUID()),
    discord_link_key varchar(255) NOT NULL DEFAULT (UUID()),
    discord_id varchar(255) DEFAULT NULL,
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    salt varchar(255) NOT NULL,
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
    universe_id varchar(255) NOT NULL,
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
    playing bigint(50) NOT NULL DEFAULT '0',
    visits bigint(50) NOT NULL DEFAULT '0',
    favorites bigint(50) NOT NULL DEFAULT '0',
    likes bigint(50) NOT NULL DEFAULT '0',
    dislikes bigint(50) NOT NULL DEFAULT '0',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id)
        REFERENCES ${tables.users} (id)
        ON DELETE CASCADE
);
`;

export const createLinuxServers = `
CREATE TABLE IF NOT EXISTS ${tables.linuxServers} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    owner_id varchar(255),
    nickname varchar(255) NOT NULL,
    host varchar(255) NOT NULL,
    port varchar(255) NOT NULL,
    api_key varchar(255) NOT NULL,
    monitoring ENUM('PENDING', 'FALSE', 'TRUE') NOT NULL DEFAULT 'PENDING',
    status ENUM('PENDING', 'OFFLINE', 'ONLINE') NOT NULL DEFAULT 'PENDING',
    manufacturer varchar(255) NOT NULL DEFAULT 'PENDING',
    model varchar(255) NOT NULL DEFAULT 'PENDING',
    serial varchar(255) NOT NULL DEFAULT 'PENDING',
    bios_vendor varchar(255) NOT NULL DEFAULT 'PENDING',
    bios_version varchar(255) NOT NULL DEFAULT 'PENDING',
    bios_serial varchar(255) NOT NULL DEFAULT 'PENDING',
    os_kernel varchar(255) NOT NULL DEFAULT 'PENDING',
    os_build varchar(255) NOT NULL DEFAULT 'PENDING',
    cpu_usage float(50) NOT NULL DEFAULT '0',
    cpu_temperature float(50) NOT NULL DEFAULT '0',
    ram_usage float(50) NOT NULL DEFAULT '0',
    disk_used float(50) NOT NULL DEFAULT '0',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id)
        REFERENCES ${tables.users} (id)
        ON DELETE CASCADE
);
`;

export const createFivemServers = `
CREATE TABLE IF NOT EXISTS ${tables.fivemServers} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    owner_id varchar(255),
    nickname varchar(255) NOT NULL,
    host varchar(255) NOT NULL,
    port varchar(255) NOT NULL,
    api_key varchar(255) NOT NULL,
    monitoring ENUM('PENDING', 'FALSE', 'TRUE') NOT NULL DEFAULT 'PENDING',
    status ENUM('PENDING', 'OFFLINE', 'ONLINE') NOT NULL DEFAULT 'PENDING',
    players float(50) NOT NULL DEFAULT '0',
    cpu_usage float(50) NOT NULL DEFAULT '0',
    cpu_temperature float(50) NOT NULL DEFAULT '0',
    ram_usage float(50) NOT NULL DEFAULT '0',
    disk_used float(50) NOT NULL DEFAULT '0',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id)
        REFERENCES ${tables.users} (id)
        ON DELETE CASCADE
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

export const createDiscordAdmins = `
CREATE TABLE IF NOT EXISTS ${tables.discordAdmins} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    admin_id varchar(255) NOT NULL,
    discord_id varchar(255) NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
`;

export const createDiscordStatusChannels = `
CREATE TABLE IF NOT EXISTS ${tables.discordStatusChannels} (
    id varchar(255) NOT NULL DEFAULT (UUID()),
    owner_id varchar(255) NOT NULL,
    guild_id varchar(255) NOT NULL,
    channel_id varchar(255) NOT NULL,
    server_id varchar(255) NOT NULL,
    server_table varchar(255) NOT NULL,
    ping_everyone ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
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
    createLinuxServers,
    createFivemServers,
    createEmailVerifications,
    createForgotPasswords,
    createDiscordAdmins,
    createDiscordStatusChannels
];

export const deleteDatabase = [
    deleteServers,
    deleteRest
];