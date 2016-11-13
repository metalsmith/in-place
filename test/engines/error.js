// Mock engine for testing, always returns an error
class Engine {
  render() {
    return Promise.reject(new Error('Message'));
  }
}

module.exports = Engine;
