import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const isLinux = process.platform === 'linux';
const isDarwin = process.platform === 'darwin';

const config: Configuration = {
  mode: 'development',
  target: 'web',
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  entry: {
    app: './src/web/index.tsx',
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
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
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
  plugins: isDarwin
    ? [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
          template: './src/web/index.html',
          filename: 'index.html',
          scriptLoading: 'blocking',
          inject: 'body',
          minify: false,
        }),
      ]
    : [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
          template: './src/web/index.html',
          filename: 'index.html',
          scriptLoading: 'blocking',
          inject: 'body',
          minify: false,
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
  stats: 'errors-only',
  devtool: 'source-map',
  performance: { hints: false },
  optimization: { minimize: false },
};

export default config;
