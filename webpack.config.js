const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname + "/src",

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      },
    ],
  },

  entry: [
    'babel-polyfill', './web.js'
  ],

  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, './index.html'), to: path.resolve(__dirname, './docs/index.html') },
      { from: path.resolve(__dirname, './node_modules/base-css-theme/base.css'), to: path.resolve(__dirname, './docs/base.css') }
    ])
  ],

  output: {
    path: path.resolve(__dirname, './docs'),
    publicPath: '/',
    filename: 'dist.js'
  },

  resolve: {
    extensions: ['.js'],
    modules: [
      __dirname,
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, './src')
    ],
  },

  resolveLoader: {
    modules: ['node_modules', '../../'],
  },
};
