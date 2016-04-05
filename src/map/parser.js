'use strict';

import BufferReader from 'buffer-reader';
import {EventEmitter} from 'events';

import * as fs from 'fs';

import Map from './map';

/**
 * Map Parser
 * @class MapParser
 * @type {MapParser}
 *
 * @property {BufferReader} parser
 * @property {{parts:string[]}} options
 */
export default class MapParser extends EventEmitter {
  options;
  buffer;
  file;
  parser;
  debug;
  map = new Map();

  // Parts to parse (reference part to chunk).
  _parts = {
    'basic':   ['50606082','50606083','50606088'], // author, uid, times, game, title, etc.
    'header':  ['50606085'], // xml.
    'thumb':   ['50606087']  // jpg image + comments.
  };
  _chunkPart = { // Reversed
    '50606082': 'basic', '50606083': 'basic', '50606088': 'basic',
    '50606085': 'header',
    '50606087': 'thumb'
  };

  /**
   * Parse Map File.
   * @param {string|Buffer} fd Could be a file (string) or a buffer.
   * @param {{parts:string[]}} [options] Provide extra options, for example parts to parse. Could be 'basic', 'header' (xml), 'thumb'..
   */
  constructor (fd, options) {
    super();

    options = options || {};
    options.parts = options.parts || ['basic', 'header', 'thumb']; // All by default.
    this.options = options;

    if (fd instanceof Buffer) {
      this.buffer = fd;
    } else if (typeof fd === 'string') {
      this.file = fd;
    } else {
      throw new Error('Please provide a buffer or file path!');
    }
  }

  /**
   * Parse the Map file.
   * After completing it will emit events on the Parser itself.
   *
   * @returns {Promise}
   */
  parse () {
    return new Promise((resolve, reject) => {
      return new Promise((resolve, reject) => {
        if (! this.buffer && this.file) {
          fs.readFile(this.file, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
          });
        } else {
          return resolve(this.buffer);
        }
      }).then((buffer) => {
        this.parser = new BufferReader(buffer);
        try {
          this.parser.move(9);

          let classId = this.parser.nextUInt32LE();
          if (classId !== ((0x3 << 24) | (0x43 << 12))) { // engineid << 24, classid << 12.
            return reject(new Error('Map is not a valid map class!'));
          }
          return this._parseParts(this.options.parts);
        } catch (err) {
          console.log(err);
          return reject(err);
        }
      }).then(() => {
        return resolve(this.map);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  /**
   * Parse Header and contents (in parts).
   * @param {[string]} parts Parts to parse.
   * @returns {Promise}
   * @private
   */
  _parseParts (parts) {
    let headerLength = this.parser.nextUInt32LE();
    let chunkCount = this.parser.nextUInt32LE();
    let chunkInfos = {};

    // Parse chunks (extract from header).
    for (var chunkNr = 0; chunkNr < chunkCount; chunkNr++) {
      chunkInfos[this.parser.nextUInt32LE()] = this.parser.nextUInt32LE() & ~0x80000000;
    }

    return Object.keys(chunkInfos).reduce((promise, chunkId) => {
      return promise.then(() => {
        return this._parseChunk(chunkId, chunkInfos[chunkId]);
      });
    }, Promise.resolve());
  }

  /**
   * Parse Chunk (will have the switch in it to forward to internal methods)
   *
   * @param {string} id String format with decimal of chunkid.
   * @param {number} size Size in bytes of chunk.
   * @returns {Promise}
   * @private
   */
  _parseChunk (id, size) {
    // Check if we want to skip this one..
    if (! this._chunkPart[id] || this.options.parts.indexOf(this._chunkPart[id]) === -1) {
      this.parser.move(size);
      return Promise.resolve(); // Skip
    }

    switch (id) {
      case '50606082': // 0x03043002
        return this._parseC1(size);
      case '50606083': // 0x03043003
        return this._parseC2(size);
      default:
        return Promise.resolve();
    }
  }


  // Chunk Parsers...........

  /**
   * Parse First Chunk, time and attribute information in it.
   * Part name 'basic'.
   * Chunk '50606082' (0x03043002)
   *
   * @param size
   * @returns {Promise}
   * @private
   */
  _parseC1 (size) {
    try {
      let version = this.parser.nextUInt8();
      if (typeof this.debug === 'function') this.debug(`Chunk (0x03043002), Version: ${version}`);
      // times, price, lap, etc.
      this.parser.move(4);

      this.map.time.bronze = this.parser.nextUInt32LE();
      this.map.time.silver = this.parser.nextUInt32LE();
      this.map.time.gold = this.parser.nextUInt32LE();
      this.map.time.author = this.parser.nextUInt32LE();

      this.map.price = this.parser.nextUInt32LE();
      this.map.isMultilap = this.parser.nextUInt32LE() === 1;
      this.map.type = this.parser.nextUInt32LE(); // TODO: Parse type into string type.

      this.parser.move(4);

      this.map.authorScore = this.parser.nextUInt32LE();
      this.map.editor = this.parser.nextUInt32LE() === 1 ? 'simple' : 'advanced';

      this.parser.move(4);

      this.map.checkpoints = this.parser.nextUInt32LE();
      this.map.laps = this.parser.nextUInt32LE();

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Parse Second Chunk, extended map informations, mostly general/technical.
   * Part name 'basic'.
   * Chunk '50606083' (0x03043003)
   *
   * @param size
   * @returns {Promise}
   * @private
   */
  _parseC2 (size) {
    try {
      let version = this.parser.nextUInt8();
      if (typeof this.debug === 'function') this.debug(`Chunk (0x03043003), Version: ${version}`);

      this.map.uid = this.parser.nextLookBackString();
      this.map.environment = this.parser.nextLookBackString();
      this.map.author.login = this.parser.nextLookBackString();
      this.map.name = this.parser.nextGbxString();

      this.parser.move(5);
      this.parser.nextGbxString(); // I don't want that on my baguette!

      this.map.mood = this.parser.nextLookBackString();
      this.map.decorationEnvironment.id = this.parser.nextLookBackString();
      this.map.decorationEnvironment.author = this.parser.nextLookBackString();

      this.parser.move(4*4+16);

      this.map.mapType =  this.parser.nextGbxString();
      this.map.style   = this.parser.nextGbxString();

      this.parser.move(9);

      this.map.title = this.parser.nextLookBackString();

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
