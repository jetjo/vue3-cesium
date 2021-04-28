export const getCesiumViewer = (Viewer, element, options) => {
  const viewer = new Viewer(element, options);
  viewer.cesiumWidget.creditContainer.style.display = "none";
  return viewer;
};

export const setCesiumIon = (Ion, token) => {
  Ion.defaultAccessToken = token;
};
