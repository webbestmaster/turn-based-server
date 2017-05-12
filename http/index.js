'use strict';

const FsServer = require('fs-server');
const serverConst = require('./server-const');
const {httpPort} = serverConst;
const fsServerConfig = {
    root: './www/', // path to front-end part of site
    port: httpPort // optional, recommended this, or do not use this field
    // page404: 'custom-404-page/index.html' // optional, path to custom 404 page
};

new FsServer(fsServerConfig) // create server with config
    .run(); // and run
