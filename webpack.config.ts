import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

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
  plugins: [
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
        { from: './assets/icon.png', to: '.' },
        { from: './assets/title_icon.png', to: '.' },
      ],
    }),
  ],
  stats: 'errors-only',
  performance: { hints: false },
  optimization: { minimize: false },
  devtool: 'source-map',
};

export default config;
