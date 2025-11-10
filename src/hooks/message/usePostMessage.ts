// 这个hooks用于规范处理PostMessage，避免全局事件污染

import { onMounted, onUnmounted } from 'vue';

export function usePostMessage(onReceive: (this: Window, ev: MessageEvent<any>) => any) {
  onMounted(() => {
    window.addEventListener('message', onReceive, true);
  });
  onUnmounted(() => {
    window.removeEventListener('message', onReceive, true);
  });
}
