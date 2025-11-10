/**
 * * 设置 cookie
 * @param name 键名
 * @param cvalue 键值
 * @param exdays 过期时间
 */
export const setCookie = (name: string, cvalue: string, exdays: number) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = name + '=' + cvalue + '; ' + expires;
};

/**
 * * 获取 cookie
 * @param cname 键名
 * @returns string
 */
export const getCookie = (cname: string) => {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return '';
};

/**
 * * 清除 cookie
 * @param name 键名
 * @returns string
 */
export const clearCookie = (name: string) => {
  setCookie(name, '', -1);
};
