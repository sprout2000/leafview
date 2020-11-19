const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';

/** @type import('webpack').Configuration */
const base = {
  mode: isDev ? 'development' : 'production',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
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
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]',
        },
      },
    ],
  },
  optimization: {
    minimizer: [new TerserWebpackPlugin()],
  },
  devtool: isDev ? 'inline-source-map' : false,
};

/** @type import('webpack').Configuration */
const main = {
  ...base,
  target: 'electron-main',
  entry: {
    main: './src/main.ts',
  },
};

/** @type import('webpack').Configuration */
const preload = {
  ...base,
  target: 'electron-preload',
  entry: {
    preload: './src/preload.ts',
  },
};

/** @type import('webpack').Configuration */
const renderer = {
  ...base,
  target: 'web',
  entry: {
    renderer: './src/index.tsx',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: isDev ? 'src/index.dev.html' : './src/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin(),
  ],
  performance: {
    hints: false,
  },
};

module.exports = [main, preload, renderer];
