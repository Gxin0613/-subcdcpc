import axios from 'axios';
import Event from '../../../../utils/Events';
import { useDesignerStore } from '/@/store/modules/form';
import { getAppEnvConfig } from '/@/utils/env';
import { useUserStore } from '/@/store/modules/user';
const store = useDesignerStore();
const { VITE_GLOB_API_URL, VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();

const service = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL,
  withCredentials: false,
});

// 请求拦截
service.interceptors.request.use(
  (config) => {
    const user = useUserStore();
    let url = config.url;
    if (config.params) {
      if (!config.params.Token) config.params.Token = user.getToken;
      url += '?';
      const keys = Object.keys(config.params);
      for (const key of keys) {
        try {
          url += `${key}=${decodeURIComponent(config.params[key])}&`;
        } catch (e) {
          throw new Error('不受支持的字符');
        }
      }
      url = url?.substring(0, url?.length - 1);
      config.params = {};
    } else {
      config.params ={};
      config.params.Token = user.getToken;
    }
    config.url = url;
    if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
      config.headers = {
        // ruoyi 集成
        Authorization: 'Bearer ' + user.getSToken,
        // jeecg 集成
        'X-Access-Token': user.getSToken,
        //jeesite 使用
        'X-Token': user.getSToken,
        //snowy 使用
        token: user.getSToken,
      };
    }

    //java请求失效，暂时注掉
    return config;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (!!data && typeof data === 'string') {
      if (data.startsWith('err@')) {
        store.globalLoading = false;
        const errMsg = data.replace('err@', '');
        Event.emit('showErr', errMsg);
        if (data.indexOf('登录信息丢失') != -1) {
          Event.emit('showErr', '当前登录已经失效，请重新登录');
          // setTimeout(() => {
          //   // @ts-ignore
          //   window?.top?.vm?.logoutExt();
          // });
        }
        return Promise.reject(errMsg);
      }
      if (data.startsWith('url@')) {
        const url = window.location.origin + '/#/WF/Designer/Form?' + data.split('?')[1];
        window.location.assign(url);
        return Promise.resolve();
        // return decodeResponseParams(data);
        // window.location.reload();
        // return Promise.resolve();
      }

      try {
        return JSON.parse(data);
      } catch (_) {
        return data;
      }
    }
    return data;
  },
  (error) => {
    store.globalLoading = false;
    Event.emit('showErr', error.toString());
    return Promise.reject(error);
  },
);

export default service;
