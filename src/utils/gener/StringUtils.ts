import WebUser from '/@/bp/web/WebUser';
import { message } from 'ant-design-vue';
import * as dd from 'dingtalk-jsapi';
import { AtPara } from '/@/bp/da/AtPara';
import { isMobile } from '../envChecker';

/**
 * 去除空格\b\s等
 * @param str
 * @constructor
 */
export function Trim(str: string) {
  return str.replace(/[\n\b\t\s+]/g, '');
}

/**
 * 表达式短语的替换
 * @param expStr 表达式
 * @param mainData 替换的JSON格式
 * @constructor
 */

export function DealExp(expStr: string, mainData: Record<string, any> | null = {}, showMessage = true, isEncode = false) {
  expStr = expStr.replace(/~/g, "'");
  if (typeof expStr !== 'string') return '';
  if (expStr.includes('@') == false) return expStr;
  //替换表达式常用的用户信息
  let userNo = WebUser.No as string;
  if (expStr.includes('@WebUser.No') && userNo.includes('@')) {
    userNo = userNo.replace('@', '%40');
  }
  expStr = expStr.replace(/@WebUser.No/g, userNo);
  expStr = expStr.replace(/@WebUser.Name/g, <string>WebUser.Name);
  //expStr = expStr.replace("@WebUser.DeptNoNameOfFull", WebUser.DeptNoNameOfFull);
  expStr = expStr.replace(/@WebUser.DeptName/g, <string>WebUser.DeptName);
  expStr = expStr.replace(/@WebUser.DeptNo/g, <string>WebUser.DeptNo);
  expStr = expStr.replace(/@WebUser.OrgNo/g, <string>WebUser.OrgNo);
  expStr = expStr.replace(/@WebUser.OrgName/g, <string>WebUser.OrgName);
  expStr = expStr.replace(/@WebUser.Token/g, <string>WebUser.Token);
  if (expStr.includes('@') == false) {
    expStr = expStr.replace(/%40/g, '@');
    return expStr;
  }
  if (mainData == null) {
    if (expStr.includes('@') == true && showMessage) {
      message.error(expStr + '含有@未被替换');
      expStr = expStr.replace(/%40/g, '@');
      return expStr;
    }
    return expStr;
  }

  for (const key in mainData) {
    if(mainData.hasOwnProperty(key+'T')){
       if (isEncode) expStr = expStr.replace(new RegExp('@' + key+'T', 'g'), encodeURIComponent(mainData[key+'T']));
       else expStr = expStr.replace(new RegExp('@' + key+'T', 'g'), mainData[key+'T']);
    }
    if (isEncode) expStr = expStr.replace(new RegExp('@' + key, 'g'), encodeURIComponent(mainData[key]));
    else expStr = expStr.replace(new RegExp('@' + key, 'g'), mainData[key]);

    if (expStr.includes('@') == false) {
      expStr = expStr.replace(/%40/g, '@');
      return expStr;
    }
  }
  if (expStr.includes('@') == true && showMessage) {
    //message.error(expStr + '含有@未被替换');
    expStr = expStr.replace(/%40/g, '@');
    return expStr;
  }
  expStr = expStr.replace(/%40/g, '@');
  return expStr;
}

/**
 * 获取数据形式为@Name=张三@Age=24@XingBie=男，根据key值获取对应的数据
 * @param atPara
 * @param key
 * @constructor
 */
export function GetPara(atPara: string | null | undefined | AtPara, key: string) {
  if (atPara instanceof AtPara) {
    return atPara.GetValStrByKey(key);
  }
  if (atPara === null || atPara === undefined) return '';
  const reg = new RegExp('(^|@)' + key + '=([^@]*)(@|$)');
  const results = atPara.match(reg);
  if (results != null) {
    return unescape(results[2]);
  }
  return '';
}

/**
 * JSON转params的url字符串
 * @param data
 * @constructor
 */
export function GetParamsUrl(data) {
  const params = JSON.parse(JSON.stringify(data));
  const keys = Object.keys(params);
  const pArr: Array<string> = [];
  for (const key of keys) {
    let val = params[key];
    if (val === null || val === undefined) val = '';
    if (val.toString().includes('<script')) {
      val = '';
    }
    pArr.push(`${key}=${val}`);
  }
  return pArr.join('&');
}

/**
 * 把URL转成JSON格式
 * @param data
 * @constructor
 */
export function GetUrlToJSON(data) {
  const obj: { [propName: string]: any } = {};
  const args = data.split('?');
  if (args.length < 2 || !args[1].trim()) {
    return {};
  }
  args[1].split('&').forEach((arg: string) => {
    const [key, val] = arg.split('=');
    obj[key] = val;
  });
  return obj;
}

export function dealClassId(classID: string, targetFilePrefix: string) {
  if (classID.startsWith('/src') && classID.endsWith('.ts')) {
    const startPosition = classID.lastIndexOf(targetFilePrefix);
    const endPosition = classID.indexOf('.ts');
    classID = classID.substring(startPosition + 1, endPosition);
  }
  return classID;
}

/**
 * 获取数据形式为@key=value@key1=value1,或者value,value1的Json值{key:value,key1:value1},没有key值使用index索引代替
 */
export function GetStrPara(dataStr: string) {
  const result: Record<any, any> = {};
  if (!!dataStr) {
    if (dataStr.includes('@')) {
      dataStr
        .trim()
        .split('@')
        .forEach((item) => {
          if (!!item) {
            const strs = item.split('=');
            if (strs.length == 2) result[strs[0]] = strs[1];
          }
        });
    } else {
      dataStr
        .trim()
        .split(',')
        .forEach((item, idx) => {
          result[idx] = item;
        });
    }
    return result;
  }
}
/**
 * 处理url链接参数为对象.例如xxxx?key=val&key1=val1,得到{key：val, key1：val1}
 */
export function parsePathParams(path) {
  const params = {};

  if (!path || typeof path !== 'string') {
    return params;
  }

  const questionMarkIndex = path.indexOf('?');

  if (questionMarkIndex === -1 || questionMarkIndex === path.length - 1) {
    return params;
  }

  try {
    const queryString = path.substring(questionMarkIndex + 1);
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      // URLSearchParams 会自动解码
      params[key] = value;
    }
  } catch (e) {
    console.error('Error parsing path parameters:', e);
  }

  return params;
}

/**
 * 判断是否是移动端打开
 * @constructor
 */
export function IsMobile() {
  const info = navigator.userAgent;
  const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPod', 'iPad'];
  for (let i = 0; i < agents.length; i++) {
    if (info.indexOf(agents[i]) >= 0) return true;
  }
  return false;
}

// 是否是钉钉
export const IsDingDing = () => dd.env.platform !== 'notInDingTalk';
// 判断flutter
export const IsFlutterApp = () => navigator.userAgent.toLowerCase().includes('flutter');
// 是否是手机微信
export const InMobileWeChat = () => navigator.userAgent.toLowerCase().includes('micromessenger');
// 移动端navbar是否显示
export const mobileNavbarVisible = () => isMobile() && !IsDingDing() && !InMobileWeChat() && !IsFlutterApp();
const utf8_encode = (input) => {
  input = input.replace(/\r\n/g, '\n');
  let utftext = '';
  for (let n = 0; n < input.length; n++) {
    let c = input.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
};
export const setBase64=(input)=>{
  let _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;
  input = utf8_encode(input);
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
  }
  return output;
}
