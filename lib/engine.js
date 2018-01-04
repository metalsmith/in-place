const isUtf8 = require('is-utf8')
const getTransformer = require('./get-transformer')

module.exports = class Engine {
  constructor(files, metalsmith, options) {
    this.files = files
    this.options = options
    this.metadata = metalsmith.metadata()
    this.source = metalsmith.source()
  }

  /**
  * Accepts a single key from a metalsmith files object (i.e. a filename), and returns true if it
  * can be processed, false if it can't
  */
  validate(filename) {
    // Files without an extension cannot be processed
    if (!filename.includes('.')) {
      return false
    }

    // Files that are not utf8 are ignored
    if (!isUtf8(this.files[filename].contents)) {
      return false
    }

    // Files without an applicable jstransformer are ignored
    const extension = filename.split('.').pop()
    return getTransformer(extension)
  }

  /**
  * Accepts a single key from a metalsmith files object (i.e. a filename), and renders it with all
  * available jstransformers. Starts at the rightmost extension, and stops when there's no more
  * extensions with an applicable jstransformer.
  */
  render(filename) {
    return new Promise(resolve => {
      const [base, ...extensions] = filename.split('.')
      const file = this.files[filename]

      // Stringify file contents
      file.contents = file.contents.toString()

      // Go through all extensions
      const extLength = extensions.length
      for (let i = 0; i < extLength; i += 1) {
        const ext = extensions.pop()
        const transform = getTransformer(ext)
        const locals = Object.assign({}, this.metadata, file)

        // Stop if the current extension can't be transformed
        if (!transform) {
          extensions.push(ext)
          break
        }

        // If this is the last extension, replace it with a new one
        if (extensions.length === 0) {
          extensions.push(transform.outputFormat)
        }

        // Transform the contents
        file.contents = transform.render(file.contents, this.options, locals).body
      }

      // Store results and delete old file
      file.contents = Buffer.from(file.contents)
      this.files[[base, ...extensions].join('.')] = file
      delete this.files[filename]
      return resolve()
    })
  }
}
