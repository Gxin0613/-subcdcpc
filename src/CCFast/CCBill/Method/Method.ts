import { EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { GroupMethod } from './GroupMethod';
import { PCenters } from '../../GPM/PCenter/PCenter';
import DBAccess from '/@/utils/gener/DBAccess';
// 集合方法
export class Method extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.Method');
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
    const map = new Map('Frm_Method', '实体方法');

    map.AddGroupAttr('基础信息');
    //主键.
    map.AddTBStringPK('No', null, '编号', true, true, 0, 50, 10);
    map.AddTBString('Name', null, '方法名', true, false, 0, 300, 140);
    map.AddTBString('MethodID', null, '方法ID', true, true, 0, 300, 10);
    map.AddDDLEntities('GroupID', null, '方法目录', new GroupMethod(), true, null, false);

    //功能标记.
    map.AddTBString('MethodModel', null, '方法模式', true, true, 0, 300, 100);
    map.AddTBString('Tag1', null, 'Tag1', true, true, 0, 300, 10);
    map.AddTBString('Tag2', null, 'Tag2', true, true, 0, 300, 10);

    map.AddTBString('Mark', null, 'Mark', true, true, 0, 300, 10);

    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('FlowNo', null, '流程编号', true, true, 0, 10, 10);
    map.AddTBString('Icon', null, '图标', true, false, 0, 50, 100, true);

    ////批处理的方法，显示到集合上.
    //map.AddBoolean(MethodAttr.IsCanBatch, false, "是否可以批处理?", true, false);

    //临时存储.
    map.AddTBString('Docs', null, '方法内容', true, false, 0, 300, 10);

    map.AddDDLSysEnum('RefMethodType', 0, '方法类型', true, false, 'RefMethodType', '@0=功能@1=模态窗口打开@2=新窗口打开@3=右侧窗口打开');
    //是否启用？
    map.AddBoolean('IsEnable', true, '启用?', true, true);
    map.AddTBInt('IsList', 0, '是否显示在列表?', true, false);
    map.AddTBInt('IsHavePara', 0, '是否含有参数?', true, false);
    map.AddTBInt('Idx', 0, 'Idx', true, false);

    map.AddGroupAttr('显示位置控制');
    // #region 显示位置控制.
    map.AddBoolean('IsMyBillToolBar', false, '是否显示在MyBill.htm工具栏上', true, true, true);
    map.AddBoolean('IsMyBillToolExt', false, '是否显示在MyBill.htm工具栏右边的更多按钮里', true, true, true);
    map.AddBoolean('IsSearchBar', false, '是否显示在Search.htm工具栏上(用于批处理)', true, true, true);
    // #endregion 显示位置控制.

    //  #region 外观.
    map.AddGroupAttr('外观');
    map.AddTBInt('PopHeight', 0, '弹窗高度', true, false);
    map.AddTBInt('PopWidth', 0, '弹窗宽度', true, false);
    //    #endregion 外观.

    //   #region 对功能有效
    //对功能有效.
    map.AddGroupAttr('对功能有效');
    map.AddTBString('WarningMsg', null, '功能执行警告信息', true, false, 0, 300, 10);
    map.AddTBString('MsgSuccess', null, '成功提示信息', true, false, 0, 300, 10, true);
    map.AddTBString('MsgErr', null, '失败提示信息', true, false, 0, 300, 10, true);
    map.AddDDLSysEnum('WhatAreYouTodo', 0, '执行完毕后干啥？', true, true, 'WhatAreYouTodo', '@0=关闭提示窗口@1=关闭提示窗口并刷新@2=转入到Search.htm页面上去');
    map.AddDDLSysEnum('MethodDocTypeOfFunc', 0, '内容类型', true, false, 'MethodDocTypeOfFunc', '@0=SQL@1=URL@2=JavaScript@3=业务单元');
    //#endregion 对功能有效
    map.AddGroupAttr('(流程)相同字段数据同步方式');
    // #region (流程)相同字段数据同步方式.
    map.AddDDLSysEnum('DTSDataWay', 0, '同步相同字段数据方式', true, true, 'DTSDataWay', '@0=不同步@1=同步全部的相同字段的数据@2=同步指定字段的数据');
    map.AddTBString('DTSSpecFiels', null, '要同步的字段', true, false, 0, 300, 10, true);
    map.AddBoolean('DTSWhenFlowOver', false, '流程结束后同步？', true, true, true);
    map.AddBoolean('DTSWhenNodeOver', false, '节点发送成功后同步？', true, true, true);
    // #endregion (流程)相同字段数据同步方式.
    map.AddTBAtParas();

    //相关功能: &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    map.AddRM_DtlSearch('权限', new PCenters(), `&CtrlObj=Method`, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    if (!this.No) this.No = DBAccess.GenerGUID(); // = '2021-09-01';
    if (!this.Icon) this.Icon = 'icon-drop';
    if (!this.Idx) this.Idx = 100;
    return Promise.resolve(true);
  }
}

//集合方法s
export class Methods extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Method();
  }
  constructor() {
    super();
  }
}

//属性列表
export class MethodAttr extends EntityNoNameAttr {
  public static readonly FrmID = 'FrmID';
  public static readonly GroupID = 'GroupID';
  public static readonly MethodID = 'MethodID';
  public static readonly Icon = 'Icon';
  public static readonly RefMethodType = 'RefMethodType';
  public static readonly MethodModel = 'MethodModel';
  public static readonly Mark = 'Mark';
  public static readonly Tag1 = 'Tag1';
  public static readonly Tag2 = 'Tag2';
  public static readonly ShowModel = 'ShowModel';
  public static readonly MethodDoc_Url = 'MethodDoc_Url';
  public static readonly MethodDocTypeOfFunc = 'MethodDocTypeOfFunc';
  public static readonly Docs = 'Docs';
  public static readonly WarningMsg = 'WarningMsg';
  public static readonly MsgSuccess = 'MsgSuccess';
  public static readonly MsgErr = 'MsgErr';
  public static readonly WhatAreYouTodo = 'WhatAreYouTodo';
  public static readonly Idx = 'Idx';
  public static readonly PopWidth = 'PopWidth';
  public static readonly PopHeight = 'PopHeight';
  public static readonly IsMyBillToolBar = 'IsMyBillToolBar';
  public static readonly IsMyBillToolExt = 'IsMyBillToolExt';
  public static readonly IsSearchBar = 'IsSearchBar';
  public static readonly DTSDataWay = 'DTSDataWay';
  public static readonly DTSSpecFiels = 'DTSSpecFiels';
  public static readonly DTSWhenFlowOver = 'DTSWhenFlowOver';
  public static readonly DTSWhenNodeOver = 'DTSWhenNodeOver';
  public static readonly FlowNo = 'FlowNo';
  public static readonly IsEnable = 'IsEnable';
  public static readonly IsList = 'IsList';
  public static readonly IsHavePara = 'IsHavePara';
}
