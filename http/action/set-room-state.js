'use strict';

const roomModule = require('./../../model/room');
const {roomsHashMap} = roomModule;
const util = require('./../util');

module.exports = (req, res, url, roomId) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const data = stringBody ? JSON.parse(stringBody) : {};
                const room = roomsHashMap.rooms[roomId];

                if (!room) {
                    util.createError(res, 'Room with ID: ' + roomId + ' is not exist.', {});
                    return;
                }

                Object.keys(data).forEach(key => room.set(key, data[key]));
                res.end();
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
