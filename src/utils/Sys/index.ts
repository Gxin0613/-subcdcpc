import { Persistent, BasicKeys } from '/@/utils/cache/persistent';
import { CacheTypeEnum } from '/@/enums/cacheEnum';
import projectSetting from '/@/settings/projectSetting';
import {SysNo, CustomerNo } from '/@/enums/cacheEnum';
import { defineAsyncComponent } from 'vue';


const { permissionCacheType } = projectSetting;
const isLocal = permissionCacheType === CacheTypeEnum.LOCAL;
/**
 *  系统及用户编号缓存处理
 *  1.个性化参数或路径的处理都在这个工具类里
 * @returns 
 */

//获取系统编号
export function getSysNo<T>() {
    const fn = isLocal ? Persistent.getLocal : Persistent.getSession;
   return fn(SysNo) as T;
}

//获取客户编号
export function getCustomerNo<T>() {
  const fn = isLocal ? Persistent.getLocal : Persistent.getSession;
  return fn(CustomerNo) as T;
  
}

//设置系统编号
export function setSysNoCache( value) {
  const fn = isLocal ? Persistent.setLocal : Persistent.setSession;
  return fn(SysNo, value, true);


}
//设置客户编号
export function setCustomerNoCache( value) {
  const fn = isLocal ? Persistent.setLocal : Persistent.setSession;
  return fn(CustomerNo, value, true);
}


//其他用户的登录页面都在App/自己文件夹下
export function getComponent () {
   let No= getSysNo()+"";
  /**
   * 预先导入所有组件
   * ccflow之外的用户，如果个性化登录，需要提前设置好自己的登录页面并在下方进行配置
   */
  const componentMap = {
    CCFlow: defineAsyncComponent(() => import('/@/Portal/LoginStyle/Login0.vue')),
    // QMS: defineAsyncComponent(() => import('/@/App/QMS/Portal/Login.vue')),
    // LIMS: defineAsyncComponent(() => import('/@/App/LIMS/Portal/Login.vue')),
  }
 
  return componentMap[No] || componentMap['CCFlow']  
}
