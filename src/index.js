import isUtf8 from 'is-utf8'
import { parseFilepath, handleExtname, getTransformer } from './utils.js'

/**
 * @callback Render
 * @param {string} source
 * @param {Object} options
 * @param {Object} locals
 * @returns {string}
 */

/**
 * @callback RenderAsync
 * @param {string} source
 * @param {Object} options
 * @param {Object} locals
 * @param {Function} callback
 * @returns {Promise<string>}
 */

/**
 * @callback Compile
 * @param {string} source
 * @param {Object} options
 * @returns {string}
 */

/**
 * @callback CompileAsync
 * @param {string} source
 * @param {Object} options
 * @param {Function} callback
 * @returns {Promise<string>}
 */

/**
 * @typedef {Object} JsTransformer
 * @property {string} name
 * @property {string[]} inputFormats
 * @property {string} outputFormat
 * @property {Render} [render]
 * @property {RenderAsync} [renderAsync]
 * @property {Compile} [compile]
 * @property {CompileAsync} [compileAsync]
 */

/* c8 ignore start */
let debug = () => {
  throw new Error('uninstantiated debug')
}
/* c8 ignore end */

async function render({ filename, files, metalsmith, options, transform }) {
  const file = files[filename]
  const engineOptions = Object.assign({}, options.engineOptions)
  if (options.engineOptions.filename) {
    Object.assign(engineOptions, {
      // set the filename in options for jstransformers requiring it (like Pug)
      filename: metalsmith.path(metalsmith.source(), filename)
    })
  }
  const metadata = metalsmith.metadata()
  debug(`rendering ${filename}`)

  const locals = Object.assign({}, metadata, file)
  const contents = file.contents.toString()

  return transform
    .renderAsync(contents, engineOptions, locals)
    .then((rendered) => {
      const newName = handleExtname(filename, { ...options, transform })
      debug('Done rendering %s', filename)
      debug('Renaming "%s" to "%s"', filename, newName)

      if (newName !== filename) {
        delete files[filename]
        files[newName] = file
      }
      files[newName].contents = Buffer.from(rendered.body)
    })
    .catch((err) => {
      err.message = `${filename}: ${err.message}`
      throw err
    })
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ filename, files, transform }) {
  const { extensions } = parseFilepath(filename)
  debug(`validating ${filename} %O %O`, extensions, transform.inputFormats)

  // IF the transform has inputFormats defined, invalidate the file if it has no matching extname
  if (transform.inputFormats && !extensions.some((fmt) => transform.inputFormats.includes(fmt))) {
    debug.warn(
      'Validation failed for file "%s", transformer %s supports extensions %s.',
      filename,
      transform.name,
      transform.inputFormats.map((i) => `.${i}`).join(', ')
    )
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(files[filename].contents)) {
    debug.warn(`Validation failed, %s is not utf-8`, filename)
    return false
  }
  return true
}

/**
 * @typedef {Object} Options
 * @property {string|JsTransformer} transform Jstransformer to run: name of a node module or local JS module path (starting with `.`) whose default export is a jstransformer. As a shorthand for existing transformers you can remove the `jstransformer-` prefix: `marked` will be understood as `jstransformer-marked`. Or an actual jstransformer; an object with `name`, `inputFormats`,`outputFormat`, and at least one of the render methods `render`, `renderAsync`, `compile` or `compileAsync` described in the [jstransformer API docs](https://github.com/jstransformers/jstransformer#api)
 * @property {string} [pattern='**\/*.<transform.inputFormats>'] (*optional*) One or more paths or glob patterns to limit the scope of the transform. Defaults to `'**\/*.<transform.inputFormats>*'`
 * @property {Object} [engineOptions={}] (*optional*) Pass options to the jstransformer templating engine that's rendering your files. The default is `{}`
 * @property {string} [extname] (*optional*) Pass `''` to remove the extension or `'.<extname>'` to keep or rename it. Defaults to `transform.outputFormat`
 **/

/**
 * Set default options based on jstransformer `transform`
 * @param {JsTransformer} transform
 * @returns {Options}
 */
function normalizeOptions(transform) {
  const extMatch =
    transform.inputFormats.length === 1 ? transform.inputFormats[0] : `{${transform.inputFormats.join(',')}}`
  return {
    pattern: `**/*.${extMatch}*`,
    extname: `.${transform.outputFormat}`,
    engineOptions: {}
  }
}

/**
 * A metalsmith plugin for in-place templating
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function inPlace(options = {}) {
  let transform

  return async function inPlace(files, metalsmith, done) {
    debug = metalsmith.debug('@metalsmith/in-place')

    // Check whether the pattern option is valid
    if (options.pattern && !(typeof options.pattern === 'string' || Array.isArray(options.pattern))) {
      return done(
        new Error(
          'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/@metalsmith/in-place#pattern'
        )
      )
    }

    // skip resolving the transform option on repeat runs
    if (!transform) {
      try {
        transform = await getTransformer(options.transform, debug)
      } catch (err) {
        // pass through jstransformer & Node import resolution errors
        return done(err)
      }
    }

    options = Object.assign(normalizeOptions(transform), options)

    debug('Running with options %O', options)

    const matchedFiles = metalsmith.match(options.pattern)

    // Filter files by validity, pass basename to avoid dots in folder path
    const validFiles = matchedFiles.filter((filename) => validate({ filename, files, transform }))

    // Let the user know when there are no files to process
    if (validFiles.length === 0) {
      debug.warn('No valid files to process.')
      return done()
    } else {
      debug('Rendering %s files', validFiles.length)
    }

    // Map all files that should be processed to an array of promises and call done when finished
    return Promise.all(validFiles.map((filename) => render({ filename, files, metalsmith, options, transform })))
      .then(() => done())
      .catch((error) => done(error))
  }
}

export default inPlace
