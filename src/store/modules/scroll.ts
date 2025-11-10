import { defineStore } from 'pinia';

export const useScrollKeepStore = defineStore({
  id: 'app-scroll-keep',
  state: () => ({
    scrollMap: new Map<string, number>(),
  }),
  getters: {
    getScrollMap(): Map<string, number> {
      return this.scrollMap;
    },
  },
  actions: {
    setScrollInfo(compName: string, sTop: number) {
      this.scrollMap.set(compName, sTop);
    },
  },
});
