'use strict';

const roomHashMap = require('./../../../model/room/hash-map.js');

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
        JSON.stringify(
            Object.keys(
                roomHashMap.items
            )
        )
    );
};
