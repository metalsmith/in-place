# metalsmith-templates

A fork of [metalsmith-templates](https://github.com/segmentio/metalsmith-templates). The original `metalsmith-templates` uses the `inPlace` flag to switch between either in-place templating or embedding a file within a template, this fork just supports in-place templating. It can be used in conjunction with [ismay/metalsmith-layouts](https://github.com/ismay/metalsmith-layouts), which just embeds source files in templates.

This originated in [https://github.com/segmentio/metalsmith-templates/issues/35](https://github.com/segmentio/metalsmith-templates/issues/35). Splitting up `metalsmith-templates` was suggested by Ian Storm Taylor as a way to simplify both use-cases. It allows you to apply templates (or layouts) to your files *and/or* render the templating syntax in your source files.

## Installation

```
$ npm install git://github.com/ismay/metalsmith-templates.git
```

## Usage

All that this plugin does is process templating syntax in your source files (in-place templating). Pass options to it with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* `engine`: templating engine
* `pattern`: only files that match this pattern will be processed (optional)

## Example

Configuration in `metalsmith.json`:

```
{
  "plugins": {
    "metalsmith-templates": {
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

This is of course a very basic example. A more realistic use for this plugin would be:

* Extending templates (like with [handlebars-layouts](https://github.com/shannonmoeller/handlebars-layouts), [swig](http://paularmstrong.github.io/swig/docs/#inheritance) or other templating languages that support template inheritance)
* Using local and global variables in your source files, whilst still using [layouts](https://github.com/ismay/metalsmith-layouts)

## Differences with segmentio/metalsmith-templates

* The `default`, `directory` and `inPlace` options have been removed

For further documentation see the original [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), but keep these differences in mind.

## License

MIT
