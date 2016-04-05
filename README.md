# GBX Parser
[![Build Status](https://travis-ci.org/ManiaJS/gbxparser.svg?branch=master)](https://travis-ci.org/ManiaJS/gbxparser)

Nadeo GameBox file format parser. Currently supporting the following types:

- Maps


## Installation

Install to your local project with:

```
npm install @maniajs/gbxparser
```
(you can append --save to save to your package.json).

## Usage

Depending on the parsers including you mostly import it and create new instance with file path or buffer and options object (optional).

### Map File

Create new Map Parser:

```javascript
let MapParser = require('@maniajs/gbxparser').MapParser;
// ES6:
// import {MapParser} from '@maniajs/gbxparser';

let parser = new MapParser(__dirname + '/greyroad.Map.Gbx'); // From file
let parser = new MapParser(buffer); // From buffer
```

Let it parse and interact with promise:

```javascript
parser.parse().then((map) => {
  console.log(`Map Author: ${map.author.login}`);
});
```

Errors will be thrown when file is invalid, or error while reading occur.
Make sure you catch the errors!


_For the full map properties, referer to [the map object definition](https://github.com/ManiaJS/gbxparser/blob/master/src/map/map.js)._

#### Debug

Debug during parse can be enabled before calling parse() like this:

```javascript
let parser = new MapParser(...);
parser.debug = console.log; // Any function that takes first parameter as string and output/write it to anywere.
```
