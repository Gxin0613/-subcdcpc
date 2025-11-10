import { getAppEnvConfig } from '/@/utils/env';
import WebUser from '/@/bp/web/WebUser';

export function useThirdPartUrl() {
  const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();

  const getUrlPrefix = () => {
    if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
      const { origin, pathname } = window.location;
      const prefix = origin + pathname;
      if (prefix.endsWith('/')) {
        return prefix.substring(0, prefix.length - 1);
      }
      return prefix;
    }
    return '';
  };

  const getValidHashUrl = (url: string) => {
    if (url.startsWith('/#/')) {
      url = location.pathname + url.substring(1);
    }
    // if (VITE_GLOB_IS_THIRDPART_SYSTEM && url.startsWith('/#/')) {
    //   url = url.substring(1);
    // }
    if (!url.includes('Token')) {
      url += `${url.includes('?') ? '&' : '?'}Token=${WebUser.Token}`;
    }
    return getUrlPrefix() + url;
  };

  return {
    getUrlPrefix,
    getValidHashUrl,
  };
}
