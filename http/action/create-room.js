'use strict';

const roomModule = require('./../../model/room');
const {Room} = roomModule;
const util = require('./../util');

module.exports = (req, res) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const room = new Room(stringBody && JSON.parse(stringBody));

                res.end(room.get('id'));
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
