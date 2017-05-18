/* global describe, it */
'use strict';

const {get, post} = require('./../util');
// const request = require('request');
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
        return get({
            url: route.create,
            method: 'post'
        }).then(roomId => {
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
});
