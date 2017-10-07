// Mock engine for testing, always sets the contents of files to 'processed'
class Engine {
  constructor(files) {
    this.files = files
  }

  // eslint-disable-next-line class-methods-use-this
  validate() {
    return true
  }

  render(filename) {
    return new Promise(resolve => {
      this.files[filename].contents = Buffer.from('processed')

      resolve()
    })
  }
}

module.exports = Engine
