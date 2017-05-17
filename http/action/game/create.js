'use strict';

const {Game} = require('./../../../model/game');
const util = require('./../../util');
const gameHashMap = require('./../../../model/game/hash-map.js');

module.exports = (req, res) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const room = new Game(
                    stringBody && JSON.parse(stringBody),
                    gameHashMap
                );

                res.setHeader('Content-Type', 'application/json');
                res.end(room.get('id'));
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
