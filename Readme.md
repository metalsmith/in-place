# metalsmith-in-place

[![npm](https://img.shields.io/npm/v/metalsmith-in-place.svg)](https://www.npmjs.com/package/metalsmith-in-place) [![Build Status](https://travis-ci.org/superwolff/metalsmith-in-place.svg)](https://travis-ci.org/superwolff/metalsmith-in-place) [![Dependency Status](https://david-dm.org/superwolff/metalsmith-in-place.svg)](https://david-dm.org/superwolff/metalsmith-in-place) [![devDependency Status](https://david-dm.org/superwolff/metalsmith-in-place/dev-status.svg)](https://david-dm.org/superwolff/metalsmith-in-place#info=devDependencies) [![npm](https://img.shields.io/npm/dm/metalsmith-in-place.svg)](https://www.npmjs.com/package/metalsmith-in-place)

> A metalsmith plugin for in-place templating

This plugin allows you to render templating syntax in your source files. You can use any templating engine supported by [consolidate.js](https://github.com/tj/consolidate.js#supported-template-engines).

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

Results in `build/index.html`:

```html
<p>The title</p>
```

This is a very basic example. For a ready-to-use boilerplate that utilizes this plugin see [metalsmith-boilerplates](https://github.com/superwolff/metalsmith-boilerplates).

## Options

You can pass options to `metalsmith-in-place` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* [engine](#engine): templating engine (required)
* [partials](#partials): directory for the partials (optional)
* [pattern](#pattern): only files that match this pattern will be processed (optional)
* [rename](#rename): change the file extension of processed files to `.html` (optional)

### engine

The engine that will render your templating syntax. Metalsmith-in-place uses [consolidate.js](https://github.com/tj/consolidate.js) to render templating syntax, so any engine [supported by consolidate.js](https://github.com/tj/consolidate.js#supported-template-engines) can be used. Don't forget to install the templating engine separately. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-in-place": {
      "engine": "swig"
    }
  }
}
```

Will render your templating syntax with swig.

### partials

The directory where `metalsmith-in-place` looks for partials. Each partial is named by removing the file extension from its path (relative to the partials directory), so make sure to avoid duplicates. So this `metalsmith.json`:

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

Would mean that a partial at `partials/nav.html` can be used as `{{> nav }}`, and `partials/nested/footer.html` can be used as `{{> nested/footer }}`. Note that passing anything but a string to the `partials` option will pass the option on to consolidate. However, the implementation of consolidate for `metalsmith-in-place` skips consolidate's `readPartials` method, so paths to partials in the partials object won't be resolved.

### pattern

Only files that match this pattern will be processed. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-in-place": {
      "engine": "handlebars",
      "pattern": "*.hbs"
    }
  }
}
```

Would only process files that have the `.hbs` extension.

### rename

Change the file extension of processed files to `.html` (optional). This option is set to `false` by default. So for example this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-in-place": {
      "engine": "handlebars",
      "rename": true
    }
  }
}
```

Would rename the extensions of all processed files to `.html`.

### Consolidate

Any unrecognised options will be passed on to consolidate.js. You can use this, for example, to disable caching by passing `cache: false`. See the [consolidate.js documentation](https://github.com/tj/consolidate.js) for all options supported by consolidate.

### Filename property

Some templating engines require a `filename` property to be set on each file, if you want to include or extend templates. For that, use [metalsmith-filenames](https://github.com/MoOx/metalsmith-filenames).

## Origins

This plugin is a fork of the now deprecated [metalsmith-templates](https://github.com/segmentio/metalsmith-templates). Splitting up `metalsmith-templates` into two plugins was suggested by Ian Storm Taylor. The results are:

* [metalsmith-in-place](https://github.com/superwolff/metalsmith-in-place): render templating syntax in your source files.
* [metalsmith-layouts](https://github.com/superwolff/metalsmith-layouts): apply layouts to your source files.

## License

MIT
