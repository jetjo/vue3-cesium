import { createStore } from "vuex";
import { LocalForage, persistPlugin } from "@/plugins/localForage";

export const state = {};

export const mutations = {};

export const actions = {};

export const getters = {};

export default async function extendStore() {
  const savedState = await LocalForage.getItems();

  return createStore({
    plugins: [persistPlugin],
    state: {
      ...state,
      ...savedState,
    },
    mutations,
    actions,
    getters,
  });
}
