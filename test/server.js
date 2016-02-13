var expect    = require("chai").expect;
var util = require('util');
var server = require('../server.js');

describe("SoupServer", function() {
  describe("Sanity tests", function() {
    it("Create a server", function() {
      var config = {
	"sessionid"          : "testing",
	"listeningPort"      : 9000,
	"listener"           : function(socket) {
	  util.log('heard connection'); 
	}
      }

      var soupServer = new server.SoupServer(config);
      expect(soupServer).to.be.an.instanceof(server.SoupServer);
    });
  });
});


