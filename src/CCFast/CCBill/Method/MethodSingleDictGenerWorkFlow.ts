import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

// 单个实体流程查询
export class MethodSingleDictGenerWorkFlow extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.MethodSingleDictGenerWorkFlow');
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
    const map = new Map('Frm_Method', '单个实体流程查询');

    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 200, 10);
    map.AddTBString(MethodAttr.GroupID, null, 'GroupID', true, true, 0, 200, 10);

    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, 'Tag1', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.Mark, null, 'Mark', true, false, 0, 300, 10);

    map.AddBoolean(MethodAttr.IsMyBillToolBar, true, '是否显示在MyBill.htm工具栏上', true, true, true);
    map.AddBoolean(MethodAttr.IsMyBillToolExt, false, '是否显示在MyBill.htm工具栏右边的更多按钮里', true, true, true);
    map.AddBoolean(MethodAttr.IsSearchBar, false, '是否显示在Search.htm工具栏上(用于批处理)', true, true, true);
    map.AddTBAtParas();

    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }
}

//单个实体流程查询s
export class MethodSingleDictGenerWorkFlows extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MethodSingleDictGenerWorkFlow();
  }
  constructor() {
    super();
  }
}
