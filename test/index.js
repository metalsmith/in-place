/* eslint-env node, mocha */

import { strictEqual, deepStrictEqual } from 'node:assert'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import Metalsmith from 'metalsmith'
import equal from 'assert-dir-equal'
import plugin from '../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { name } = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

function fixture(p) {
  return resolve(__dirname, 'fixtures', p)
}

describe('@metalsmith/in-place', () => {
  it('should export a named plugin function matching package.json name', function () {
    const namechars = name.split('/')[1]
    const camelCased = namechars.split('').reduce((str, char, i) => {
      str += namechars[i - 1] === '-' ? char.toUpperCase() : char === '-' ? '' : char
      return str
    }, '')
    strictEqual(plugin().name, camelCased)
  })

  it('should support filepaths with dots in dirpaths', (done) => {
    Metalsmith(fixture('dots-in-folderpath'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('dots-in-folderpath/build'), fixture('dots-in-folderpath/expected'))
        done()
      })
  })

  it('should process a single file', (done) => {
    Metalsmith(fixture('single-file'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('single-file/build'), fixture('single-file/expected'))
        done()
      })
  })

  it('should stop processing after the last extension has been processed', (done) => {
    Metalsmith(fixture('stop-processing'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('stop-processing/build'), fixture('stop-processing/expected'))
        done()
      })
  })

  it('should process multiple files', (done) => {
    Metalsmith(fixture('multiple-files'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('multiple-files/build'), fixture('multiple-files/expected'))
        done()
      })
  })

  it('should only process files that match the string pattern', (done) => {
    Metalsmith(fixture('string-pattern-process'))
      .use(plugin({ pattern: '*.md' }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('string-pattern-process/build'), fixture('string-pattern-process/expected'))
        return done()
      })
  })

  it('should only process files that match the array pattern', (done) => {
    Metalsmith(fixture('array-pattern-process'))
      .use(plugin({ pattern: ['index.md', 'extra.md'] }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('array-pattern-process/build'), fixture('array-pattern-process/expected'))
        done()
      })
  })

  it('should return an error when there are no valid files to process', (done) => {
    const ms = Metalsmith(fixture('no-files')),
      output = []
    const Debugger = (...args) => {
      output.push(['log', ...args])
    }
    Object.assign(Debugger, {
      info: (...args) => {
        output.push(['info', ...args])
      },
      warn: (...args) => {
        output.push(['warn', ...args])
      },
      error: (...args) => {
        output.push(['error', ...args])
      }
    })
    ms.env('DEBUG', '*:warn')
      .use(() => {
        ms.debug = () => Debugger
      })
      .use(plugin())
      .build(() => {
        try {
          deepStrictEqual(output.slice(output.length - 2), [
            ['warn', 'validation failed, index does not have an extension'],
            ['warn', 'No valid files to process.']
          ])
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should return an error for an invalid pattern', (done) => {
    Metalsmith(fixture('invalid-pattern'))
      .use(plugin({ pattern: () => {} }))
      .build((err) => {
        strictEqual(err instanceof Error, true)
        strictEqual(
          err.message,
          'invalid pattern, the pattern option should be a string or array of strings. See https://www.npmjs.com/package/@metalsmith/in-place#pattern'
        )
        done()
      })
  })

  it('should ignore files without an extension', (done) => {
    Metalsmith(fixture('ignore-extensionless'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('ignore-extensionless/build'), fixture('ignore-extensionless/expected'))
        done()
      })
  })

  it('should ignore binary files', (done) => {
    Metalsmith(fixture('ignore-binary'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('ignore-binary/build'), fixture('ignore-binary/expected'))
        return done()
      })
  })

  it('should correctly transform files when multiple extensions match', (done) => {
    Metalsmith(fixture('transform-multiple'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('transform-multiple/build'), fixture('transform-multiple/expected'))
        return done()
      })
  })

  it('should correctly transform files when all extensions match', (done) => {
    Metalsmith(fixture('transform-multiple-and-first'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(fixture('transform-multiple-and-first/build'), fixture('transform-multiple-and-first/expected'))
        return done()
      })
  })

  it('should ignore files with extensions that do not match a jstransformer', (done) => {
    Metalsmith(fixture('ignore-extension-without-jstransformer'))
      .use(plugin())
      .build((err) => {
        if (err) done(err)
        equal(
          fixture('ignore-extension-without-jstransformer/build'),
          fixture('ignore-extension-without-jstransformer/expected')
        )
        done()
      })
  })

  it('should prefix rendering errors with the filename', (done) => {
    Metalsmith(fixture('rendering-error'))
      .use(plugin())
      .build((err) => {
        strictEqual(err instanceof Error, true)
        strictEqual(err.message.split(/\r*\n/)[0], 'index.hbs: Parse error on line 1:')
        done()
      })
  })

  it('should accept an option to set the filename in engine options', (done) => {
    Metalsmith(fixture('set-filename'))
      .use(plugin({ setFilename: true }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('set-filename/build'), fixture('set-filename/expected'))
        done()
      })
  })
})
