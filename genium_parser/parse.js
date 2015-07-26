var fs = require("fs");
var util = require("util");
var BigNumber = require('bignumber.js')
var sprintf = require('sprintf-js').sprintf
var f=require('./functions.js')
var rs = fs.createReadStream('test.txt');
var Messages = require('./messages.js');
var parser = require('./parser.js');
var listener = require('./listener.js');
var winston = require('winston');


winston.level='info';

debugger;
var line;
var l = new listener.Listener();

rs.on('open', function() {
  // open event is fired before readable
  //util.log("Opening file...");
  winston.debug('Opening file...');
});

var readSize = 500;

// Buffer for genium message
function IndexedBuffer(size) {
  this.numBytes = size;
  // holds the message being processed
  this.buf = new Buffer(this.numBytes);
  // position within the message
  this.position = 0;
  // bytes remaining until message is completely read
  this.remaining = this.numBytes;

  this.onchunk = function(chunk) {
    debugger;
    winston.debug("onchunk");
    if (!chunk.containsEOM(this)) {
      debugger; 
      // We need to read more data
      winston.debug("EOM is not in this chunk...");
      winston.debug(chunk.buf.toString('hex', chunk.position, chunk.position + this.remaining));
      chunk.buf.copy(this.buf, this.position, chunk.position, chunk.position + chunk.remaining);
      this.position += chunk.remaining;
      this.remaining -= chunk.remaining;
      chunk.position += chunk.remaining;
      chunk.remaining = 0;
    } else {
      debugger;
      winston.debug("Processing end of message."); 
      winston.debug(chunk.buf.toString('hex', chunk.position, chunk.position + this.remaining));
      // this chunk contains the rest of the message
      chunk.buf.copy(this.buf, this.position, chunk.position, chunk.position + this.remaining);
      chunk.position += this.remaining;
      chunk.remaining -= this.remaining;
      this.position = this.numBytes;
      winston.debug("done reading message.");
      winston.debug(chunk.position + "|" + this.position); 
      this.onMsgFullyRead();       
      this.remaining = 0;
      winston.debug("Stream message has been fully processed");
    }
  };

  this.onMsgFullyRead = function() {
    winston.debug(sprintf("Message fully read [hex=%1$s]", this.buf.toString('hex', 0, this.numBytes)));
    parser.parse(this.buf, l);    
  }
}

function WrappedBuffer(buf) {
  this.buf = buf;
  // bytes remaining until chunk is read
  this.remaining = buf.length;
   // position within this chunk
  this.position = 0;
  this.containsEOM = function(msg) {
    debugger;
    winston.debug(sprintf("eomcheck [msg remaining=%1$s, chunk remaining=%2$s]", msg.remaining, this.remaining));
    return msg.remaining <= this.remaining;
  };
  this.hasRemaining = function() {
    return this.buf.length- this.position >= 2;
  };
}

function onStartOfMessage(p) {
  debugger;
  var msgLen = p.buf.readInt16BE(p.position);
  winston.debug(sprintf("onStartOfMessage [msgLen(hex)=%1$s, msgLen=%2$s]", p.buf.toString('hex', p.position, p.position + 2), msgLen));
  winston.debug(p.buf.toString('hex', p.position, p.position + msgLen));
  p.position += 2;
  p.remaining -= 2; 
  // message doesn't really include length
  return new IndexedBuffer(msgLen);
}

var geniumMsg;
// a message can span network pulls, although it's unlikely
rs.on('readable', function() {
  // we read some more data
  
  // a message can span chunks is readSize is small enough
  while ((chunk = rs.read(readSize)) != null) {
    debugger;
    winston.debug(sprintf("Read chunk from internal buffer [readSize=%1$s, data=%2$s]", readSize, chunk.toString('hex')));
    
    var chunkWrapper = new WrappedBuffer(chunk); 
    
    while(chunkWrapper.hasRemaining()) {
      debugger;
      if (geniumMsg != undefined && geniumMsg.remaining > 0) {
        // continue processing message in process
        winston.debug("processing message in process");
      } else {
        
        geniumMsg = onStartOfMessage(chunkWrapper);
      } 
      geniumMsg.onchunk(chunkWrapper);

    } 
    // we need to get more data to determine the size of the next message.
    
 
    // we need to pull in len bytes for this message
  }
});

