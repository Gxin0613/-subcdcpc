const baseIframeAddress = import.meta.env.MODE === 'development' ? 'http://localhost:2296/' : '';
export const getIframeAddress = (url: string) => {
  if (import.meta.env.MODE !== 'development') {
    return url;
  }
  const routeLayer = ['WF', 'Admin', 'FoolFormDesigner'];
  let count = 3;
  while (url.startsWith('../')) {
    url = url.replace('../', '');
    count--;
  }
  url = url.replace('./', '');
  url = '/' + url;
  const layer = routeLayer.slice(0, count);
  const path = layer.length > 0 ? layer.join('/') : '';
  return baseIframeAddress + path + url;
};
