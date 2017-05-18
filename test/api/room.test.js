/* global describe, it, clearInterval, setTimeout, setInterval */
'use strict';

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

    it('create room', () => {
        return post(route.create).then(roomId => {
            firstRoomId = roomId;
            assert(/\d+/.test(roomId));
        });
    });

    it('create room with parameters', () => {
        return post(route.create, {key: 'value'})
            .then(roomId => {
                secondRoomId = roomId;
                return get(route.getState.replace(':roomId', secondRoomId).replace(':key', 'key'));
            })
            .then(result => assert(JSON.parse(result).result === 'value'));
    });

    it('get all rooms', () => {
        return get(route.getItems)
            .then(roomsId => {
                assert(JSON.parse(roomsId).indexOf(firstRoomId) !== -1);
                assert(JSON.parse(roomsId).indexOf(secondRoomId) !== -1);
            });
    });

    it('set/get room state(s)', () => {
        return post(route.setState.replace(':roomId', firstRoomId), {
            key1: 'value1',
            key2: 'value2'
        })
            .then(() => Promise.all([
                get(route.getState.replace(':roomId', firstRoomId).replace(':key', 'key1')),
                get(route.getStates.replace(':roomId', firstRoomId).replace(':keys', 'key1,key2'))
            ]))
            .then(([result, results]) => {
                assert(JSON.parse(result).result === 'value1');
                assert.deepEqual(JSON.parse(results).result, {key1: 'value1', key2: 'value2'});
            });
    });

    it('push to key', () => {
        return post(route.setState.replace(':roomId', firstRoomId), {arr: ['firstValue']})
            .then(() => post(route.pushToKey.replace(':roomId', firstRoomId), {arr: 'secondValue'}))
            .then(() => get(route.getState.replace(':roomId', firstRoomId).replace(':key', 'arr')))
            .then(result => assert.deepEqual(JSON.parse(result).result, ['firstValue', 'secondValue']));
    });

    it('join', () => {
        return get(route.join.replace(':roomId', firstRoomId).replace(':privateUserId', privateUserId))
            .then(() => get(route.getState.replace(':roomId', firstRoomId).replace(':key', 'users')))
            .then(result => assert.deepEqual(JSON.parse(result).result, [{publicId: publicUserId}]));
    });

    it('set user state', () => {
        return post(route.setUserState.replace(':roomId', firstRoomId).replace(':privateUserId', privateUserId),
            {userKey: 'userValue'})
            .then(() => get(route.getState.replace(':roomId', firstRoomId).replace(':key', 'users')))
            .then(result => assert.deepEqual(JSON.parse(result).result, [{
                publicId: publicUserId,
                userKey: 'userValue'
            }]));
    });

    it('leave', () => {
        return get(route.leave.replace(':roomId', firstRoomId).replace(':privateUserId', privateUserId))
            .then(() => get(route.getState.replace(':roomId', firstRoomId).replace(':key', 'users')))
            .then(result => assert.property(JSON.parse(result), 'error'));
    });

    it('ping user', function withTimeOut(done) {
        const {leaveUserTimeout} = roomProps;
        let testRoomId = '';

        this.timeout(leaveUserTimeout * 5); // eslint-disable-line no-invalid-this

        post(route.create)
            .then(roomId => {
                testRoomId = roomId;
                return get(route.join.replace(':roomId', testRoomId).replace(':privateUserId', privateUserId));
            })
            .then(() => {
                function pingUser() {
                    return get(route.pingUser
                        .replace(':roomId', testRoomId)
                        .replace(':privateUserId', privateUserId))
                        .then(result => assert(result === ''));
                }

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
});
