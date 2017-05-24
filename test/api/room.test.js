/* global describe, it, clearInterval, setTimeout, setInterval */
const {get, post} = require('./../util');
const roomProps = require('./../../model/room').props;
const {assert} = require('chai');
const constant = require('./../const.json');
const {url} = constant;
const apiRoute = require('./../../http/api-route.json');
const generatePublicId = require('./../../lib/generate-public-id');
const roomRoute = apiRoute.route.room;
const route = {};

Object.keys(roomRoute)
    .forEach(key =>
        Object.assign(route, {[key]: url + roomRoute[key]}));

describe('api/room', () => {
    let firstRoomId = '';
    let secondRoomId = '';
    const privateUserId = 'private-user-id-1234567890';
    const publicUserId = generatePublicId(privateUserId);
    const privateSecondUserId = 'private-user-id-second-1234567890';
    // const publicSecondUserId = generatePublicId(privateUserId);

    it('create room', async () => {
        firstRoomId = await post(route.create);
        assert(/\d+/.test(firstRoomId));
    });

    it('create room with parameters', async () => {
        secondRoomId = await post(route.create, {key: 'value'});

        const state = await get(route.getState.replace(':instanceId', secondRoomId).replace(':key', 'key'));

        assert(JSON.parse(state).result === 'value');
    });

    it('get all rooms', async () => {
        const roomsId = JSON.parse(await get(route.getItems));

        assert(roomsId.indexOf(firstRoomId) !== -1);
        assert(roomsId.indexOf(secondRoomId) !== -1);
    });

    it('set/get room state(s)', async () => {
        await post(route.setState.replace(':instanceId', firstRoomId), {
            key1: 'value1',
            key2: 'value2'
        });

        const [result, results] = await Promise.all([
            get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'key1')),
            get(route.getStates.replace(':instanceId', firstRoomId).replace(':keys', 'key1,key2'))
        ]);

        assert(JSON.parse(result).result === 'value1');
        assert.deepEqual(JSON.parse(results).result, {key1: 'value1', key2: 'value2'});
    });

    it('push to key', async () => {
        await post(route.setState.replace(':instanceId', firstRoomId), {arr: ['firstValue']});
        await post(route.pushToKey.replace(':instanceId', firstRoomId), {arr: 'secondValue'});
        const result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'arr'));

        assert.deepEqual(JSON.parse(result).result, ['firstValue', 'secondValue']);
    });

    it('join', async () => {
        await get(route.join.replace(':instanceId', firstRoomId).replace(':privateUserId', privateUserId));
        const result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'users'));

        assert.deepEqual(JSON.parse(result).result, [{publicId: publicUserId}]);
    });

    it('set user state', async () => {
        await post(
            route.setUserState.replace(':instanceId', firstRoomId).replace(':privateUserId', privateUserId),
            {userKey: 'userValue'}
        );
        const result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'users'));

        assert.deepEqual(JSON.parse(result).result, [{
            publicId: publicUserId,
            userKey: 'userValue'
        }]);
    });

    it('leave', async () => {
        await get(route.leave.replace(':instanceId', firstRoomId).replace(':privateUserId', privateUserId));
        const result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'users'));

        assert.property(JSON.parse(result), 'error');
    });

    it.skip('ping user', function withTimeOut(done) {
        const {leaveUserTimeout} = roomProps;
        let testRoomId = '';

        this.timeout(leaveUserTimeout * 5); // eslint-disable-line no-invalid-this

        function pingUser() {
            return get(route.pingUser
                .replace(':instanceId', testRoomId)
                .replace(':privateUserId', privateUserId))
                .then(result => assert(result === ''));
        }

        post(route.create)
            .then(instanceId => {
                testRoomId = instanceId;
                return get(route.join.replace(':instanceId', testRoomId).replace(':privateUserId', privateUserId));
            })
            .then(() => {
                const setIntervalId = setInterval(pingUser, 1e3);

                setTimeout(() => {
                    // check room for exists
                    get(route.getItems)
                        .then(roomsId => assert(JSON.parse(roomsId).indexOf(testRoomId) !== -1));

                    clearInterval(setIntervalId);
                }, leaveUserTimeout * 2); // ping server some time

                setTimeout(() => {
                    // check room for NOT exists
                    get(route.getItems)
                        .then(roomsId => {
                            assert(JSON.parse(roomsId).indexOf(testRoomId) === -1);
                            done();
                        });
                }, leaveUserTimeout * 4); // ping server some time
            });
    });

    it('leave/push turn by user', () => {
        let roomId = '';

        return post(route.create)
            .then(instanceId => {
                roomId = instanceId;
            })
            // join users
            .then(() =>
                get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateUserId)))
            .then(() =>
                get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId)))
            // check current currentUserIndex
            .then(() =>
                get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex')))
            .then(result =>
                assert(JSON.parse(result).result === 0))
            // push turn
            .then(() =>
                post(
                    route.pushTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId),
                    {myTurnKey: 'myTurnValue'}
                ))
            // check push turn
            .then(() => get(route.getState.replace(':instanceId', roomId).replace(':key', 'turns')))
            .then(result => assert.deepEqual(JSON.parse(result).result[0].turn, {myTurnKey: 'myTurnValue'}))
            // leave turn
            .then(() =>
                get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId)))
            .then(() =>
                get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex')))
            .then(result => assert(JSON.parse(result).result === 1))
            // push turn if no users turn
            .then(() =>
                post(
                    route.pushTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId),
                    {myTurnKey: 'myTurnValue'}
                ))
            .then(result => assert.property(JSON.parse(result), 'error'))
            // check push turn if no users turn
            .then(() => get(route.getState.replace(':instanceId', roomId).replace(':key', 'turns')))
            .then(result => {
                const turns = JSON.parse(result).result;

                assert(turns.length === 1);
                assert.deepEqual(turns[0].turn, {myTurnKey: 'myTurnValue'});
            })
            // leave turn by the same user
            .then(() =>
                get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId)))
            .then(() =>
                get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex')))
            .then(result => assert(JSON.parse(result).result === 1))
            // leave turn by the second user
            .then(() =>
                get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId)))
            .then(() =>
                get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex')))
            .then(result =>
                assert(JSON.parse(result).result === 0))
            // leave turn by first user
            .then(() =>
                get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId)))
            .then(() =>
                get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex')))
            .then(result =>
                assert(JSON.parse(result).result === 1))
            // leave room by second user
            .then(() =>
                get(route.leave.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId)))
            .then(() =>
                get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex')))
            .then(result =>
                assert(JSON.parse(result).result === 0));
    });

    it.skip('leave turn by disconnect', function withTimeOut(done) {
        let roomId = '';
        const {leaveUserTimeout} = roomProps;

        this.timeout(leaveUserTimeout * 5); // eslint-disable-line no-invalid-this

        function pingUser() {
            return get(route.pingUser
                .replace(':instanceId', roomId)
                .replace(':privateUserId', privateUserId))
                .then(result => assert(result === ''));
        }

        post(route.create)
            .then(instanceId => {
                roomId = instanceId;
            })
            // join users
            .then(() => get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateUserId)))
            .then(() => get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId)))
            // leave turn by first user
            .then(() => get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId)))
            .then(() => {
                const setIntervalId = setInterval(pingUser, 1e3);

                setTimeout(() => {
                    get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserIndex'))
                        .then(result => assert(JSON.parse(result).result === 0))
                        .then(() => {
                            clearInterval(setIntervalId);
                            done();
                        });
                }, leaveUserTimeout * 2);
            });
    });
});
