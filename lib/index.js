'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('metalsmith-in-place');
const extend = require('extend');
const jstransformer = require('jstransformer');
const match = require('multimatch');
const path = require('path');
const toTransformer = require('inputformat-to-jstransformer');

/**
 * Transformer cache
 */

const cache = {};

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
    // Get global metadata
    const metadata = metalsmith.metadata();

    // Loop through all files
    Object.keys(files).forEach((file) => {
      // Check file, skip processing if it fails
      if (!checkFile(file, pattern)) {
        return done();
      }

      // Set filename in options, necessary for some languages
      options.filename = path.join(metalsmith._directory, metalsmith._source, file);

      // Transform file
      const results = renderFile(files, file, metadata, options);

      // Return early if there weren't any transforms
      if (results.filename === file) {
        debug(`'${file}' wasn't modified`);
        return done();
      }

      // If there were transforms store new file and delete the old
      files[file].contents = results.contents;
      files[results.filename] = files[file];
      delete files[file];
      debug(`'${file}' transformed to '${results.filename}'`);
      return done();
    });
  };
};

/**
 * Get the appropriate transformer by extension.
 */

function getTransformer(ext) {
  // Check cache and return the transformer if found
  if (ext in cache) {
    return cache[ext];
  }

  // Get transformer if not in cache and store it
  const transformer = toTransformer(ext);
  cache[ext] = transformer ? jstransformer(transformer) : false;

  // Return transformer
  return cache[ext];
}

/**
 * Renders file with all available transformers
 */

function renderFile(files, file, metadata, options) {
  // Split filename and extensions, and get file contents
  let filename = file.split('.');
  let contents = files[file].contents.toString();

  // Loop through all extensions (but skip the file name)
  for (let i = 0; i < filename.length - 1; i++) {
    // Get last extension and the appropriate transformer
    const ext = filename.pop();
    const transform = getTransformer(ext);

    // If the current extension can't be transformed stop looping
    if (!transform) {
      debug(`no transformer found for '${ext}'`);
      filename.push(ext);
      break;
    }

    // Otherwise transform the contents
    const locals = extend({}, metadata, files[file]);
    contents = transform.render(contents, options, locals).body;
  }

  // Convert contents back to buffer
  contents = new Buffer(contents);
  // Reconstruct filename
  filename = filename.join('.');

  return { filename, contents };
}

/**
 * Checks file
 */

function checkFile(file, pattern) {
  // Only process files that match the pattern
  if (!match(file, pattern)[0]) {
    debug(`the file '${file}' doesn't match the pattern '${pattern}'`);
    return false;
  }

  // Only process files with an extension
  if (!contains(file, '.')) {
    debug(`the file '${file}' doesn't have an extension`);
    return false;
  }

  return true;
}

/**
 * Checks if a string contains another string, returns true if it does
 */

function contains(string, substring) {
  return string.indexOf(substring) > -1;
}
