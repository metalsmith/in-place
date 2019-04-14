### 4.4.0 - April 14, 2019
* add `setFilename` option, to set the absolute file path in the engine options

### 4.3.0 - April 7, 2019
* prefix rendering errors with filename that caused the error
* allow async transforms

### 4.2.0 - July 19, 2018
* add `suppressNoFilesError` feature 

### 4.1.1 - January 25, 2018
* documentation fix

### 4.1.0 - January 25, 2018
* add a documentation link to the error messages
* add debug for better debugging

### 4.0.0 - January 4, 2018
So this library went through a bit of churny phase, my apologies for that. It was caused by a couple
of factors; moving the library to a new home, a new rendering engine and me trying to abstract said
rendering engine for reuse in metalsmith-layouts.

However, the end result is now a stable plugin, that's easy to use and easy to maintain.
Jstransformers are way simpler to debug, and so far I haven't even encountered any bugs. We're not
abstracting the rendering engine because it's just not worth it, and confusing apis have been
removed. All in all I hope that you'll enjoy this release and feel free to let me know if you
encounter anything!

* breaking: dropped node 4 support
* breaking: the filename property is no longer set automatically, use https://github.com/MoOx/metalsmith-filenames
* removed metalsmith-engine-jstransformer for ease of maintenance

### 4.0.0-alpha.2 - October 7, 2017
* update metalsmith-engine-jstransformer to 1.0.0-alpha.2

### 4.0.0-alpha.1 - October 7, 2017
* update metalsmith-engine-jstransformer to 1.0.0-alpha.1

### 3.0.1 - August 2, 2017
* update metalsmith-engine-jstransformer to 0.1.2

### 3.0.0 - July 26, 2017
* dropped support for iojs and node 0.12
* allow arrays for pattern option as well

### 2.0.1 - January 1, 2017
* correct publishing mistake

### 2.0.0 - January 1, 2017
* abstract templating, allows user to choose which engine to use for rendering (breaking change)

### 2.0.0-beta.1 - September 11, 2016
* switch to jstransformers for rendering (breaking change)

### 1.4.4 - May 3, 2016
* normalize partial name for windows

### 1.4.3 - February 11, 2016
* add rename option
* prevent path issue on windows

### 1.3.3 - January 27, 2016
* update consolidate and lodash.omit

### 1.3.2 - October 17, 2015
* update fs-readdir-recursive

### 1.3.1 - August 6, 2015
* pass unrecognised `partials` options to consolidate

### 1.3.0 - August 6, 2015
* add swig include test
* add error handling for unrecognised engines
* code style, dependency and readme updates
* add partials option and test

### 1.2.1 - July 23, 2015
* update swig

### 1.2.0 - July 23, 2015
* update dependencies
* update and add badges

### 1.1.1 - July 20, 2015
* is-utf8 should be a dependency
* add eslint
* add release badge

### 1.1.0 - July 19, 2015
* update tests
* ignore binary files
* add travis ci and david dm badges to readme
* add gitattributes and editorconfig to repo

### 1.0.1 - November 22, 2014
* change name to metalsmith-in-place

### 1.0.0 - November 18, 2014
* render files in-place by default
* remove `default`, `directory` and `inPlace`

### 0.6.0 - October 3, 2014
* fix to use `path` for metalsmith `1.0.0`

### 0.5.2 - July 9, 2014
* fix breaking binary files

### 0.5.1 - June 11, 2014
* fix race condition with stringify file contents

### 0.5.0 - April 29, 2014
* pass in options to consolidate.js

### 0.4.0 - April 2, 2014
* add `default` option

### 0.3.0 - March 10, 2014
* add `inPlace` option
* change `pattern` option to just filter

### 0.2.1 - March 10, 2014
* fix bug in matching pattern logic

### 0.2.0 - March 8, 2014
* add rendering files in place with a `pattern`

### 0.1.0 - March 5, 2014
* add `string` engine convenience

### 0.0.6 - February 7, 2014
* fix `directory` option bug

### 0.0.5 - February 7, 2014
* stringify `contents` on the original file data

### 0.0.4 - February 6, 2014
* switch to `extend` from `defaults` to avoid cloning
* add debug statements

### 0.0.3 - February 6, 2014
* fix to use buffers

### 0.0.2 - February 5, 2014
* mix in metadata

### 0.0.1 - February 4, 2014
:sparkles:
