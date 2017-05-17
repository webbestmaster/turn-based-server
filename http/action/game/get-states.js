'use strict';

const gameHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, keys) => {
    const room = gameHashMap.items[roomId];

    if (room) {
        const result = {};

        keys.split(',')
            .forEach(key => Object.assign(result, {[key]: room.get(key)}));

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
};
