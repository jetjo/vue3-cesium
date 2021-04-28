export default function createRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    next();
  });

  router.afterEach(() => {});
}
