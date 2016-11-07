const renderFile = require('./render-file');

class Engine {
  constructor(files, metalsmith, options) {
    this.files = files;
    this.options = options;
    this.metadata = metalsmith.metadata();
    this.source = metalsmith.source();
  }

  render(filename) {
    // Transform file
    const newname = renderFile(this.files, filename, this.metadata, this.source, this.options);

    // If there were transforms store new file and delete the old
    if (newname !== filename) {
      this.files[newname] = this.files[filename];
      delete this.files[filename];
    }
  }
}

module.exports = Engine;
