
import dd from 'dingtalk-jsapi';
// import { IsDingDing } from './gener/StringUtils';

export function resetWindowOpen() {
  // 保存原始的window.open()方法
  const originalWindowOpen = window.open;
  // 重写window.open()方法
  window.open = function (url?: string | URL | undefined, target?: string, features?: string): Window | null {
    const isDingTalk = /DingTalk/.test(navigator.userAgent);
    // IsDingDing()
    if (isDingTalk) {
      dd.biz.util.openLink({
        url: url + '',
      });
    } else {
      // 调用原始的window.open()方法
      const opener = originalWindowOpen(url, target, features);
      if (!opener) {
        window.confirm('请检查浏览器是否阻止了弹出窗口');
      }
    }
    return null;
  };
}
