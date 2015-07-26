var BigNumber = require('bignumber.js')

function readUInt64(buf, offset) {
   var word0 = buf.readUInt32LE(offset);
   var word1 = buf.readUInt32LE(offset+4);
   return new BigNumber(word0).plus(new BigNumber(word1).times(0x100000000));
}

function readString(buf, offset) {
    var length = this.buf.readInt16LE(offset);
    return buf.toString('ascii', offset + 2, offset + 2 + length);
} 

module.exports= {
  readUInt64:readUInt64,
  readString:readString 
}

