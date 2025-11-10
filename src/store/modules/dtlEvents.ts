import { defineStore } from 'pinia';

type DtlEventParam = {
  type: string;
  dtlKey: string;
  dtlColumn: string;
  val: any;
};

export const useDtlEventsStore = defineStore({
  id: 'dtl-events',
  state: () => ({
    events: new Map<string, DtlEventParam[]>(),
  }),
  getters: {
    getEvents: (state) => (dtlKey: string) => {
      const dtlEvents = state.events.get(dtlKey);
      if (Array.isArray(dtlEvents) && dtlEvents.length > 0) {
        return dtlEvents;
      }
      return [];
    },
  },
  actions: {
    setEvent(dtlKey: string, event: DtlEventParam) {
      // 存储事件
      if (!this.events.has(dtlKey)) {
        this.events.set(dtlKey, []);
      }
      const existingEvents = this.events.get(dtlKey);
      if (!existingEvents) return;
      existingEvents.push(event);
      this.events.set(dtlKey, existingEvents);
    },
    clearEvents(dtlKey: string) {
      this.events.set(dtlKey, []);
    },
  },
});
