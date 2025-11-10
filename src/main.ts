import App from './App.vue';
import { createApp } from 'vue';
// import pinia from '/@/views/hsw/store';
import 'uno.css';
// global icon
import '/@/design/index.less';

// iconfont
import '/@/assets/form/index.less';
import '/@/assets/form/iconfont.css';
import '/@/assets/form/simple-line-icons.css';
import '/@/assets/form/glyphicons.css';
import '/@/assets/form/font-awesome-icons.css';
import('/@/assets/hsw/styles/jeethink.scss');
// ant-design
import 'ant-design-vue/dist/reset.css';
// vant css
import 'vant/lib/index.css';

// Register icon sprite element-plus
import 'virtual:svg-icons-register';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import locale from 'element-plus/es/locale/lang/zh-cn';
import '/@/assets/hsw/styles/index.scss'; // global css
import rightMenu from '/@/views/hsw/components/rightMenu/rightMenu.vue';
import position from '/@/views/hsw/components/Pagination/index.vue';

// import { createApp } from 'vue';
import { getCurrentInstance } from 'vue';
// import { createPinia } from 'pinia'
import { initAppConfigStore } from '/@/logics/initAppConfig';
import { setupErrorHandle } from '/@/logics/error-handle';
import { router, setupRouter } from '/@/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import { setupGlobDirectives } from '/@/directives';
import { setupI18n } from '/@/locales/setupI18n';
import { registerGlobComp } from '/@/components/registerGlobComp';
// import store from '/@/views/hsw/store'
//hsw常用工具
// import { useDict } from '/@/views/hsw/utils/dict.js'
import { parseTime, addDateRange, selectDictLabel, showDictValue, download, handleTree, handleTreeString, formatDate, resetForm } from '/@/views/hsw/utils/jeethink.js';
// import { getDicts } from '/@/api/hsw/cdc/system/dict/data.js';
import modal from '/@/views/hsw/utils/modal.js';

//兼容vue2
import { configureCompat } from '@vue/compat';
// 启用 Vue 2 兼容模式
configureCompat({
  MODE: 2, // 或 'Vue2'
});

// svg图标
import 'virtual:svg-icons-register';
// import SvgIcon from '/@/views/hsw/components/SvgIcon/index.vue'
// import elementIcons from '/@/views/hsw/components/SvgIcon/svgicon'

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
// highlightjs
import hljs from 'highlight.js';
// import { initGloablRTErrHandler } from './err';
import { resetWindowOpen } from './utils/resetWindowOpen';
import { addLegacyCompatibility } from './logics/compatibility';
// import { setupGoView } from './CCFast/GoView/SetupGoView';
// highlight code
VMdPreview.use(githubTheme, {
  Hljs: hljs,
});
async function bootstrap() {
  const app = createApp(App);
  // const pinia = createPinia()
  // app.use(pinia);
  app.use(ElementPlus, {
    locale: locale,
  });
  app.config.globalProperties.showDictValue = showDictValue;
  app.config.globalProperties.parseTime = parseTime;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.download = download;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.handleTreeString = handleTreeString;
  app.config.globalProperties.formatDate = formatDate;
  app.config.globalProperties.resetForm = resetForm;
  // app.config.globalProperties.getDicts = getDicts;
  // app.config.globalProperties.useDict = useDict;
  app.config.globalProperties.$modal = modal;

  // const pinia = createPinia()
  // app.use(pinia);
  // markdown插件引入
  app.use(VMdPreview);
  // app.use(store);
  setupStore(app);
  //svg图标
  // app.use(elementIcons)
  // app.component('svg-icon', SvgIcon)
  // app.mount('#app');
  // 添加代码高亮指令
  // Initialize internal system configuration
  initAppConfigStore();
  getCurrentInstance();
  // Register global components
  registerGlobComp(app);

  // Multilingual configuration
  // Asynchronous case: language files may be obtained from the server side
  await setupI18n(app);
  // Configure routing
  setupRouter(app);
  // router-guard
  setupRouterGuard(router);
  // Register global directive
  setupGlobDirectives(app);
  // Configure global error handling
  setupErrorHandle(app);

  // 为低版本浏览器支持replaceAll
  addLegacyCompatibility();

  await router.isReady();
  resetWindowOpen();
  // parseTime();
  // addDateRange();
  // selectDictLabel();
  // download();
  // handleTree();
  // handleTreeString();
  // formatDate();
  // 处理富文本组件
  // app.config.compilerOptions.isCustomElement = (tag) => ['center'].includes(tag);
  // end
  app.component('RightMenu', rightMenu);
  app.component('Pagination', position);
  app.mount('#app');
}

bootstrap();
