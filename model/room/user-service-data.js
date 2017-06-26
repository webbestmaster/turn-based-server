/* global setTimeout, clearTimeout */
const BaseModel = require('main-model');

const attr = {
    id: 'id',
    leaveTimeout: 'leaveTimeout'
};

/**
 *
 * @typedef {UserServiceData} - user service data
 */
class UserServiceData extends BaseModel {
    constructor() {
        super();

        const model = this;

        model.setId('');
        model.setLeaveTimeOut(() => {
        }, 0);
    }

    /**
     *
     * @return {string} user public id
     */
    getId() {
        return this.get(attr.id);
    }

    /**
     *
     * @param {string} id - user public id
     * @return {UserServiceData} instance
     */
    setId(id) {
        return this.set(attr.id, id);
    }

    /**
     *
     * @return {UserServiceData} instance
     */
    clearLeaveTimeOut() {
        const model = this;

        clearTimeout(model.get(attr.leaveTimeout));

        return model;
    }

    /**
     *
     * @param {function} callback - leave user from room
     * @param {number} timeOutSize - time out to for callback
     * @return {UserServiceData} instance
     */
    setLeaveTimeOut(callback, timeOutSize) {
        const model = this;

        model.clearLeaveTimeOut();

        model.set(attr.leaveTimeout, setTimeout(callback, timeOutSize));

        return model;
    }

    destroy() {
        this.clearLeaveTimeOut();
        super.destroy();
    }
}

module.exports.UserServiceData = UserServiceData;
