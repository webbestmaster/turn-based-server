'use strict';

const roomModule = require('./../../model/room');
const {roomsHashMap} = roomModule;
const util = require('./../util');

module.exports = (req, res, url, roomId, keys) => {
    res.setHeader('Content-Type', 'application/json');

    const room = roomsHashMap.rooms[roomId];

    if (room) {
        const result = {};

        keys.split(',').forEach(key => {
            result[key] = room.get(key);
        });

        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
