const Jstransformer = require('metalsmith-engine-jstransformer')
const match = require('multimatch')

const plugin = (options = {}, ...rest) => {
  const pattern = options.pattern || '**'
  const Engine = options.engine || Jstransformer
  const engineOptions = options.engineOptions || {}

  return (files, metalsmith, done) => {
    if (rest.length > 0) {
      done(new Error('invalid options, this plugin expects a single options object.'))
    }

    if (!(typeof pattern === 'string' || Array.isArray(pattern))) {
      done(new Error('invalid pattern, the pattern option should be a string or array.'))
    }

    const engine = new Engine(files, metalsmith, engineOptions)

    // Filter files by pattern first, and then by validity
    const validFiles = match(Object.keys(files), pattern).filter(filename =>
      engine.validate(filename)
    )

    if (validFiles.length === 0) {
      done(
        new Error(
          'no files to process, check whether you have jstransformers installed for the files you want to process.'
        )
      )
    }

    // Map all files that should be processed to an array of promises
    const promises = validFiles.map(filename => engine.render(filename))

    // Call done callback when all promises are resolved
    Promise.all(promises).then(() => done()).catch(error => done(error))
  }
}

module.exports = plugin
