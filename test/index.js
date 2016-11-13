/* eslint-disable import/no-extraneous-dependencies */

// Enable --harmony flag if needed
require('harmonize')();

const equal = require('assert-dir-equal');
const expect = require('expect');
const Metalsmith = require('metalsmith');
const path = require('path');
const rimraf = require('rimraf');
const BuildEngine = require('./engines/build');
const ErrorEngine = require('./engines/error');
const OptionsEngine = require('./engines/options');
const plugin = require('../lib');

describe('metalsmith-in-place', () => {
  it('should process a single file', (done) => {
    const base = path.join('test', 'fixtures', 'single-file');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({ engine: BuildEngine }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should process multiple files', (done) => {
    const base = path.join('test', 'fixtures', 'multiple-files');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({ engine: BuildEngine }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should only process files that match the pattern', (done) => {
    const base = path.join('test', 'fixtures', 'pattern-process');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({
        pattern: '*.md',
        engine: BuildEngine,
      }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should fall back to the default engine', (done) => {
    const base = path.join('test', 'fixtures', 'default-engine');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin())
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should throw an error for invalid options', (done) => {
    const base = path.join('test', 'fixtures', 'invalid-options');
    const message = 'invalid options, this plugin expects a single options object.';
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(plugin({}, 'invalid option'))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual(message);
        return done();
      });
  });

  it('should throw an error for an invalid pattern', (done) => {
    const base = path.join('test', 'fixtures', 'invalid-pattern');
    const message = 'invalid pattern, the pattern option should be a string.';
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(plugin({
        pattern: () => {},
      }))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual(message);
        return done();
      });
  });

  it('should throw an error for an invalid engine', (done) => {
    const base = path.join('test', 'fixtures', 'invalid-engine');
    const message = 'invalid engine, the engine should be a constructor.';
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(plugin({
        engine: 'invalid engine',
      }))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual(message);
        return done();
      });
  });

  it('should throw an error for an engine without a render method', (done) => {
    const base = path.join('test', 'fixtures', 'missing-render');
    const message = 'invalid engine, the engine instance should have a render method.';
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(plugin({
        engine: () => {},
      }))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual(message);
        return done();
      });
  });

  it('should throw an error for an engine with an invalid render property', (done) => {
    const base = path.join('test', 'fixtures', 'invalid-render');
    const message = 'invalid engine, the render property should be a function.';
    const metalsmith = new Metalsmith(base);
    function Engine() {
      this.render = 'Invalid render prop';
    }

    return metalsmith
      .use(plugin({
        engine: Engine,
      }))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual(message);
        return done();
      });
  });

  it('should catch errors from the engine', (done) => {
    const base = path.join('test', 'fixtures', 'engine-error');
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(plugin({ engine: ErrorEngine }))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual('Message');
        return done();
      });
  });

  it('should pass the engine options to the engine', (done) => {
    const base = path.join('test', 'fixtures', 'engine-options');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({
        engine: OptionsEngine,
        engineOptions: {
          optionOne: 'value',
          optionTwo: 'value',
        },
      }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });
});
