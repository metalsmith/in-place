# metalsmith-in-place

[![build status][build-badge]][build-url]
[![coverage status][coverage-badge]][coverage-url]
[![greenkeeper][greenkeeper-badge]][greenkeeper-url]

> A metalsmith plugin for transforming your source files

This plugin allows you to render templating syntax in your source files. It uses file extensions to infer which templating engine to use. So files ending in `.njk` will be processed as nunjucks, `.md` as markdown, etc. You can even chain transformations by appending multiple extensions, which will be processed right-to-left.

If you want to wrap your source files in a common template, you can use [metalsmith-layouts](https://github.com/metalsmith/metalsmith-layouts). For usage examples check out our [wiki](https://github.com/metalsmith/metalsmith-in-place/wiki). Feel free to contribute an example if anything is missing, or update the existing ones. For support questions please use [stack overflow][stackoverflow-url] or our [slack channel][slack-url]. For templating engine specific questions try the aforementioned channels, as well as the documentation for [jstransformers](https://github.com/jstransformers) and your templating engine of choice.

## Installation

```bash
$ npm install metalsmith-in-place
```

This plugin uses [jstransformers](https://github.com/jstransformers/jstransformer) to transform files. Since there are a lot of jstransformers we don't install them automatically, so you'll also need to install the appropriate jstransformers.

For example, to render markdown you would install [jstransformer-markdown](https://github.com/jstransformers/jstransformer-markdown). To render handlebars you would install [jstransformer-handlebars](https://github.com/jstransformers/jstransformer-handlebars). See the [jstransformer organisation](https://github.com/jstransformers) for all available jstransformers and [this dictionary](https://github.com/jstransformers/inputformat-to-jstransformer/blob/master/dictionary.json) to see which extensions map to which jstransformer.

## Options

You can pass options to `metalsmith-in-place` with the [Javascript API](https://github.com/segmentio/metalsmith#api) or [CLI](https://github.com/segmentio/metalsmith#cli). The options are:

* [pattern](#pattern): optional. Only files that match this pattern will be processed. Accepts a string or an array of strings. The default is `**`.
* [engineOptions](#engineoptions): optional. Use this to pass options to the jstransformer that's rendering your files. The default is `{}`.
* [suppressNoFilesError](#suppressnofileserror): optional. The no-files-to-process error will be suppressed. The default is `false`.

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

### `engineOptions`

Use this to pass options to the jstransformer that's rendering your templates. So this
`metalsmith.json`:

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

### `suppressNoFilesError`

`metalsmith-in-place` throws [an error](#no-files-to-process) if it can’t find any files to process. If you’re doing any kind of incremental builds via something like `metalsmith-watch`, this is problematic as you’re likely only rebuilding files that have changed. This flag allows you to suppress that error ([more info](https://github.com/metalsmith/metalsmith-in-place/pull/151)).

Note that if you have [debugging](#errors-and-debugging) turned on, you’ll see a message denoting that no files are present for processing.

## Errors and debugging

If you're encountering problems you can use [debug](https://www.npmjs.com/package/debug) to enable verbose logging. To enable `debug` prefix your build command with `DEBUG=metalsmith-in-place`. So if you normally run `metalsmith` to build, use `DEBUG=metalsmith-in-place metalsmith` (on windows the syntax is [slightly different](https://www.npmjs.com/package/debug#windows-note)).

### No files to process

There are several things that might cause you to get a `no files to process` error:

* Your [pattern](#pattern) does not match any files
* None of your files pass validation, validation fails for files that:
  * Have no extension
  * Are not utf-8
  * Need a jstransformer that hasn't been installed

## Credits

* [Ian Storm Taylor](https://github.com/ianstormtaylor) for creating [metalsmith-templates](https://github.com/segmentio/metalsmith-templates), on which this plugin was based
* [Rob Loach](https://github.com/RobLoach) for creating [metalsmith-jstransformer](https://github.com/RobLoach/metalsmith-jstransformer), which inspired our switch to jstransformers

## License

[MIT](https://ismay.mit-license.org/)

[build-badge]: https://travis-ci.org/metalsmith/metalsmith-in-place.svg?branch=master
[build-url]: https://travis-ci.org/metalsmith/metalsmith-in-place
[greenkeeper-badge]: https://badges.greenkeeper.io/metalsmith/metalsmith-in-place.svg
[greenkeeper-url]: https://greenkeeper.io/
[coverage-badge]: https://coveralls.io/repos/github/metalsmith/metalsmith-in-place/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/metalsmith/metalsmith-in-place?branch=master
[slack-url]: http://metalsmith-slack.herokuapp.com/
[stackoverflow-url]: http://stackoverflow.com/questions/tagged/metalsmith
