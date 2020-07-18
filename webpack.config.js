const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

/** @type import('webpack').Configuration */
const main = {
  mode: isDev ? 'development' : 'production',
  target: 'electron-main',
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    minimizer: [new TerserWebpackPlugin()],
  },
  devtool: isDev ? 'inline-source-map' : false,
};

/** @type import('webpack').Configuration */
const preload = {
  mode: isDev ? 'development' : 'production',
  target: 'electron-preload',
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  entry: './src/preload.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'preload.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    minimizer: [new TerserWebpackPlugin()],
  },
  devtool: isDev ? 'inline-source-map' : false,
};

/** @type import('webpack').Configuration */
const renderer = {
  mode: isDev ? 'development' : 'production',
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  entry: {
    renderer: './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  performance: {
    hints: false,
  },
  optimization: {
    minimizer: [new TerserWebpackPlugin()],
  },
  devtool: isDev ? 'inline-source-map' : false,
};

module.exports = [main, preload, renderer];
