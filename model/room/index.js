'use strict';

/* global setTimeout, clearTimeout */
const generateId = require('./../../lib/generate-id');
const generatePublicId = require('./../../lib/generate-public-id');
const _ = require('lodash');
const BaseModel = require('./../base-model');

const props = {
    leaveUserTimeout: 5e3
};

const attr = {
    users: 'users'
};

class Room extends BaseModel {
    constructor(data, classHashMap) {
        super(data);
        const room = this;

        room.usersServiceData = [];
        room.classHashMap = classHashMap;

        room.set({
            id: generateId(),
            [attr.users]: []
        });

        Object.assign(classHashMap.items, {[room.get('id')]: room});

        room.onChange(attr.users, room.onUsersChange, room);
    }

    onUsersChange(newUsers) {
        const room = this;
        const {usersServiceData} = room;

        // user added
        if (usersServiceData.length < newUsers.length) {
            newUsers.forEach(newUser => {
                const {publicId} = newUser;

                if (_.find(usersServiceData, {publicId})) {
                    return;
                }

                usersServiceData.push({
                    publicId,
                    leaveTimeoutId: null
                });
            });
            console.log(usersServiceData);
            return;
        }

        // user leaved
        if (usersServiceData.length > newUsers.length) {
            room.usersServiceData =
                usersServiceData.filter(userServiceData => {
                    if (_.find(newUsers, {publicId: userServiceData.publicId})) {
                        return true;
                    }
                    clearTimeout(userServiceData.leaveTimeoutId);
                    return false;
                });
            console.log(usersServiceData);
            return;
        }

        console.warn('Why triggered onUsersChange?');
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

        const userServiceData = _.find(room.usersServiceData, {publicId});

        if (userServiceData) {
            clearTimeout(userServiceData.leaveTimeoutId);
            userServiceData.leaveTimeoutId = setTimeout(
                () => room.leave(privateUserId),
                props.leaveUserTimeout
            );
        }

        return {};
    }

    join(privateUserId) {
        const room = this;
        const publicId = generatePublicId(privateUserId);
        const users = room.get(attr.users);

        const user = _.find(users, {publicId});

        if (user) { // user already exists
            return;
        }

        console.log('join user ', privateUserId);

        users.push({
            publicId
        });

        room.trigger(attr.users); // need to trigger service data

        room.ping(privateUserId);
    }

    leave(privateUserId) {
        const room = this;
        const publicId = generatePublicId(privateUserId);
        const users = room.get(attr.users);
        const userToLeave = _.find(users, {publicId});

        console.log('leave user ', privateUserId);

        if (userToLeave) {
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
        const roomId = room.get('id');

        room.usersServiceData.forEach(userServiceData => clearTimeout(userServiceData.leaveTimeoutId));

        room.usersServiceData = null;

        Reflect.deleteProperty(room.classHashMap.items, roomId);
        room.classHashMap = null;

        console.log('room destroyed', roomId);

        super.destroy();
    }
}

module.exports.Room = Room;
// module.exports.props = props;
