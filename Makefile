eslint=node_modules/.bin/eslint lib/**/*.js test/*.js
mocha=node_modules/.bin/mocha --reporter spec

node_modules: package.json
	@npm install

test: node_modules
	@$(mocha)
	@$(eslint)

.PHONY: test
