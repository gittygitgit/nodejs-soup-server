var util = require('util');
var s = require('underscore.string')

var TIMEOUT_LOGIN_REQUEST_IN_SECONDS = 30;
var TIMEOUT_HEARTBEAT_IN_SECONDS = 1;
var TIMEOUT_PUMP_IN_SECONDS = 1;
var TIMEOUT_NO_CLIENT_HEARTBEAT_IN_SECONDS = 15;
/** 
 * ClientWorker @constructor.
 * 
 * Handles behaviors after a client connects to the server port.
 * @constructor
 *
 * @param socket clientSocket created as part of client connecting to server socket.
 */
function ClientWorker(socket) {
  var _this = this;
  this.socket = socket;
  this.isLoggedIn = false;

  /**
   * Schedules a connection timeout event if no successful login hasn't been performed within timeoutInSeconds.
   * @param {number} timeoutInSeconds 
   * @returns handle to the scheduled event, allowing for cancelling if necessary.
   */
  this.scheduleLoginRequestTimeout  = function(timeoutInSeconds) {
    return setTimeout(function() {
      if (!this.isLoggedIn) {
        _this.socket.end(util.format("No login request received in %d seconds...Terminating connection.", timeoutInSeconds));
      }
    }, timeoutInSeconds * 1000);
  };
 
  /** handle to loginRequestTimeout timer */ 
  this.loginTimer = this.scheduleLoginRequestTimeout(TIMEOUT_LOGIN_REQUEST_IN_SECONDS);

  this.heartbeat;
  this.clientMonitor;

  //per connection state
  this.currentSeqno = 0


  socket.on('end', () => {
    util.log("detected client disconnect.")
    clearTimeout(_this.clientMonitor);
    clearTimeout(_this.heartbeat);
    clearTimeout(_this.pump);
  });
  /**
   * Callback invoked when data is received from clientSocket.
   * @param data
   */
  this.onData = function(data) {
    // heard some client data...
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

  /**
   * callback invoked after login request has been received from the client.
   * @param {string} uname
   * @param {string} password
   */
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
  /**
   * Callback invoked as part of client login request processing. 
   * 
   * Compares session provided in login request (if any) with session registered with running soup server.
   * When invoked, if sessionid doesn't match, return false, otherwise true.  Also, if user didn't pass a session in login request, return true (default to dropping data from whatever session server is setup with.
   * 
   * @param {string} sessionid
   */
  this.validSession = function(sessionid) {
    return true;

    /* TODO: re-enable database store */
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

  /**
   * Callback timer invoked periodically to send heardbeat packet to client.
   */
  this.scheduleServerHeartbeat = function() {
    _this.heartbeat = setInterval(function() {
      _this.socket.write('H\n');
    }, TIMEOUT_HEARTBEAT_IN_SECONDS * 1000);
  };
  
  /**
   * Callback timer which if invoked signifies no client heartbeat has been received and that server should sever the connection.
   */
  this.scheduleClientHeartbeatMonitor = function() {
    _this.clientMonitor = setInterval(function() {
      _this.socket.end("No client detected...Terminating connection.");
    } , TIMEOUT_NO_CLIENT_HEARTBEAT_IN_SECONDS * 1000);
  };
 
  /**
   * Callback invoked periodically to check for messages in the store to be pushed to client.
   *
   * The mechanism here is overly simplified.  
   * 
   * In a more robust, real-life impl, progress within an underlying store would be maintained such that previously pushed messages aren't re-sent and some reasonable amount of batching is used to avoid sending a storm of messages to the client.
   *
   * In this implementation, a random message is sent on each invocation, sequenced according to a globally maintained sequence counter.
   */
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

  /**
   * Publishes message to client socket based on row retrieved from db store.
   * @param row
   */
  this.broadcastMessage = function(row) {
    util.log('here');
    util.log(row);
    console.dir(row);
    this.socket.write('S' + row['SEQNO'] + '|' + row['UNDERLYING'] + '\n');
    this.currentSeqno = row['SEQNO'];
  };

  /**
   * Timer invoked periodically to check a store for messages to publish.
   */
  this.scheduleMessagePump = function() {

    _this.pump = setInterval(function() {
      _this.socket.write('S' + _this.currentSeqno + '\n');
      _this.currentSeqno += 1;
    }, TIMEOUT_PUMP_IN_SECONDS * 1000);

    // TODO: Reenable database store
    /*pump = setInterval(function() {
      // query for messages from store
      pollForMessages();
    }, TIMEOUT_PUMP_IN_SECONDS * 1000);*/
  }

  /**
   * Invoked when a login request is detected from a client.
   * 
   * Validates request information for a valid login attempt.
   * 
   * If an invalid request is received, the login timeout is reset , the server sends an Invalid Login packet and the server waits for another login request.
   *
   * Otherwise, the server sends a Login Accepted packet and registers heartbeat timers and starts the message pump timer.
   * @param data
   */
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

    util.log(login)
    if (login.length != 38) {
      util.error("Unexpected login packet size");
      this.socket.end("Malformed login packet [expected size=38, received=" + login.length + "]");
      clearTimeout(this.loginTimer);
    } else {
      var uname = login.substr(1, 6);
      var password = login.substr(7, 10);
      var session = login.substr(17, 10).trim();
      var seqno = login.substr(27, 10);

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
  util.log(util.format("Client worker now listening for client data [isLoggedIn=%s, currentSeqno=%s]...", this.isLoggedIn, this.currentSeqno))
  this.socket.on('data', this.onData);
}


module.exports = {
  ClientWorker:ClientWorker
}
