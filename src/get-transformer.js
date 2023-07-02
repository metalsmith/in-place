import jstransformer from 'jstransformer'
import toTransformer from 'inputformat-to-jstransformer'

/**
 * Gets jstransformer for an extension, and caches them
 */

const cache = {}

function getTransformer(ext) {
  if (ext in cache) {
    return cache[ext]
  }

  const transformer = toTransformer(ext)
  cache[ext] = transformer ? jstransformer(transformer) : false

  return cache[ext]
}

export default getTransformer
