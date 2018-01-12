const match = require('multimatch');
const isUtf8 = require('is-utf8');
const jstransformer = require('jstransformer');
const toTransformer = require('inputformat-to-jstransformer');

/**
 * Gets jstransformer for an extension, and caches them
 */

const cache = {};

function getTransformer(ext) {
  if (ext in cache) {
    return cache[ext];
  }

  const transformer = toTransformer(ext);
  cache[ext] = transformer ? jstransformer(transformer) : false;

  return cache[ext];
}

/**
 * Engine, renders file contents with all available transformers
 */

function render({ filename, files, metadata, engineOptions }) {
  return new Promise(resolve => {
    const [base, ...extensions] = filename.split('.');
    const file = files[filename];

    // Stringify file contents
    file.contents = file.contents.toString();

    // Go through all extensions
    const extLength = extensions.length;
    for (let i = 0; i < extLength; i += 1) {
      const ext = extensions.pop();
      const transform = getTransformer(ext);
      const locals = Object.assign({}, metadata, file);

      // Stop if the current extension can't be transformed
      if (!transform) {
        extensions.push(ext);
        break;
      }

      // If this is the last extension, replace it with a new one
      if (extensions.length === 0) {
        extensions.push(transform.outputFormat);
      }

      // Transform the contents
      file.contents = transform.render(file.contents, engineOptions, locals).body;
    }

    // Store results and delete old file
    file.contents = Buffer.from(file.contents);
    files[[base, ...extensions].join('.')] = file; // eslint-disable-line no-param-reassign
    delete files[filename]; // eslint-disable-line no-param-reassign
    return resolve();
  });
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ filename, files }) {
  // Files without an extension cannot be processed
  if (!filename.includes('.')) {
    return false;
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(files[filename].contents)) {
    return false;
  }

  // Files without an applicable jstransformer are ignored
  const extension = filename.split('.').pop();
  return getTransformer(extension);
}

/**
 * Plugin, the main plugin used by metalsmith
 */

module.exports = options => (files, metalsmith, done) => {
  const defaults = {
    pattern: '**',
    engineOptions: {}
  };
  const settings = Object.assign({}, defaults, options);
  const metadata = metalsmith.metadata();

  // Check whether the pattern option is valid
  if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
    done(new Error('invalid pattern, the pattern option should be a string or array.'));
  }

  const matchedFiles = match(Object.keys(files), settings.pattern);

  // Filter files by validity
  const validFiles = matchedFiles.filter(filename => validate({ filename, files }));

  // Let the user know when there are no files to process, usually caused by missing jstransformer
  if (validFiles.length === 0) {
    done(new Error('no files to process, check whether you have a jstransformer installed.'));
  }

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(
    validFiles.map(filename =>
      render({ filename, files, metadata, engineOptions: settings.engineOptions })
    )
  )
    .then(() => done())
    .catch(/* istanbul ignore next */ error => done(error));
};
