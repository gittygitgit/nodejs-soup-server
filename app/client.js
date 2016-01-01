var net = require('net');
var util = require('util');
var os = require('os');
var TIMEOUT_HEARTBEAT_IN_SECONDS = 1;
var TIMEOUT_NO_SERVER_HEARTBEAT_IN_SECONDS = 15;
var serverMonitor;

function scheduleClientHeartbeat() {
  heartbeat = setInterval(function() {
    client.write('R\n');
  }, TIMEOUT_HEARTBEAT_IN_SECONDS * 1000);
}

function scheduleServerHeartbeatMonitor() {
  serverMonitor = setTimeout(function() {
    client.end("No server detected...Terminating connection.");
  } , TIMEOUT_NO_SERVER_HEARTBEAT_IN_SECONDS * 1000);
}

var client = net.connect({port: 8080},
  function() { //'connect' listener
    console.log('client connected');
    client.write('Lbrace1password10                              ' + os.EOL);
  }
);

client.on('data', function(data) {
  util.log("heard data")
  var msgType = data.toString("utf-8", 0, 1);

  switch(msgType) {
  case 'A':
    util.log("heard login accepted message.");
    scheduleClientHeartbeat();
    scheduleServerHeartbeatMonitor();
    break;
  case 'J':
    util.log("heard login rejected message.");
    break;
  case 'H':
    util.log("heard server heartbeat.");
    clearTimeout(serverMonitor);
    scheduleServerHeartbeatMonitor();
    break;
  }
});
