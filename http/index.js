'use strict';

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

// Room api
fsServer.bindRequest('post', apiRoute.route.creteRoom, actionRoom.reateRoom, null);
fsServer.bindRequest('get', apiRoute.route.getRooms, actionRoom.getRooms, null);
fsServer.bindRequest('get', apiRoute.route.joinRoom, actionRoom.joinRoom, null);
fsServer.bindRequest('get', apiRoute.route.leaveRoom, actionRoom.leaveRoom, null);
fsServer.bindRequest('get', apiRoute.route.getRoomState, actionRoom.getRoomState, null);
fsServer.bindRequest('get', apiRoute.route.getRoomStates, actionRoom.getRoomStates, null);
fsServer.bindRequest('post', apiRoute.route.setRoomState, actionRoom.setRoomState, null);
fsServer.bindRequest('post', apiRoute.route.setUserRoomState, actionRoom.setUserRoomState, null);
fsServer.bindRequest('get', apiRoute.route.pingUserRoom, actionRoom.pingUserRoom, null);
fsServer.bindRequest('post', apiRoute.route.pushToRoomKey, actionRoom.pushToRoomKey, null);

// Other api
fsServer.bindRequest('get', apiRoute.route.getPublicId, actionOther.getPublicId, null);

// run server
fsServer.run();
