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
    var ext = path.extname(files[i]);
    var name = files[i].replace(ext, '');
    var partial = path.join(absolutePath, files[i]);
    var contents = fs.readFileSync(partial, 'utf8');

    partials[name] = contents;
  }

  return partials;
}
