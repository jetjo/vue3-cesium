import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import extendStore from "./store";

import "@/assets/less/base.less";

const app = createApp(App);
app.use(extendStore());
app.use(router);
app.mount("#app");
