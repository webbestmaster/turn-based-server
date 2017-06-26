/* global setTimeout */
const generateId = require('./../../lib/generate-id');
const generatePublicId = require('./../../lib/generate-public-id');
const generateTurnId = require('./../../lib/generate-turn-id');
const find = require('lodash/find');
const BaseModel = require('main-model');
const {UserServiceData} = require('./user-service-data');

const props = {
    leaveUserTimeout: 5e3
};

// here is 'private' properties
const attr = {
    id: 'id',
    users: 'users',
    currentUserPublicId: 'currentUserPublicId',
    turns: 'turns',
    turnCounter: 'turnCounter'
};

const userAttr = {
    publicId: 'publicId',
    prevPingTimeStamp: 'prevPingTimeStamp',
    pingTimeStamp: 'pingTimeStamp'
};

class Room extends BaseModel {
    constructor(data, classHashMap) {
        super(data);
        const model = this;

        model.usersServiceData = [];
        model.classHashMap = classHashMap;

        model.set({
            [attr.id]: generateId(),
            [attr.users]: [],
            [attr.currentUserPublicId]: '',
            [attr.turns]: [],
            [attr.turnCounter]: 0
        });

        Object.assign(classHashMap.items, {[model.get('id')]: model});

        model.onChange(attr.users, model.onUsersChange, model);
        model.onChange(attr.currentUserPublicId, () => model.changeBy(attr.turnCounter, 1), model);
    }

    findUserServiceData(id) {
        const model = this;
        const {usersServiceData} = model;

        return find(usersServiceData, instance => instance.getId() === id);
    }

    onUsersChange(newUsers) {
        const model = this;
        const {usersServiceData} = model;

        // user added
        if (usersServiceData.length < newUsers.length) {
            newUsers.forEach(newUser => {
                const publicId = newUser[userAttr.publicId];

                if (model.findUserServiceData(publicId)) {
                    return;
                }

                const userServiceData = new UserServiceData();

                userServiceData.setId(publicId);

                usersServiceData.push(userServiceData);
            });
            return;
        }

        // user leaved
        if (usersServiceData.length > newUsers.length) {
            model.usersServiceData =
                usersServiceData.filter(instance => {
                    if (find(newUsers, {[userAttr.publicId]: instance.getId()})) {
                        return true;
                    }
                    instance.destroy();
                    return false;
                });
            return;
        }

        console.warn('Why triggered onUsersChange?');
    }

    ping(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const user = find(users, {[userAttr.publicId]: publicId});

        if (!user) {
            return {
                error: 'User is NOT exists'
            };
        }

        user[userAttr.prevPingTimeStamp] = user[userAttr.pingTimeStamp];
        user[userAttr.pingTimeStamp] = Date.now();

        const userServiceData = model.findUserServiceData(publicId);

        if (userServiceData) {
            userServiceData.setLeaveTimeOut(() => model.leave(privateUserId), props.leaveUserTimeout);
        }

        return {};
    }

    join(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);

        const user = find(users, {[userAttr.publicId]: publicId});

        if (user) { // user already exists
            return;
        }

        users.push({
            [userAttr.prevPingTimeStamp]: Date.now(),
            [userAttr.pingTimeStamp]: Date.now(),
            [userAttr.publicId]: publicId
        });

        model.trigger(attr.users); // need to trigger service data

        model.ping(privateUserId);
    }

    leave(privateUserId) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const userToLeave = find(users, {[userAttr.publicId]: publicId});

        if (!userToLeave) {
            return;
        }

        model.leaveTurn(privateUserId);

        model.set(attr.users, users.filter(user => user[userAttr.publicId] !== publicId));

        if (model.get(attr.users).length === 0) {
            model.destroy();
        }
    }

    setUserState(privateUserId, key, value) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const user = find(users, {[userAttr.publicId]: publicId});

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

        model.usersServiceData.forEach(userServiceData => userServiceData.destroy());

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
        const currentUserPublicId = model.get(attr.currentUserPublicId);
        const currentUser = find(users, {[userAttr.publicId]: currentUserPublicId});

        if (!currentUser) {
            return;
        }

        // FIXME
        // if we have only ONE user - stop game cause we have a winner
        if (users.length === 1) {
            model.set(attr.currentUserPublicId, '');
            setTimeout(() => model.set(attr.currentUserPublicId, publicId), props.leaveUserTimeout);
            return;
        }

        if (currentUser[userAttr.publicId] !== publicId) {
            return;
        }

        const currentUserIndex = users.indexOf(currentUser);

        if (currentUserIndex === users.length - 1) {
            model.set(attr.currentUserPublicId, users[0][userAttr.publicId]);
        } else {
            model.set(attr.currentUserPublicId, users[currentUserIndex + 1][userAttr.publicId]);
        }
    }

    pushTurn(privateUserId, data) {
        const model = this;
        const publicId = generatePublicId(privateUserId);
        const users = model.get(attr.users);
        const currentUserPublicId = model.get(attr.currentUserPublicId);
        const currentUser = find(users, {[userAttr.publicId]: currentUserPublicId});

        if (!currentUser || currentUser[userAttr.publicId] !== publicId) {
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
