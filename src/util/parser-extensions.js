/**
 * Special Parser Overrides
 */
'use strict';

let BufferReader = require('buffer-reader');

BufferReader.prototype.nextGbxString = function () {
  let len = this.nextUInt32LE();
  return this.nextString(len);
};

BufferReader.prototype.nextLookBackString = function () {
  if (! this.lookbackSeen) {
    console.log('Init lookback registry, version of LBS: ' + this.nextUInt32LE());
    this.lookbackSeen = true;
    this.lookbackStore = [];
  }

  let inp = this.nextUInt32LE();
  if (inp === 0) {
    return null;
  }
  if(((inp & 0xc0000000) !== 0 && (inp & 0x3fffffff) === 0)
    || inp === 0) {
    let str = this.nextGbxString();
    this.lookbackStore.push(str);
    return str;
  }
  if (inp === -1) return '';

  if ((inp & 0x3fffffff) === inp) {
    switch (inp) { // The string could be in the predefined libary...
      case 11: return 'Valley';
      case 12: return 'Canyon';
      case 13: return 'Lagoon';
      case 17: return 'TMCommon';
      case 202: return 'Storm';
      case 299: return 'SMCommon';
      case 10003: return 'Common';
    }
  }
  inp &= 0x3fffffff;
  if (inp-1 >= this.lookbackStore.length) {
    throw new Error('String not found in lookback list!');
  }
  return this.lookbackStore[inp-1];
};
