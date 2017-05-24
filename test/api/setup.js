/* global before, after */
const httpServer = require('./../../http');

before(() => httpServer.run());
after(() => httpServer.destroy());
