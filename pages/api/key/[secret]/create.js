const { randomUUID } = require('crypto');

const { tables } = require('../../../../lib/mysql/queries');
const { insertIntoTable } = require('../../../../lib/mysql/functions');

const { config, plans } = require('../../../../lib/config');
const { Response } = require('../../../../lib/classes');

export default async (req, res) => {
    const response = new Response();
    const { secret, plan, amount } = req?.query;

    response.setResponse(res);

    if (!plan || secret !== config?.secret || (amount < 1 || amount > 100)) return response.sendError('Invalid/unauthorized request.');

    const foundPlan = plans?.find((p) => p?.toLowerCase() === plan?.toLowerCase());

    if (!foundPlan) return response.sendError('Invalid plan.');

    const keys = await Promise.all([...Array(amount ? parseInt(amount) : 1)].map(async () => {
        const key = randomUUID();

        await insertIntoTable(tables.keys, [
            { name: 'plan_key', value: key },
            { name: 'subscription', value: foundPlan },
        ]);

        return key;
    }));
    
    return response.sendPlain(keys?.join('\n'));
};