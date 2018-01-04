/* eslint-env jest */

const Metalsmith = require('metalsmith')
const equal = require('assert-dir-equal')
const rimraf = require('rimraf')
const path = require('path')
const plugin = require('./index')

describe('metalsmith-in-place', () => {
  it('should process a single file', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'single-file')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should process multiple files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'multiple-files')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
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
          pattern: '*.md'
        })
      )
      .build(err => {
        if (err) {
          return done(err)
        }
        expect(() => equal(actual, expected)).not.toThrow()
        return done()
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
          pattern: ['index.md', 'extra.md']
        })
      )
      .build(err => {
        if (err) {
          return done(err)
        }
        expect(() => equal(actual, expected)).not.toThrow()
        return done()
      })
  })

  it('should return an error when there are no valid files to process', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'no-files')
    const metalsmith = new Metalsmith(base)

    return metalsmith.use(plugin()).build(err => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toMatchSnapshot()
      done()
    })
  })

  it('should return an error for an invalid pattern', done => {
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

  it('should ignore files without an extension', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'ignore-extensionless')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should ignore binary files', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'ignore-binary')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should correctly transform files when multiple extensions match', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'transform-multiple')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should correctly transform files when all extensions match', done => {
    const base = path.join(process.cwd(), 'test', 'fixtures', 'transform-multiple-and-first')
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })

  it('should ignore files with extensions that do not match a jstransformer', done => {
    const base = path.join(
      process.cwd(),
      'test',
      'fixtures',
      'ignore-extension-without-jstransformer'
    )
    const actual = path.join(base, 'build')
    const expected = path.join(base, 'expected')
    const metalsmith = new Metalsmith(base)

    rimraf.sync(actual)

    return metalsmith.use(plugin()).build(err => {
      if (err) {
        return done(err)
      }
      expect(() => equal(actual, expected)).not.toThrow()
      return done()
    })
  })
})
