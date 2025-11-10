import axios from 'axios';
import { decodeResponseParams } from '/@/utils/request/decode';
import { useUserStore } from '/@/store/modules/user';
import { getAppEnvConfig } from '/@/utils/env';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash';
import { ClassFactory } from '/@/bp/da/ClassFactory';
const { VITE_GLOB_API_URL, VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
const service = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL,
  withCredentials: false,
  maxContentLength: Infinity, // 无限大，防止默认限制
  maxBodyLength: Infinity, // 无限大，防止默认限制
});
// 请求拦截
service.interceptors.request.use(
  (config) => {
    const user = useUserStore();
    let url = config.url;
    if (config.params) {
      if (!config.params.Token && config.params.DoMethod != 'Port_Init') {
        if (!!user.getToken) config.params.Token = user.getToken;
      }

      if (config.params.DoMethod == 'RegisterAdminer_Submit') config.params.Token = '';
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
    }
    config.url = url;
    if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
      config.headers = {
        // 'Content-Type': 'multipart/form-data',
        //ruoyi使用
        Authorization: 'Bearer ' + user.getSToken,
        //jeecg 使用
        'X-Access-Token': user.getSToken,
        //jeesite 使用
        'X-Token': user.getSToken,
        //snowy 使用
        token: user.getSToken,
      };
      // config.params.Token = getCookie('Token');
    }
    return config;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  },
);

const handleTokenExpired = debounce((user) => {
  message.error('登录过期，请重新登录');
  // 判断是不是顶层的window
  // 如果不是顶层window，退出时通过postMessage通知外层的应用token过期
  // postMessage()
  if (window !== window.top) {
    window.parent.postMessage({ type: 'logout', msg: true }, '*');
  }
  user.logout(true);
}, 200);

// const clsNameExp = /\[(.*?)\]/g;

// const resetMap = async (clsName) => {
//   try {
//     const entity = await ClassFactory.GetEn(clsName);
//     if (entity) {
//       await entity.UpdateMapCache();
//     }
//   } catch (e: any) {}
// };

service.interceptors.response.use(
  (response) => {
    const { data } = response;
    const user = useUserStore();
    if (!!data && typeof data === 'string') {
      if (data.startsWith('err@')) {
        //const errMsg = data.replace('err@', '');
        if (
          data.includes('err@登录信息丢失') ||
          data.includes('token 过期或失效') ||
          data.includes('err@token失效')
        ) {
          handleTokenExpired(user);
          return Promise.reject('登录过期，请重新登录');
        }
        // if (data.includes('没有找到') && data.includes('的map')) {
        // const reqConfig = response.config as any;
        // const result = data.match(clsNameExp);
        // let clsName = '';
        // if (Array.isArray(result) && result.length > 0) {
        //   clsName = result[0].slice(1, -1);
        // }
        // if (clsName.includes('.') && !reqConfig._already_retry) {
        //   resetMap(clsName).then(() => {
        //     reqConfig._already_retry = true;
        //     axios(reqConfig);
        //   });
        // }
        // return;
        // }
        const errMsg = data.replace('err@', '').toString().toLowerCase();
        if (errMsg.includes('unknown database')) {
          message.info('未检测到您的数据库或您的数据库名称错误，请您 “检查” 是否正确配置数据库名称或 “创建” 数据库后刷新页面.');
          return Promise.reject('未检测到您的数据库或您的数据库名称错误，请您 “检查” 是否正确配置数据库名称或 “创建” 数据库后刷新页面.');
        }
        if (errMsg.includes('unknown column')) {
          //  message.error('未检测到您的数据库缺少字段，正在为您修复数据库，请刷新页面.'+errMsg);
          message.info('ERR:' + errMsg + ' @系统有自动修复功能,请刷新后尝试.');
          return Promise.reject('ERR:' + errMsg + ' @系统有自动修复功能,请刷新后尝试.');
        }
        if (errMsg.includes('frm_dbrole') && errMsg.includes('exist')) {
          message.info('ERR:' + errMsg + ' @系统有自动修复功能,请刷新后尝试.');
          return Promise.reject('ERR:' + errMsg + ' @系统有自动修复功能,请刷新后尝试.');
        }
        //执行SQL错误,必须弹窗.
        if (errMsg.includes('update') || errMsg.includes('select') || errMsg.includes('insert') || errMsg.includes('delete') || errMsg.includes('where')) {
          return Promise.reject(errMsg);
        }
        return Promise.reject(data.replace('err@', ''));
      }
      if (data.startsWith('url@')) {
        return decodeResponseParams(data);
        // window.location.href = data.replace('url@', '');
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
    return Promise.reject(error);
  },
);

export default service;
