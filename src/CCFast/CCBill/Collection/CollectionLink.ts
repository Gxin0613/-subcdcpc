import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
// 功能方法
export class CollectionLink extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.CollectionLink');
    if (!!pkval) this.No = pkval;
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
    const map = new Map('Frm_Collection', '自定义链接');

    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 100, 10);
    map.AddTBString(MethodAttr.Name, null, '链接标签', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', false, true, 0, 300, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', false, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, '链接地址', true, false, 0, 300, 10, true);
    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    map.AddDDLSysEnum(MethodAttr.ShowModel, 0, '显示方式', false, false, MethodAttr.ShowModel, '@0=按钮@1=超链接');

    map.AddDDLSysEnum(MethodAttr.RefMethodType, 0, '页面打开方式', true, true, 'RefMethodTypeLink', '@0=模态窗口打开@1=新窗口打开@2=右侧窗口打开@4=转到新页面');

    map.AddTBInt(MethodAttr.PopWidth, 500, '宽度', true, false);
    map.AddTBInt(MethodAttr.PopHeight, 700, '高度', true, false);

    map.AddBoolean('IsZD', false, '是否折叠?', true, true, true);
    map.SetHelperAlert('IsZD', '折叠后显示在更多按钮里.');
  //  map.AddBoolean('IsRight', false, '右键显示?', true, true, true);


    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }
  // protected bool: any beforeInsert() {
  //     if (DataType.IsNullOrEmpty(this.No) == true)
  //         this.No = DBAccess.GenerGUID();
  //     return base.beforeInsert();
}
