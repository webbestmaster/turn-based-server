const instanceHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, instanceId, key) => {
    const instance = instanceHashMap.items[instanceId];

    if (instance) {
        const result = instance.get(key);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + instanceId + ' is not exist.', {});
};
