import type { GlobEnvConfig } from '/#/config';

import pkg from '../../package.json';
import { API_ADDRESS } from '/@/enums/cacheEnum';

export function getCommonStoragePrefix() {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppEnvConfig();
  return `${VITE_GLOB_APP_SHORT_NAME}__${getEnv()}`.toUpperCase();
}

/***
 * 获取当前浏览器名称
 */
export const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  let browserName: string;

  // 判断用户代理字符串中是否包含特定的标识符来识别浏览器
  if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browserName = 'IE';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
  } else {
    browserName = 'Unknown';
  }
  return browserName;
};

// Generate cache key according to version
export function getStorageShortName() {
  return `${getCommonStoragePrefix()}${`__${pkg.version}`}__`.toUpperCase();
}

const getVariableName = (title: string) => {
  function strToHex(str: string) {
    const result: string[] = [];
    for (let i = 0; i < str.length; ++i) {
      const hex = str.charCodeAt(i).toString(16);
      result.push(('000' + hex).slice(-4));
    }
    return result.join('').toUpperCase();
  }
  return `__PRODUCTION__${strToHex(title) || '__APP'}__CONF__`.toUpperCase().replace(/\s/g, '');
};

export function getAppEnvConfig() {
  const ENV_NAME = getVariableName(import.meta.env.VITE_GLOB_APP_TITLE);
  // const ENV_NAME = getConfigFileName(import.meta.env);

  const ENV = (import.meta.env.DEV
    ? // Get the global configuration (the configuration will be extracted independently when packaging)
      (import.meta.env as unknown as GlobEnvConfig)
    : window[ENV_NAME as any]) as unknown as GlobEnvConfig;
  let { VITE_GLOB_API_URL } = ENV;
  if (localStorage.getItem(API_ADDRESS)) {
    const address = JSON.parse(localStorage.getItem(API_ADDRESS) || '{}');
    if (address?.key) VITE_GLOB_API_URL = address?.val;
  }
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_CCFLOW_UPLOAD_URL,
    VITE_GLOB_JFLOW_UPLOAD_URL,
    VITE_GLOB_JFLOW_HANDLER,
    VITE_GLOB_CCFLOW_HANDLER,
    VITE_GLOB_PLATFORM,
    VITE_SDKFROESERV_HOST,
    VITE_GLOB_IS_THIRDPART_SYSTEM,
    VITE_GLOB_DINGTALK,
    VITE_GLOB_KKFILE_PreviewPathOfAth,
    VITE_GLOB_KKFILE_MINIOHOST,
    VITE_GLOB_GOVIEW_URL,
    VITE_GLOB_ENCRYPTION_KEY,
    VITE_GLOB_OSModel,
    VITE_GLOB_SaaSModel,
    VITE_GLOB_MOBILE_SHOW_LOGOUT,
    VITE_GLOB_PRELOAD_URL,
    VITE_PUBLIC_PATH,
    VITE_GLOB_PREVIEW_URL,
    VITE_GLOB_WS_URL,
    VITE_GLOB_SX_TITLE,
    VITE_GLOB_HIDDEN_SYSTEM_WHEN_SINGLE_ITEM,
    VITE_GLOB_HIDE_HELP_DOCS,
    VITE_GLOB_PassWordComposeType,
    VITE_GLOB_VERSION_CODE,
  } = ENV;

  return {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_WS_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_CCFLOW_UPLOAD_URL,
    VITE_GLOB_JFLOW_UPLOAD_URL,
    VITE_GLOB_JFLOW_HANDLER,
    VITE_GLOB_CCFLOW_HANDLER,
    VITE_GLOB_PLATFORM,
    VITE_SDKFROESERV_HOST,
    VITE_GLOB_IS_THIRDPART_SYSTEM: VITE_GLOB_IS_THIRDPART_SYSTEM === '1',
    VITE_GLOB_DINGTALK,
    VITE_GLOB_KKFILE_PreviewPathOfAth,
    VITE_GLOB_KKFILE_MINIOHOST,
    VITE_GLOB_GOVIEW_URL,
    VITE_GLOB_ENCRYPTION_KEY,
    VITE_GLOB_OSModel,
    VITE_GLOB_SaaSModel,
    VITE_GLOB_MOBILE_SHOW_LOGOUT,
    VITE_GLOB_PRELOAD_URL,
    VITE_PUBLIC_PATH,
    VITE_GLOB_PREVIEW_URL,
    VITE_GLOB_SX_TITLE,
    VITE_GLOB_HIDE_HELP_DOCS: VITE_GLOB_HIDE_HELP_DOCS === '1',
    VITE_GLOB_HIDDEN_SYSTEM_WHEN_SINGLE_ITEM,
    VITE_GLOB_PassWordComposeType,
    VITE_GLOB_VERSION_CODE,
  };
}

/**
 * @description: Development mode
 */
export const devMode = 'development';

/**
 * @description: Production mode
 */
export const prodMode = 'production';

/**
 * @description: Get environment variables
 * @returns:
 * @example:
 */
export function getEnv(): string {
  return import.meta.env.MODE;
}

/**
 * @description: Is it a development mode
 * @returns:
 * @example:
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}

/**
 * @description: Is it a production mode
 * @returns:
 * @example:
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD;
}
