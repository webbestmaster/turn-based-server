'use strict';

const generateId = require('./../../lib/generate-id');
const generatePublicId = require('./../../lib/generate-public-id');
const _ = require('lodash');


const roomsHashMap = {
    rooms: {}
};

// TODO: add check if user get/set filed users
const attr = {
    users: 'users_'
};

class Room {
    constructor(props) {
        const room = this;

        room._attr = props || {};
        room.set('id', generateId());
        room.set(attr.users, []);

        roomsHashMap.rooms[room.get('id')] = room;
    }

    get(key) {
        return this._attr[key];
    }

    set(key, value) {
        this._attr[key] = value;
        return this;
    }

    join(privateUserId) {
        const room = this;
        const publicId = generatePublicId(privateUserId);
        const users = room.get(attr.users);

        const user = _.find(users, {publicId});

        if (user) {
            return {
                error: 'User already exists'
            };
        }

        users.push({
            publicId
        });

        return {
            publicId
        };
    }
}

module.exports.Room = Room;
module.exports.roomsHashMap = roomsHashMap;
