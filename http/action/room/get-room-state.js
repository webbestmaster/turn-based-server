'use strict';

const roomHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, key) => {
    const room = roomHashMap.items[roomId];

    if (room) {
        const result = room.get(key);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
