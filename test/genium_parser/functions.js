var expect    = require("chai").expect;
var f         = require("../../app/genium_parser/functions")
var util      = require("util");

describe("Binary functions", function() {
  describe("64bit longs", function() {
    it("Just larger than biggest int", function() {
      var buf = new Buffer(100);
      buf.writeUInt32BE(1, 0);
      buf.writeUInt32BE(0, 4);

      var long = f.readUInt64BE(buf, 0);
      console.log(long.toString());
      expect(long.toString()).to.equal("4294967296");       
    });
  });
});

describe("Color Code Converter", function() {
  describe("RGB to Hex conversion", function() {
    it("converts the basic colors", function() {

    });
  });
});

