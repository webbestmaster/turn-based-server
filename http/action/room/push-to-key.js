'use strict';

const instanceHashMap = require('./../../../model/room/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, instanceId) => {
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

                Object.keys(data).forEach(key => {
                    const arr = instance.get(key);

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
