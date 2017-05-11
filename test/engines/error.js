// Mock engine for testing, always returns an error
class Engine {
  render() {
    return Promise.reject(new Error('Default error from ErrorEngine'));
  }
}

module.exports = Engine;
