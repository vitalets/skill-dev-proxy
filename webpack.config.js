const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const outDir = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'none',
  entry: './src/index.js',
  target: 'node',
  output: {
    path: outDir,
    filename: 'index.js',
    library: {
      type: 'commonjs',
    },
  },
  externals: [
    nodeExternals(),
    './targets',
  ],
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/targets.js', to: outDir },
        { from: 'package.json', to: outDir, transform: cleanPackageJson },
      ],
    }),
  ],
};

function cleanPackageJson(content) {
  const { name, version, private, dependencies } = JSON.parse(content.toString());
  return JSON.stringify({ name, version, private, dependencies }, false, 2);
}
