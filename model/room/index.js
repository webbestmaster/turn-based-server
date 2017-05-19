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
        const model = this;

        model.usersServiceData = [];
        model.classHashMap = classHashMap;

        model.set({
            id: generateId(),
            [attr.users]: []
        });

        Object.assign(classHashMap.items, {[model.get('id')]: model});

        model.onChange(attr.users, model.onUsersChange, model);
    }

    onUsersChange(newUsers) {
        const model = this;
        const {usersServiceData} = model;

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
            model.usersServiceData =
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
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const user = _.find(users, {publicId});

        if (!user) {
            return {
                error: 'User is NOT exists'
            };
        }

        const userServiceData = _.find(model.usersServiceData, {publicId});

        if (userServiceData) {
            clearTimeout(userServiceData.leaveTimeoutId);
            userServiceData.leaveTimeoutId = setTimeout(
                () => model.leave(privateUserId),
                props.leaveUserTimeout
            );
        }

        return {};
    }

    join(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);

        const user = _.find(users, {publicId});

        if (user) { // user already exists
            return;
        }

        console.log('join user ', privateUserId);

        users.push({
            publicId
        });

        model.trigger(attr.users); // need to trigger service data

        model.ping(privateUserId);
    }

    leave(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const userToLeave = _.find(users, {publicId});

        console.log('leave user ', privateUserId);

        if (userToLeave) {
            model.set(attr.users, users.filter(user => user.publicId !== publicId));
        }

        if (model.get(attr.users).length === 0) {
            model.destroy();
        }
    }

    setUserState(privateUserId, key, value) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
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
        const model = this;
        const instanceId = model.get('id');

        model.usersServiceData.forEach(userServiceData => clearTimeout(userServiceData.leaveTimeoutId));

        model.usersServiceData = null;

        Reflect.deleteProperty(model.classHashMap.items, instanceId);
        model.classHashMap = null;

        console.log('model destroyed', instanceId);

        super.destroy();
    }
}

module.exports.Room = Room;
module.exports.props = props;
