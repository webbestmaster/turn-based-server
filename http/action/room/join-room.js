'use strict';

const roomModule = require('./../../../model/room');
const {roomsHashMap} = roomModule;
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const room = roomsHashMap.rooms[roomId];

    if (room) {
        const joinResult = room.join(privateUserId);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(joinResult));
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
