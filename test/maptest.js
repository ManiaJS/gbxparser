'use strict';

var MapParser = require('../lib/').MapParser;

var should = require('chai').should();
var expect = require('chai').expect;


describe('Map parsing of \'greyroad\'', function() {
  describe('basic chunk', function (done) {
    var parser;
    var map;

    // Parse file.
    it('should parse file successfully', function (done) {
      parser = new MapParser(__dirname + '/greyroad.Map.Gbx');
      parser.parse().then((_map) => {
        map = _map;
        done();
      }, (err) => {
        done(err);
      });
    });

    // Check Times
    it('should parse the correct map times', function() {
      expect(map.time).to.deep.equal({
        bronze: 72000,
        silver: 57000,
        gold: 51000,
        author: 47488
      });
    });

    it('should have the correct display costs (price)', function () {
      expect(map.price).to.equal(5135);
    });

    it('should have the correct attributes in basic header', function () {
      expect(map.isMultilap).to.equal(false);
      expect(map.type).to.equal(0); // = Race
      expect(map.authorScore).to.equal(47488);
      expect(map.editor).to.equal('advanced');
      expect(map.checkpoints).to.equal(11);
      expect(map.laps).to.equal(1);
    });


    // ===
    
  });
});
