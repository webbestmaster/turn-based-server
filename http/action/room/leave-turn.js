const instanceHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, instanceId, privateUserId) => {
    const instance = instanceHashMap.items[instanceId];

    if (instance) {
        instance.leaveTurn(privateUserId);
        Object.assign(res, {statusCode: 204});
        res.end();
        return;
    }

    util.createError(res, 'Item with ID: ' + instanceId + ' is not exist.', {});
};
