<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { onMounted } from "vue";
import { getCesiumViewer } from "@/utils/index";
import { createWorldTerrain, Viewer } from "@/plugins/cesium/helpers";
import CesiumLocale from "cesium-locale";

export default {
  name: "Home",
  setup() {
    onMounted(() => {
      const viewer = getCesiumViewer(Viewer, "cesiumContainer", {
        terrainProvider: createWorldTerrain(),
      });

      new CesiumLocale(viewer);
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
