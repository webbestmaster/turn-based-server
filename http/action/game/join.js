'use strict';

const instanceHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const instance = instanceHashMap.items[roomId];

    if (instance) {
        instance.join(privateUserId);
        Object.assign(res, {statusCode: 204});
        res.end();
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
