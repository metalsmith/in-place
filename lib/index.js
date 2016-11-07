'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('metalsmith-in-place');

/**
 * Local
 */

const checkFile = require('./check-file');
const renderFile = require('./render-file');

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
      // Check file, only process if it passes
      if (checkFile(filename, pattern)) {
        // Transform file
        const newname = renderFile(files, filename, metadata, source, options);

        // Do nothing if there were no transforms
        if (newname === filename) {
          debug(`'${filename}' wasn't modified`);
        } else {
          // If there were transforms store new file and delete the old
          files[newname] = files[filename];
          delete files[filename];
          debug(`'${filename}' transformed to '${newname}'`);
        }
      }
    });

    debug('all files processed');
    done();
  };
};
