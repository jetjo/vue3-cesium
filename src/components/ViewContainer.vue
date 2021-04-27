<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { onMounted } from "vue";
import { createWorldTerrain, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

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
