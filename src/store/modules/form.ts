import { defineStore } from 'pinia';
import { LabelPlacement } from 'naive-ui/es/form/src/interface';
import { FormGroup, FormItem } from '/@form/props/form/FormComponents';
import { MapAttr, MapExt } from '/@form/props/database/FormInfo';
import Entity from '/@form/dto/Entity';

export interface GlobalFormConfig {
  name: string; // 表单名称
  cols: 4 | 6; // 表单是格或者6格
  labelPosition: LabelPlacement; // 标签位置
  labelAlign: 'left' | 'center' | 'right'; // 标签对其方式
  inline: 'true' | 'false'; // 行内表单
  labelTextColor: string;
  labelBgColor: string;
  autoGenerateId: number;
  designerWidth: number;
  showHiddenField: number;
  originData: Record<string, any>;
  autoFitWidth: string; //显示实际宽度
  showChapterIndex: boolean; //章节表单受否显示索引
  DBSrc: string; //数据源
}

export const useDesignerStore = defineStore({
  id: 'designer',
  state: () => {
    return {
      widgetsList: <Array<FormGroup>>[],
      selectedWidget: <FormItem | FormGroup | null>null,
      selectedLogWidget: <FormItem | FormGroup | null>null,
      widgetsDtoList: <Array<MapAttr>>[],
      selectedWidgetDto: <Entity | null>null,
      globalFormConfig: <GlobalFormConfig>{
        name: '',
        cols: 4,
        labelPosition: 'left',
        labelAlign: 'left',
        inline: 'true',
        labelTextColor: '#333333',
        labelBgColor: '#f2f5f7',
        autoGenerateId: 0,
        designerWidth: 1000,
        showHiddenField: 0,
        originData: {},
        autoFitWidth: '0',
        showChapterIndex: true,
        DBSrc: 'local',
      },
      // 全局iframe属性
      professionSettingVisible: false,
      professionSettingUrl: <string>'',
      professionSettingTitle: <string>'',
      professionSettingType: <string>'',
      currentDragWidget: <any>null,
      newWidgetIndex: <number>-1,
      globalLoading: <boolean>false,
      settingPanelLoading: <boolean>false,
      loadingDesc: <string>'loading',
      userInfo: <any>{},
      activeDropZoneId: <null | string | number>-1,
      componentsCollapse: <boolean>false,
      settingsCollapse: <boolean>false,
      mapExtList: <Array<MapExt>>[],
      athInfoList: <Recordable[]>[],
    };
  },
});

export const useDesignerTheme = defineStore('theme', {
  state: () => {
    return {
      primaryColor: '#1890ff',
      primaryColorRgba: 'rgba(69,157,255,0.6)',
      defineTheme: <any>{},
    };
  },
});
