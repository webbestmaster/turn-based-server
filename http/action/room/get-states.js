'use strict';

const roomHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, keys) => {
    const room = roomHashMap.items[roomId];

    if (room) {
        const result = {};

        keys.split(',').forEach(key => {
            result[key] = room.get(key);
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
