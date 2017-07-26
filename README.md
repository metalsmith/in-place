# metalsmith-in-place

[![npm version][version-badge]][version-url]
[![build status][build-badge]][build-url]
[![coverage status][coverage-badge]][coverage-url]
[![greenkeeper][greenkeeper-badge]][greenkeeper-url]
[![downloads][downloads-badge]][downloads-url]
[![node security status][nsp-badge]][nsp-url]

> A metalsmith plugin for in-place templating

This plugin allows you to render templates. For support questions please use 
[stack overflow][stackoverflow-url] or our [slack channel][slack-url].

## Installation

1. Install metalsmith-in-place:
  ```
  $ npm install metalsmith-in-place
  ```
2. If you're using [jstransformer](https://github.com/superwolff/metalsmith-engine-jstransformer), the default rendering engine, you'll also need to install `jstransformer-*` plugins to do whatever transformations you need. For example, to render handlebars templates, you'd need to install `metalsmith-in-place` *and* [`jstransformer-handlebars`](https://github.com/jstransformers/jstransformer-handlebars).

## Usage

You can use `metalsmith-in-place` with the with Metalsmith's
[Javascript API](https://github.com/segmentio/metalsmith#api) or 
[CLI](https://github.com/segmentio/metalsmith#cli).

**Note:** When using `jstransformer` as the rendering engine, you'll also need to rename your files, since `jstransformer` plugins use file extensions to mark files for transformation. So, to process a file called `index.html` using `jstransformer-markdown` and then `jstransformer-handlebars`, you'd name it `index.html.handlebars.markdown`.

### Options

* `engine`: the engine that will be used for processing files (optional, default: 
[jstransformer](https://github.com/superwolff/metalsmith-engine-jstransformer))
* `engineOptions`: an object with options that will be passed to the engine (optional, default: `{}`)
* `pattern`: only files that match this pattern will be processed, can be a string or array of strings (optional, default: `**`)

#### `engine`

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

#### `engineOptions`

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

If your engine is the default [jstransformer](https://github.com/superwolff/metalsmith-engine-jstransformer), the options you pass to `engineOptions` will be available to all jstransformer plugins.

#### `pattern`

Exclude files that don't match the given pattern. So this configuration:

```javascript
var metalsmith = require('metalsmith')
var inPlace = require('metalsmith-in-place')

metalsmith(__dirname)
  .use(inPlace({
    pattern: "blog/**/*"
  }))
  .build(function(err){
    if (err) throw err;
  });
```

Would only process files within the `blog` folder. See [multimatch](https://github.com/sindresorhus/multimatch) for further details.

**Note:** When using `jstransformer` as the rendering engine, files are selected for transformation based on their extensions. The pattern option can be used to filter the selection down, but files without the proper extensions won't be processed by `jstransformer` plugins.

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
[greenkeeper-badge]: https://badges.greenkeeper.io/superwolff/metalsmith-in-place.svg
[greenkeeper-url]: https://greenkeeper.io/
[coverage-badge]: https://coveralls.io/repos/github/superwolff/metalsmith-in-place/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/superwolff/metalsmith-in-place?branch=master
[nsp-badge]: https://nodesecurity.io/orgs/ismay/projects/f9a90e69-de31-4850-9eaf-6ed058171bbd/badge
[nsp-url]: https://nodesecurity.io/orgs/ismay/projects/f9a90e69-de31-4850-9eaf-6ed058171bbd
