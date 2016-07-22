'use strict';

/**
 * Local
 */

const checkFile = require('./lib/check-file');
const renderFile = require('./lib/render-file');
const saveFile = require('./lib/save-file');

/**
 * Main export
 */

module.exports = function plugin(opts) {
  opts = opts || {};

  // Parse options and set defaults
  const pattern = opts.pattern || '**';
  const options = opts.options || {};

  // Main plugin function
  return function (files, metalsmith, done) {
    // Get data from current metalsmith instance
    const metadata = metalsmith.metadata();
    const source = metalsmith.source();

    // Loop through all files
    Object.keys(files).forEach((filename) => {
      // Check file, skip processing if it fails
      if (!checkFile(filename, pattern)) return done();

      // Transform file
      const newname = renderFile(files, filename, metadata, source, options);

      // Save results
      saveFile(files, filename, newname, done);
    });
  };
};
