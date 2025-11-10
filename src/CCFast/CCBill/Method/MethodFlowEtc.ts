import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 功能方法
export class MethodFlowEtc extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodFlowEtc","TS.Demo.BPFramework.MethodFlowEtc");
    super('TS.CCBill.MethodFlowEtc');

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

    //  map.AddTBString(MethodAttr.WarningMsg, null, "实体其他业务流程警告信息", true, false, 0, 300, 10, true);
    map.AddDDLSysEnum(MethodAttr.ShowModel, 0, '显示方式', true, true, MethodAttr.ShowModel, '@0=按钮@1=超链接');

    // #region 外观.
    map.AddTBInt(MethodAttr.PopHeight, 100, '弹窗高度', true, false);
    map.AddTBInt(MethodAttr.PopWidth, 260, '弹窗宽度', true, false);
    //  #endregion 外观.

    // #region 显示位置控制.
    map.AddBoolean(MethodAttr.IsMyBillToolBar, false, '是否显示在MyBill.htm工具栏上', true, true, true);
    map.AddBoolean(MethodAttr.IsMyBillToolExt, false, '是否显示在MyBill.htm工具栏右边的更多按钮里', true, true, true);
    map.AddBoolean(MethodAttr.IsSearchBar, false, '是否显示在Search.htm工具栏上(用于批处理)', true, true, true);
    // #endregion 显示位置控制.

    // #region 相同字段数据同步方式.
    map.AddDDLSysEnum(MethodAttr.DTSDataWay, 0, '同步相同字段数据方式', true, true, MethodAttr.DTSDataWay, '@0=不同步@1=同步全部的相同字段的数据@2=同步指定字段的数据');

    map.AddTBString(MethodAttr.DTSSpecFiels, null, '要同步的字段', true, false, 0, 300, 10, true);

    map.AddBoolean(MethodAttr.DTSWhenFlowOver, false, '流程结束后同步？', true, true, true);
    map.AddBoolean(MethodAttr.DTSWhenNodeOver, false, '节点发送成功后同步？', true, true, true);
    map.AddTBAtParas();

    // #endregion 相同字段数据同步方式.
    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    const rm = new RefMethod();
    rm.Title = '设计流程';
    rm.ClassMethod = 'DFlow';
    rm.RefMethodType = RefMethodType.RightFrameOpen;
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = true;
    rm.Icon = 'icon-link';
    map.AddRefMethod(rm);

    // rm = new RefMethod();
    // rm.Title = '重新导入实体字段';
    // rm.ClassMethod = 'ReSetFrm';
    // rm.Warning = '现有的表单字段将会被清除，重新导入的字段会被增加上去，数据不会变化，导入需慎重。';
    // rm.Visable = true;
    // rm.RefMethodType = RefMethodType.Func;
    // //rm.GroupName = "开发接口";
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  public DFlow() {
    const url = GloComm.UrlFlowD(this.Tag1);

    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }
}

//功能方法 s
export class MethodFlowEtcs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MethodFlowEtc();
  }
  constructor() {
    super();
  }
}
