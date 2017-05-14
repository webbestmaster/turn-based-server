'use strict';

const generatePublicId = require('./../../../lib/generate-public-id');

module.exports = (req, res, url, key) => {
    res.setHeader('Content-Type', 'text/plain');
    res.end(generatePublicId(key));
};
