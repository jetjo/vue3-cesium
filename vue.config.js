const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const postcss = require("postcss");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const resolve = (dir) => path.resolve(__dirname, dir);

const IS_PROD = ["prod", "production"].includes(process.env.NODE_ENV);

function getLessVaribles(fileUrl, list = {}) {
  if (!fs.existsSync(fileUrl)) return {};
  let lessFile = fs.readFileSync(fileUrl, "utf8");
  return postcss.parse(lessFile).nodes.reduce((acc, curr) => {
    acc[`${curr.name.replace(/\:/, "")}`] = `${curr.params}`;
    return acc;
  }, list);
}

const modifyVars = getLessVaribles(
  path.resolve(__dirname, "./src/assets/less/variables.less")
);

const PROJECT_NAME = process.env.VUE_APP_PROJECT_NAME || "";

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
        // 表示哪些代码需要优化，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为async
        // chunks: 'all',
        // 表示被引用次数，默认为1
        // minChunks: 1,
        // 表示在压缩前的最小模块大小，默认为30000
        minSize: 10000,
        // 一个入口最大的并行请求数，默认为3
        maxInitialRequests: Infinity,
        // 命名连接符
        // automaticNameDelimiter: '-',

        // maxSize: 250000,
        // 按需加载时候最大的并行请求数，默认为5
        // maxAsyncRequests: 5,

        // cacheGroups的属性除上面所有属性外，还有test, priority, reuseExistingChunk
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
      output: {
        filename: IS_PROD ? "[name].bundle.js" : "[name].js",
        libraryExport: "default",
        // 在Cesium中编译多行字符串
        sourcePrefix: "",
      },
      devtool: IS_PROD ? false : "eval",
      plugins,
      module,
      optimization,
    };
  },
  chainWebpack: (config) => {
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");

    config.resolve.symlinks(true);

    config.resolve.alias
      // .set("vue$", "vue/dist/vue.esm.js")
      .set("@", resolve("src"))
      .set("@apis", resolve("src/apis"))
      .set("@assets", resolve("src/assets"))
      .set("@scss", resolve("src/assets/scss"))
      .set("@less", resolve("src/assets/less"))
      .set("@components", resolve("src/components"))
      .set("@middlewares", resolve("src/middlewares"))
      .set("@mixins", resolve("src/mixins"))
      .set("@plugins", resolve("src/plugins"))
      .set("@router", resolve("src/router"))
      .set("@store", resolve("src/store"))
      .set("@config", resolve("src/config"))
      .set("@utils", resolve("src/utils"))
      .set("@leaflets", resolve("src/leaflets"))
      .set("@views", resolve("src/views"))
      .set("@layouts", resolve("src/layouts"));

    config.plugin("html").tap((args) => {
      args[0].chunksSortMode = "none";
      args[0].title = PROJECT_NAME;
      return args;
    });

    config
      .plugin("ignore")
      .use(
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn$/)
      );

    if (IS_PROD) {
      config.plugin("webpack-report").use(BundleAnalyzerPlugin, [
        {
          analyzerMode: "static",
        },
      ]);
    }
  },
  css: {
    extract: IS_PROD,
    // sourceMap: false,
    loaderOptions: {
      less: {
        modifyVars,
        javascriptEnabled: true,
      },
    },
  },
  devServer: {
    hot: true,
    port: 8001,
    open: true,
    compress: true,
    // noInfo: false,
    disableHostCheck: true,
    // overlay: {
    //   warnings: true,
    //   errors: true,
    // },
  },
  lintOnSave: false,
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: !IS_PROD, // 生产环境的 source map
  parallel: require("os").cpus().length > 1,
  pwa: {},
  transpileDependencies: [],
};
