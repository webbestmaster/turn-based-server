'use strict';

const instanceHashMap = require('./../../../model/game/hash-map.js');
const util = require('./../../util');

module.exports = (req, res, url, instanceId, keys) => {
    const instance = instanceHashMap.items[instanceId];

    if (instance) {
        const result = {};

        keys.split(',')
            .forEach(key => Object.assign(result, {[key]: instance.get(key)}));

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result}));
        return;
    }

    util.createError(res, 'Item with ID: ' + instanceId + ' is not exist.', {});
};
