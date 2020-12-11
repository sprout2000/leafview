import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

const base: Configuration = {
  mode: isProd ? 'production' : 'development',
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
        use: 'ts-loader',
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: !isProd,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProd,
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
    minimizer: [new TerserWebpackPlugin(), new CssMinimizerWebpackPlugin()],
  },
  stats: 'none',
  devtool: isProd ? false : 'inline-source-map',
};

const main: Configuration = {
  ...base,
  target: 'electron-main',
  entry: {
    main: path.join(__dirname, 'src', 'main.ts'),
  },
};

const preload: Configuration = {
  ...base,
  target: 'electron-preload',
  entry: {
    preload: path.join(__dirname, 'src', 'preload.ts'),
  },
};

const renderer: Configuration = {
  ...base,
  target: 'web',
  entry: {
    renderer: path.join(__dirname, 'src', 'index.tsx'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(
        __dirname,
        'src',
        isDev ? 'index.dev.html' : 'index.html'
      ),
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'blocking',
      minify: true,
    }),
    new MiniCssExtractPlugin(),
  ],
};

export default [main, preload, renderer];
