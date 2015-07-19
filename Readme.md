# metalsmith-in-place

[![Build Status](https://travis-ci.org/superwolff/metalsmith-in-place.svg)](https://travis-ci.org/superwolff/metalsmith-in-place) [![Dependency Status](https://david-dm.org/superwolff/metalsmith-in-place.svg)](https://david-dm.org/superwolff/metalsmith-in-place) [![devDependency Status](https://david-dm.org/superwolff/metalsmith-in-place/dev-status.svg)](https://david-dm.org/superwolff/metalsmith-in-place#info=devDependencies)

> A metalsmith plugin for in-place templating

This plugin renders templating syntax in your source files. You can use any templating engine supported by [consolidate.js](https://github.com/tj/consolidate.js). Pass options to it with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: templating engine (required)
* `pattern`: only files that match this pattern will be processed (optional)

## Installation

```
$ npm install metalsmith-in-place
```

## Example

Configuration in `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-in-place": {
      "engine": "handlebars"
    }
  }
}
```

Source file `src/index.html`:

```html
---
title: The title
---
<p>{{title}}</p>
```

Results in `dist/index.html`:

```html
<p>The title</p>
```

This is a very basic example. A more advanced use of this plugin would be [extending templates](http://paularmstrong.github.io/swig/docs/#inheritance) or combining the use of templating syntax in your source files with [layouts](https://github.com/superwolff/metalsmith-layouts).

## Origins

This plugin originated in [metalsmith-templates issue #35](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` into two plugins was suggested by Ian Storm Taylor. The results are:

* [metalsmith-in-place](https://github.com/superwolff/metalsmith-in-place): `metalsmith-templates` with `inPlace: true`
* [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts): `metalsmith-templates` with `inPlace: false`

Both plugins have been optimised for each use case. For `metalsmith-in-place` the `default`, `directory` and `inPlace` options have been removed. For further documentation see [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), but keep these differences in mind.

## License

MIT
