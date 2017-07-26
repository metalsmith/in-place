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

    if (typeof Engine !== 'function') {
      done(new Error('invalid engine, the engine should be a constructor.'))
    }

    const engine = new Engine(files, metalsmith, engineOptions)

    if (!engine.render) {
      done(new Error('invalid engine, the engine instance should have a render method.'))
    }

    if (typeof engine.render !== 'function') {
      done(new Error('invalid engine, the render property should be a function.'))
    }

    // Map all files that should be processed to an array of promises
    const promises = Object.keys(files)
      .filter(filename => match(filename, pattern)[0])
      .map(filename => engine.render(filename))

    // Call done callback when all promises are resolved
    Promise.all(promises).then(() => done()).catch(error => done(error))
  }
}

module.exports = plugin
