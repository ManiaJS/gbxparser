'use strict';

/**
 * Map
 * @type {Map}
 *
 * @property {{bronze: number, silver: number, gold: number, author: number}} time
 * @property {number} price
 * @property {number} authorScore score of author, could be time or (stunt)score.
 * @property {number} type Numeric map type. 0 == Race.
 * @property {boolean} isMultilap
 * @property {string} editor Can be 'simple' or 'advanced'
 * @property {number} checkpoints
 * @property {number} laps
 *
 * @property {string} uid
 * @property {string} environment
 * @property {string} name
 * @property {string} mood
 * @property {{id: string, author: string}} decorationEnvironment
 * @property {string} mapType
 * @property {string} style
 * @property {string} title
 *
 * @property {string} xml
 *
 * @property {Buffer} thumb
 *
 * @property {{version:number,login:string,nickname:string,zone:string,extra:string}} author
 */
export default class Map {
  time = {};
  price;
  authorScore;
  editor;
  isMultilap;
  type;
  checkpoints;
  laps;

  uid;
  environment;
  name;
  mood;
  decorationEnvironment = {}; // id, author
  mapType; // string type format, Trackmania\Race.
  style;
  title;

  xml;

  thumb;
  comments;

  author = {}; // version, login, nick, zone, extra.
}
