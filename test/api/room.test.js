/* global describe, it */
'use strict';

const {get, post} = require('./../util');
// const request = require('request');
const {assert} = require('chai');
const constant = require('./../const.json');
const {url} = constant;
const apiRoute = require('./../../http/api-route.json');

describe('api/room', () => {
    let firstRoomId = '';
    let secondRoomId = '';

    it('create room', () => {
        return get({
            url: url + apiRoute.route.room.create,
            method: 'post'
        }).then(roomId => {
            firstRoomId = roomId;
            assert(/\d+/.test(roomId));
        });
    });

    it('create room with parameters', () => {
        return post(url + apiRoute.route.room.create, {key: 'value'})
            .then(roomId => {
                secondRoomId = roomId;
                return get(url + apiRoute.route.room.getState.replace(':roomId', secondRoomId).replace(':key', 'key'));
            })
            .then(result => assert(JSON.parse(result).result === 'value'));
    });

    it('get all rooms', () => {
        return get(url + apiRoute.route.room.getItems)
            .then(roomsId => {
                assert(JSON.parse(roomsId).indexOf(firstRoomId) !== -1);
                assert(JSON.parse(roomsId).indexOf(secondRoomId) !== -1);
            });
    });

    it('set/get room state(s)', () => {
        return post(url + apiRoute.route.room.setState.replace(':roomId', firstRoomId), {
            key1: 'value1',
            key2: 'value2'
        })
            .then(() => Promise.all([
                get(url + apiRoute.route.room.getState.replace(':roomId', firstRoomId).replace(':key', 'key1')),
                get(url + apiRoute.route.room.getStates.replace(':roomId', firstRoomId).replace(':keys', 'key1,key2'))
            ]))
            .then(([result, results]) => {
                assert(JSON.parse(result).result === 'value1');
                assert.deepEqual(JSON.parse(results).result, {key1: 'value1', key2: 'value2'});
            });
    });

    it('push to key', () => {
        return post(url + apiRoute.route.room.setState.replace(':roomId', firstRoomId), {
            arr: ['firstValue']
        })
            .then(() => post(url + apiRoute.route.room.pushToKey.replace(':roomId', firstRoomId), {arr: 'secondValue'}))
            .then(() => get(url + apiRoute.route.room.getState.replace(':roomId', firstRoomId).replace(':key', 'arr')))
            .then(result => assert.deepEqual(JSON.parse(result).result, ['firstValue', 'secondValue']));
    });
});
