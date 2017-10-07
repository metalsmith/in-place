// Mock engine for testing, always returns an error
class Engine {
  // eslint-disable-next-line class-methods-use-this
  validate() {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return Promise.reject(new Error('Default error from ErrorEngine'))
  }
}

module.exports = Engine
