import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const isDev = process.env.NODE_ENV === 'development';

const isLinux = process.platform === 'linux';
const isDarwin = process.platform === 'darwin';

const base: Configuration = {
  mode: isDev ? 'development' : 'production',
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
    filename: '[name].js',
    assetModuleFilename: 'images/[name][ext]',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: 'ts-loader' },
          { loader: 'ifdef-loader', options: { DEBUG: false } },
        ],
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
        type: 'asset/resource',
      },
    ],
  },
  stats: 'errors-only',
  performance: { hints: false },
  optimization: { minimize: !isDev },
  devtool: isDev ? 'inline-source-map' : undefined,
};

const main: Configuration = {
  ...base,
  target: 'electron-main',
  entry: {
    main: './src/main.ts',
  },
};

const preload: Configuration = {
  ...base,
  target: 'electron-preload',
  entry: {
    preload: './src/preload.ts',
  },
};

const renderer: Configuration = {
  ...base,
  target: 'web',
  entry: {
    index: './src/web/index.tsx',
  },
  plugins: isDarwin
    ? [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
          template: './src/web/index.html',
          minify: !isDev,
          inject: 'body',
          filename: 'index.html',
          scriptLoading: 'blocking',
        }),
      ]
    : [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
          template: './src/web/index.html',
          minify: !isDev,
          inject: 'body',
          filename: 'index.html',
          scriptLoading: 'blocking',
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: isLinux ? './assets/linux.png' : './assets/icon.png',
              to: './images/logo.png',
            },
          ],
        }),
      ],
};

export default [main, preload, renderer];
