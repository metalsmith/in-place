const path = require('path');
const debug = require('debug')('metalsmith-in-place');
const match = require('multimatch');
const isUtf8 = require('is-utf8');
const getTransformer = require('./get-transformer');

/**
 * Engine, renders file contents with all available transformers
 */

function render({ filename, files, metalsmith, settings }) {
  const [base, ...extensions] = filename.split('.');
  const file = files[filename];
  const engineOptions = Object.assign({}, settings.engineOptions);
  const metadata = metalsmith.metadata();

  debug(`rendering ${filename}`);

  const ext = extensions.pop();
  const transform = getTransformer(ext);
  const locals = Object.assign({}, metadata, file);

  // Stop if the current extension can't be transformed
  if (!transform) {
    debug(`no transformer available for ${ext} extension for ${filename}`);
    return Promise.resolve();
  }

  // Stringify file contents
  const contents = file.contents.toString();

  // If this is the last extension, replace it with a new one
  if (extensions.length === 0) {
    debug(`last extension reached, replacing last extension with ${transform.outputFormat}`);
    extensions.push(transform.outputFormat);
  }

  // Check if the filename should be set in the engine options
  if (settings.setFilename) {
    debug(`setting filename in the engine options`);
    engineOptions.filename = path.join(metalsmith.source(), filename);
  }

  // Transform the contents
  debug(`rendering ${ext} extension for ${filename}`);

  return transform
    .renderAsync(contents, engineOptions, locals)
    .then(rendered => {
      // Delete old file
      delete files[filename]; // eslint-disable-line no-param-reassign

      // Update files with the newly rendered file
      const newName = [base, ...extensions].join('.');
      files[newName] = file; // eslint-disable-line no-param-reassign
      files[newName].contents = Buffer.from(rendered.body); // eslint-disable-line no-param-reassign

      debug(`done rendering ${filename}, renamed to ${newName}`);

      // Keep rendering until there are no applicable transformers left
      return render({ filename: newName, files, metalsmith, settings });
    })
    .catch(err => {
      err.message = `${filename}: ${err.message}`; // eslint-disable-line no-param-reassign
      throw err;
    });
}

/**
 * Validate, checks whether a file should be processed
 */

function validate({ filename, files }) {
  debug(`validating ${filename}`);

  // Files without an extension cannot be processed
  if (!filename.includes('.')) {
    debug(`validation failed, ${filename} does not have an extension`);
    return false;
  }

  // Files that are not utf8 are ignored
  if (!isUtf8(files[filename].contents)) {
    debug(`validation failed, ${filename} is not utf-8`);
    return false;
  }

  // Files without an applicable jstransformer are ignored
  const extension = filename.split('.').pop();
  const transformer = getTransformer(extension);

  if (!transformer) {
    debug(`validation failed, no jstransformer found for last extension of ${filename}`);
  }

  return transformer;
}

/**
 * Plugin, the main plugin used by metalsmith
 */

module.exports = options => (files, metalsmith, done) => {
  const defaults = {
    pattern: '**',
    engineOptions: {},
    suppressNoFilesError: false,
    setFilename: false
  };
  const settings = Object.assign({}, defaults, options);

  // Check whether the pattern option is valid
  if (!(typeof settings.pattern === 'string' || Array.isArray(settings.pattern))) {
    done(
      new Error(
        'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/metalsmith-in-place#pattern'
      )
    );
  }

  const matchedFiles = match(Object.keys(files), settings.pattern);

  // Filter files by validity
  const validFiles = matchedFiles.filter(filename => validate({ filename, files }));

  // Let the user know when there are no files to process, usually caused by missing jstransformer
  if (validFiles.length === 0) {
    const message =
      'no files to process. See https://www.npmjs.com/package/metalsmith-in-place#no-files-to-process';
    if (settings.suppressNoFilesError) {
      debug(message);
      done();
    } else {
      done(new Error(message));
    }
  }

  // Map all files that should be processed to an array of promises and call done when finished
  Promise.all(validFiles.map(filename => render({ filename, files, metalsmith, settings })))
    .then(() => done())
    .catch(/* istanbul ignore next */ error => done(error));
};
