var util = require("util");
var BigNumber = require('bignumber.js')
var fn = require('./functions.js');
var sprintf = require('sprintf-js').sprintf
var indent="    ";
function getRecordFmt(n) {
  var pad="";
  for (var i = 0; i < n; i++) {
    pad += indent;
  }
  return pad + "%1$-50s = %2$s";
}

var fmt=getRecordFmt(1);
var fmt2=getRecordFmt(2);
var fmt3=getRecordFmt(3);

Messages={};
Messages.orderbook=function(buf) {
  var p=0; 
  this.messageGroup = buf.readInt16LE(p);
  p+=2;
  this.messageId= buf.readInt16LE(p);
  p+=2;
  this.timestamp=fn.readUInt64(buf, p);
  p+=8;
  this.id=buf.readInt32LE(p);
  p+=4;
  this.name=fn.readString(buf, p);
  p+=buf.readInt16LE(p);
  p+=2;
  this.exchangeId = buf.readInt16LE(p);
  p+=2;
  this.marketId = buf.readInt16LE(p);
  p+=2;
  this.instrumentGroupId = buf.readInt16LE(p);
  p+=2;
  this.modifier = buf.readInt16LE(p);
  p+=2;
  this.underlyingId=buf.readInt32LE(p);
  p+=4;
  this.strikePrice=buf.readInt32LE(p);
  p+=4;
  this.expirationDate=buf.readInt32LE(p);
  p+=4;
  this.firstTradingDate=fn.readUInt64(buf, p);
  p+=8;
  this.lastTradingDate=fn.readUInt64(buf, p);
  p+=8;
  this.groupType=buf.readInt8(p);
  p++;
  this.optionType=buf.readInt8(p);
  p++;
  this.optionStyle=buf.readInt8(p);
  p++;
  this.sector=fn.readString(buf, p);
  p+=buf.readInt16LE(p);
  p+=2;
  this.currency=fn.readString(buf, p);
  p+=buf.readInt16LE(p);
  p+=2;
  this.currencyUnit=buf.readInt8(p);
  p++;
  this.currencyRelation=buf.readInt32LE(p);
  p+=4;
  this.contractSize=buf.readInt32LE(p);
  p+=4;
  this.priceQuotationFactor=buf.readInt32LE(p);
  p+=4;
  this.priceUnit=buf.readInt8(p);
  p++;

  var tickSizes = buf.readInt16LE(p);
  p += 2;
  this.tickSizes=[];
  if (tickSizes > 0) {
    for (var i = 0; i < tickSizes; i++) {
      this.tickSizes.push(
        {
          lowerLimit: fn.readUInt64(buf, p),
          upperLimit: fn.readUInt64(buf, p+8),
          tickSize: fn.readUInt64(buf, p+16)
        });
      p += 24;
    }
  }

  this.decimalsInPrice=buf.readInt32LE(p);
  p+=4;
  this.decimalsInStrikePrice=buf.readInt32LE(p);
  p+=4;
  this.underlyingName=fn.readString(buf, p);
  p+=buf.readInt16LE(p);
  p+=2;
  this.issuerId=buf.readInt32LE(p);
  p+=4;
  this.settlementDate=fn.readUInt64(buf, p);
  p+=8;
  this.active=buf.readInt8(p)==1;
  p++;
  this.indexMarket=buf.readInt8(p)==1;
  p++;
  this.nominalValue=fn.readUInt64(buf, p);
  p+=8;
  this.decimalsInNominalValue=buf.readInt32LE(p);
  p+=4;
  this.fixedIncomeType=buf.readInt8(p)==1;
  p++;
  this.couponInterest=fn.readUInt64(buf, p);
  p+=8;
  this.couponFrequency=buf.readInt32LE(p);
  p+=4;
  this.nextCouponDate=fn.readUInt64(buf, p);
  p+=8;
  this.dayCountConvention=buf.readInt8(p)==1;
  p++;
  this.datedDate=fn.readUInt64(buf, p);
  p+=8;

  var comboLegs = buf.readInt16LE(p);
  p += 2;

  this.comboLegs=[];
  if (comboLegs > 0) {
    for (var i = 0; i < comboLegs; i++) {
      p += 4;
      var singleOrderBookId = buf.readInt32LE(p);
      p += 4;
      var buyLeg = buf.readInt8(p) == 1;
      p++;
      var ratio = buf.readInt32LE(p);
      p += 4;
      var priceQuotationFactor = buf.readInt32LE(p);
      this.comboLegs.push({
        singleOrderBookId: singleOrderBookId,
        buyLeg: buyLeg,
        ratio: ratio,
        priceQuotationFactor: priceQuotationFactor    
      });
    }
  }

  this.tradingAtSettlement=buf.readInt8(p)==1;
  p++;
  this.action=buf.readInt8(p);
  this.print = function() {
    util.log("OrderBook");
    util.log(sprintf(fmt, "messageGroup", this.messageGroup));
    util.log(sprintf(fmt, "messageId", this.messageId));
    util.log(sprintf(fmt, "timestamp", this.timestamp));
    util.log(sprintf(fmt, "id", this.id));
    util.log(sprintf(fmt, "name", this.name));
    util.log(sprintf(fmt, "exchangeId", this.exchangeId));
    util.log(sprintf(fmt, "marketId", this.marketId));
    util.log(sprintf(fmt, "instrumentGroupId", this.instrumentGroupId));
    util.log(sprintf(fmt, "modifier", this.modifier));
    util.log(sprintf(fmt, "underlyingId", this.underlyingId));
    util.log(sprintf(fmt, "strikePrice", this.strikePrice));
    util.log(sprintf(fmt, "expirationDate", this.expirationDate));
    util.log(sprintf(fmt, "firstTradingDate", this.firstTradingDate));
    util.log(sprintf(fmt, "lastTradingDate", this.lastTradingDate));
    util.log(sprintf(fmt, "groupType", this.groupType));
    util.log(sprintf(fmt, "optionType", this.optionType));
    util.log(sprintf(fmt, "optionStyle", this.optionStyle));
    util.log(sprintf(fmt, "sector", this.sector));
    util.log(sprintf(fmt, "currency", this.currency));
    util.log(sprintf(fmt, "currencyUnit", this.currencyUnit));
    util.log(sprintf(fmt, "currencyRelation", this.currencyRelation));
    util.log(sprintf(fmt, "contractSize", this.contractSize));
    util.log(sprintf(fmt, "priceQuotationFactor", this.priceQuotationFactor));
    util.log(sprintf(fmt, "contractSize", this.contractSize));
    util.log(sprintf(fmt, "priceQuotationFactor", this.priceQuotationFactor));
    util.log(sprintf(fmt, "priceUnit", this.priceUnit));
    util.log(indent + "TickSizes");
    for (var i = 0; i < this.tickSizes.length; i++) {
      
      var tick=this.tickSizes[i];
      
      util.log(sprintf(indent + indent + "tickSize [lowerLimit=%1$s, upperLimit=%2$s, tickSize=%3$s]", tick.lowerLimit, tick.upperLimit, tick.tickSize));
    }
    util.log(sprintf(fmt, "decimalsInPrice", this.decimalsInPrice));
    util.log(sprintf(fmt, "decimalsInStrikePrice", this.decimalsInStrikePrice));
    util.log(sprintf(fmt, "underlyingName", this.underlyingName));
    util.log(sprintf(fmt, "issuerId", this.issuerId));
    util.log(sprintf(fmt, "settlementDate", this.settlementDate));
    util.log(sprintf(fmt, "active", this.active));
    util.log(sprintf(fmt, "indexMarket", this.indexMarket));
    util.log(sprintf(fmt, "nominalValue", this.nominalValue));
    util.log(sprintf(fmt, "decimalsInNominalValue", this.decimalsInNominalValue));
    util.log(sprintf(fmt, "fixedIncomeType", this.fixedIncomeType));
    util.log(sprintf(fmt, "couponInterest", this.couponInterest));
    util.log(sprintf(fmt, "couponFrequency", this.couponFrequency));
    util.log(sprintf(fmt, "nextCouponDate", this.nextCouponDate));
    util.log(sprintf(fmt, "dayCountConvention", this.dayCountConvention));
    util.log(sprintf(fmt, "datedDate", this.datedDate));
   
    util.log(indent + "Legs");
    if (this.comboLegs.length == 0) {
      util.log(indent + indent + "--No Legs");
    } 
    for (var i = 0; i < this.comboLegs.length; i++) {
      var leg=this.comboLegs[i];
      
      util.log(sprintf("comboLeg [singleOrderBookId=%1$s, buyLeg=%2$s, ratio=%3$s, priceQuotationFactor=%4$s]", leg.singleOrderBookId, leg.buyLeg, leg.ratio, leg.priceQuotationFactor));
    }
    util.log(sprintf(fmt, "tradingAtSettlement", this.tradingAtSettlement));
    util.log(sprintf(fmt, "action", this.action));
  }
}

Messages.account=function(buf) {
  var p=0; 
  this.messageGroup = buf.readInt16LE(p);
  p+=2;
  this.messageId= buf.readInt16LE(p);
  p+=2;
  this.timestamp=fn.readUInt64(buf, p);
  p+=8;
  this.participantId=buf.readInt32LE(p);
  p+=4;
  var length = buf.readInt16LE(p);
  p += 2;
  if (length != 0) {
    this.accountId = fn.readStringOfLength(buf, p, length);
  }
  p += length;
  length = buf.readInt16LE(p);
  p += 2;
  if (length != 0) {
    this.clearingHouseAccountId= fn.readStringOfLength(buf, p, length);
  }
 
  this.print = function() {
    util.log("Account");
    util.log(sprintf(fmt, "messageGroup", this.messageGroup));
    util.log(sprintf(fmt, "messageId", this.messageId));
    util.log(sprintf(fmt, "timestamp", this.timestamp));
    util.log(sprintf(fmt, "participantId", this.participantId));
    util.log(sprintf(fmt, "accountId", this.accountId));
    util.log(sprintf(fmt, "clearingHouseAccountId", this.clearingHouseAccountId));
  } 
}

Messages.startOfTransaction=function(buf) {
  var p=0; 
  this.messageGroup = buf.readInt16LE(p);
  p+=2;
  this.messageId= buf.readInt16LE(p);
  p+=2;
  this.orderId=fn.readUInt64(buf, p);
  p+=8;

  this.print=function() {
    util.log("StartOfTransaction");
    util.log(sprintf(fmt, "messageGroup", this.messageGroup));
    util.log(sprintf(fmt, "messageId", this.messageId));
    util.log(sprintf(fmt, "orderId", this.orderId));
  }
}

Messages.commit = function(buf) {
  this.print=function() {
    util.log("Commit");
    util.log(sprintf("%1$s=%2$s", "messageGroup", this.messageGroup));
    util.log(sprintf("%1$s=%2$s", "messageId", this.messageId));
  }
  var p=0;
  this.messageGroup = buf.readInt16LE(p);
  p+=2;
  this.messageId= buf.readInt16LE(p);
  p+=2;
}

Messages.matchId=function(buf, p) {
  this.print=function() {
    util.log(sprintf(fmt2, "serialVersionUID", this.serialVersionUID));
    util.log(sprintf(fmt2, "matchGroupId", this.matchGroupId));
    util.log(sprintf(fmt2, "notUsed", this.notUsed));
    util.log(sprintf(fmt2, "combinationMatchId", this.combinationMatchId));
  }
  // parse matchid
  this.serialVersionUID = buf.readInt32LE(p);
  p+=4;
  this.matchGroupId = fn.readUInt64(buf, p);
  p+=8;
  this.notUsed = buf.readInt32LE(p);
  p+=4;
  this.combinationMatchId = buf.readInt32LE(p);
  p+=4;
}

Messages.trade=function(buf) {
  this.print=function() {
    util.log("Trade");
    util.log(sprintf(fmt, "messageGroup", this.messageGroup));
    util.log(sprintf(fmt, "messageId", this.messageId));
    util.log(sprintf(fmt, "tradeTime", this.tradeTime));
    util.log(sprintf(fmt, "orderBookId", this.orderBookId));
    util.log(sprintf(fmt, "userId", this.userId));
    util.log(sprintf(fmt, "participantId", this.participantId));
    util.log(sprintf(fmt, "orderId", this.orderId));
    if (this.matchId != undefined) {
      util.log(indent + "MatchId");
      this.matchId.print();
    }
    util.log(sprintf(fmt, "price", this.price));
    util.log(sprintf(fmt, "quantity", this.quantity));
    util.log(sprintf(fmt, "side", this.side));
    util.log(sprintf(fmt, "dealSource", this.dealSource));
    util.log(sprintf(fmt, "tradeType", this.tradeType));
    util.log(sprintf(fmt, "passiveAggressive", this.passiveAggressive));
    util.log(sprintf(fmt, "accountId", this.accountId));
    util.log(sprintf(fmt, "exchangeInfo", this.exchangeInfo));
    util.log(sprintf(fmt, "customerInfo", this.customerInfo));
    util.log(sprintf(fmt, "settlementDate", this.settlementDate));
    util.log(sprintf(fmt, "yieldOrPrice", this.yieldOrPrice));
    util.log(sprintf(fmt, "accruedInterest", this.accruedInterest));
    util.log(sprintf(fmt, "giveUpParticipant", this.giveUpParticipant));
    util.log(sprintf(fmt, "originalTrade", this.originalTrade));
    util.log(sprintf(fmt, "tradeReportCode", this.tradeReportCode));
    util.log(sprintf(fmt, "positionEffect", this.positionEffect));
  
  }
  var p=0; 
  this.messageGroup = buf.readInt16LE(p);
  p+=2;
  this.messageId= buf.readInt16LE(p);
  p+=2;
  this.tradeTime=fn.readUInt64(buf, p);
  p+=8;
  this.orderBookId=buf.readInt32LE(p);
  p+=4;
  this.userId=buf.readInt32LE(p);
  p+=4;
  this.participantId=buf.readInt32LE(p);
  p+=4;
  this.orderId=fn.readUInt64(buf, p);
  p+=8;
  var exists=buf.readInt8(p)==1;
  p++;
  if (exists) {
    this.matchId=new Messages.matchId(buf, p);
    p+=20;
  }
  this.price = fn.readUInt64(buf, p);
  p+=8;
  this.quantity = fn.readUInt64(buf, p);
  p+=8;
  this.side = buf.readInt8(p);
  p++;
  this.dealSource = buf.readInt16LE(p);
  p+=2;
  this.tradeType = buf.readInt8(p);
  p++;
  this.passiveAggressive = buf.readInt8(p);
  p++; 

  var length = buf.readInt16LE(p);
  p += 2;
  if (length != 0) {
    this.accountId = fn.readStringOfLength(buf, p, length);
  }
  p += length;

  this.print();
  length = buf.readInt16LE(p);
  p+=2;
  if (length != 0) {
    this.exchangeInfo = fn.readStringOfLength(buf, p, length);
  }
  p+=length;
 
  length = buf.readInt16LE(p);
  p+=2;
  if (length != 0) {
    this.customerInfo = fn.readStringOfLength(buf, p, length);
  }

  this.settlementDate = fn.readUInt64(buf, p);
  p+=8;
  this.yieldOrPrice = fn.readUInt64(buf, p);
  p+=8;
  this.accruesInterest = fn.readUInt64(buf, p);
  p+=8;
  
  length = buf.readInt16LE(p);
  p+=2;
  if (length != 0) {
    this.giveUpParticipant = fn.readStringOfLength(buf, p, length);
  }
  p+=length;

  this.originalTrade = buf.readInt8(p) == 1;
  p++;
  this.tradeReportCode = buf.readInt8(p);    
  p++;
  this.positionEffect = buf.readInt8(p);
  p++;

}
 
module.exports={};
module.exports.account=Messages.account;
module.exports.orderbook=Messages.orderbook;
module.exports.startOfTransaction=Messages.startOfTransaction;
module.exports.trade=Messages.trade;
module.exports.commit=Messages.commit;

