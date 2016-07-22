'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('metalsmith-in-place');
const extend = require('extend');
const path = require('path');

/**
 * Local
 */

const getTransformer = require('./get-transformer');

/**
 * Renders file with all available transformers
 */

module.exports = function renderFile(files, filename, metadata, source, options) {
  // Split filename and extensions
  const parts = filename.split('.');
  const name = parts.shift();
  const file = files[filename];

  // Set filename in options, necessary for some languages
  options.filename = path.join(source, filename);

  // Stringify file contents
  file.contents = file.contents.toString();

  // Loop through all extensions
  for (let i = 0; i < parts.length; i++) {
    // Get last extension and the appropriate transformer
    const extension = parts.pop();
    const transform = getTransformer(extension);

    // If the current extension can't be transformed stop looping
    if (!transform) {
      debug(`no transformer found for '${extension}'`);
      parts.push(extension);
      break;
    }

    // Otherwise transform the contents
    const locals = extend({}, metadata, file);
    file.contents = transform.render(file.contents, options, locals).body;

    // If the last extension was transformed, replace it with a new one
    if (parts.length === 0) parts[0] = transform.outputFormat;
  }

  // Add name back to the beginning of the extensions array
  parts.unshift(name);

  // Construct results
  const results = {
    filename: parts.join('.'),
    contents: new Buffer(file.contents)
  };

  return results;
};
