var SoupServer = require('../app/server.js').SoupServer;
var ClientWorker = require('../libs/client-worker.js').ClientWorker;

var util = require('util');
var config = {
  "sessionid"          : "testing",
  "listeningPort"      : 9000,
  "listener"           : function(socket) {
    util.log('heard connection');
    var worker = new ClientWorker(socket);
  }
}
var server = new SoupServer(config);
server.start();
