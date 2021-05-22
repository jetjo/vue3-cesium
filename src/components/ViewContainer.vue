<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { onMounted } from "vue";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Viewer } from "cesium";

export default {
  name: "Home",
  setup() {
    onMounted(() => {
      new Viewer("cesiumContainer");
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
