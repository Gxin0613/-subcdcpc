import { debounce } from 'lodash-es';
import { useScrollKeepStore } from '/@/store/modules/scroll';
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue';

export default function useScrollKeep(_sk_key: string) {
  const skStore = useScrollKeepStore();
  const handleScroll = debounce((e) => {
    skStore.setScrollInfo(_sk_key, e.target.scrollTop);
  }, 200);

  let _el: HTMLElement | null = null;

  const setupElem = (el: HTMLElement) => {
    _el = el;
    if (!_el) return;
    _el.removeEventListener('scroll', handleScroll);
    _el.addEventListener('scroll', handleScroll);
  };

  const tryReStoreST = () => {
    const sTop = skStore.getScrollMap.get(_sk_key);
    if (typeof sTop !== 'number') return;
    if (!_el) return;
    _el.scrollTop = sTop;
  };

  onMounted(() => {
    tryReStoreST();
    if (!_el) return;
    _el.addEventListener('scroll', handleScroll);
  });
  onUnmounted(() => {
    if (!_el) return;
    _el.removeEventListener('scroll', handleScroll);
  });
  onActivated(() => {
    tryReStoreST();
    if (!_el) return;
    _el.addEventListener('scroll', handleScroll);
  });
  onDeactivated(() => {
    if (!_el) return;
    _el.removeEventListener('scroll', handleScroll);
  });

  return {
    setupElem,
  };
}
