/* global describe, it */
'use strict';

const {get} = require('./../util');
const {assert} = require('chai');
const constant = require('./../const.json');
const apiRoute = require('./../../http/api-route.json');

describe('api/other', () => {
    it('get public id', () =>
        get(constant.url + apiRoute.route.other.getPublicId.replace(':privateUserId', constant.privateUserId))
            .then(body => assert(body === 'public-id-7d9d163d366e5abdcfc48331a4bb9581b8f07b7f'))
    );
});
