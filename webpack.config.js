const path = require('path');

module.exports = (env) => ({
  entry: './jsOutput/index.js',
  target: 'node',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: "birbal-bot",
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".js", ".json"]

  }
});