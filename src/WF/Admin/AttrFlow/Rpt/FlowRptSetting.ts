import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DBRoles } from '/@/CCFast/CCBill/DBRole/DBRole';
import { GPE_DTSearchWay } from '/@/CCFast/CCBill/Admin/SearchCond/GPE_DTSearchWay';
import { SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';
import { GPN_FlowRptSelectFields } from './GPN_FlowRptSelectFields';
// import { FrameworkExt } from '/@/CommExt/FrameworkExt';
// 人员
export class FlowRptSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.WF.FlowRptSetting');
    if (!!no) this.setPKVal(no);
  }

  // override GetRefExt() {
  //   return new FrameworkExt(this);
  // }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '设计');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '流程', true, true, 1, 3, 50);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddTBString('FlowNo', null, 'FlowNo', false, false, 0, 50, 200);
    map.AddBoolean('HideTitle', false, '隐藏标题', true, true);

    map.AddGroupMethod('1.查询条件');
    map.AddRM_GPN(new GPN_FlowRptSelectFields(), 'icon-drop');

    //外键枚举查询条件
    map.AddRM_DtlSearch('外键枚举查询条件', new SearchFKEnums(), 'FrmID', '', '', '', 'icon-drop', true);
    //日期查询方式
    map.AddRM_GPE(new GPE_DTSearchWay(), 'icon-drop');

    map.AddGroupMethod('2.数据列表');
    map.AddRM_DtlSearch('列表权限', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=FlowRptDBList');
    map.AddRM_DtlSearch('导出-Button', new DBRoles(), 'FrmID', '', '', '', 'icon-settings', false, '&DBRole=ExpExcel');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
