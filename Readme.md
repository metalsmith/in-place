# metalsmith-in-place

[![npm version][version-badge]][version-url]
[![build status][build-badge]][build-url]
[![downloads][downloads-badge]][downloads-url]
[![slack chat][slack-badge]][slack-url]

> A metalsmith plugin for in-place templating

**This documentation is for the 2.0.0-beta. This version will not be installed automatically and has been released for testing purposes, check [here](https://github.com/superwolff/metalsmith-in-place/blob/7cb06e54142b8843f35178ceb5560946ae356049/Readme.md) for the readme for the latest stable version. If you're using the beta please let us know about any bugs!**

This plugin allows you to render templates with [jstransformer](https://github.com/jstransformers/jstransformer). Files will be transformed based on their extension, last extension first. Transformations are applied until there are no more applicable jstransformers.

Though its main purpose is rendering templates, any jstransformer compatible plugin can be used. For support questions please use [stack overflow][stackoverflow-url] or our [slack channel][slack-url].

## Installation

```
$ npm install metalsmith-in-place
```

Make sure that the jstransformers that you want to use are installed as well.

## Example

Install [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars) to enable the handlebars transformation:

```
$ npm install jstransformer-handlebars
```

Configuration in `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-in-place": true
  }
}
```

Source file `src/index.html.handlebars`:

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

## Options

You can pass options to `metalsmith-in-place` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* pattern: only files that match this pattern will be processed (optional, default: `**`)
* options: an object with options that will be passed to the jstransformer (optional)

### pattern

Only files that match this pattern will be processed. So this `metalsmith.json`:

```json
{
  "plugins": {
    "metalsmith-in-place": {
      "pattern": "**/*.handlebars"
    }
  }
}
```

Would only process files that have the `.handlebars` extension.

### options

These options will be passed on to jstransformer. How these options will be used differs from transformer to transformer. For example, the [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars) allows you to define partials in the options like so:

```json
{
  "plugins": {
    "metalsmith-in-place": {
      "options": {
        "title": "The title"
      }
    }
  }
}
```

Which would allow you to use the partial as `{{> title}}`. See the documentation for the transformer that you want to use for more details.

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
