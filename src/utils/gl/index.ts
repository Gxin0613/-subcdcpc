import WebUser from '/@/bp/web/WebUser';
/**
 * 判断是否是外部页面.
 * 例如：Port、Do、FeForward.
 *
 * @param   路由地址
 * @return  url路径
 */
export function isComPage(url) {
  if (url.startsWith('/src/')) {
    const tokenSuffix = '&Token=' + WebUser.Token;
    const subUrl = url.replace('/src/', '#/').replace('.vue', '');
    return location.origin + location.pathname + subUrl + tokenSuffix;
  }
  if (url.startsWith('/')) {
    return location.origin + url;
  } else {
    return location.origin + location.pathname + url;
  }
}
