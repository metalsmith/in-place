/**
 * Dependencies
 */

const debug = require('debug')('metalsmith-in-place');

/**
 * Main export
 */

module.exports = function saveFile(files, filename, results, done) {
  // Return early if there weren't any transforms
  if (results.filename === filename) {
    debug(`'${filename}' wasn't modified`);
    return done();
  }

  // If there were transforms store new file and delete the old
  files[filename].contents = results.contents;
  files[results.filename] = files[filename];
  delete files[filename];
  debug(`'${filename}' transformed to '${results.filename}'`);
  return done();
};
