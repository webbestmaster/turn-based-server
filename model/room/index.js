'use strict';

/* global setTimeout, clearTimeout */
const generateId = require('./../../lib/generate-id');
const generatePublicId = require('./../../lib/generate-public-id');
const _ = require('lodash');

const roomsHashMap = {
    rooms: {}
};

const props = {
    leaveUserTimeout: 5e3
};

// TODO: add check if user get/set filed users
const attr = {
    users: 'users'
};

class Room {
    constructor(data) {
        const room = this;

        room._attr = data || {};
        room.set('id', generateId());
        room.set(attr.users, []);

        roomsHashMap.rooms[room.get('id')] = room;
    }

    ping(privateUserId) {
        const room = this;
        const publicId = generatePublicId(privateUserId);
        const users = room.get(attr.users);
        const user = _.find(users, {publicId});

        if (!user) {
            return {
                error: 'User is NOT exists'
            };
        }

        clearTimeout(user.leaveTimeoutId);
        user.leaveTimeoutId = setTimeout(
            () => room.leave(privateUserId),
            props.leaveUserTimeout
        );

        return {};
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

        console.log('join user ', privateUserId);

        users.push({
            publicId,
            leaveTimeoutId: -1
        });

        room.ping(privateUserId);

        return {
            publicId
        };
    }

    leave(privateUserId) {
        const room = this;
        const publicId = generatePublicId(privateUserId);
        const users = room.get(attr.users);
        const userToLeave = _.find(users, {publicId});

        console.log('leave user ', privateUserId);

        if (userToLeave) {
            clearTimeout(userToLeave.leaveTimeoutId);
            room.set(attr.users, users.filter(user => user.publicId !== publicId));
        }

        if (room.get(attr.users).length === 0) {
            room.destroy();
        }
    }

    setUserState(privateUserId, key, value) {
        const room = this;
        const publicId = generatePublicId(privateUserId);
        const users = room.get(attr.users);
        const user = _.find(users, {publicId});

        if (!user) {
            return {
                error: 'User is NOT exists'
            };
        }

        user[key] = value;

        return {};
    }

    destroy() {
        const room = this;
        const users = room.get(attr.users);
        const roomId = room.get('id');

        users.map(user => {
            clearTimeout(user.leaveTimeoutId);
            return null;
        });

        room._attr = null;
        Reflect.deleteProperty(roomsHashMap.rooms, roomId);
        console.log('room destroyed', roomId);
    }
}

module.exports.Room = Room;
module.exports.roomsHashMap = roomsHashMap;
