const redirectMap = new Map([
  ['Start', '/WF/GenerList'],
  ['MyFlow', '/WF/MyFlow'],
  ['Search', '/WF/Comm/Search'],
  ['GenerList', '/WF/GenerList'],
]);

/**
 * demo.ccbpm.cn/#/WF/MyFlow?Token=xxxx
 * @param callbackObject
 * @returns
 */

// 这个方法一定要return 一个boolean值 true / false
export function handlerRedirect(callbackObject: Recordable) {
  const { PageName, ...restArgs } = callbackObject;
  let vuePath = redirectMap.get(PageName);
  if (!vuePath) return '';
  const argKeys = Object.keys(restArgs);
  vuePath += '?' + argKeys.map((key) => `${key}=${restArgs[key]}`).join('&');
  return vuePath;
}
