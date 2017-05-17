'use strict';

const {Room} = require('./../../../model/room');
const util = require('./../../util');
const roomHashMap = require('./../../../model/room/hash-map.js');

module.exports = (req, res) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const room = new Room(
                    stringBody && JSON.parse(stringBody),
                    roomHashMap
                );

                res.setHeader('Content-Type', 'application/json');
                res.end(room.get('id'));
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
