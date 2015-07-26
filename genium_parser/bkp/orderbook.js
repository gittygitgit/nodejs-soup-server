var util = require("util");
var BigNumber = require('bignumber.js')
var fn = require('./functions.js');

Messages={};
Messages.orderbook=function(buf) {
    var p=0; 
    this.messageGroup = buf.readInt16LE(p);
    p+=2;
    this.messageId= buf.readInt16LE(p);
    p+=2;
    this.timestamp=readUInt64(buf, p);
    p+=8;
    this.id=buf.readInt32LE(p);
    p+=4;
    this.name=readString(buf, p);
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
    this.firstTradingDate=readUInt64(buf, p);
    p+=8;
    this.lastTradingDate=readUInt64(buf, p);
    p+=8;
    this.groupType=readInt8(p);
    p++;
    this.optionType=readInt8(p);
    p++;
    this.optionStyle=readInt8(p);
    p++;
    this.sector=readString(buf, p);
    p+=buf.readInt16LE(p);
    p+=2;
    this.currency=readString(buf, p);
    p+=buf.readInt16LE(p);
    p+=2;
    this.currencyUnit=readInt8(p);
    p++;
    this.currencyRelation=buf.readInt32LE(p);
    p+=4;
    this.contractSize=buf.readInt32LE(p);
    p+=4;
    this.priceQuotationFactor=buf.readInt32LE(p);
    p+=4;
    this.priceUnit=readInt8(p);
    p++;

    var tickSizes = buf.readInt16LE(p);
    p += 2;
    this.tickSizes=[];
    if (tickSizes > 0) {
      for (var i = 0; i < tickSizes; i++) {
        this.tickSizes.push(
          {
            lowerLimit: readUInt64(buf, p),
            upperLimit: readUInt64(buf, p+8),
            tickSize: readUInt64(buf, p+16)
          });
        p += 24;
      }
    }

    this.decimalsInPrice=buf.readInt32LE(p);
    p+=4;
    this.decimalsInStrikePrice=buf.readInt32LE(p);
    p+=4;
    this.underlyingName=readString(buf, p);
    p+=buf.readInt16LE(p);
    p+=2;
    this.issuerId=buf.readInt32LE(p);
    p+=4;
    this.settlementDate=readUInt64(buf, p);
    p+=8;
    this.active=buf.readInt8(p)==1;
    p++;
    this.indexMarket=buf.readInt8(p)==1;
    p++;
    this.nominalValue=readUInt64(buf, p);
    p+=8;
    this.decimalsInNominalValue=buf.readInt32LE(p);
    p+=4;
    this.fixedIncomeType=buf.readInt8(p)==1;
    p++;
    this.couponInterest=readUInt64(buf, p);
    p+=8;
    this.couponFrequency=buf.readInt32LE(p);
    p+=4;
    this.nextCouponDate=readUInt64(buf, p);
    p+=8;
    this.dayCountConvention=buf.readInt8(p)==1;
    p++;
    this.datedDate=readUInt64(buf, p);
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
        this.comboLegs.push(
          singleOrderBookId: singleOrderBookId,
          buyLeg: buyLeg,
          ratio: ratio,
          priceQuotationFactor: priceQuotationFactor    
        );
      }
    }

    this.tradingAtSettlement=buf.readInt8(p)==1;
    p++;
    this.action=readInt8(p);
}

module.exports={
  Messages:Messages
}
