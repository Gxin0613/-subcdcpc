import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

export class FrmNodeAttr {
  /// 节点
  public static readonly FK_Frm = 'FK_Frm';
  /// 工作节点
  public static readonly FK_Node = 'FK_Node';
  /// 是否readonly.
  public static readonly IsEdit = 'IsEdit';
  /// IsPrint
  public static readonly IsPrint = 'IsPrint';
  /// 是否启用装载填充事件.
  public static readonly IsEnableLoadData = 'IsEnableLoadData';
  /// 打开表单时是否覆盖其他节点页面？
  public static readonly IsCloseEtcFrm = 'IsCloseEtcFrm';
  /// 是否1变N(对于分流节点有效)
  public static readonly Is1ToN = 'Is1ToN';
  /// 是否默认打开
  public static readonly IsDefaultOpen = 'IsDefaultOpen';
  /// FK_Flow
  public static readonly FK_Flow = 'FK_Flow';
  /// 表单类型
  public static readonly FrmType = 'FrmType';
  /// 方案
  public static readonly FrmSln = 'FrmSln';
  /// 是否启用审核组件
  public static readonly IsEnableFWC = 'IsEnableFWC';
  /// 谁是主键？
  public static readonly WhoIsPK = 'WhoIsPK';
  /// 模版文件
  public static readonly TempleteFile = 'TempleteFile';
  /// 是否显示
  public static readonly IsEnable = 'IsEnable';
  /// 汇总
  public static readonly HuiZong = 'HuiZong';
  /// 表单启用规则
  public static readonly FrmEnableRole = 'FrmEnableRole';
  ///  表单启动表达式.
  public static readonly FrmEnableExp = 'FrmEnableExp';
  /// 表单显示的名字
  public static readonly FrmNameShow = 'FrmNameShow';
  /// 父子流程组件
  public static readonly SFSta = 'SFSta';
  public static readonly CheckField = 'CheckField';
  public static readonly BillNoField = 'BillNoField';
  /// Idx
  public static readonly Idx = 'Idx';
}

/// <summary>
/// 节点表单属性
/// </summary>
export class FrmNode extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmNode', 'BP.WF.Template.FrmNode');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_FrmNode', '节点表单属性');

    map.AddMyPK();
    map.AddTBString(FrmNodeAttr.FK_Frm, null, '表单ID', true, true, 1, 200, 150);
    map.AddTBString(FrmNodeAttr.FrmNameShow, null, '表单显示名字', true, false, 0, 100, 150);

    map.AddTBInt(FrmNodeAttr.FK_Node, 0, '节点编号', true, false);
    map.AddTBString(FrmNodeAttr.FK_Flow, null, '流程编号', true, true, 1, 10, 20);
    map.AddTBString(FrmNodeAttr.FrmType, '0', '表单类型', true, true, 1, 20, 20);

    //菜单在本节点的权限控制.
    // map.AddTBInt(FrmNodeAttr.IsEdit, 1, "是否可以更新", true, false);
    map.AddTBInt(FrmNodeAttr.IsPrint, 0, '是否可以打印', true, false);
    map.AddTBInt(FrmNodeAttr.IsEnableLoadData, 0, '是否启用装载填充事件', true, false);
    map.AddTBInt(FrmNodeAttr.IsDefaultOpen, 0, '是否默认打开', true, false);
    map.AddTBInt(FrmNodeAttr.IsCloseEtcFrm, 0, '打开时是否关闭其它的页面？', true, false);
    map.AddTBInt(FrmNodeAttr.IsEnableFWC, 0, '是否启用审核组件？', true, false);
    map.AddTBInt(FrmNodeAttr.SFSta, 0, '是否启用父子流程组件？', true, false);

    //显示的
    map.AddTBInt(FrmNodeAttr.Idx, 0, '序号', true, false);
    map.AddTBInt(FrmNodeAttr.FrmSln, 0, '表单权限方案', true, false);

    // add 2014-01-26
    map.AddTBInt(FrmNodeAttr.WhoIsPK, 0, '谁是主键？', true, false);

    //add 2016.3.25.
    map.AddTBInt(FrmNodeAttr.Is1ToN, 0, '是否1变N？', true, false);
    map.AddTBString(FrmNodeAttr.HuiZong, null, '子线程要汇总的数据表', true, true, 0, 300, 20);

    map.AddTBInt(FrmNodeAttr.FrmEnableRole, 0, '表单启用规则', true, false);
    map.AddTBString(FrmNodeAttr.FrmEnableExp, null, '启用的表达式', true, true, 0, 900, 20);

    //模版文件，对于office表单有效.
    map.AddTBString(FrmNodeAttr.TempleteFile, null, '模版文件', true, true, 0, 500, 20);

    //是否显示
    map.AddTBInt(FrmNodeAttr.IsEnable, 1, '是否显示', true, false);

    // map.AddTBString(FrmNodeAttr.GuanJianZiDuan, null, "关键字段", true, true, 0, 20, 20);

    //@2019.09.30 by zhoupeng.
    //  map.SetHelperAlert(FrmNodeAttr.FrmNameShow, "显示在表单树上的名字,默认为空,表示与表单的实际名字相同.多用于节点表单的名字在表单树上显示.");
    //签批字段不可见
    map.AddTBString(FrmNodeAttr.CheckField, null, '签批字段', false, false, 0, 50, 10, false);
    map.AddTBString(FrmNodeAttr.BillNoField, null, '单据编号字段', false, false, 0, 50, 10, false);

    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class FrmNodes extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmNode();
  }

  constructor() {
    super();
  }
}
