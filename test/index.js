'use strict';

/* eslint-disable no-var, prefer-arrow-callback, object-shorthand */

/**
 * Dependencies
 */

var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var path = require('path');
var plugin = require('..');
var rimraf = require('rimraf');

/**
 * Tests
 */

describe('metalsmith-in-place', function () {
  it('should process relative jade includes', function (done) {
    var folder = 'lang-jade-includes';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process relative swig includes', function (done) {
    var folder = 'lang-swig-includes';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process handlebars partials defined in the options', function (done) {
    var folder = 'options-handlebars-partials';
    var metalsmith = new Metalsmith(fixture(folder));
    var partials = { title: 'The title' };
    var options = { options: { partials: partials } };

    runTest(folder, options, metalsmith, done);
  });

  it('should only process files that match the pattern', function (done) {
    var folder = 'options-pattern';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, { pattern: '*.swig' }, metalsmith, done);
  });

  it('should render files with chained transforms', function (done) {
    var folder = 'render-chained';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should render files in nested folders', function (done) {
    var folder = 'render-nested';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should replace the last extension when transformed', function (done) {
    var folder = 'render-replace-ext';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should skip filenames when transforming', function (done) {
    var folder = 'render-skip-filename';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should skip files without an extension', function (done) {
    var folder = 'render-skip-no-extension';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should skip files without appropriate transforms', function (done) {
    var folder = 'render-skip-no-transform';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process variables defined in the frontmatter', function (done) {
    var folder = 'variables-frontmatter';
    var metalsmith = new Metalsmith(fixture(folder));

    runTest(folder, {}, metalsmith, done);
  });

  it('should process variables defined in the metadata', function (done) {
    var folder = 'variables-metadata';
    var metadata = { title: 'The title' };
    var metalsmith = new Metalsmith(fixture(folder)).metadata(metadata);

    runTest(folder, {}, metalsmith, done);
  });

  it('should prefer frontmatter over metadata variables', function (done) {
    var folder = 'variables-overwrite';
    var metalsmith = new Metalsmith(fixture(folder));

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
    .build(function (err) {
      if (err) return done(err);
      equal(expected(folder), build(folder));
      return done();
    });
}
