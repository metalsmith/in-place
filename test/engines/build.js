// Mock engine for testing, always sets the contents of files to 'processed'
class Engine {
  constructor(files) {
    this.files = files
  }

  render(filename) {
    return new Promise(resolve => {
      this.files[filename].contents = new Buffer('processed')

      resolve()
    })
  }
}

module.exports = Engine
