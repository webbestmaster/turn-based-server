'use strict';

const gameHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const data = stringBody ? JSON.parse(stringBody) : {};
                const room = gameHashMap.items[roomId];

                if (!room) {
                    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
                    return;
                }

                Object.keys(data).forEach(key => {
                    const arr = room.get(key);

                    if (Array.isArray(arr)) {
                        arr.push(data[key]);
                    }
                });

                Object.assign(res, {statusCode: 204});
                res.end();
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
