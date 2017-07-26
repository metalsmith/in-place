/* eslint-env jest */

const Metalsmith = require('metalsmith')
const equal = require('assert-dir-equal')
const rimraf = require('rimraf')
const path = require('path')
const plugin = require('./index')
const BuildEngine = require('../test/engines/build')
const ErrorEngine = require('../test/engines/error')
const OptionsEngine = require('../test/engines/options')

describe('metalsmith-in-place', () => {
  it('should process a single file', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'single-file')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin({ engine: BuildEngine })).build(err => {
      if (err) throw err
      expect(() => equal(actual, expected)).not.toThrow()
      done()
    })
  })

  it('should process multiple files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'multiple-files')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin({ engine: BuildEngine })).build(err => {
      if (err) throw err
      expect(() => equal(actual, expected)).not.toThrow()
      done()
    })
  })

  it('should only process files that match the string pattern', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'string-pattern-process')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith
      .use(
        plugin({
          pattern: '*.md',
          engine: BuildEngine
        })
      )
      .build(err => {
        if (err) throw err
        expect(() => equal(actual, expected)).not.toThrow()
        done()
      })
  })

  it('should only process files that match the array pattern', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'array-pattern-process')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith
      .use(
        plugin({
          pattern: ['index.md', 'extra.md'],
          engine: BuildEngine
        })
      )
      .build(err => {
        if (err) throw err
        expect(() => equal(actual, expected)).not.toThrow()
        done()
      })
  })

  it('should fall back to the default engine', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'default-engine')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) throw err
      expect(() => equal(actual, expected)).not.toThrow()
      done()
    })
  })

  it('should throw an error for invalid options', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'invalid-options')
    const metalsmith = new Metalsmith(base)

    return metalsmith.use(plugin({}, 'invalid option')).build(err => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toMatchSnapshot()
      done()
    })
  })

  it('should throw an error for an invalid pattern', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'invalid-pattern')
    const metalsmith = new Metalsmith(base)

    return metalsmith
      .use(
        plugin({
          pattern: () => {}
        })
      )
      .build(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toMatchSnapshot()
        done()
      })
  })

  it('should throw an error for an invalid engine', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'invalid-engine')
    const metalsmith = new Metalsmith(base)

    return metalsmith
      .use(
        plugin({
          engine: 'invalid engine'
        })
      )
      .build(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toMatchSnapshot()
        done()
      })
  })

  it('should throw an error for an engine without a render method', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'missing-render')
    const metalsmith = new Metalsmith(base)

    return metalsmith
      .use(
        plugin({
          engine: () => {}
        })
      )
      .build(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toMatchSnapshot()
        done()
      })
  })

  it('should throw an error for an engine with an invalid render property', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'invalid-render')
    const metalsmith = new Metalsmith(base)

    function Engine() {
      this.render = 'Invalid render prop'
    }

    return metalsmith
      .use(
        plugin({
          engine: Engine
        })
      )
      .build(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toMatchSnapshot()
        done()
      })
  })

  it('should catch errors from the engine', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'engine-error')
    const metalsmith = new Metalsmith(base)

    return metalsmith.use(plugin({ engine: ErrorEngine })).build(err => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toMatchSnapshot()
      done()
    })
  })

  it('should pass the engine options to the engine', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'engine-options')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith
      .use(
        plugin({
          engine: OptionsEngine,
          engineOptions: {
            optionOne: 'value',
            optionTwo: 'value'
          }
        })
      )
      .build(err => {
        if (err) throw err
        expect(() => equal(actual, expected)).not.toThrow()
        done()
      })
  })
})
