var util = require("util");
var sprintf = require('sprintf-js').sprintf
var winston = require('winston');
function parse(b, l) {
      
  var messageGroup = b.readInt16LE(0);
  var messageId= b.readInt16LE(2);

  var msgKey=(messageId << 16) | messageGroup;
  switch(msgKey) {
    case 1114122:
      // account
      winston.debug("account");
      l.onAccount(b);
      break;
    case 589834:
      // start of trx
      winston.debug("startOfTransaction");
      l.onStartOfTransaction(b);
      break;
    case 458762:
      // trade
      winston.debug("trade");
      l.onTrade(b);
      break;
    case 196618:
      // user
      winston.debug("user");
      l.onUser(b);
      break;
    case 131082:
      // participant
      winston.debug("participant");
      l.onParticipant(b);
      break;
    case 655370:
      // commit
      winston.debug("commit");
      l.onCommit(b);
      break;
    case 65546:
      // orderbook
      winston.debug("orderbook");
      l.onOrderBook(b);
      break;
    default:
      winston.debug(sprintf("unknown message type [messageId=%1$s, messageGroup=%2$s, msgkey=%3$s", messageId, messageGroup, msgKey));
  }
      
}

module.exports = {
  parse: parse 
}
