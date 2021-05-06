# 创建项目
&emsp;&emsp;基于vue-cli搭建vue3.0项目框架。
```bash
npx @vue/cli create vue3-cesium
```

&emsp;&emsp;下载cesium以及其声明文件
```bash
npm i -S cesium
npm i -D @types/cesium
```



# 配置vue.config.js兼容cesium打包
```bash
npm i -D strip-pragma-loader
```
&emsp;&emsp;配置vue.config.js：
```js
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
```
# 创建ViewerContainer组件
```vue
<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { onMounted } from "vue";
import { createWorldTerrain, Viewer } from "@plugins/cesium";

export default {
  name: "Home",
  setup() {
    onMounted(() => {
      const viewer = new Viewer("cesiumContainer", {
        terrainProvider: createWorldTerrain(),
      });

      viewer.cesiumWidget.creditContainer.style.display = "none";
    });
    return {};
  },
};
</script>

<style lang="less">
#cesiumContainer {
  height: 100vh;
}
</style>
```
