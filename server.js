var moment = require('moment');
var net = require('net');
var util = require('util');

/** Soup server constructor. */
function SoupServer(config) {
  this.clients=[];
  this.sessionid=config['sessionid'];
  this.listeningPort = config['listeningPort'];
  this.listener = config['listener'];

  // Creates / returns a session token
  this.generateSession = function() {
    return moment().format("MMDDYYYY");
  };
  /** Creates server and starts listening on bind port.  If instance wasn't configured w/ sessionid, automatically generates one. */
  this.start = function() {
    // MAIN START====================
    if (this.sessionid == undefined ) {
      this.sessionid = this.generateSession();
    }
    this.server = net.createServer(this.listener);
    console.log("Starting to listen on port %d.", this.listeningPort);
    this.server.listen(this.listeningPort, "localhost");
    console.log("TCP server has been set up on localhost and listening on port %d", this.listeningPort); 
  };
}

module.exports = {
  SoupServer:SoupServer
}
