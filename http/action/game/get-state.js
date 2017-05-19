'use strict';

const instanceHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, key) => {
    const instance = instanceHashMap.items[roomId];

    if (instance) {
        const result = instance.get(key);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
