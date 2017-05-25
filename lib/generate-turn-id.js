const sha1 = require('sha1');
let id = 0;

module.exports = key => {
    id += 1;
    return 'turn-id-' + sha1(key + String(id)).slice(0, 6);
};
