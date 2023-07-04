import path from 'node:path'
import isUtf8 from 'is-utf8'
import jstransformer from 'jstransformer'

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

/**
 * @param {string|JsTransformer} namePathOrTransformer
 * @returns {Promise<JsTransformer>}
 */
async function getTransformer(namePathOrTransformer) {
  let transform = null
  const t = namePathOrTransformer
  const tName = t
  const tPath = t

  // let the jstransformer constructor throw errors
  if (typeof t !== 'string') {
    transform = Promise.resolve(t)
  } else {
    if (path.isAbsolute(tPath) || tPath.startsWith('.') || tName.startsWith('jstransformer-')) {
      debug('Importing transformer: %s', tPath)
      transform = import(tPath).then((t) => t.default)
    } else {
      debug('Importing transformer: jstransformer-%s', tName)
      // suppose a shorthand where the jstransformer- prefix is omitted, more likely
      transform = import(`jstransformer-${tName}`)
        .then((t) => t.default)
        .catch(() => {
          // else fall back to trying to import the name
          debug.warn('"jstransformer-%s" not found, trying "%s" instead', tName, tName)
          return import(tName).then((t) => t.default)
        })
    }
  }
  return transform.then((t) => {
    return jstransformer(t)
  })
}

/* c8 ignore start */
let debug = () => {
  throw new Error('uninstantiated debug')
}
/* c8 ignore end */

function parseFilepath(filename) {
  const isNested = filename.includes(path.sep)
  const dirname = isNested ? path.dirname(filename) : ''
  const [base, ...extensions] = path.basename(filename).split('.')
  return { dirname, base, extensions }
}

/**
 * Engine, renders file contents with all available transformers
 */

async function render({ filename, files, metalsmith, settings, transform }) {
  const { dirname, base, extensions } = parseFilepath(filename)
  const file = files[filename]
  const engineOptions = Object.assign({}, settings.engineOptions)
  if (settings.engineOptions.filename) {
    Object.assign(engineOptions, {
      // set the filename in options for jstransformers requiring it (like Pug)
      filename: metalsmith.path(metalsmith.source(), filename)
    })
  }
  const metadata = metalsmith.metadata()
  const isLastExtension = extensions.length === 1
  debug(`rendering ${filename}`)

  const ext = extensions.pop()
  const locals = Object.assign({}, metadata, file)

  // Stringify file contents
  const contents = file.contents.toString()

  // If this is the last extension, replace it with a new one
  if (isLastExtension) {
    debug(`last extension reached, replacing extension with ${transform.outputFormat}`)
    extensions.push(transform.outputFormat)
  }

  // Transform the contents
  debug(`rendering ${ext} extension for ${filename}`)

  return transform
    .renderAsync(contents, engineOptions, locals)
    .then((rendered) => {
      // Delete old file
      delete files[filename]

      // Update files with the newly rendered file
      const newName = [path.join(dirname, base), ...extensions].join('.')
      files[newName] = file
      files[newName].contents = Buffer.from(rendered.body)

      debug(`done rendering ${filename}, renamed to ${newName}`)
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
  debug(`validating ${filename}`)
  const { extensions } = parseFilepath(filename)

  // IF the transform has inputFormats defined, invalidate the file if it has no matching extname
  if (transform.inputFormats && !transform.inputFormats.includes(extensions.slice(-1)[0])) {
    debug.warn(
      'Validation failed for file "%s", transformer %s supports extensions %s.',
      filename,
      transform.name,
      transform.inputFormats.map((i) => `.${i}`).join(', ')
    )
    return false
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
 * @property {string} [pattern='**\/*.<transform.inputFormats>'] (*optional*) One or more paths or glob patterns to limit the scope of the transform. Defaults to `'**\/*.<transform.inputFormats>'`
 * @property {Object} [engineOptions={}] (*optional*) Pass options to the jstransformer templating engine that's rendering your files. The default is `{}`
 **/

/** @type {Options} */
const defaultOptions = {
  pattern: '**',
  engineOptions: {}
}

/**
 * A metalsmith plugin for in-place templating
 * @param {Options} options
 * @returns {import('metalsmith').Plugin}
 */
function initializeInPlace(options = defaultOptions) {
  const settings = Object.assign({}, defaultOptions, options)
  let transform

  return async function inPlace(files, metalsmith, done) {
    debug = metalsmith.debug('@metalsmith/in-place')

    // Check whether the pattern option is valid
    if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
      return done(
        new Error(
          'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/@metalsmith/in-place#pattern'
        )
      )
    }

    // skip resolving the transform option on repeat runs
    if (!transform) {
      try {
        transform = await getTransformer(options.transform)
      } catch (err) {
        // pass through jstransformer & Node import resolution errors
        return done(err)
      }
    }

    if (settings.pattern === defaultOptions.pattern) {
      settings.pattern = `${settings.pattern}/*.{${transform.inputFormats.join(',')}}`
    }

    debug('Running with options %O', settings)

    const matchedFiles = metalsmith.match(settings.pattern)

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
    return Promise.all(validFiles.map((filename) => render({ filename, files, metalsmith, settings, transform })))
      .then(() => done())
      .catch((error) => done(error))
  }
}

export default initializeInPlace
