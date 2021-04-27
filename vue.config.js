const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const resolve = (dir) => path.resolve(__dirname, dir);

const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
const cesiumThirdParty = "../Build/Cesium/ThirdParty";
const cesiumAssets = "../Build/Cesium/Assets";
const cesiumWidgets = "../Build/Cesium/Widgets";

const cesiumResolve = (dir) => path.resolve(cesiumSource, dir);

module.exports = {
  configureWebpack: () => {
    const plugins = [
      new CopyWebpackPlugin([
        { from: cesiumResolve(cesiumWorkers), to: "cesium/Workers" },
      ]),
      new CopyWebpackPlugin([
        { from: cesiumResolve(cesiumThirdParty), to: "cesium/ThirdParty" },
      ]),
      new CopyWebpackPlugin([
        { from: cesiumResolve(cesiumAssets), to: "cesium/Assets" },
      ]),
      new CopyWebpackPlugin([
        { from: cesiumResolve(cesiumWidgets), to: "cesium/Widgets" },
      ]),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify("./cesium"),
      }),
    ];

    const module = {
      unknownContextCritical: false,
      // unknownContextRegExp: /^.\/.*$/,
      unknownContextRegExp: /\/cesium\/Source\/Core\/buildModuleUrl\.js/,
      rules: [
        {
          // test: /\.(png|gif|jpg|jpeg|svg|xml|json|czml|glb)$/,
          test: /\.(czml|glb)$/,
          use: ["url-loader"],
        },
        {
          // Strip cesium pragmas
          test: /\.js$/,
          enforce: "pre",
          include: resolve(cesiumSource),
          sideEffects: false,
          use: [
            {
              loader: "strip-pragma-loader",
              options: {
                pragmas: {
                  debug: false,
                },
              },
            },
          ],
        },
      ],
    };

    const optimization = {
      splitChunks: {
        minSize: 10000,
        maxInitialRequests: Infinity,
        cacheGroups: {
          vendor: {
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `${packageName.replace("@", "")}`;
            },
            test: /[\\/]node_modules[\\/]/,
            priority: -20,
            chunks: "all",
          },
          cesium: {
            name: "cesium",
            test: /[\\/]node_modules[\\/]cesium/,
            priority: 30,
            chunks: "all",
          },
        },
      },
    };

    return {
      plugins,
      module,
      optimization,
    };
  },
};
