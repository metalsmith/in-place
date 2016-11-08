'use strict';

const JsTransformer = require('../engine/js-transformer'); // will be moved to an external module
const match = require('multimatch');

// Checks if files match the provided pattern
function check(filename, pattern) {
  return match(filename, pattern)[0];
}

function plugin(options = {}) {
  // Defaults
  const pattern = options.pattern || '**';
  const Engine = options.engine || JsTransformer;
  const engineOptions = options.engineOptions || {};

  return function (files, metalsmith, done) {
    const engine = new Engine(files, metalsmith, engineOptions);

    // Map all files that should be processed to an array of promises
    const promises = Object.keys(files)
      .filter(filename => check(filename, pattern))
      .map(filename => engine.render(filename));

    // Call done callback when all promises are resolved
    Promise.all(promises)
      .then(() => done())
      .catch(error => done(error));
  };
}

module.exports = plugin;
