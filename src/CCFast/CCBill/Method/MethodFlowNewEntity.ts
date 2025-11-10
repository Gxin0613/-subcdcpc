import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

//属性列表
export class MethodFlowNewEntityAttr extends EntityNoNameAttr {
  // #region 基本属性.
  /// <summary>
  /// 表单ID
  /// </summary>
  public static readonly FrmID = 'FrmID';
  /// <summary>
  /// 方法ID
  /// </summary>
  public static readonly MethodID = 'MethodID';
  /// <summary>
  /// 图标
  /// </summary>
  public static readonly Icon = 'Icon';
  /// <summary>
  /// 方法打开模式
  /// </summary>
  public static readonly MethodModel = 'MethodModel';
  /// <summary>
  /// 标记
  /// </summary>
  public static readonly Mark = 'Mark';
  /// <summary>
  /// tag
  /// </summary>
  public static readonly Tag1 = 'Tag1';
  /// <summary>
  /// 显示方式.
  /// </summary>
  public static readonly ShowModel = 'ShowModel';
  /// <summary>
  /// 处理内容
  /// </summary>
  public static readonly MethodFlowNewEntityDoc_Url = 'MethodFlowNewEntityDoc_Url';
  /// <summary>
  /// 内容类型
  /// </summary>
  public static readonly MethodFlowNewEntityDocTypeOfFunc = 'MethodFlowNewEntityDocTypeOfFunc';
  /// <summary>
  /// 处理内容s
  /// </summary>
  public static readonly Docs = 'Docs';

  /// <summary>
  /// 执行警告信息-对新建实体有效
  /// </summary>
  public static readonly WarningMsg = 'WarningMsg';
  /// <summary>
  /// 成功提示信息
  /// </summary>
  public static readonly MsgSuccess = 'MsgSuccess';
  /// <summary>
  /// 失败提示信息
  /// </summary>
  public static readonly MsgErr = 'MsgErr';
  /// <summary>
  /// 执行完毕后干啥？
  /// </summary>
  public static readonly WhatAreYouTodo = 'WhatAreYouTodo';
  /// <summary>
  /// Idx
  /// </summary>
  public static readonly Idx = 'Idx';
  //#endregion 基本属性.

  // #region 外观.
  /// <summary>
  /// 宽度.
  /// </summary>
  public static readonly PopWidth = 'PopWidth';
  /// <summary>
  /// 高度
  /// </summary>
  public static readonly PopHeight = 'PopHeight';
  // #endregion 外观.

  /// <summary>
  /// 是否启用
  /// </summary>
  public static readonly IsEnable = 'IsEnable';
  /// <summary>
  /// 流程编号
  /// </summary>
  public static readonly FlowNo = 'FlowNo';
}

// 新建实体
export class MethodFlowNewEntity extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodFlowNewEntity","TS.Demo.BPFramework.MethodFlowNewEntity");
    super('TS.CCBill.MethodFlowNewEntity');

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
    const map = new Map('GPM_Menu', '新建实体');

    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 150, 10);
    map.AddTBString(MethodAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('FlowNo', null, '流程编号', true, true, 0, 300, 10, false);
    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);

    //
    map.AddTBString('UrlExt', null, '链接', false, false, 0, 300, 10, true);

    //  #region 显示位置控制.
    map.AddBoolean(MethodAttr.IsMyBillToolBar, false, '是否显示在MyDict.htm工具栏上', true, true, true);
    map.AddBoolean(MethodAttr.IsMyBillToolExt, false, '是否显示在MyDict.htm工具栏右边的更多按钮里', true, true, true);
    map.AddBoolean(MethodAttr.IsSearchBar, false, '是否显示在 SearchDict.htm工具栏上(用于批处理)', true, true, true);
    // #endregion 显示位置控制.

    // #region 相同字段数据同步方式.
    map.AddDDLSysEnum(MethodAttr.DTSDataWay, 0, '同步相同字段数据方式', true, true, MethodAttr.DTSDataWay, '@0=不同步@1=同步全部的相同字段的数据@2=同步指定字段的数据');

    map.AddTBString(MethodAttr.DTSSpecFiels, null, '要同步的字段', true, false, 0, 300, 10, true);

    map.AddBoolean(MethodAttr.DTSWhenFlowOver, false, '流程结束后同步？', true, true, true);
    map.AddBoolean(MethodAttr.DTSWhenNodeOver, false, '节点发送成功后同步？', true, true, true);
    map.AddTBAtParas(3000);

    //  #endregion 相同字段数据同步方式.
    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    const rm = new RefMethod();
    rm.Title = '设计流程';
    rm.ClassMethod = 'DoAlert';
    rm.Warning = '';
    rm.Visable = true;
    rm.RefMethodType = RefMethodType.Func;
    //rm.GroupName = "开发接口";
    //  map.AddRefMethod(rm);

    const rm2 = new RefMethod();
    rm2.Title = '重新导入实体字段';
    rm2.ClassMethod = 'ReSetFrm';
    rm2.Warning = '现有的表单字段将会被清除，重新导入的字段会被增加上去，数据不会变化，导入需慎重。';
    rm2.Visable = true;
    rm2.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm2);

    this._enMap = map;
    return this._enMap;
  }

  //   public string CreateWorkID()
  //   {
  //       Int64 workid = TS.WF.Dev2Interface.Node_CreateBlankWork(this.FlowNo);

  //       //给当前的流程实例做标记.
  //       TS.WF.GenerWorkFlow gwf = new WF.GenerWorkFlow(workid);
  //       gwf.PFlowNo = this.FrmID;
  //       gwf.SetPara("FlowNewEntity", "1"); //设置标记，等到流程结束后，自动写入到Dict一笔记录.
  //       gwf.SetPara("MenuNo", this.No); //菜单编号.
  //       gwf.PWorkID = gwf.WorkID; //实体保存的ID 与 流程ID一致。
  //       gwf.Update();

  //       return workid.ToString();
  //   }

  //   #region 执行方法.
  //   /// <summary>
  //   /// 方法参数
  //   /// </summary>
  //   /// <returns></returns>
  //   public string DoAlert()
  //   {
  //       return "您需要转入流程设计器去设计流程.";
  //       // return "../../CCBill/Admin/MethodParas.htm?No=" + this.MyPK;
  //   }
  //   /// <summary>
  //   /// 重新导入实体字段
  //   /// </summary>
  //   /// <returns></returns>
  //   public string ReSetFrm()
  //   {
  //       //如果是发起流程的方法，就要表单的字段复制到，流程的表单上去.
  //       TS.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp handler = new TS.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp();
  //       //   handler.AddPara
  //       handler.Imp_CopyFrm("ND" + int.Parse(this.FlowNo + "01"), this.FrmID);
  //       return "执行成功，您需要转入流程设计器查看表单.";

  //   }
  //   protected override bool beforeInsert()
  //   {
  //       if (DataType.IsNullOrEmpty(this.No) == true)
  //           this.No = DBAccess.GenerGUID();
  //       return base.beforeInsert();
  //   }
  //   #endregion 执行方法.
}
