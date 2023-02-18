import { selectInTable } from "../mysql/functions";
import { tables } from "../mysql/queries";


export const getServers = async (ownerId) => {
    const { data: { rows: ipServers } } = await selectInTable(tables.ipServers, 'id, nickname, ip_address', [
        { name: 'owner_id', value: ownerId }
    ]);

    const { data: { rows: robloxServers } } = await selectInTable(tables.robloxServers, 'id, nickname, place_id', [
        { name: 'owner_id', value: ownerId }
    ]);

    const { data: { rows: linuxServers } } = await selectInTable(tables.linuxServers, 'id, nickname, host', [
        { name: 'owner_id', value: ownerId }
    ]);

    return [...ipServers, ...robloxServers, ...linuxServers];
};