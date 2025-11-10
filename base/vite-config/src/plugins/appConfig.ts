import colors from 'picocolors';
import { readPackageJSON } from 'pkg-types';
import { type PluginOption } from 'vite';

import { getEnvConfig } from '../utils/env';
import { createContentHash } from '../utils/hash';

const GLOBAL_CONFIG_FILE_NAME = '_app.config.js';
const PLUGIN_NAME = 'app-config';

async function createAppConfigPlugin({ root, isBuild }: { root: string; isBuild: boolean }): Promise<PluginOption> {
  let publicPath: string, source: string;
  let config: Record<string, any>;
  const { version = '' } = await readPackageJSON(root);

  return {
    name: PLUGIN_NAME,
    async config() {
      // 1. 加载基础配置
      const baseConfig = await getEnvConfig();
      const versionCode = Date.now().toString();
      // 2. 将版本号和基础配置合并，并存储在插件作用域的 config 变量中
      config = { ...baseConfig, VITE_GLOB_VERSION_CODE: versionCode };
      const variableName = getVariableName(config.VITE_GLOB_APP_TITLE || '');

      // 统一通过 define 注入
      return {
        define: {
          // 1. 定义全局变量，供 index.html 和 build 模式下的 getAppEnvConfig 使用
          [variableName]: JSON.stringify(config),
          // 2. 关键：在 dev 模式下，将变量注入到 import.meta.env
          // 这样 getAppEnvConfig 才能在开发时正确读取
          'import.meta.env.VITE_GLOB_VERSION_CODE': JSON.stringify(config.VITE_GLOB_VERSION_CODE),
        },
      };
    },
    async configResolved(_config) {
      const appTitle = _config?.env?.VITE_GLOB_APP_TITLE ?? '';
      publicPath = _config.base;
      source = getConfigSource(appTitle, config);
    },
    async transformIndexHtml(html) {
      // 开发模式下不需要注入 _app.config.js
      if (!isBuild) return html;
      publicPath = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;

      const appConfigSrc = `${publicPath || '/'}${GLOBAL_CONFIG_FILE_NAME}?v=${version}-${createContentHash(source)}`;

      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              src: appConfigSrc,
            },
          },
        ],
      };
    },
    async generateBundle() {
      if (!isBuild) return;
      try {
        this.emitFile({
          type: 'asset',
          fileName: GLOBAL_CONFIG_FILE_NAME,
          source,
        });

        console.log(colors.cyan(`✨configuration file is build successfully!`));
      } catch (error) {
        console.log(colors.red('configuration file configuration file failed to package:\n' + error));
      }
    },
  };
}

/**
 * Get the configuration file variable name
 * @param env
 */
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

function getConfigSource(appTitle: string, config: Record<string, any>) {
  const variableName = getVariableName(appTitle);
  const windowVariable = `window.${variableName}`;
  // Ensure that the variable will not be modified
  let source = `${windowVariable}=${JSON.stringify(config)};`;
  source += `
    Object.freeze(${windowVariable});
    Object.defineProperty(window, "${variableName}", {
      configurable: false,
      writable: false,
    });
  `.replace(/\s/g, '');
  return source;
}

export { createAppConfigPlugin };
