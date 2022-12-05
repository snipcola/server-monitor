import { selectInTable } from "../mysql/functions";
import { tables } from "../mysql/queries";


export const getServers = async (ownerId) => {
    const { data: { rows: ipServers } } = await selectInTable(tables.ipServers, null, [
        { name: 'owner_id', value: ownerId }
    ]);

    return [...ipServers];
};