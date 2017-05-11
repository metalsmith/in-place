// Mock engine for testing, always renders the passed options into each file it processes.
class Engine {
  constructor(files, metalsmith, options) {
    this.files = files
    this.options = options
  }

  render(filename) {
    return new Promise(resolve => {
      this.files[filename].contents = new Buffer(JSON.stringify(this.options))

      resolve()
    })
  }
}

module.exports = Engine
