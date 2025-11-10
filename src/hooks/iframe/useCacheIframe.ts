// 此文件用于缓存一个需要长期交互的后台页面
export function useCacheIframe(options: { clickWrapperClose: boolean }) {
  const getOrCreateIframeContainer = () => {
    const wrapperDiv = document.getElementById('cached-iframe-wrapper');
    if (!wrapperDiv) {
      const wrapperDiv = document.createElement('div');
      wrapperDiv.id = 'cached-iframe-wrapper';
      wrapperDiv.style.position = 'fixed';
      wrapperDiv.style.backgroundColor = 'white';
      wrapperDiv.style.width = '100vw';
      wrapperDiv.style.height = 'var(--viewport-height)';
      wrapperDiv.style.left = '130vw';
      wrapperDiv.style.top = '0px';
      wrapperDiv.style.background = 'transparent';
      wrapperDiv.style.transition = 'left 0.4s ease';
      const closeBtn = document.createElement('div');
      closeBtn.style.position = 'absolute';
      closeBtn.style.left = '-14px';
      closeBtn.style.top = '-14px';
      closeBtn.style.width = '28px';
      closeBtn.style.height = '28px';
      closeBtn.id = 'close-btn';
      closeBtn.style.backgroundColor = 'white';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.border = '1px solid #ccc';
      closeBtn.style.textAlign = 'center';
      closeBtn.style.lineHeight = '26px';
      closeBtn.style.fontSize = '16px';
      closeBtn.style.color = '#333';
      closeBtn.style.zIndex = '9999';
      closeBtn.innerHTML = 'X';
      closeBtn.onclick = () => {
        wrapperDiv.style.left = '130vw';
      };
      wrapperDiv.appendChild(closeBtn);
      const iframe = document.createElement('iframe');
      iframe.id = 'cached-iframe';
      iframe.style.position = 'absolute';
      iframe.style.left = '0';
      iframe.style.top = '0';
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.zIndex = '9998';
      iframe.style.backgroundColor = 'white';
      wrapperDiv.appendChild(iframe);
      if (options.clickWrapperClose) {
        wrapperDiv.addEventListener('click', () => {
          wrapperDiv.style.left = '130vw';
        });
      }
      document.body.appendChild(wrapperDiv);
      return wrapperDiv;
    }
    return wrapperDiv;
  };

  const getIframe = () => {
    const container = getOrCreateIframeContainer();
    const iframe = container.querySelector('iframe')!;
    return iframe;
  };
  const isSameOrigin = (current: string, prev: string) => {
    console.log({ current, prev });
    return current.split('?')[0] === prev.split('?')[0];
  };
  const loadUrl = (url: string) => {
    const iframe = getIframe();
    if (!isSameOrigin(iframe.src, url)) {
      iframe.src = url;
    }
  };

  const setSize = (rectInfo: DOMRect) => {
    const iframe = getIframe();
    const wrapperDiv = getOrCreateIframeContainer();
    iframe.style.width = rectInfo.width + 'px';
    iframe.style.height = rectInfo.height + 'px';
    iframe.style.top = rectInfo.top + 'px';
    iframe.style.left = rectInfo.left + 'px';
    const closeBtn = wrapperDiv.querySelector('div#close-btn')! as HTMLDivElement;
    closeBtn.style.left = rectInfo.left - 14 + 'px';
    closeBtn.style.top = rectInfo.top - 14 + 'px';
    wrapperDiv.style.zIndex = '9999';
    wrapperDiv.style.left = '0';
  };

  return {
    getIframe,
    isSameOrigin,
    loadUrl,
    setSize,
  };
}
