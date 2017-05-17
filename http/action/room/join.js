'use strict';

const roomHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const room = roomHashMap.items[roomId];

    if (room) {
        const joinResult = room.join(privateUserId);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(joinResult));
        return;
    }

    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
};
