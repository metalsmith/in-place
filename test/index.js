// Enable --harmony flag if needed
require('harmonize')();

const equal = require('assert-dir-equal');
const expect = require('expect');
const Metalsmith = require('metalsmith');
const path = require('path');
const rimraf = require('rimraf');
const buildEngine = require('./build-engine');
const errorEngine = require('./error-engine');
const plugin = require('../lib');

describe('metalsmith-in-place', () => {
  it('should process a single file', (done) => {
    const base = path.join('test', 'fixtures', 'single');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({ engine: buildEngine }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should process multiple files', (done) => {
    const base = path.join('test', 'fixtures', 'multiple');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({ engine: buildEngine }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should only process files that match the pattern', (done) => {
    const base = path.join('test', 'fixtures', 'pattern');
    const actual = path.join(base, 'build');
    const expected = path.join(base, 'expected');
    const metalsmith = new Metalsmith(base);

    rimraf.sync(actual);

    return metalsmith
      .use(plugin({
        pattern: '*.md',
        engine: buildEngine,
      }))
      .build((err) => {
        if (err) return done(err);
        equal(actual, expected);
        return done();
      });
  });

  it('should fall back to the default engine', (done) => {
    const base = path.join('test', 'fixtures', 'engine');
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
    const base = path.join('test', 'fixtures', 'invalid');
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

  it('should catch errors from the engine', (done) => {
    const base = path.join('test', 'fixtures', 'error');
    const metalsmith = new Metalsmith(base);

    return metalsmith
      .use(plugin({ engine: errorEngine }))
      .build((err) => {
        expect(err).toBeA(Error);
        expect(err.message).toEqual('Message');
        return done();
      });
  });
});
