'use strict';

const roomModule = require('./../../model/room');
const {roomsHashMap} = roomModule;
const util = require('./../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    res.setHeader('Content-Type', 'application/json');

    const room = roomsHashMap.rooms[roomId];

    if (room) {
        room.ping(privateUserId);
        res.end();
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
