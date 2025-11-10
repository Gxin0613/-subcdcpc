import { RefMethod } from '/@/bp/en/Map/RefMethod';

export type NodeEventType = 'click' | 'mouseenter' | 'mouseleave' | 'contextmenu';

export type QueryFormEmitEvents = {
  (event: 'add'): void;
  (event: 'query', queryInfo: Recordable): void;
  (event: 'reset'): void;
  (event: 'delete-selected'): void;
  (event: 'open-setting'): void;
  (event: 'export-table'): void;
  (event: 'import-table'): void;
  (event: 'open-analy-page'): void;
  (event: 'exec-method', method: RefMethod): void;
  (event: 'change-density', key: 'small' | 'large' | 'medium' | undefined): void;
};
