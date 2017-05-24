const FsServer = require('fs-server');
const serverConst = require('./server-const');
const {httpPort} = serverConst;
const fsServerConfig = {
    root: './../ae3/dist/', // path to front-end part of site
    port: httpPort // optional, recommended this, or do not use this field
    // page404: 'custom-404-page/index.html' // optional, path to custom 404 page
};
const apiRoute = require('./api-route.json');
const fsServer = new FsServer(fsServerConfig); // create server with config
const actionRoom = require('./action/room');
const actionOther = require('./action/other');

// Other api
fsServer.bindRequest('get', apiRoute.route.other.getPublicId, actionOther.getPublicId, null);

// Room api
fsServer.bindRequest('post', apiRoute.route.room.create, actionRoom.create, null);
fsServer.bindRequest('get', apiRoute.route.room.getItems, actionRoom.getItems, null);
fsServer.bindRequest('get', apiRoute.route.room.join, actionRoom.join, null);
fsServer.bindRequest('get', apiRoute.route.room.leave, actionRoom.leave, null);
fsServer.bindRequest('get', apiRoute.route.room.getState, actionRoom.getState, null);
fsServer.bindRequest('get', apiRoute.route.room.getStates, actionRoom.getStates, null);
fsServer.bindRequest('post', apiRoute.route.room.setState, actionRoom.setState, null);
fsServer.bindRequest('post', apiRoute.route.room.setUserState, actionRoom.setUserState, null);
fsServer.bindRequest('get', apiRoute.route.room.pingUser, actionRoom.pingUser, null);
fsServer.bindRequest('post', apiRoute.route.room.pushToKey, actionRoom.pushToKey, null);
fsServer.bindRequest('get', apiRoute.route.room.leaveTurn, actionRoom.leaveTurn, null);
fsServer.bindRequest('post', apiRoute.route.room.pushTurn, actionRoom.pushTurn, null);

module.exports = fsServer;
