'use strict';

/**
 * Dependencies
 */

const equal = require('assert-dir-equal');
const metalsmith = require('metalsmith');
const plugin = require('..');

/**
 * Tests
 */

describe('metalsmith-in-place', () => {
  it('should process relative swig includes', (done) => {
    const name = 'lang-swig-includes';

    metalsmith(fixture(name))
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should process handlebars partials defined in the options', (done) => {
    const name = 'options-handlebars-partials';
    const partials = { title: 'The title' };

    metalsmith(fixture(name))
      .use(plugin({
        options: { partials }
      }))
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should only process files that match the pattern', (done) => {
    const name = 'options-pattern';

    metalsmith(fixture(name))
      .use(plugin({ pattern: '*.swig' }))
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should render files with chained transforms', (done) => {
    const name = 'render-chained';

    metalsmith(fixture(name))
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should render files in nested folders', (done) => {
    const name = 'render-nested';

    metalsmith(fixture(name))
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should skip files without appropriate transforms', (done) => {
    const name = 'render-skip';

    metalsmith(fixture(name))
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should process variables defined in the frontmatter', (done) => {
    const name = 'variables-frontmatter';

    metalsmith(fixture(name))
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should process variables defined in the metadata', (done) => {
    const name = 'variables-metadata';

    metalsmith(fixture(name))
      .metadata({ title: 'The title' })
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });

  it('should prefer frontmatter over metadata variables', (done) => {
    const name = 'variables-overwrite';

    metalsmith(fixture(name))
      .metadata({ title: 'The metadata title' })
      .use(plugin())
      .build((err) => {
        if (err) {
          return done(err);
        }
        equal(expected(name), build(name));
        return done();
      });
  });
});

/**
 * Utils
 */

function fixture(name) {
  return `test/fixtures/${name}`;
}

function expected(name) {
  return `test/fixtures/${name}/expected`;
}

function build(name) {
  return `test/fixtures/${name}/build`;
}
