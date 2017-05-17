'use strict';

const gameHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const room = gameHashMap.items[roomId];

    if (room) {
        room.ping(privateUserId);
        Object.assign(res, {statusCode: 204});
        res.end();
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
