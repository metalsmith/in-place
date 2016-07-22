/**
 * Dependencies
 */

const debug = require('debug')('metalsmith-in-place');

/**
 * Main export
 */

module.exports = function saveFile(files, filename, newname, done) {
  // Return early if there weren't any transforms
  if (newname === filename) {
    debug(`'${filename}' wasn't modified`);
    return done();
  }

  // If there were transforms store new file and delete the old
  files[newname] = files[filename];
  delete files[filename];
  debug(`'${filename}' transformed to '${newname}'`);
  return done();
};
