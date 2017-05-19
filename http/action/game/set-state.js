'use strict';

const instanceHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, roomId) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const data = stringBody ? JSON.parse(stringBody) : {};
                const instance = instanceHashMap.items[roomId];

                if (!instance) {
                    util.createError(res, 'Item with ID: ' + roomId + ' is not exist.', {});
                    return;
                }

                instance.set(data);

                Object.assign(res, {statusCode: 204});
                res.end();
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
