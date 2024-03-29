/* eslint-env node, mocha */

import { strictEqual, deepStrictEqual } from 'node:assert'
import { resolve, dirname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import Metalsmith from 'metalsmith'
import equal from 'assert-dir-equal'
import plugin from '../src/index.js'
import { handleExtname } from '../src/utils.js'
import jsTransformerPug from 'jstransformer-pug'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { name } = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

function fixture(p) {
  return resolve(__dirname, 'fixtures', p)
}

function patchDebug() {
  const output = []
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
  return function patchDebug(files, ms) {
    ms.debug = () => Debugger
    ms.metadata({ logs: output })
  }
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

  it('should throw on unspecified transform option', (done) => {
    Metalsmith(fixture('transform-option'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin())
      .process((err) => {
        try {
          strictEqual(err instanceof Error, true)
          strictEqual(err.code, 'ERR_ASSERTION')
          strictEqual(err.message, 'Transformer must be an object')
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should throw on invalid transformer', (done) => {
    Promise.allSettled([
      Metalsmith(fixture('transform-option'))
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: false }))
        .process(),
      Metalsmith(fixture('transform-option'))
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: { renderAsync() {} } }))
        .process(),
      Metalsmith(fixture('transform-option'))
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: { name: '' } }))
        .process()
    ]).then((promises) => {
      const messages = [
        'Transformer must be an object',
        'Transformer must have a name',
        'Transformer must have an output format'
      ]
      for (let i = 0; i < 3; i++) {
        const err = promises[i].reason
        try {
          strictEqual(err instanceof Error, true)
          strictEqual(err.code, 'ERR_ASSERTION')
          strictEqual(err.message, messages[i])
        } catch (err) {
          done(err)
          break
        }
      }
      done()
    })
  })

  it('should throw on unresolved transform option', () => {
    return Promise.allSettled([
      Metalsmith(fixture('transform-option'))
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: 'invalid' }))
        .process(),
      Metalsmith(fixture('transform-option'))
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: './invalid-local' }))
        .process(),
      Metalsmith(fixture('transform-option'))
        .env('DEBUG', process.env.DEBUG)
        .use(plugin({ transform: 'jstransformer-invalid' }))
        .process()
    ]).then((promises) => {
      deepStrictEqual(
        promises.map((p) => p.status),
        ['rejected', 'rejected', 'rejected']
      )
      // in ESM, this yields ERR_MODULE_NOT_FOUND, but in CJS the ERR_ prefix is omitted
      deepStrictEqual(
        promises.map((p) => p.reason.code.replace('ERR_', '')),
        ['MODULE_NOT_FOUND', 'MODULE_NOT_FOUND', 'MODULE_NOT_FOUND']
      )
    })
  })

  it('should resolve the transform option flexibly', (done) => {
    // Metalsmith.directory() doesn't really matter here, we just need to validate it doesn't return an error
    Metalsmith(fixture('transform-option'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .use(plugin({ transform: 'jstransformer-marked' }))
      .use(plugin({ transform: jsTransformerPug }))
      .build((err) => {
        try {
          strictEqual(err, null)
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should support filepaths with dots in dirpaths', (done) => {
    Metalsmith(fixture('dots-in-folderpath'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('dots-in-folderpath/build'), fixture('dots-in-folderpath/expected'))
        done()
      })
  })

  it('should process a single file', (done) => {
    Metalsmith(fixture('single-file'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('single-file/build'), fixture('single-file/expected'))
        done()
      })
  })

  it('should stop processing after the last extension has been processed', (done) => {
    Metalsmith(fixture('stop-processing'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .use(plugin({ transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        try {
          equal(fixture('stop-processing/build'), fixture('stop-processing/expected'))
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should process multiple files', (done) => {
    Metalsmith(fixture('multiple-files'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        try {
          equal(fixture('multiple-files/build'), fixture('multiple-files/expected'))
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should only process files that match the string pattern', (done) => {
    Metalsmith(fixture('string-pattern-process'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ pattern: 'index.md', transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        try {
          equal(fixture('string-pattern-process/build'), fixture('string-pattern-process/expected'))
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should only process files that match the array pattern', (done) => {
    Metalsmith(fixture('array-pattern-process'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ pattern: ['index.md', 'extra.md'], transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('array-pattern-process/build'), fixture('array-pattern-process/expected'))
        done()
      })
  })

  it('should log a warning when there are no valid files to process', (done) => {
    const ms = Metalsmith(fixture('no-files'))

    ms.env('DEBUG', '@metalsmith/in-place:warn')
      .use(patchDebug())
      .use(plugin({ transform: 'marked' }))
      .build(() => {
        try {
          const { logs } = ms.metadata()
          deepStrictEqual(
            logs.filter((l) => l[0] === 'warn'),
            [['warn', 'No valid files to process.']]
          )
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should return an error for an invalid pattern', (done) => {
    Metalsmith(fixture('invalid-pattern'))
      .env('DEBUG', process.env.DEBUG)
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

  it('should ignore binary files', (done) => {
    const ms = Metalsmith(fixture('ignore-binary'))
    ms.env('DEBUG', '@metalsmith/in-place*')
      .use(patchDebug())
      .use(plugin({ transform: 'handlebars' }))
      .build((err) => {
        if (err) done(err)
        try {
          equal(fixture('ignore-binary/build'), fixture('ignore-binary/expected'))
          deepStrictEqual(
            ms.metadata().logs.filter((l) => l[0] === 'warn'),
            [['warn', 'Validation failed, %s is not utf-8', 'binary.hbs']]
          )
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should correctly transform files when multiple extensions match', (done) => {
    Metalsmith(fixture('transform-multiple'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .use(plugin({ transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('transform-multiple/build'), fixture('transform-multiple/expected'))
        return done()
      })
  })

  it('should correctly transform files when all extensions match', (done) => {
    Metalsmith(fixture('transform-multiple-and-first'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .use(plugin({ transform: 'marked' }))
      .build((err) => {
        if (err) done(err)
        equal(fixture('transform-multiple-and-first/build'), fixture('transform-multiple-and-first/expected'))
        return done()
      })
  })

  it("should log a warning for files without extension matching a jstransformer's inputFormats", (done) => {
    const ms = Metalsmith(fixture('warn-no-matching-extension'))

    ms.env('DEBUG', '@metalsmith/in-place*')
      .use(patchDebug())
      .use(plugin({ transform: 'marked', pattern: ['index.njk', 'index.md'] }))
      .build((err) => {
        try {
          strictEqual(err, null)
          equal(fixture('warn-no-matching-extension/build'), fixture('warn-no-matching-extension/expected'))
          strictEqual(
            ms.metadata().logs.find((log) => log[0] === 'warn')[1],
            'Validation failed for file "%s", transformer %s supports extensions %s.'
          )
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should prefix rendering errors with the filename', (done) => {
    Metalsmith(fixture('rendering-error'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: 'handlebars' }))
      .build((err) => {
        strictEqual(err instanceof Error, true)
        strictEqual(err.message.split(/\r*\n/)[0], 'index.hbs: Parse error on line 1:')
        done()
      })
  })

  it('should understand the filename option in engine options to allow working with Pug and other transformers with a filename option', (done) => {
    Metalsmith(fixture('set-filename'))
      .env('DEBUG', process.env.DEBUG)
      .use(plugin({ transform: { ...jsTransformerPug, inputFormats: ['pug'] }, engineOptions: { filename: true } }))
      .build((err) => {
        try {
          strictEqual(err, null)
          equal(fixture('set-filename/build'), fixture('set-filename/expected'))
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should be capable of rendering in rtl file extension order', (done) => {
    Metalsmith(fixture('ext-chaining'))
      .env('DEBUG', process.env.DEBUG)
      .metadata({ nums: ['one', 'two', 'three'] })
      .use(plugin({ transform: 'handlebars' }))
      .use(plugin({ transform: 'marked' }))
      .build((err) => {
        try {
          strictEqual(err, null)
          equal(fixture('ext-chaining/build'), fixture('ext-chaining/expected'))
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  it('should be capable of rendering in a different order than the rtl file extension order', (done) => {
    Metalsmith(fixture('custom-ext-order'))
      .env('DEBUG', process.env.DEBUG)
      .metadata({ nums: ['one', 'two', 'three'] })
      .use(plugin({ transform: 'marked' }))
      .use(plugin({ transform: 'handlebars' }))
      .build((err) => {
        try {
          strictEqual(err, null)
          equal(fixture('custom-ext-order/build'), fixture('custom-ext-order/expected'))
          done()
        } catch (err) {
          done(err)
        }
      })
  })

  describe('extension handling', () => {
    const options = {
      defaults: {
        extname: '.html',
        transform: {
          inputFormats: ['njk', 'nunjucks'],
          outputFormat: 'html'
        }
      },
      markdown: {
        extname: '.html',
        transform: {
          inputFormats: ['md', 'marked', 'markdown'],
          outputFormat: 'html'
        }
      },
      ejs: {
        extname: '.html',
        transform: {
          inputFormats: ['ejs'],
          outputFormat: 'html'
        }
      }
    }

    describe('when filename has a single extension', () => {
      // options.extname defaults to `.${options.tranform.outputFormat}`
      it('replaces the matching extension with options.extname', () => {
        strictEqual(handleExtname('index.njk', options.defaults), 'index.html')
        strictEqual(handleExtname('index.njk', { ...options.defaults, extname: '.htm' }), 'index.htm')
      })
      it('keeps the extension if options.extname === `.${extension}`', () => {
        strictEqual(handleExtname('index.html', options.defaults), 'index.html')
        strictEqual(handleExtname('index.htm', { ...options.defaults, extname: '.html' }), 'index.htm')
      })
      it("removes the extension if options.extname === null|false|''", () => {
        strictEqual(handleExtname('index.njk', { ...options.defaults, extname: false }), 'index')
        strictEqual(handleExtname('index.njk', { ...options.defaults, extname: '' }), 'index')
        strictEqual(handleExtname('index.njk', { ...options.defaults, extname: null }), 'index')
      })
    })
    describe('when filename has multiple extensions', () => {
      it('strips the rightmost matching extension', () => {
        const renamed = handleExtname('index.md.njk', options.defaults)
        strictEqual(renamed, 'index.md')
      })
      it('strips the rightmost matching extension, regardless of its position', () => {
        const renamed = handleExtname('index.njk.md', options.defaults)
        strictEqual(renamed, 'index.md')
      })
      it('*only* strips the rightmost matching extension, regardless of multiple matches', () => {
        const renamed = handleExtname('index.njk.nunjucks.md', options.defaults)
        strictEqual(renamed, 'index.njk.md')
      })
      it('does not strip any extension if none matches options.transform.inputFormats', () => {
        const renamed = handleExtname('index.html.md', options.defaults)
        strictEqual(renamed, 'index.html.md')
      })
    })

    describe('supports complex cases', () => {
      it('processing a filename with 4 extensions', () => {
        const filename = 'index.njk.md.ejs.html'
        const renamed = handleExtname(
          handleExtname(handleExtname(filename, options.defaults), options.ejs),
          options.markdown
        )
        strictEqual(renamed, 'index.html')
      })
      it('processing a filename with no extensions', () => {
        const filename = 'index.html'
        const renamed = handleExtname(
          handleExtname(handleExtname(filename, options.defaults), options.ejs),
          options.markdown
        )
        strictEqual(renamed, 'index.html')
      })
      it('filepath with periods in dirname', () => {
        strictEqual(
          handleExtname(normalize('some.release/v2.4.0/index.html.njk'), options.defaults),
          normalize('some.release/v2.4.0/index.html')
        )
      })
      it('filepath with periods in basename', () => {
        strictEqual(
          handleExtname(normalize('some.release/v2.4.0.html.njk'), options.defaults),
          normalize('some.release/v2.4.0.html')
        )
      })
    })
  })
})
