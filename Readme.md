# metalsmith-in-place

[![npm](https://img.shields.io/npm/v/metalsmith-in-place.svg)](https://www.npmjs.com/package/metalsmith-in-place) [![Build Status](https://travis-ci.org/superwolff/metalsmith-in-place.svg)](https://travis-ci.org/superwolff/metalsmith-in-place) [![Dependency Status](https://david-dm.org/superwolff/metalsmith-in-place.svg)](https://david-dm.org/superwolff/metalsmith-in-place) [![devDependency Status](https://david-dm.org/superwolff/metalsmith-in-place/dev-status.svg)](https://david-dm.org/superwolff/metalsmith-in-place#info=devDependencies) [![npm](https://img.shields.io/npm/dm/metalsmith-in-place.svg)](https://www.npmjs.com/package/metalsmith-in-place)

> A metalsmith plugin for in-place templating

This plugin renders templating syntax in your source files. You can use any templating engine supported by [consolidate.js](https://github.com/tj/consolidate.js#supported-template-engines). Pass options to `metalsmith-in-place` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: templating engine (required)
* `partials`: a folder to scan for partials, will register all found files as partials (optional)
* `pattern`: only files that match this pattern will be processed (optional)

Any unrecognised options will be passed on to consolidate.js. You can use this, for example, to disable caching by passing `cache: false` to consolidate. See the [consolidate.js documentation](https://github.com/tj/consolidate.js) for all available options.

Note that consolidates `partials` option isn't accessible, as the implementation of consolidate for `metalsmith-in-place` skips the `readPartials` method. This is why anything other than a string passed to the `partials` option will be discarded.

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
      "engine": "handlebars",
      "partials": "partials"
    }
  }
}
```

Source file `src/index.html`:

```html
---
title: The title
---
{{>nav}}
<p>{{title}}</p>
```

Partial file `partials/nav.html`:

```html
<!-- The partial name is the path relative to the `partials` folder, without the extension -->
<nav>Nav</nav>
```

Results in `dist/index.html`:

```html
<nav>Nav</nav>
<p>The title</p>
```

This is a very basic example. A more advanced use of this plugin would be [extending templates](http://paularmstrong.github.io/swig/docs/#inheritance) or combining the use of templating syntax in your source files with [layouts](https://github.com/superwolff/metalsmith-layouts).

## Origins

This plugin is a fork of [metalsmith-templates](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` into two plugins was suggested by Ian Storm Taylor. The results are:

* [metalsmith-in-place](https://github.com/superwolff/metalsmith-in-place): render templating syntax in your source files.
* [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts): apply layouts to your source files.

## License

MIT
