const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isDev = process.env.NODE_ENV === "development";

/** @type import("webpack").Configuration */
const common = {
  mode: isDev ? "development" : "production",
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  externals: ["fsevents"],
  output: {
    publicPath: "./",
    filename: "[name].js",
    assetModuleFilename: "images/[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.png$/,
        type: "asset/resource",
      },
    ],
  },
  stats: "errors-only",
  devtool: isDev ? "source-map" : false,
};

/** @type import("webpack").Configuration */
const main = {
  ...common,
  target: "electron-main",
  entry: {
    main: "./src/main.ts",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from:
            process.platform === "linux"
              ? "./assets/linux.png"
              : "./assets/icon.png",
          to: "./images/logo.png",
        },
      ],
    }),
  ],
};

/** @type import("webpack").Configuration */
const preload = {
  ...common,
  target: "electron-preload",
  entry: {
    preload: "./src/preload.ts",
  },
};

/** @type import("webpack").Configuration */
const renderer = {
  ...common,
  target: "web",
  entry: {
    app: "./src/web/index.tsx",
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      meta: isDev
        ? ""
        : {
            "Content-Security-Policy": {
              "http-equiv": "Content-Security-Policy",
              content: "default-src 'self'",
            },
          },
      devtools: isDev
        ? '<script src="http://localhost:8097"></script>'
        : undefined,
      template: "./src/web/index.html",
      inject: "body",
    }),
  ],
};

module.exports = [main, preload, renderer];
