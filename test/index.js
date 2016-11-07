'use strict';

/**
 * Enable --harmony flag if needed
 */

require('harmonize')();

/**
 * Dependencies
 */

const equal = require('assert-dir-equal');
const Metalsmith = require('metalsmith');
const path = require('path');
const plugin = require('../lib');
const rimraf = require('rimraf');

/**
 * Tests
 */

describe('metalsmith-in-place', () => {
  it('should process relative jade includes', (done) => {
    const folder = 'lang-jade-includes';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process relative swig includes', (done) => {
    const folder = 'lang-swig-includes';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process handlebars partials defined in the options', (done) => {
    const folder = 'options-handlebars-partials';
    const metalsmith = new Metalsmith(fixture(folder));
    const partials = { title: 'The title' };
    const options = { options: { partials } };

    runTest(folder, options, metalsmith, done);
  });

  it('should only process files that match the pattern', (done) => {
    const folder = 'options-pattern';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, { pattern: '*.swig' }, metalsmith, done);
  });

  it('should render files with chained transforms', (done) => {
    const folder = 'render-chained';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should render files in nested folders', (done) => {
    const folder = 'render-nested';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should replace the last extension when transformed', (done) => {
    const folder = 'render-replace-ext';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should skip filenames when transforming', (done) => {
    const folder = 'render-skip-filename';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should skip files without an extension', (done) => {
    const folder = 'render-skip-no-extension';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should skip files without appropriate transforms', (done) => {
    const folder = 'render-skip-no-transform';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process variables defined in the frontmatter', (done) => {
    const folder = 'variables-frontmatter';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process variables defined in the metadata', (done) => {
    const folder = 'variables-metadata';
    const metadata = { title: 'The title' };
    const metalsmith = new Metalsmith(fixture(folder)).metadata(metadata);

    runTest(folder, {}, metalsmith, done);
  });

  it('should prefer frontmatter over metadata variables', (done) => {
    const folder = 'variables-overwrite';
    const metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });
});

/**
 * Utils
 */

function fixture(folder) {
  return path.join('test', 'fixtures', folder);
}

function expected(folder) {
  return path.join(fixture(folder), 'expected');
}

function build(folder) {
  return path.join(fixture(folder), 'build');
}

function runTest(folder, options, metalsmith, done) {
  rimraf.sync(build(folder));

  return metalsmith
    .use(plugin(options))
    .build((err) => {
      if (err) return done(err);
      equal(expected(folder), build(folder));
      return done();
    });
}
