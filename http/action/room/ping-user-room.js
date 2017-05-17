'use strict';

const roomHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const room = roomHashMap.items[roomId];

    if (room) {
        room.ping(privateUserId);
        Object.assign(res, {statusCode: 204});
        res.end();
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
