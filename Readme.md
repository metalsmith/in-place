# metalsmith-in-place

[![npm version][version-badge]][version-url]
[![build status][build-badge]][build-url]
[![downloads][downloads-badge]][downloads-url]
[![slack chat][slack-badge]][slack-url]

> A metalsmith plugin for in-place templating

This plugin allows you to render templates. For support questions please use 
[stack overflow][stackoverflow-url] or our [slack channel][slack-url].

## Installation

```
$ npm install metalsmith-in-place
```

## Options

You can pass options to `metalsmith-in-place` with the
[Javascript API](https://github.com/segmentio/metalsmith#api) or 
[CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: the engine that will be used for processing files (optional, default: 
[jstransformer](https://github.com/superwolff/metalsmith-engine-jstransformer))
* `engineOptions`: an object with options that will be passed to the engine (optional, default: `{}`)
* `pattern`: only files that match this pattern will be processed (optional, default: `**`)

### engine

The engine that will be used to process files. The default engine is
[jstransformer](https://github.com/superwolff/metalsmith-engine-jstransformer), but any compatible 
engine can be used. To select a different engine you must use metalsmith's
[Javascript API](https://github.com/segmentio/metalsmith#api) like so:

```javascript
var metalsmith = require('metalsmith')
var inPlace = require('metalsmith-in-place')
var Consolidate = require('metalsmith-engine-consolidate')

metalsmith(__dirname)
  .use(inPlace({
    engine: Consolidate
  }))
  .build(function(err){
    if (err) throw err;
  });
```

This would use consolidate to process files. See each engine's documentation for options and
implementation details.

### engineOptions

These options will be passed on to the selected engine. So this configuration:

```Javascript
var metalsmith = require('metalsmith')
var inPlace = require('metalsmith-in-place')

metalsmith(__dirname)
  .use(inPlace({
    engineOptions: {
      "cache": false
    }
  }))
  .build(function(err){
    if (err) throw err;
  });
```

Would pass `{ "cache": false }` to the selected engine.

### pattern

Only files that match this pattern will be processed. So this configuration:

```javascript
var metalsmith = require('metalsmith')
var inPlace = require('metalsmith-in-place')

metalsmith(__dirname)
  .use(inPlace({
    pattern: "**/*.hbs"
  }))
  .build(function(err){
    if (err) throw err;
  });
```

Would only process files that have the `.hbs` extension.

## Credits

* [Ian Storm Taylor](https://github.com/ianstormtaylor) for creating [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), on which this plugin was based
* [Rob Loach](https://github.com/RobLoach) for creating [metalsmith-jstransformer](https://github.com/RobLoach/metalsmith-jstransformer), which inspired our switch to jstransformers

## License

MIT

[build-badge]: https://travis-ci.org/superwolff/metalsmith-in-place.svg
[build-url]: https://travis-ci.org/superwolff/metalsmith-in-place
[downloads-badge]: https://img.shields.io/npm/dm/metalsmith-in-place.svg
[downloads-url]: https://www.npmjs.com/package/metalsmith-in-place
[slack-badge]: https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg
[slack-url]: http://metalsmith-slack.herokuapp.com/
[version-badge]: https://img.shields.io/npm/v/metalsmith-in-place.svg
[version-url]: https://www.npmjs.com/package/metalsmith-in-place
[stackoverflow-url]: http://stackoverflow.com/questions/tagged/metalsmith
