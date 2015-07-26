var fs = require("fs");
var util = require("util");
var BigNumber = require('bignumber.js')
var sprintf = require('sprintf-js').sprintf

var rs = fs.createReadStream('test.txt');
var line;
rs.on('open', function() {
  // open event is fired before readable
  util.log("Opening file...");
});
var readSize = 500;
var msgLen;
var msgKey;

function readUInt64(buff, offset) {
   var word0 = buff.readUInt32LE(offset);
   var word1 = buff.readUInt32LE(offset+4);
   return new BigNumber(word0).plus(new BigNumber(word1).times(0x100000000));
}

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
    util.log("onchunk");
    if (!chunk.containsEOM(this)) {
      debugger; 
      // We need to read more data
      util.log("EOM is not in this chunk...");
      chunk.buf.copy(this.buf, this.position)
      this.position += chunk.remaining;
    } else {
      debugger;
      util.log(chunk.buf.toString('hex', chunk.position, chunk.position + this.remaining));
      // this chunk contains the rest of the message
      chunk.buf.copy(this.buf, this.position, chunk.position, chunk.position + this.remaining);
      chunk.position += this.remaining;
      chunk.remaining = chunk.buf.length- chunk.position;
      this.position = this.numBytes;
      util.log("done reading message.");
      util.log(chunk.position + "|" + this.position); 
      this.print();
   }
  };

  this.readAndLogBoolean = function(fieldName) {
    util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+1), this.buf.readInt8(this.position)==1));
    this.position ++;
  }

  this.readAndLogByte = function(fieldName) {
    util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+1), this.buf.readInt8(this.position)));
    this.position ++;
  }

  this.readAndLogShort = function(fieldName) {
    util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+2), this.buf.readInt16LE(this.position)));
    this.position += 2;
  }

  this.readAndLogInt = function(fieldName) {
    util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+4), this.buf.readInt32LE(this.position)));
    this.position += 4;
  }

  this.readString = function(fieldName) {
    var length = this.buf.readInt16LE(this.position);
    util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+2+length), this.buf.toString('ascii', this.position + 2, this.position+2+length)));
    this.position += 2;
    this.position += length;
  }

  this.readAndLogLong = function(fieldName) {
    util.log(sprintf("%1$s [hex=%2$s, value=%3$s]",  fieldName,  this.buf.toString('hex', this.position, this.position+8), readUInt64(this.buf, this.position)));
    this.position += 8;
  }

  this.readAndLogTickSize = function() {
    util.log(sprintf("tickSize [hex=%1$s, lowerLimit=%2$s, upperLimit=%3$s, tickSize=%4$s]",  this.buf.toString('hex', this.position, this.position+24), readUInt64(this.buf, this.position), readUInt64(this.buf, this.position + 8), readUInt64(this.buf, this.position + 16)));
    this.position += 24;
  }

  this.readAndLogComboLeg = function() {
    // skip serializationId
    var start = this.position;
    this.position += 4;
    var singleOrderBookId = this.buf.readInt32LE(this.position);
    this.position += 4;
    var buyLeg = this.buf.readInt8(this.position) == 1;
    this.position++;
    var ratio = this.buf.readInt32LE(this.position);
    this.position += 4;
    var priceQuotationFactor = this.buf.readInt32LE(this.position);
    util.log(sprintf("comboLeg [hex=%1$s, singleOrderBookId=%2$s, buyLeg=%3$s, ratio=%4$s, priceQuotationFactor=%5$s]", this.buf.toString('hex', start, start + 13), singleOrderBookId, buyLeg, ratio, priceQuotationFactor));
 }


  this.print = function() {
    util.log("printMsg");
    this.position = 0;
    this.readAndLogShort('messageGroup');
    this.readAndLogShort('messageId');
    this.readAndLogLong('timestamp');
    this.readAndLogInt('id');
    this.readString('name');
    this.readAndLogShort('exchangeId');
    this.readAndLogShort('marketId');
    this.readAndLogShort('instrumentGroupId');
    this.readAndLogShort('modifier');
    this.readAndLogInt('underlyingId');
    this.readAndLogInt('strikePrice');
    this.readAndLogInt('expirationDate');
    this.readAndLogLong('firstTradingDate');
    this.readAndLogLong('lastTradingDate');
    this.readAndLogByte('groupType');
    this.readAndLogByte('optionType');
    this.readAndLogByte('optionStyle');
    this.readString('sector');
    this.readString('currency');
    this.readAndLogByte('currencyUnit');
    this.readAndLogInt('currencyRelation');
    this.readAndLogInt('contractSize');
    this.readAndLogInt('priceQuotationFactor');
    this.readAndLogByte('priceUnit');

    var tickSizes = this.buf.readInt16LE(this.position);
    this.position += 2;

    if (tickSizes > 0) {
      for (var i = 0; i < tickSizes; i++) {
        this.readAndLogTickSize();
      }
    }

    this.readAndLogInt('decimalsInPrice');
    this.readAndLogInt('decimalsInStrikePrice');
    this.readString('underlyingName');
    this.readAndLogInt('issuerId');
    this.readAndLogLong('settlementDate');
    this.readAndLogBoolean('active');
    this.readAndLogBoolean('indexMarket');
    this.readAndLogLong('nominalValue');
    this.readAndLogInt('decimalsInNominalValue');
    this.readAndLogByte('fixedIncomeType');
    this.readAndLogLong('couponInterest');
    this.readAndLogInt('couponFrequency');
    this.readAndLogLong('nextCouponDate');
    this.readAndLogByte('dayCountConvention');
    this.readAndLogLong('datedDate');

    var comboLegs = this.buf.readInt16LE(this.position);
    this.position += 2;

    if (comboLegs > 0) {
      for (var i = 0; i < comboLegs; i++) {
        this.readAndLogComboLeg();
      }
    }

    this.readAndLogBoolean('tradingAtSettlement');
    this.readAndLogByte('action');
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
    return msg.remaining < this.remaining;
  };
  this.hasRemaining = function() {
    return this.buf.length- this.position >= 2;
  };
}

function onStartOfMessage(p) {
  debugger;
  msgLen = p.buf.readInt16BE(p.position);
  p.position += 2;
  p.remaining -= 2; 
  // message doesn't really include length
  return new IndexedBuffer(msgLen);
}

function chunkContainsEOM(geniumMsg) {
  return geniumMsg.remaining < readSize;
}

var geniumMsg;
// a message can span network pulls, although it's unlikely
rs.on('readable', function() {
  // we read some more data
  util.log("Pulling data from network into internal buffer...");
  
  // a message can span chunks is readSize is small enough
  while ((chunk = rs.read(readSize)) != null) {
    debugger;
    util.log(sprintf("Reading chunk from internal buffer [readSize=%1$s, data=%2$s]", readSize, chunk.toString('hex')));
    
    var chunkWrapper = new WrappedBuffer(chunk); 
    
    while(chunkWrapper.hasRemaining()) {
      debugger;
      geniumMsg = onStartOfMessage(chunkWrapper);
      util.log(geniumMsg.position); 
      // invoke onchunk on different msg based on messageid
      var msgGroup = geniumMsg.buf.readInt16LE(0);
      var msgId= geniumMsg.buf.readInt16LE(2);
 
      util.log(sprintf("msgGroup=%1$s, msgType=%2$s", msgGroup, msgId));
 
      geniumMsg.onchunk(chunkWrapper);
      util.log("Processed chunk.");

    } 
    // we need to get more data to determine the size of the next message.
    
 
    // we need to pull in len bytes for this message
  }
});

//test
