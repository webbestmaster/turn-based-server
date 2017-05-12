'use strict';

const FsServer = require('fs-server');
const serverConst = require('./server-const');
const {httpPort} = serverConst;
const fsServerConfig = {
    root: './www/', // path to front-end part of site
    port: httpPort // optional, recommended this, or do not use this field
    // page404: 'custom-404-page/index.html' // optional, path to custom 404 page
};
const apiRoute = require('./api-route.json');
const fsServer = new FsServer(fsServerConfig); // create server with config
const action = require('./action');

// Room api
fsServer.bindRequest('post', apiRoute.route.creteRoom, action.reateRoom, null);
fsServer.bindRequest('get', apiRoute.route.getRooms, action.getRooms, null);
fsServer.bindRequest('get', apiRoute.route.joinRoom, action.joinRoom, null);

// run server
fsServer.run();
