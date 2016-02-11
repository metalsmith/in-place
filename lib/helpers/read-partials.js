/**
 * Dependencies
 */
var fs = require('fs');
var path = require('path');
var read = require('fs-readdir-recursive');

/**
 * Expose `readPartials`
 */
module.exports = readPartials;

/**
 * Helper for reading a folder with partials, returns a `partials` object that
 * can be consumed by consolidate.
 *
 * @param {String} relativePath
 * @param {Object} metalsmith
 * @return {Object}
 */
function readPartials(relativePath, metalsmith) {
  var absolutePath = path.join(metalsmith.path(), relativePath);
  var files = read(absolutePath);
  var partials = {};

  // Return early if there are no partials
  if (files.length === 0) {
    return partials;
  }

  // Read and process all partials
  for (var i = 0; i < files.length; i++) {
    var fileInfo = path.parse(files[i]);
    var name = path.join(fileInfo.dir, fileInfo.name);
    var partial = path.join(absolutePath, files[i]);
    var contents = fs.readFileSync(partial, 'utf8');

    partials[name] = contents;
  }

  return partials;
}
