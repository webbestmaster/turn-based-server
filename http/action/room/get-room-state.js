'use strict';

const roomModule = require('./../../../model/room');
const {roomsHashMap} = roomModule;
const util = require('./../../util');

module.exports = (req, res, url, roomId, key) => {
    const room = roomsHashMap.rooms[roomId];

    if (room) {
        const result = room.get(key);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
