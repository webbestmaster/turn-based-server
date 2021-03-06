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
    const privateUserId = constant.privateUserId;
    const publicUserId = generatePublicId(privateUserId);
    const privateSecondUserId = 'private-user-id-second-9876543210';
    const publicSecondUserId = generatePublicId(privateSecondUserId);

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
        let result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'users'));

        result = JSON.parse(result).result;

        const {pingTimeStamp, prevPingTimeStamp} = result[0];

        assert(typeof pingTimeStamp === 'number');
        assert(pingTimeStamp > 0);

        assert(typeof prevPingTimeStamp === 'number');
        assert(prevPingTimeStamp > 0);

        assert(prevPingTimeStamp === pingTimeStamp);

        assert.deepEqual(result, [{publicId: publicUserId, pingTimeStamp, prevPingTimeStamp}]);
    });

    it('set user state', async () => {
        await post(
            route.setUserState.replace(':instanceId', firstRoomId).replace(':privateUserId', privateUserId),
            {userKey: 'userValue'}
        );
        let result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'users'));

        result = JSON.parse(result).result;

        const {pingTimeStamp, prevPingTimeStamp} = result[0];

        assert.deepEqual(result, [{
            publicId: publicUserId,
            userKey: 'userValue',
            pingTimeStamp,
            prevPingTimeStamp
        }]);
    });

    it('leave', async () => {
        await get(route.leave.replace(':instanceId', firstRoomId).replace(':privateUserId', privateUserId));
        const result = await get(route.getState.replace(':instanceId', firstRoomId).replace(':key', 'users'));

        assert.property(JSON.parse(result), 'error');
    });

    it('ping user', async function withTimeOut() {
        const {leaveUserTimeout} = roomProps;

        this.timeout(leaveUserTimeout * 5); // eslint-disable-line no-invalid-this

        const testRoomId = await post(route.create);

        async function pingUser() {
            const result = await get(route.pingUser
                .replace(':instanceId', testRoomId).replace(':privateUserId', privateUserId));

            assert(result === '');
        }

        await get(route.join.replace(':instanceId', testRoomId).replace(':privateUserId', privateUserId));

        const setIntervalId = setInterval(pingUser, 1e3);

        setTimeout(async () => {
            // check room for exists
            const roomsId = await get(route.getItems);

            assert(JSON.parse(roomsId).indexOf(testRoomId) !== -1);

            clearInterval(setIntervalId);
        }, leaveUserTimeout * 2); // ping server some time

        await new Promise(resolve =>
            setTimeout(async () => {
                // check room for NOT exists
                const roomsId = await get(route.getItems);

                assert(JSON.parse(roomsId).indexOf(testRoomId) === -1);
                resolve();
            }, leaveUserTimeout * 4) // ping server some time
        );
    });

    it('ping prev and current last ping time stamp', async function withTimeOut() {
        const {leaveUserTimeout} = roomProps;
        const setTimeoutPeriod = 1e3;
        const testRoomId = await post(route.create);

        this.timeout(leaveUserTimeout * 5); // eslint-disable-line no-invalid-this

        await get(route.join.replace(':instanceId', testRoomId).replace(':privateUserId', privateUserId));

        // create first prevPingTimeStamp
        await new Promise(resolve =>
            setTimeout(async () => {
                await get(route.pingUser.replace(':instanceId', testRoomId).replace(':privateUserId', privateUserId));
                resolve();
            }, setTimeoutPeriod)
        );

        let result = await get(route.getState.replace(':instanceId', testRoomId).replace(':key', 'users'));
        let {prevPingTimeStamp, pingTimeStamp} = JSON.parse(result).result[0];

        let pingDelta = pingTimeStamp - prevPingTimeStamp;

        assert(pingDelta <= setTimeoutPeriod + 100);
        assert(pingDelta >= setTimeoutPeriod - 100);

        // create second prevPingTimeStamp
        await new Promise(resolve =>
            setTimeout(async () => {
                await get(route.pingUser.replace(':instanceId', testRoomId).replace(':privateUserId', privateUserId));
                resolve();
            }, setTimeoutPeriod)
        );

        result = await get(route.getState.replace(':instanceId', testRoomId).replace(':key', 'users'));

        prevPingTimeStamp = JSON.parse(result).result[0].prevPingTimeStamp;
        pingTimeStamp = JSON.parse(result).result[0].pingTimeStamp;

        pingDelta = pingTimeStamp - prevPingTimeStamp;

        assert(pingDelta <= setTimeoutPeriod + 100);
        assert(pingDelta >= setTimeoutPeriod - 100);
    });

    it('leave/push/get turn by user', async () => { // eslint-disable-line max-statements
        const roomId = await post(route.create);

        // join users
        await get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateUserId));
        await get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId));

        // check current currentUserPublicId
        await post(route.setState.replace(':instanceId', roomId), {currentUserPublicId: publicUserId});
        let result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));

        assert(JSON.parse(result).result === publicUserId);

        // check turn counter
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'turnCounter'));
        assert(JSON.parse(result).result === 1);

        // first user push turn
        await post(
            route.pushTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId),
            {myTurnKey: 'myTurnValue'}
        );
        // check push turn
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'turns'));
        assert.deepEqual(JSON.parse(result).result[0].turn, {myTurnKey: 'myTurnValue'});

        // first user leave turn
        await get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId));
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));
        assert(JSON.parse(result).result === publicSecondUserId);

        // check turn counter
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'turnCounter'));
        assert(JSON.parse(result).result === 2);

        // push turn if no users turn
        result = await post(
            route.pushTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId),
            {myTurnKey: 'myTurnValue'}
        );
        assert.property(JSON.parse(result), 'error');

        // check push turn if no users turn
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'turns'));
        let turns = JSON.parse(result).result;

        assert(turns.length === 1);
        assert.deepEqual(turns[0].turn, {myTurnKey: 'myTurnValue'});

        // leave turn by the same user
        await get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId));
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));
        assert(JSON.parse(result).result === publicSecondUserId);

        // leave turn by the second user
        await get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId));
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));
        assert(JSON.parse(result).result === publicUserId);

        // check turn counter
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'turnCounter'));
        assert(JSON.parse(result).result === 3);

        // leave turn by first user
        await get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId));
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));
        assert(JSON.parse(result).result === publicSecondUserId);

        // leave room by second user
        await get(route.leave.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId));
        result = await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));
        assert(JSON.parse(result).result === publicUserId);

        // push turn
        const pushTurnResult = await post(
            route.pushTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId),
            {myTurnKey2: 'myTurnValue2'}
        );

        assert.property(JSON.parse(pushTurnResult).result, 'hash');

        // get all turns
        result = await get(route.getTurns.replace(':instanceId', roomId).replace(':hash', 'all'));
        turns = JSON.parse(result).result.turns;
        assert(turns.length === 2);

        const firstTurnHash = turns[0].hash;

        // get turns from defined hash
        result = await get(route.getTurns.replace(':instanceId', roomId).replace(':hash', firstTurnHash));
        turns = JSON.parse(result).result.turns;
        assert(turns.length === 1);
        assert(turns[0].hash !== firstTurnHash);

        // get turn from non exists hash
        result = await get(route.getTurns.replace(':instanceId', roomId).replace(':hash', 'non-existing-hash'));
        assert.property(JSON.parse(result), 'error');
    });

    it('leave turn by disconnect', async function withTimeOut() {
        const {leaveUserTimeout} = roomProps;

        this.timeout(leaveUserTimeout * 5); // eslint-disable-line no-invalid-this

        const roomId = await post(route.create);

        async function pingUser() {
            const result = await get(route.pingUser
                .replace(':instanceId', roomId)
                .replace(':privateUserId', privateUserId));

            assert(result === '');
        }

        // join users
        await get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateUserId));
        await get(route.join.replace(':instanceId', roomId).replace(':privateUserId', privateSecondUserId));

        // currentUserPublicId
        await post(route.setState.replace(':instanceId', roomId), {
            currentUserPublicId: publicUserId
        });

        // leave turn by first user
        await get(route.leaveTurn.replace(':instanceId', roomId).replace(':privateUserId', privateUserId));
        const setIntervalId = setInterval(pingUser, 1e3);

        await new Promise(resolve =>
            setTimeout(async () => {
                const result =
                    await get(route.getState.replace(':instanceId', roomId).replace(':key', 'currentUserPublicId'));

                assert(JSON.parse(result).result === publicUserId);

                clearInterval(setIntervalId);

                resolve();
            }, leaveUserTimeout * 2)
        );
    });
});
