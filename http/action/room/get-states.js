'use strict';

const instanceHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, keys) => {
    const instance = instanceHashMap.items[roomId];

    if (instance) {
        const result = {};

        keys.split(',')
            .forEach(key => Object.assign(result, {[key]: instance.get(key)}));

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
