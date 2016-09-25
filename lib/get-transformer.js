'use strict';

/**
 * Dependencies
 */

const jstransformer = require('jstransformer');
const toTransformer = require('inputformat-to-jstransformer');

/**
 * Transformer cache
 */

const cache = {};

/**
 * Get the appropriate transformer by extension.
 */

module.exports = function getTransformer(ext) {
  // Check cache and return the transformer if found
  if (ext in cache) return cache[ext];

  // Get transformer if not in cache and store it
  const transformer = toTransformer(ext);
  cache[ext] = transformer ? jstransformer(transformer) : false;

  // Return transformer
  return cache[ext];
};
