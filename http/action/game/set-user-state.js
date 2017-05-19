'use strict';

const instanceHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, instanceId, privateUserId) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const data = stringBody ? JSON.parse(stringBody) : {};
                const instance = instanceHashMap.items[instanceId];

                if (!instance) {
                    util.createError(res, 'Item with ID: ' + instanceId + ' is not exist.', {});
                    return;
                }

                Object
                    .keys(data)
                    .map(key => instance.setUserState(privateUserId, key, data[key]));

                Object.assign(res, {statusCode: 204});
                res.end();
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
