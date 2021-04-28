import { createRouter, createWebHistory } from "vue-router";
import createRouterGuards from "./router-guards";

import { loadView } from "@/utils/index";

const routes = [
  {
    path: "/",
    name: "Home",
    component: loadView("Home"),
  },
  {
    path: "/404",
    name: "404",
    component: loadView("error/404"),
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

createRouterGuards(router);

export default router;
