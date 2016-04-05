'use strict';

var MapParser = require('../lib/').MapParser;

var should = require('chai').should();
var expect = require('chai').expect;


describe('Map parsing of \'greyroad\'', function() {
  describe('header chunks', function (done) {
    var parser;
    var map;

    // Parse file.
    it('should parse file successfully', function (done) {
      parser = new MapParser(__dirname + '/greyroad.Map.Gbx');

      // Enable for debug:
      // parser.debug = console.log;

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
    it('should have the correct uid, name and author login', function () {
      expect(map.uid).to.equal('46Yh0hgv5EdSb6IkHsYK1PXHaua');
      expect(map.name).to.equal('$s$678$oGrey$o$fff road');
      expect(map.author.login).to.equal('tomvalk');
    });

    it('should have the correct environment and title', function () {
      expect(map.environment).to.equal('Canyon');
      expect(map.title).to.equal('TMCanyon');
    });

    it('should have the correct mood, mapType and style', function () {
      expect(map.mood).to.equal('Sunrise');
      expect(map.mapType).to.equal('Trackmania\\Race');
      expect(map.style).to.equal('');
    });

    // ===
    // todo: xml


    // ===
    it('should have the correct jpg and comment', function () {
      expect(map.thumb.length).to.equal(27803);
      expect(map.comment).to.equal('');
    });

  });
});
