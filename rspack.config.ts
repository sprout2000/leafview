import path from "node:path";
import type { Configuration } from "@rspack/cli";
import {
  CopyRspackPlugin,
  CssExtractRspackPlugin,
  HtmlRspackPlugin,
} from "@rspack/core";

const isDev = process.env.NODE_ENV === "development";

const common: Configuration = {
  mode: isDev ? "development" : "production",
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  externals: ["fsevents"],
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "./",
    filename: "[name].js",
    assetModuleFilename: "images/[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
            },
            transform: {
              react: {
                runtime: "automatic",
              },
            },
          },
        },
      },
      {
        test: /\.s?css$/,
        use: [CssExtractRspackPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
        type: "asset/resource",
      },
    ],
  },
  watch: isDev,
  stats: "summary",
  devtool: isDev ? "source-map" : false,
};

const main: Configuration = {
  ...common,
  target: "electron-main",
  entry: {
    main: "./src/main.ts",
  },
  plugins: [
    new CopyRspackPlugin({
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

const preload: Configuration = {
  ...common,
  target: "electron-preload",
  entry: {
    preload: "./src/preload.ts",
  },
};

const renderer: Configuration = {
  ...common,
  target: "web",
  entry: {
    index: "./src/web/index.tsx",
  },
  plugins: [
    new CssExtractRspackPlugin(),
    new HtmlRspackPlugin({
      inject: "body",
      template: isDev ? "./src/web/index.dev.html" : "./src/web/index.html",
    }),
  ],
};

export default [main, preload, renderer];
