import LocalForage from "localforage";
import "localforage-getitems";
import "localforage-setitems";
const INDEXDB_NAME = process.env.INDEXDB_NAME || "CESIUM_INDEXDB";

// Configure localforage
LocalForage.config({
  driver: LocalForage.IndexedDB,
  name: INDEXDB_NAME,
  version: 1.0,
  storeName: `${INDEXDB_NAME}_STORE`,
});

// Our store plugin
const persistPlugin = (store) => {
  store.subscribe((mutations, state) => {
    LocalForage.setItems(state);
  });
};

export { LocalForage, persistPlugin };
