'use strict';

const instanceHashMap = require('./../../../model/game/hash-map.js');

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
        JSON.stringify(
            Object.keys(
                instanceHashMap.items
            )
        )
    );
};
