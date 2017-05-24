/* global describe, it */
const {get} = require('./../util');
const {assert} = require('chai');
const constant = require('./../const.json');
const {url} = constant;
const apiRoute = require('./../../http/api-route.json');
const otherRoute = apiRoute.route.other;
const route = {};

Object.keys(otherRoute)
    .forEach(key =>
        Object.assign(route, {[key]: url + otherRoute[key]}));

describe('api/other', () => {
    it('get public id', async () => {
        const publicId = await get(route.getPublicId.replace(':privateUserId', constant.privateUserId));

        assert(publicId === 'public-id-7d9d163d366e5abdcfc48331a4bb9581b8f07b7f');
    });
});
