'use strict';

/**
 * Checks if a string contains another string, returns true if it does
 */

module.exports = function contains(string, substring) {
  return string.indexOf(substring) > -1;
};
