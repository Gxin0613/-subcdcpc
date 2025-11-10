import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
import { getAllRequestParams } from '/@/utils/request/decode';
import ExceptionVue from '/@/views/sys/exception/Exception.vue';

const vueComponents = import.meta.glob('/src/**/*.vue');
export default function useComponentLoader() {
  const loadComponent = (url: string) => {
    url = url.replace('@/', 'src/');
    const componentFilePath = url.split('?')[0];
    const componentLoader = vueComponents[componentFilePath];
    if (componentLoader) {
      return createAsyncComponent(componentLoader, {
        loading: true,
      });
    }
    return ExceptionVue;
    // throw new Error('加载组件失败，' + url);
  };

  const getComponentParamsByUrl = (url) => {
    return getAllRequestParams(url);
  };

  return {
    loadComponent,
    getComponentParamsByUrl,
  };
}
