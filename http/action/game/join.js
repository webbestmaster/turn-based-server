'use strict';

const gameHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    const room = gameHashMap.items[roomId];

    if (room) {
        const joinResult = room.join(privateUserId);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(joinResult));
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
