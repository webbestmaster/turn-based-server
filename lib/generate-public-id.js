'use strict';

const sha1 = require('sha1');

module.exports = key => 'public-id-' + sha1(key);
