'use strict';

const roomModule = require('./../../../model/room');
const {roomsHashMap} = roomModule;
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const room = roomsHashMap.rooms[roomId];

    if (room) {
        room.leave(privateUserId);
        Object.assign(res, {statusCode: 204});
        res.end();
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
