'use strict';

const roomHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId, privateUserId) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const data = stringBody ? JSON.parse(stringBody) : {};
                const room = roomHashMap.items[roomId];

                if (!room) {
                    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
                    return;
                }

                const result = Object.keys(data).map(key => room.setUserState(privateUserId, key, data[key]));

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({result}));
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
