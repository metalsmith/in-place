'use strict';

const debug = require('debug')('metalsmith-in-place');
const JsTransformer = require('./js-transformer');

/**
 * Local
 */

const check = require('./check');

/**
 * Main export
 */

module.exports = function plugin(opts) {
  opts = opts || {};

  // Parse options and set defaults
  const Engine = opts.engine || JsTransformer;
  const engineOptions = opts.engineOptions || {};
  const pattern = opts.pattern || '**';

  return function (files, metalsmith, done) {
    const engine = new Engine(files, metalsmith, engineOptions);

    Object.keys(files).filter((file) => check(file, pattern)).forEach((filename) => {
      engine.render(filename);
    });

    debug('all files processed');
    done();
  };
};
