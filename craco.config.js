const CracoAlias = require("craco-alias");
const webpack = require("webpack");
const cracoWasm = require("craco-wasm");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          util: require.resolve("util"),
          stream: require.resolve("stream-browserify"),
          crypto: require.resolve("crypto-browserify"),
          process: require.resolve("process/browser"),
          zlib: require.resolve("browserify-zlib"),
          buffer: require.resolve("buffer"),
          asset: require.resolve("assert"),
          path: require.resolve("path-browserify"),
          fs: require.resolve("browserify-fs"),
        },
      },
      plugins: [
        new webpack.DefinePlugin({
          process: { env: {} },
        }),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      ],
    },
  },
  style: {
    postOptions: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        // baseUrl SHOULD be specified
        // plugin does not take it from tsconfig
        baseUrl: "./src",
        // tsConfigPath should point to the file where "baseUrl" and "paths" are specified
        tsConfigPath: "./tsconfig.extend.json",
      },
    },
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          webpackConfig.experiments = {
            asyncWebAssembly: true,
            topLevelAwait: true,
          };

          // The last rule in the react-scripts webpack.config.js is a
          // file-loader which loads any asset not caught by previous rules. We
          // need to exclude `.wasm` files so that they are instead loaded by
          // webpacks internal webassembly loader (which I believe is enabled by
          // the experiment setting above).
          //
          // See https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-scripts/config/webpack.config.js#L587
          webpackConfig.module.rules
            .at(-1)
            .oneOf.at(-1)
            .exclude.push(/\.wasm$/);
          return webpackConfig;
        },
      },
    },
  ],
};
