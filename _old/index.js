var net = require('net');
var util = require('util');
var sql = require('mssql'); 
var moment = require('moment');
var s = require("underscore.string")
var parseArgs=require('minimist')

result = parseArgs(process.argv.slice(2))
process.on('exit', function(code) {
  switch(code) {
    case 0:
      break;
    default:
      console.log('Exiting with code:', code);
  }
});

var sessionid = result['sessionid'];

console.log(sessionid);
if (sessionid == undefined) {
  console.log("No session specified.  Will auto-generate one.")
}

var TIMEOUT_LOGIN_REQUEST_IN_SECONDS = 30;
var TIMEOUT_HEARTBEAT_IN_SECONDS = 1;
var TIMEOUT_PUMP_IN_SECONDS = 1;
var TIMEOUT_NO_CLIENT_HEARTBEAT_IN_SECONDS = 15;

var config = {
  user: 'appusr',
  password: 'appusr',
  server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
  database: 'TEST',
  stream: true
}

// Schedules a connection timeout in the event a successful login hasn't been
// performed.  
// Returns a handle to the schedule event.
function scheduleLoginRequestTimeout(timeoutInSec) {
  return setTimeout(function() {
    if (!loggedIn) {
       con.end(util.format("No login request received in %d seconds...Terminating connection.", timeoutInSec));
    }
  }, timeoutInSec * 1000);
}


// Creates / returns a session token
function generateSession() {
  return moment().format("MMDDYYYY");
} 

// Instantiate server object
// Connection listener is passed in
var server = net.createServer(function (con) {
  // Register login timeout listener
  var loginTimer = scheduleLoginRequestTimeout(TIMEOUT_LOGIN_REQUEST_IN_SECONDS);
  var heartbeat;
  var clientMonitor;
  
  //per connection state
  var currentSeqno = 0;
  var loggedIn = false;
  
  util.log(util.format("Connection received [host=%s, port=%s]", con.remoteAddress, con.remotePort));

  // Register data listener for the connection
  con.on('data', function(data) {

    var msgType = data.toString("utf-8", 0, 1); 
      // check for login 
    switch(msgType) {
    case 'L':
      // login request
      handleLoginRequest(data);
      break;
    case 'O':
      // logout request
      util.log("Detected logout request");
      con.end("Terminating connection.");
      break;
    case 'R':
      // client heartbeat
      util.log("Detected client heartbeat.");
      clearTimeout(clientMonitor);
      scheduleClientHeartbeatMonitor();
      break;
    default:
      util.error("Heard unexpected data");
    }
  });
  //con.end(" Connection set up successfully. ");

  function handleLoginRequest(data) {
    if (loggedIn) {
      util.error("Already logged in.");
      return;
    }

    // Cancel previously scheduled login timeout event
    clearTimeout(loginTimer);
    util.log("Detected login request");
    loginTimer = scheduleLoginRequestTimeout(TIMEOUT_LOGIN_REQUEST_IN_SECONDS);
	
    var login = data.toString("utf-8");

    if (login.length != 48) {
      util.error("Unexpected login packet size");
      con.end("Malformed login packet [expected size=48, received=" + login.length + "]");
      clearTimeout(loginTimer);
    } else {
      var uname = login.substr(1, 6);
      var password = login.substr(7, 10);
      var session = login.substr(17, 10).trim();
      var seqno = login.substr(27, 20);

      util.debug(util.format("Login request [uname=%s, password=%s, session=%s, seqno=%s]", uname, password, session, seqno));

      if (!validLogin(uname, password)) {
	util.error("Invalid login.");
	con.end("J" + "A\n");
	clearTimeout(loginTimer);
	return;
      }   
      debugger;
      if (session && session.match(/^\s+/)) {
        if (!validSession(session)) {
          util.error("Invalid session.");
	  con.end("JS\n");
	  clearTimeout(loginTimer);
	  return;
        }
      } 
      
      loggedIn = true;
      // TODO: handle bad input 
      currentSeqno = parseInt(seqno);
      util.log("Successful login!");
      con.write("A" +  s.pad(sessionid, 10) + s.pad("1", 10) + "\n")
      // schedule server heartbeats
      scheduleServerHeartbeat();
      scheduleClientHeartbeatMonitor();
      scheduleMessagePump(seqno);
      // schedule client heartbeat monitor
	  
    }
  }
  function validLogin(uname, password) {
    // TODO: replace with a real check
    if (uname !== "brace1") {
      util.error("Invalid username");
      return false;
    }
	
    if (password !== "password10") {
      util.error("Invalid password");
      return false;
    }
	
    return true;
  }
 
  /*
  Server is configured with a session.  Compare what's passed in
  login with configuration.  Or if user didn't pass a session, 
  return true.
  */ 
  function validSession(sessionid) {
    return true;
    /*var con = new sql.Connection(config);

    con.connect(function(err) {
      if (err) {
	util.error("problem connecting to store");
	// TODO: throw exception?
        return false;
      }
      util.log('connected');
		
      var request = new sql.Request(con);
      request.query('SELECT COUNT(1) FROM tSession WHERE SESSIONID = ' + sessionid, function(err, recordset) {
	if (err) {
	  util.log('err');
	  console.log(err);
	  // TODO: throw exception?
	  return;
	} else {
	  util.debug(recordset.length);
	  return recordset.length == 1;
	}
      });
    });
    */
  }
  
  function scheduleServerHeartbeat() {
    heartbeat = setInterval(function() {
      con.write('H\n');
    }, TIMEOUT_HEARTBEAT_IN_SECONDS * 1000);
  }
  
  function scheduleClientHeartbeatMonitor() {
    clientMonitor = setInterval(function() {
      con.end("No client detected...Terminating connection.");
    } , TIMEOUT_NO_CLIENT_HEARTBEAT_IN_SECONDS * 1000);
  }

  function scheduleMessagePump(startSeqno) {
    /*pump = setInterval(function() {
      // query for messages from store
      pollForMessages();
    }, TIMEOUT_PUMP_IN_SECONDS * 1000);*/

  }
  
  function pollForMessages() {
    // load messages not already served
    util.debug("polling for Messages" + currentSeqno);
  
    var con = new sql.Connection(config);

    con.connect(function(err) {
    if (err) {
      util.error("problem connecting to store");
      // TODO: throw exception?
      return;
    }
	  
    util.log('connected');
		
    var request = new sql.Request(con);
	  
    //request.query('select ID from tTest', function(err, recordset) {
    request.query('select SEQNO, UNDERLYING from tOrder where SEQNO > ' + currentSeqno, function(err, recordset) {
      if (err) {
        util.log('err');
	  console.log(err);
	  // TODO: throw exception?
	  return;
	} else {
          util.log(recordset.length + ' rows');
	}
      });
      request.on('row', function(row) {
        broadcastMessage(row);
      });
    });
  }
  
  function broadcastMessage(row) {
    util.log('here');
    util.log(row);
    console.dir(row);
    con.write('S' + row['SEQNO'] + '|' + row['UNDERLYING'] + '\n');
    currentSeqno = row['SEQNO'];
  }
});

// MAIN START====================
if (sessionid == undefined ) {
  sessionid = generateSession();
}

var port = 8080;
console.log("Starting to listen on port %d.", port);
server.listen(port, "localhost");
console.log("TCP server has been set up on localhost and listening on port 8080.");
