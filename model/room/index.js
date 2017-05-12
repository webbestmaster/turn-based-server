'use strict';

const generateId = require('./../../lib/generate-id');
const roomsHashMap = {
    rooms: {}
};

class Room {
    constructor(props) {
        const room = this;

        room._attr = props || {};
        room.set('id', generateId());

        roomsHashMap.rooms[room.get('id')] = room;
    }

    get(key) {
        return this._attr[key];
    }

    set(key, value) {
        this._attr[key] = value;
        return this;
    }
}

module.exports.Room = Room;
module.exports.roomsHashMap = roomsHashMap;
