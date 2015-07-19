eslint=node_modules/.bin/eslint
mocha=node_modules/.bin/mocha --reporter spec

node_modules: package.json
	@npm install

test: node_modules
	@$(mocha)
	@$(eslint) lib/index.js test/*.js

test-debug: node_modules
	@$(mocha) debug

.PHONY: test
.PHONY: test-debug
