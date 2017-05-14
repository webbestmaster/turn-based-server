'use strict';

const roomModule = require('./../../../model/room');
const {roomsHashMap} = roomModule;

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
        JSON.stringify(
            Object.keys(
                roomsHashMap.rooms
            )
        )
    );
};
