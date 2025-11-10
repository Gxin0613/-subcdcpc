import { getAppEnvConfig } from '/@/utils/env';

export function getVstoHost() {
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  let realHost = VITE_GLOB_API_URL;
  if (/^\/.*\/$/.test(realHost)) {
    realHost = window.location.origin + realHost;
  }
  return realHost;
}
