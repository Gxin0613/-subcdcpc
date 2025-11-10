import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
// 功能方法
export class MethodFlow extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodFlow","TS.Demo.BPFramework.MethodFlow");
    super('TS.CCBill.MethodFlow');
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
    const map = new Map('Frm_Method', '功能方法');

    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', true, true, 0, 50, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '方法模式', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Tag1, null, 'Tag1', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Mark, null, 'Mark', true, true, 0, 300, 10);

    map.AddTBString(MethodAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.FlowNo, null, '流程编号', true, true, 0, 10, 10);

    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);

    //  map.AddTBString(MethodAttr.WarningMsg, null, "执行流程警告信息", true, false, 0, 300, 10, true);
    map.AddDDLSysEnum(MethodAttr.ShowModel, 0, '显示方式', true, true, MethodAttr.ShowModel, '@0=按钮@1=超链接');

    // map.AddDDLSysEnum(MethodAttr.MethodDocTypeOfFunc, 0, "内容类型", true, false, "MethodDocTypeOfFunc",
    //"@0=SQL@1=URL@2=JavaScript@3=业务单元");
    // map.AddTBString(MethodAttr.MethodDoc_Url, null, "URL执行内容", false, false, 0, 300, 10);
    //   map.AddTBString(MethodAttr.MsgSuccess, null, "成功提示信息", true, false, 0, 300, 10, true);
    //    map.AddTBString(MethodAttr.MsgErr, null, "失败提示信息", true, false, 0, 300, 10, true);

    //#region 外观.
    map.AddTBInt(MethodAttr.PopHeight, 100, '弹窗高度', true, false);
    map.AddTBInt(MethodAttr.PopWidth, 260, '弹窗宽度', true, false);
    //#endregion 外观.

    //#region 显示位置控制.
    map.AddBoolean(MethodAttr.IsMyBillToolBar, false, '是否显示在MyBill.htm工具栏上', true, true, true);
    map.AddBoolean(MethodAttr.IsMyBillToolExt, false, '是否显示在MyBill.htm工具栏右边的更多按钮里', true, true, true);
    map.AddBoolean(MethodAttr.IsSearchBar, false, '是否显示在Search.htm工具栏上(用于批处理)', true, true, true);
    // #endregion 显示位置控制.

    //#region 相同字段数据同步方式.
    map.AddDDLSysEnum(MethodAttr.DTSDataWay, 0, '同步相同字段数据方式', true, true, MethodAttr.DTSDataWay, '@0=不同步@1=同步全部的相同字段的数据@2=同步指定字段的数据');

    map.AddTBString(MethodAttr.DTSSpecFiels, null, '要同步的字段', true, false, 0, 300, 10, true);

    map.AddBoolean(MethodAttr.DTSWhenFlowOver, false, '流程结束后同步？', true, true, true);
    map.AddBoolean(MethodAttr.DTSWhenNodeOver, false, '节点发送成功后同步？', true, true, true);
    map.AddTBAtParas();

    map.AddRM_DtlSearch('权限', new PCenters(), `${PowerCenterAttr.CtrlPKVal}&CtrlObj=Method`, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }
}
