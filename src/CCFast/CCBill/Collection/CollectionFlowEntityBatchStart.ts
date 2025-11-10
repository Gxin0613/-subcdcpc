import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
// 功能方法
export class CollectionFlowEntityBatchStart extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.CollectionFlowEntityBatchStart');
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
    const map = new Map('Frm_Collection', '批量发起流程');

    //  Map map = new Map("Frm_Collection", "功能方法");

    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 100, 10);
    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', true, true, 0, 50, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, 'Tag1', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);

    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);

    map.AddTBString(MethodAttr.Mark, null, '功能说明', true, false, 0, 900, 10, true);
    map.SetHelperAlert(MethodAttr.Mark, '对于该功能的描述.');

    map.AddTBString(MethodAttr.WarningMsg, null, '功能执行警告信息', true, false, 0, 300, 10, true);
    //map.AddDDLSysEnum(MethodAttr.ShowModel, 0, "显示方式", true, true, MethodAttr.ShowModel,
    //  "@0=按钮@1=超链接");

    map.AddDDLSysEnum(MethodAttr.MethodDocTypeOfFunc, 0, '内容类型', true, false, 'MethodDocTypeOfFunc', '@0=SQL@1=URL@2=JavaScript@3=业务单元');

    map.AddTBString(MethodAttr.MsgSuccess, null, '成功提示信息', true, false, 0, 300, 10, true);
    map.AddTBString(MethodAttr.MsgErr, null, '失败提示信息', true, false, 0, 300, 10, true);

    map.AddBoolean('IsZD', false, '是否折叠?', true, true, true);
    map.SetHelperAlert('IsZD', '折叠后显示在更多按钮里.');
  //  map.AddBoolean('IsRight', false, '右键显示?', true, true, true);


    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    // const rm = new RefMethod();

    // rm.Title = '方法内容';
    // rm.ClassMethodName = this.ToString() + '.DoDocs';
    // rm.Visable = true;
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.Target = '_blank';
    // //rm.GroupName = "开发接口";
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
}
