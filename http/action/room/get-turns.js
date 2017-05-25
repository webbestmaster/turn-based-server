const instanceHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, instanceId, hash) => {
    const instance = instanceHashMap.items[instanceId];

    if (instance) {
        const turns = instance.getTurns(hash);

        if (turns.error) {
            util.createError(res, turns.error, {});
            return;
        }

        const result = {turns};

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + instanceId + ' is not exist.', {});
};
