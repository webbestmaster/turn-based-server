/* global describe, it */
'use strict';

const {assert} = require('chai');

function summ(arg1, arg2) {
    return arg1 + arg2;
}

describe('api/other', () => {
    it('test test', () => {
        assert.equal(summ(2, 2), 4);
    });

    it('test test', () => {
        assert.equal(summ(2, 2), 4);
    });
});
