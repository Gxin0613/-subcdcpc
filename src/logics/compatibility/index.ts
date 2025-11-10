import { IsMobile } from '/@/utils/gener/StringUtils';

const addJSFeatures = () => {
  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replace) {
      // 如果search是字符串，使用正则替换；否则直接使用全局正则
      return this.replace(new RegExp(search, 'g'), replace);
    };
  }
};

// 处理不支持dvh单位的旧设备
const fixMobileViewportHeight = () => {
  if (IsMobile()) {
    let height = window.innerHeight;
    if ('visualViewport' in window) {
      height = window.visualViewport?.height || 0;
    }
    document.documentElement.style.setProperty('--viewport-height', height + 'px');
    window.addEventListener('resize', () => {
      document.documentElement.style.setProperty('--viewport-height', height + 'px');
    });
  }
};

// PromiseAllSettled降级支持
const supportPromiseAllSettled = () => {
  if (!Promise.allSettled) {
    Promise.allSettled = function (promises) {
      return Promise.all(
        promises.map((promise) =>
          Promise.resolve(promise)
            .then((value) => ({ status: 'fulfilled', value }))
            .catch((reason) => ({ status: 'rejected', reason })),
        ),
      );
    };
  }
};

export const addLegacyCompatibility = () => {
  addJSFeatures();
  fixMobileViewportHeight();
  supportPromiseAllSettled();
};
