import { Persistent, BasicKeys } from '/@/utils/cache/persistent';
import { CacheTypeEnum } from '/@/enums/cacheEnum';
import projectSetting from '/@/settings/projectSetting';
import { CustomerNo } from '/@/enums/cacheEnum';


const { permissionCacheType } = projectSetting;
const isLocal = permissionCacheType === CacheTypeEnum.LOCAL;
/**
 *  用户编号缓存处理
 *  1.用户个性化参数或路径的处理都在这个工具类里
 * @returns 
 */


export function getCustomerNo() {
  return getNoCache(CustomerNo);
}

//其他用户的登录页面都在App/自己文件夹下
export function getLoginPath(LoginStyle) {
  const No= getNoCache(CustomerNo);
  let rpath="/@/Portal/LoginStyle";
  if(No !="ccflow"){
    rpath="/@/App/"+No+"/Portal/LoginStyle"
  }
   if(LoginStyle==1){
          return `${rpath}/Login1.vue`
   }else if(LoginStyle==2){
         return `${rpath}/Login2.vue`
   }else{
        return `${rpath}/Login0.vue`
   }
}





 function getNoCache<T>(key: BasicKeys) {
  const fn = isLocal ? Persistent.getLocal : Persistent.getSession;
  return fn(key) as T;
}

export function setCustomerNoCache( value) {
  const fn = isLocal ? Persistent.setLocal : Persistent.setSession;
  return fn(CustomerNo, value, true);
}

export function clearCustomerNoCache(immediate = true) {
  const fn = isLocal ? Persistent.clearLocal : Persistent.clearSession;
  return fn(immediate);
}
