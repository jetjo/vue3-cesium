export const nextFactory = (ctx, middleware, index) => {
  const subsequentMiddleware = middleware[index];
  if (!subsequentMiddleware) return ctx.next;
  return (...params) => {
    ctx.next(...params);
    const nextMiddleware = nextFactory(ctx, middleware, index + 1);
    subsequentMiddleware({ ...ctx, next: nextMiddleware });
  };
};

export const nextHandler = (to, from, next, router) => {
  let middleware = to.meta.middlewares;
  if (!middleware) return next();
  middleware = Array.isArray(middleware) ? middleware : [middleware];
  const ctx = { to, from, next, router };
  const nextMiddleware = nextFactory(ctx, middleware, 1);
  return middleware[0]({ ...ctx, next: nextMiddleware });
};

export const loadView = (view) => {
  return () => import(/* webpackChunkName: "[request]" */ `@views/${view}.vue`)
}