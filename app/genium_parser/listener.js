
var Messages = require('./messages.js');


function Listener() {
  this.onAccount = function(buf) {
    var account = new Messages.account(buf);
    account.print();
  },
  this.onStartOfTransaction = function(buf) {
     var sot = new Messages.startOfTransaction(buf);
     sot.print(); 
  },
  this.onTrade = function(buf) {
     var trade = new Messages.trade(buf);
     trade.print();
  },
  this.onUser = function(buf) {
     var user= new Messages.user(buf);
     user.print();

  },
  this.onParticipant = function(buf) {
     var participant= new Messages.participant(buf);
     participant.print();

  },
  this.onCommit = function(buf) {
     var commit = new Messages.commit(buf);
     commit.print();

  },
  this.onOrderBook = function(buf) {
     var orderbook= new Messages.orderbook(buf);
     orderbook.print();
  }
} 


module.exports = {
  Listener: Listener
}
