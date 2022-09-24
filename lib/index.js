const path = require('path')
const isUtf8 = require('is-utf8')
const getTransformer = require('./get-transformer')
let debug = console.log

function parseFilepath(filename) {
  const isNested = filename.includes(path.sep)
  const dirname = isNested ? path.dirname(filename) : ''
  const [base, ...extensions] = path.basename(filename).split('.')
  return { dirname, base, extensions }
}

/**
 * Engine, renders file contents with all available transformers
 */

function render({ filename, files, metalsmith, settings }) {
  const { dirname, base, extensions } = parseFilepath(filename)
  const file = files[filename]
  const engineOptions = Object.assign({}, settings.engineOptions)
  const metadata = metalsmith.metadata()
  const isLastExtension = extensions.length === 1

  debug(`rendering ${filename}`)

  const ext = extensions.pop()
  const transform = getTransformer(ext)
  const locals = Object.assign({}, metadata, file)

  // Stop if the current extension can't be transformed
  if (!transform) {
    debug(`no transformer available for ${ext} extension for ${filename}`)
    return Promise.resolve()
  }

  // Stringify file contents
  const contents = file.contents.toString()

  // If this is the last extension, replace it with a new one
  if (isLastExtension) {
    debug(`last extension reached, replacing last extension with ${transform.outputFormat}`)
    extensions.push(transform.outputFormat)
  }

  // Check if the filename should be set in the engine options
  if (settings.setFilename) {
    debug(`setting filename in the engine options`)
    engineOptions.filename = path.join(metalsmith.source(), filename)
  }

  // Transform the contents
  debug(`rendering ${ext} extension for ${filename}`)

  return transform
    .renderAsync(contents, engineOptions, locals)
    .then((rendered) => {
      // Delete old file
      delete files[filename] // eslint-disable-line no-param-reassign

      // Update files with the newly rendered file
      const newName = [path.join(dirname, base), ...extensions].join('.')
      files[newName] = file // eslint-disable-line no-param-reassign
      files[newName].contents = Buffer.from(rendered.body) // eslint-disable-line no-param-reassign

      debug(`done rendering ${filename}, renamed to ${newName}`)

      // Stop rendering if this was the last extension
      if (isLastExtension) {
        return Promise.resolve()
      }

      // Otherwise, keep rendering until there are no applicable transformers left
      return render({ filename: newName, files, metalsmith, settings })
    })
    .catch((err) => {
      err.message = `${filename}: ${err.message}` // eslint-disable-line no-param-reassign
      throw err
    })
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ filename, files }) {
  debug(`validating ${filename}`)
  const { extensions } = parseFilepath(filename)

  // Files without an extension cannot be processed
  if (!extensions.length) {
    debug(`validation failed, ${filename} does not have an extension`)
    return false
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(files[filename].contents)) {
    debug(`validation failed, ${filename} is not utf-8`)
    return false
  }

  // Files without an applicable jstransformer are ignored
  const extension = extensions[extensions.length - 1]
  const transformer = getTransformer(extension)

  if (!transformer) {
    debug(`validation failed, no jstransformer found for last extension of ${filename}`)
  }

  return transformer
}

/**
 * @typedef {Object} Options
 * @property {string} [pattern='**'] (*optional*) Limit the files to process by 1 or more glob patterns. Defaults to `'**'` (all)
 * @property {Object} [engineOptions={}] (*optional*) Pass options to the jstransformer templating engine that's rendering your files. The default is `{}`
 * @property {boolean} [suppressNoFilesError=false] (*optional*) Decide whether to ignore an error indicating that the plugin didn't find any matching files to process. The default is `false`
 * @property {boolean} [setFilename=false] (*optional*) Some templating engines, like [pug](https://github.com/pugjs/pug), need a `filename` property to be present in the options to be able to process relative includes, extends, etc. Setting this option to `true` will add the current filename to the options passed to each jstransformer. The default is `false`
 **/

/** @type {Options} */
const defaultOptions = {
  pattern: '**',
  engineOptions: {},
  suppressNoFilesError: false,
  setFilename: false
}

/**
 * A metalsmith plugin for in-place templating
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function initializeInPlace(options = defaultOptions) {
  const settings = Object.assign({}, defaultOptions, options)

  return function inPlace(files, metalsmith, done) {
    debug = metalsmith.debug('@metalsmith/in-place')
    debug('Running with options %O', settings)

    // Check whether the pattern option is valid
    if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
      return done(
        new Error(
          'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/@metalsmith/in-place#pattern'
        )
      )
    }

    // throw update error in case users didn't see the peerDependency warning
    /* istanbul ignore next */
    if (!metalsmith.match) {
      throw new Error(
        'This version of @metalsmith/in-place requires metalsmith^2.4.1\'s newly added match method\nPlease update metalsmith"'
      )
    }

    const matchedFiles = metalsmith.match(settings.pattern)

    // Filter files by validity, pass basename to avoid dots in folder path
    const validFiles = matchedFiles.filter((filename) => validate({ filename, files }))

    // Let the user know when there are no files to process, usually caused by missing jstransformer
    if (validFiles.length === 0) {
      const message = 'no files to process. See https://www.npmjs.com/package/@metalsmith/in-place#no-files-to-process'

      if (settings.suppressNoFilesError) {
        debug(message)
        return done()
      }

      return done(new Error(message))
    }

    // Map all files that should be processed to an array of promises and call done when finished
    return Promise.all(validFiles.map((filename) => render({ filename, files, metalsmith, settings })))
      .then(() => done())
      .catch(/* istanbul ignore next */ (error) => done(error))
  }
}

module.exports = initializeInPlace
