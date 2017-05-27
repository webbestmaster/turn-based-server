const {Room} = require('./../../../model/room');
const util = require('./../../util');
const instanceHashMap = require('./../../../model/room/hash-map.js');

module.exports = (req, res) => {
    util
        .streamBodyParser(req)
        .then(stringBody => {
            try {
                const instance = new Room(
                    stringBody && JSON.parse(stringBody),
                    instanceHashMap
                );

                res.end(instance.get('id'));
            } catch (evt) {
                util.createError(res, 'Can not parse post data, should be JSON', evt);
            }
        })
        .catch(err => util.createError(res, 'Can not parse post raw data', err));
};
