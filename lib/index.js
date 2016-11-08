const JsTransformer = require('../engine/js-transformer'); // TODO: move to an external module
const match = require('multimatch');

const plugin = (options = {}, ...rest) => {
  const pattern = options.pattern || '**';
  const Engine = options.engine || JsTransformer;
  const engineOptions = options.engineOptions || {};

  return (files, metalsmith, done) => {
    if (rest.length > 0) {
      done(new Error('invalid options, this plugin expects a single options object.'));
    }

    const engine = new Engine(files, metalsmith, engineOptions);

    // Map all files that should be processed to an array of promises
    const promises = Object.keys(files)
      .filter(filename => match(filename, pattern)[0])
      .map(filename => engine.render(filename));

    // Call done callback when all promises are resolved
    Promise.all(promises)
      .then(() => done())
      .catch(error => done(error));
  };
};

module.exports = plugin;
