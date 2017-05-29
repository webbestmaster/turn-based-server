/* global setTimeout, clearTimeout */
const generateId = require('./../../lib/generate-id');
const generatePublicId = require('./../../lib/generate-public-id');
const generateTurnId = require('./../../lib/generate-turn-id');
const find = require('lodash/find');
const BaseModel = require('./../base-model');

const props = {
    leaveUserTimeout: 5e3
};

// here is 'private' properties
const attr = {
    id: 'id',
    users: 'users',
    currentUserIndex: 'currentUserIndex',
    turns: 'turns'
};

class Room extends BaseModel {
    constructor(data, classHashMap) {
        super(data);
        const model = this;

        model.usersServiceData = [];
        model.classHashMap = classHashMap;

        model.set({
            id: generateId(),
            [attr.users]: [],
            [attr.currentUserIndex]: 0,
            [attr.turns]: []
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

                if (find(usersServiceData, {publicId})) {
                    return;
                }

                usersServiceData.push({
                    publicId,
                    leaveTimeoutId: null
                });
            });
            console.log('join user');
            console.log(usersServiceData);
            return;
        }

        // user leaved
        if (usersServiceData.length > newUsers.length) {
            model.usersServiceData =
                usersServiceData.filter(userServiceData => {
                    if (find(newUsers, {publicId: userServiceData.publicId})) {
                        return true;
                    }
                    clearTimeout(userServiceData.leaveTimeoutId);
                    return false;
                });
            console.log('leave user');
            console.log(usersServiceData);
            return;
        }

        console.warn('Why triggered onUsersChange?');
    }

    ping(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const user = find(users, {publicId});

        if (!user) {
            return {
                error: 'User is NOT exists'
            };
        }

        const userServiceData = find(model.usersServiceData, {publicId});

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

        const user = find(users, {publicId});

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
        let users = model.get(attr.users);
        const userToLeave = find(users, {publicId});

        console.log('leave user ', privateUserId);

        if (!userToLeave) {
            return;
        }

        model.leaveTurn(privateUserId);
        users = model.get(attr.users);
        const currentUser = users[model.get(attr.currentUserIndex)];

        model.set(attr.users, users.filter(user => user.publicId !== publicId));

        if (model.get(attr.users).length === 0) {
            model.destroy();
        } else {
            model.set(attr.currentUserIndex, model.get(attr.users).indexOf(currentUser));
        }
    }

    setUserState(privateUserId, key, value) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const user = find(users, {publicId});

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

    // game part
    leaveTurn(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const currentUserIndex = model.get(attr.currentUserIndex);
        const currentUser = users[currentUserIndex];


        // FIXME
        // if we have only ONE user - stop game cause we have a winner
        if (users.length === 1) {
            model.set(attr.currentUserIndex, -1);
            setTimeout(() => model.set(attr.currentUserIndex, 0), props.leaveUserTimeout);
            return;
        }

        if (!currentUser) {
            console.warn('how it happen?');
            model.set(attr.currentUserIndex, 0);
            return;
        }

        if (currentUser.publicId !== publicId) {
            return;
        }

        if (currentUserIndex === users.length - 1) {
            model.set(attr.currentUserIndex, 0);
        } else {
            model.changeBy(attr.currentUserIndex, 1);
        }
    }

    pushTurn(privateUserId, data) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const currentUserIndex = model.get(attr.currentUserIndex);
        const currentUser = users[currentUserIndex];

        if (!currentUser || currentUser.publicId !== publicId) {
            return {
                error: 'You can not push turn, please try again'
            };
        }

        const turns = model.get(attr.turns);

        const hash = generateTurnId(JSON.stringify(data));

        const turn = {
            turn: data,
            hash
        };

        turns.push(turn);

        return {hash};
    }

    getTurns(hash) {
        const model = this;
        const turns = model.get(attr.turns);

        if (hash === 'all') {
            return turns;
        }

        const turn = find(turns, {hash});

        if (!turn) {
            return {
                error: 'Has no turn with hash: ' + hash
            };
        }

        return turns.slice(turns.indexOf(turn) + 1);
    }
}

module.exports.Room = Room;
module.exports.props = props;
