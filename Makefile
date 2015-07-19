
mocha=node_modules/.bin/mocha --reporter spec

node_modules: package.json
	@npm install

test: node_modules
	@$(mocha)

test-debug: node_modules
	@$(mocha) debug

.PHONY: test
.PHONY: test-debug
