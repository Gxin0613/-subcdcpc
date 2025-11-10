import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

// 方法
export class MethodDictLog extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodLink","TS.Demo.BPFramework.MethodLink");
    super('TS.CCBill.MethodDictLog');
    this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_Method', '方法');

    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.Name, null, '链接标签', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', false, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', false, true, 0, 50, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', false, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, '链接地址', true, false, 0, 300, 10, true);
    map.AddTBString(MethodAttr.Mark, null, 'Mark', false, true, 0, 300, 10);

    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);

    map.AddDDLSysEnum(MethodAttr.ShowModel, 0, '显示方式', false, false, MethodAttr.ShowModel, '@0=按钮@1=超链接');

    map.AddDDLSysEnum(MethodAttr.RefMethodType, 0, '页面打开方式', true, true, 'RefMethodTypeLink', '@0=模态窗口打开@1=新窗口打开@2=右侧窗口打开@4=转到新页面');
    //是否显示到列表.
    map.AddBoolean(MethodAttr.IsList, false, '是否显示在列表?', true, true);

    map.AddTBInt(MethodAttr.PopWidth, 500, '宽度', true, false);
    map.AddTBInt(MethodAttr.PopHeight, 700, '高度', true, false);
    map.AddTBAtParas();

    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }
}
