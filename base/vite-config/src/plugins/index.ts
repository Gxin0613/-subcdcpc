import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { type PluginOption } from 'vite';
import purgeIcons from 'vite-plugin-purge-icons';

import { createAppConfigPlugin } from './appConfig';
import { configCompressPlugin } from './compress';
import { configHtmlPlugin } from './html';
import { createUnifiedMetadataPlugin } from './metadataGenerator';
// import { configMockPlugin } from './mock';
import { configSvgIconsPlugin } from './svgSprite';
import { configVisualizerConfig } from './visualizer';

interface Options {
  isBuild: boolean;
  root: string;
  compress: string;
  enableMock?: boolean;
  enableAnalyze?: boolean;
}

async function createPlugins({ isBuild, root, compress, enableAnalyze }: Options) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [vue(), vueJsx()];

  const appConfigPlugin = await createAppConfigPlugin({ root, isBuild });
  vitePlugins.push(appConfigPlugin);

  // vite-plugin-html
  // 如果需要使用二级目录，并且需要开发的时候访问静态资源，需要注释下面这个插件引入
  // 并且去掉index.html变量
  vitePlugins.push(configHtmlPlugin({ isBuild }));

  // vite-plugin-svg-icons
  vitePlugins.push(configSvgIconsPlugin({ isBuild }));

  // vite-plugin-purge-icons
  vitePlugins.push(purgeIcons());

  // 统一生成所有类型的元数据（Entity、GL、GPN）
  vitePlugins.push(
    createUnifiedMetadataPlugin({
      pattern: 'src/**/*.ts',
      entityOutput: {
        outputFile: 'public/entity-metadata.json',
        virtualModuleId: 'virtual:entity-metadata',
      },
      glOutput: {
        outputFile: 'public/gl-metadata.json',
        virtualModuleId: 'virtual:gl-metadata',
      },
      gpnOutput: {
        outputFile: 'public/gpn-metadata.json',
        virtualModuleId: 'virtual:gpn-metadata',
      },
      debug: !isBuild,
    }),
  );

  // The following plugins only work in the production environment
  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(
      configCompressPlugin({
        compress,
      }),
    );
  }

  // rollup-plugin-visualizer
  if (enableAnalyze) {
    vitePlugins.push(configVisualizerConfig());
  }

  return vitePlugins;
}

export { createPlugins };
