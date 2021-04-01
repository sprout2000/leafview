import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const isDev = process.env.NODE_ENV === 'development';

const base: Configuration = {
  mode: isDev ? 'development' : 'production',
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
        exclude: /(node_modules|tests|mocks)/,
        use: 'ts-loader',
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
  optimization: {
    minimize: !isDev,
    minimizer: [new TerserWebpackPlugin()],
  },
  stats: 'errors-only',
  performance: { hints: false },
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
    index: './src/index.tsx',
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: !isDev,
      inject: 'body',
      filename: 'index.html',
      scriptLoading: 'blocking',
    }),
  ],
};

export default [main, preload, renderer];
