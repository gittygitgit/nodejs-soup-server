var util = require('util');
var s = require('underscore.string')

var TIMEOUT_LOGIN_REQUEST_IN_SECONDS = 30;
var TIMEOUT_HEARTBEAT_IN_SECONDS = 1;
var TIMEOUT_PUMP_IN_SECONDS = 1;
var TIMEOUT_NO_CLIENT_HEARTBEAT_IN_SECONDS = 15;

function ClientWorker(socket, startSeq) {
  var _this = this;
  this.socket = socket;
  this.startSeq = startSeq;
  this.isLoggedIn = false;
  /*
  Schedules a connection timeout in the event a successful login hasn't been
  performed.
  Returns a handle to the schedule event.
  */
  this.scheduleLoginRequestTimeout  = function(timeoutInSeconds) {
    return setTimeout(function() {
      if (!this.isLoggedIn) {
        _this.socket.end(util.format("No login request received in %d seconds...Terminating connection.", timeoutInSeconds));
      }
    }, timeoutInSeconds * 1000);
  };
  
  this.loginTimer = this.scheduleLoginRequestTimeout(TIMEOUT_LOGIN_REQUEST_IN_SECONDS);
  this.heartbeat;
  this.clientMonitor;

  //per connection state
  this.currentSeqno = this.startSeq;
  this.onData = function(data) {

    var msgType = data.toString("utf-8", 0, 1);
      // check for login
    switch(msgType) {
    case 'L':
      // login request
      _this.handleLoginRequest(data);
      break;
    case 'O':
      // logout request
      util.log("Detected logout request");
      _this.socket.end("Terminating connection.");
      break;
    case 'R':
      // client heartbeat
      util.log("Detected client heartbeat.");
      clearTimeout(_this.clientMonitor);
      _this.scheduleClientHeartbeatMonitor();
      break;
    default:
      util.error("Heard unexpected data");
    }
  };
  this.validLogin = function(uname, password) {
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
  };
  /*
  Server is configured with a session.  Compare what's passed in
  login with configuration.  Or if user didn't pass a session,
  return true.
  */
  this.validSession = function(sessionid) {
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
  };
  this.scheduleServerHeartbeat = function() {
    _this.heartbeat = setInterval(function() {
      _this.socket.write('H\n');
    }, TIMEOUT_HEARTBEAT_IN_SECONDS * 1000);
  };
  this.scheduleClientHeartbeatMonitor = function() {
    _this.clientMonitor = setInterval(function() {
      _this.socket.end("No client detected...Terminating connection.");
    } , TIMEOUT_NO_CLIENT_HEARTBEAT_IN_SECONDS * 1000);
  };
  this.pollForMessages = function() {
    // load messages not already served
    util.debug("polling for Messages" + this.currentSeqno);

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
  };
  this.broadcastMessage = function(row) {
    util.log('here');
    util.log(row);
    console.dir(row);
    this.socket.write('S' + row['SEQNO'] + '|' + row['UNDERLYING'] + '\n');
    this.currentSeqno = row['SEQNO'];
  };

  this.scheduleMessagePump = function(startSeqno) {
    /*pump = setInterval(function() {
      // query for messages from store
      pollForMessages();
    }, TIMEOUT_PUMP_IN_SECONDS * 1000);*/
  }
  this.handleLoginRequest = function(data) {
    if (this.isLoggedIn) {
      util.error("Already logged in.");
      return;
    }

    // Cancel previously scheduled login timeout event
    clearTimeout(this.loginTimer);
    util.log("Detected login request");
    this.loginTimer = this.scheduleLoginRequestTimeout(TIMEOUT_LOGIN_REQUEST_IN_SECONDS);

    var login = data.toString("utf-8");

    if (login.length != 48) {
      util.error("Unexpected login packet size");
      this.socket.end("Malformed login packet [expected size=48, received=" + login.length + "]");
      clearTimeout(this.loginTimer);
    } else {
      var uname = login.substr(1, 6);
      var password = login.substr(7, 10);
      var session = login.substr(17, 10).trim();
      var seqno = login.substr(27, 20);

      util.debug(util.format("Login request [uname=%s, password=%s, session=%s, seqno=%s]", uname, password, session, seqno));

      if (!this.validLogin(uname, password)) {
        util.error("Invalid login.");
        this.socket.end("J" + "A\n");
        clearTimeout(this.loginTimer);
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

      this.loggedIn = true;
      clearTimeout(this.loginTimer);
      // TODO: handle bad input
      this.currentSeqno = parseInt(seqno);
      util.log("Successful login!");
      this.isLoggedIn = true;
      this.socket.write("A" +  s.pad(this.sessionid, 10) + s.pad("1", 10) + "\n")
      // schedule server heartbeats
      this.scheduleServerHeartbeat();
      this.scheduleClientHeartbeatMonitor();
      this.scheduleMessagePump(seqno);
      // schedule client heartbeat monitor

    }
  }

  util.log(util.format("Connection received [host=%s, port=%s]", socket.remoteAddress, socket.remotePort));

  // Register data listener for the connection
  this.socket.on('data', this.onData);

}


module.exports = {
  ClientWorker:ClientWorker
}
