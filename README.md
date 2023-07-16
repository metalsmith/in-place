# @metalsmith/in-place

A metalsmith plugin for transforming source files' contents. Complements [@metalsmith/layouts](https://github.com/metalsmith/layouts)

[![metalsmith: core plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]

## Features

- renders source files' `contents` field with any existing or a custom [Jstransformer templating engine](https://github.com/jstransformers/jstransformer)
- alters file extensions from `transform.inputFormats` to `transform.outputFormat`
- can be used multiple times with different configs per metalsmith pipeline

## Installation

NPM:

```bash
npm install @metalsmith/in-place jstransformer-handlebars
```

Yarn:

```bash
yarn add @metalsmith/in-place jstransformer-handlebars

```

This plugin works with [jstransformers](https://github.com/jstransformers/jstransformer) but they should be installed separately. `jstransformer-handlebars` is just an example, you could use any transformer. To render markdown you could install [jstransformer-marked](https://github.com/jstransformers/jstransformer-marked). To render handlebars you would install [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars). Other popular templating options include: [Nunjucks](https://github.com/jstransformers/jstransformer-nunjucks), [Twig](https://github.com/jstransformers/jstransformer-twig), [Pug](https://github.com/jstransformers/jstransformer-pug), or [EJS](https://github.com/jstransformers/jstransformer-ejs). See also [this map](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json) to see which extensions map to which jstransformer.

## Usage

Pass `@metalsmith/in-place` to `metalsmith.use` :

```js
import inPlace from '@metalsmith/in-place'

// shorthand
metalsmith.use(inPlace({ transform: 'nunjucks' }))

// same as shorthand
metalsmith.use(
  inPlace({
    transform: jsTransformerNunjucks, // resolved
    extname: '.html',
    pattern: '**/*.{njk,nunjucks}*',
    engineOptions: {}
  })
)
```

In the transformed file, you have access to `{ ...metalsmith.metadata(), ...fileMetadata }`, so that the following build

```js
metalsmith.metadata({ title: 'Default title', nodeVersion: process.version }).use(inPlace({ transform: 'handlebars' }))
```

for a file:

```yml
---
title: Article title
---
<h1>{{ title }}</h1>Node v{{ nodeVersion }}
```

would render `<h1>Article title</h1>Node v16.20`

Multiple transforms can be used to target different sets of files, or to reprocess the same files multiple times in the order they are `metalsmith.use`'d:

```js
// this build will apply the marked transform to index.md, the handlebars transform to index.hbs,
// and handlebars first, marked second to both index.hbs.md, index.md.hbs, and html-minifier to all (only in production)
metalsmith
  .env('NODE_ENV', process.env.NODE_ENV)
  .use(inPlace({ transform: 'handlebars', extname: null }))
  .use(inPlace({ transform: 'marked' }))

if (metalsmith.env('NODE_ENV') !== 'development') {
  metalsmith.use(inPlace({ transform: 'html-minifier' }))
}
```

### Options

In most cases, you will only need to specify the `transform` and `engineOptions` option.

- [transform](#transform) (`string|JsTransformer`): **required**. Which transformer to use. The full name of the transformer, e.g. `jstransformer-handlebars`, its shorthand `handlebars`, a relative JS module path starting with `.`, e.g. `./my-transformer.js`, whose default export is a jstransformer or an actual jstransformer: an object with `name`, `inputFormats`,`outputFormat`, and at least one of the render methods `render`, `renderAsync`, `compile` or `compileAsync` described in the [jstransformer API docs](https://github.com/jstransformers/jstransformer#api)
- [extname](#extension-handling) (`string|false|null`): optional. How to transform a file's extensions: `''|false|null` to remove the last `transform.inputFormat` matching extension, `.<ext>` to force an extension rename.
- [engineOptions](#engineoptions) (`Object<string, any>`): optional. Pass options to the jstransformer that's rendering the files. The default is `{}`.
- pattern (`string|string[]`): optional. Override default glob pattern matching `**/*.<transform.inputFormats>*`. Useful to limit the scope of the transform by path or glob to a subfolder, or to include files not matching `transform.inputFormats`.

### Extension handling

By default in-place will apply smart default extension handling based on `transform.inputFormats` and `transform.outputFormat`.
For example, any of the source files below processed through `inPlace({ transform: 'handlebars' })` will yield `index.html`.

| source             | output           |
| ------------------ | ---------------- |
| src/index.hbs      | build/index.html |
| src/index.hbs.html | build/index.html |
| src/index.html.hbs | build/index.html |

The example demonstrates that:

- order of extensions doesn't matter, _order of plugin execution does!_: you can pick the final extension to match the most suitable editor syntax highlighting
- a single in-place run only alters the rightmost extension matching `transform.inputFormats`
- you may choose to include or omit the `transform.outputFormat` in the source file name (.html in this case).

### `engineOptions`

Pass options to the jstransformer that's rendering your templates via `engineOptions`. The
`metalsmith.json`:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": [
    {
      "@metalsmith/in-place": {
        "transform": "ejs",
        "engineOptions": {
          "cache": false
        }
      }
    }
  ]
}
```

..would pass `{ "cache": false }` to `jstransformer-ejs`.

If you use [Pug](https://pugjs.org/api/getting-started.html), make sure to pass `engineOptions: { filename: true }`. This will ensure the filename of each processed file is passed to the render method as expected by this engine.

### Multiple transforms per file

Suppose a file `tags.hbs` that lists all the article tags used on your website

```hbs
---
title: Tags
description: Browse articles by tag
---
<h1>{{ title }}</h1>
<p>{{ description }}</p>
<ul>
{{#each tags}}
  <li><a href="/tags/{{ . }}">{{ . }}</a></li>
{{/each}}
</ul>
```

To reduce Handlebars noise, you could add `metalsmith.use(inPlace({ transform: 'marked' })` to your build and change the filename to `tags.hbs.md` to generate markdown syntax with Handlebars!

```hbs
---
title: Tags
description: Browse articles by tag
---

# {{ title }}

{{ description }}

{{#each tags}}
- [{{.}}](/tags/{{ . }})
{{/each}}

More markdown here..
```

**Caution**: when using multiple templating transforms per file, make sure there is no conflicting syntax.
For example markdown will transform blocks indented by 4 spaces to `<pre>` tags, and marked's `smartypants` can potentially garble the result.

### Usage with @metalsmith/layouts

In most cases `@metalsmith/in-place` is intended to be used _before_ `@metalsmith/layouts`.
You can easily share `engineOptions` configs between both plugins:

```js
import inPlace from '@metalsmith/in-place'
import layouts from '@metalsmith/layouts'

const engineOptions = {}
metalsmith // index.hbs.hbs
  .use(inPlace({ transform: 'handlebars', extname: '', engineOptions })) // -> index.hbs
  .use(layouts({ engineOptions })) // -> index.html
```

@metalsmith/layouts uses a similar mechanism targeting `transform.inputFormats` file extensions by default.
The example requires files ending in `.hbs.hbs` extension, but if you don't like this, you can just have a single `.hbs` extension, and change the in-place invocation to `inPlace({ engineOptions, transform, extname: '.hbs' })` for the same result.

### Debug

To enable debug logs, set the `DEBUG` environment variable to `@metalsmith/in-place*`:

```js
metalsmith.env('DEBUG', '@metalsmith/in-place*')
```

Alternatively you can set `DEBUG` to `@metalsmith/*` to debug all Metalsmith core plugins.

## Credits

- [Ismay Wolff](https://github.com/ismay) for improving upon metalsmith-templates & diligently maintaining its successor
- [Ian Storm Taylor](https://github.com/ianstormtaylor) for creating [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), on which this plugin was based
- [Rob Loach](https://github.com/RobLoach) for creating [metalsmith-jstransformer](https://github.com/RobLoach/metalsmith-jstransformer), which inspired our switch to jstransformers

## License

[MIT](LICENSE)

[npm-badge]: https://img.shields.io/npm/v/@metalsmith/in-place.svg
[npm-url]: https://www.npmjs.com/package/@metalsmith/in-place
[ci-badge]: https://github.com/metalsmith/in-place/actions/workflows/test.yml/badge.svg
[ci-url]: https://github.com/metalsmith/in-place/actions/workflows/test.yml
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-core_plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[codecov-badge]: https://img.shields.io/coveralls/github/metalsmith/in-place
[codecov-url]: https://coveralls.io/github/metalsmith/in-place
[license-badge]: https://img.shields.io/github/license/metalsmith/in-place
[license-url]: LICENSE
