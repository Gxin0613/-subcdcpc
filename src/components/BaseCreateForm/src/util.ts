import { getAppEnvConfig } from '/@/utils/env';

export const isHttpLink = (url: string) => {
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  return url.startsWith(VITE_GLOB_API_URL) || url.startsWith(`http://`) || url.startsWith('https://') || url.startsWith('/#/');
};
