# metalsmith-in-place

[![npm version][version-badge]][version-url]
[![build status][build-badge]][build-url]
[![coverage status][coverage-badge]][coverage-url]
[![greenkeeper][greenkeeper-badge]][greenkeeper-url]
[![downloads][downloads-badge]][downloads-url]

> A metalsmith plugin for rendering templates to html

This plugin allows you to render various templating languages to html. It uses
file extensions to infer which templating engine to use. So files ending in
`.md` will be processed as markdown, `.hbs` as handlebars, etc. You can even
chain transformations by appending multiple extensions, which will be processed
right-to-left.

```
$ npm install metalsmith-in-place
```

For support questions please use [stack overflow][stackoverflow-url] or our
[slack channel][slack-url].

## Example

You can use `metalsmith-in-place` with metalsmith's [Javascript API](https://github.com/segmentio/metalsmith#api)
or the [CLI](https://github.com/segmentio/metalsmith#cli). For this example
we'll use the cli:

### 1. Install metalsmith and metalsmith-in-place:

```
$ npm install --save metalsmith metalsmith-in-place
```

### 2. Install appropriate jstransformers

Under the hood this plugin uses 
[jstransformers](https://github.com/jstransformers/jstransformer)
to render your html. Since there are over a 100 jstransformers we don't install
them automatically, so you'll also need to install the appropriate
jstransformers. 

For example, to render markdown you would install [jstransformer-markdown](https://github.com/jstransformers/jstransformer-markdown).
To render handlebars you would install [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars).
See the [jstransformer organisation](https://github.com/jstransformers) for all
available jstransformers and [this dictionary](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json)
to see which extensions map to which jstransformer.
  
In this case we'll use handlebars, so we'll install jstransformer-handlebars:

```
$ npm install --save jstransformer-handlebars
```

### 3. Configure metalsmith

We'll create a metalsmith.json configuration file and a handlebars file for
metalsmith-in-place to process:

`./metalsmith.json`

```
{
  "source": "src",
  "destination": "build",
  "plugins": {
    "metalsmith-in-place": true
  }
}
```

`./src/index.hbs`

```handlebars
---
title: This is a variable, defined in the file's frontmatter
---
<h1>{{ title }}</h1>
<p>Some text here.</p>
```

### 4. Build

To build just run the metalsmith CLI:

```
$ node_modules/.bin/metalsmith
```

Which will output the following file:

`./build/index.html`

```
<h1>This is a variable, defined in the file's frontmatter</h1>
<p>Some text here.</p>
```

## Options

* `engineOptions`: optional. Use this to pass options to the jstransformer 
that's rendering your templates. The default is `{}`.

* `pattern`: optional. By default this plugin tries to process all files. If you
encounter problems use this option to filter. Only files that match this pattern
will be processed. Accepts a string or an array of strings. The default is `**`.

### `engineOptions`

Use this to pass options to the jstransformer that's rendering your templates.
So this `metalsmith.json`:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": {
    "metalsmith-in-place": {
      "engineOptions": {
        "cache": false
      }
    }
  }
}
```

Would pass `{ "cache": false }` to each used jstransformer.

### `pattern`

Only files that match this pattern will be processed. So this `metalsmith.json`:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": {
    "metalsmith-in-place": {
      "pattern": "blog/**/*"
    }
  }
}
```

Would only process files within the `./src/blog` folder, because the pattern is
relative to your source folder. See [multimatch](https://github.com/sindresorhus/multimatch)
for further details.

## Options for developers of this plugin

These options are only for developers of this plugin. You don't need to touch
this for normal use, so only use this option if you know what you're doing.

* `engine`: optional. Select the engine that will be used for processing files.
The default is [metalsmith-engine-jstransformer](https://github.com/superwolff/metalsmith-engine-jstransformer),
but any compatible engine can be used. To select a different engine you must use
metalsmith's [Javascript API](https://github.com/segmentio/metalsmith#api) like
so:

```javascript
var metalsmith = require('metalsmith')
var inPlace = require('metalsmith-in-place')
var CustomEngine = require('./custom-engine')

metalsmith(__dirname)
  .use(inPlace({
    engine: CustomEngine
  }))
  .build(function(err){
    if (err) throw err;
  });
```

This would use the custom engine to process files.

## Credits

* [Ian Storm Taylor](https://github.com/ianstormtaylor) for creating [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), on which this plugin was based
* [Rob Loach](https://github.com/RobLoach) for creating [metalsmith-jstransformer](https://github.com/RobLoach/metalsmith-jstransformer), which inspired our switch to jstransformers

## License

MIT

[build-badge]: https://travis-ci.org/ismay/metalsmith-in-place.svg?branch=master
[build-url]: https://travis-ci.org/ismay/metalsmith-in-place
[downloads-badge]: https://img.shields.io/npm/dm/metalsmith-in-place.svg
[downloads-url]: https://www.npmjs.com/package/metalsmith-in-place
[version-badge]: https://img.shields.io/npm/v/metalsmith-in-place.svg
[version-url]: https://www.npmjs.com/package/metalsmith-in-place
[greenkeeper-badge]: https://badges.greenkeeper.io/ismay/metalsmith-in-place.svg
[greenkeeper-url]: https://greenkeeper.io/
[coverage-badge]: https://coveralls.io/repos/github/ismay/metalsmith-in-place/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/ismay/metalsmith-in-place?branch=master
[slack-url]: http://metalsmith-slack.herokuapp.com/
[stackoverflow-url]: http://stackoverflow.com/questions/tagged/metalsmith
