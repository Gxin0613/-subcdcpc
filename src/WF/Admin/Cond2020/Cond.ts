import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import DBAccess from '/@/utils/gener/DBAccess';
import { Node } from '../../TSClass/Node';

//条件
export class ConnDataFrom {
  /// <summary>
  /// 表单数据
  /// </summary>
  public static readonly NodeForm = 0;
  /// <summary>
  /// 独立表单
  /// </summary>
  public static readonly StandAloneFrm = 1;
  /// <summary>
  /// 角色数据
  /// </summary>
  public static readonly Stas = 2;
  /// <summary>
  /// Depts
  /// </summary>
  public static readonly Depts = 3;
  /// <summary>
  /// 按sql计算.
  /// </summary>
  public static readonly SQL = 4;
  /// <summary>
  /// 按sql模版计算.
  /// </summary>
  public static readonly SQLTemplate = 5;
  /// <summary>
  /// 按参数
  /// </summary>
  public static readonly Paras = 6;
  /// <summary>
  /// 按Url.
  /// </summary>
  public static readonly Url = 7;
  /// <summary>
  /// 按WebApi返回值
  /// </summary>
  public static readonly WebApi = 8;
  /// <summary>
  /// 按照审核组件立场
  /// </summary>
  public static readonly WorkCheck = 9;
  /// <summary>
  /// 操作符
  /// </summary>
  public static readonly CondOperator = 100;
}

//属性列表
export class CondAttr extends EntityNoNameAttr {
  public static readonly RefPKVal = 'RefPKVal';
  // 流程编号
  public static readonly RefFlowNo = 'RefFlowNo';
  public static readonly FK_Flow = 'FK_Flow';
  public static readonly FK_Node = 'FK_Node';
  public static readonly ToNodeID = 'ToNodeID';
  public static readonly ToNodeName = 'ToNodeName'; //到节点名称
  public static readonly CondType = 'CondType';
  public static readonly DataFrom = 'DataFrom';
  public static readonly DataFromText = 'DataFromText';

  public static readonly FrmID = 'FrmID';
  public static readonly FrmName = 'FrmName';
  public static readonly FK_Attr = 'FK_Attr';
  public static readonly AttrKey = 'AttrKey';
  public static readonly AttrName = 'AttrName';
  public static readonly FK_Operator = 'FK_Operator';
  public static readonly OperatorValue = 'OperatorValue';
  public static readonly OperatorValueT = 'OperatorValueT';
  public static readonly Note = 'Note';
  public static readonly FK_DBSrc = 'FK_DBSrc';
  public static readonly Idx = 'Idx';
  public static readonly SpecOperPara = 'SpecOperPara';
  public static readonly SpecOperWay = 'SpecOperWay';
  public static readonly Tag1 = 'Tag1';
}

// 条件
export class Cond extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.Cond');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('WF_Cond', '条件');

    map.AddMyPK();
    map.AddTBString(CondAttr.RefPKVal, null, '关联主键', true, true, 0, 50, 10);
    map.AddTBString(CondAttr.FK_Flow, null, '流程编号', true, true, 0, 10, 10); //对于流程条件有效.
    map.AddTBInt(CondAttr.FK_Node, 0, '节点ID', true, false);
    map.AddTBInt(CondAttr.ToNodeID, 0, '到达的节点ID', true, false);
    map.AddTBString(CondAttr.ToNodeName, null, '到节点', true, true, 0, 80, 100);

    //条件类型.
    map.AddTBInt(CondAttr.CondType, 2, '条件类型', false, false);
    map.AddTBInt(CondAttr.DataFrom, 0, '数据来源', false, false);
    map.AddTBString(CondAttr.DataFromText, null, '数据来源', true, true, 0, 80, 100);

    map.AddTBString(CondAttr.FrmID, null, '表单ID', true, true, 0, 80, 20);
    map.AddTBString(CondAttr.FrmName, null, '表单名称', true, true, 0, 80, 20);

    map.AddTBString(CondAttr.FK_Attr, null, '属性', true, true, 0, 80, 20);
    map.AddTBString(CondAttr.AttrKey, null, '属性键', true, true, 0, 60, 20);
    map.AddTBString(CondAttr.AttrName, null, '中文名称', true, true, 0, 500, 20);
    map.AddTBString(CondAttr.FK_Operator, '=', '运算符号', true, true, 0, 60, 20);
    map.AddTBString(CondAttr.OperatorValue, '', '要运算的值', true, true, 0, 4000, 20);
    map.AddTBString(CondAttr.OperatorValueT, '', '要运算的值T', true, true, 0, 4000, 20);
    map.AddTBString(CondAttr.Tag1, null, 'Tag1', true, true, 0, 80, 20);

    map.AddTBString(CondAttr.FK_DBSrc, 'local', 'SQL的数据来源', false, true, 0, 50, 20);

    map.AddTBString(CondAttr.Note, null, '备注', true, true, 0, 500, 400);
    map.AddDDLSysEnum('JSFX', 0, '计算方向', true, true, 'JSFX', '@0=正向计算@1=反向计算');
    //参数 for wangrui add 2015.10.6. 条件为station,depts模式的时候，需要指定人员。

    map.AddTBInt(CondAttr.SpecOperWay, 0, '操作员类型', false, true);
    map.AddTBString(CondAttr.SpecOperPara, null, '操作员参数', false, true, 0, 500, 20);

    map.AddTBAtParas(2000);
    map.AddTBInt('Idx', 0, '序号', true, true);

    //map.ParaFields = ',SpecOperWay,SpecOperPara,';

    // const rm = new RefMethod();
    // rm.Title = '检查正确';
    // rm.RefMethodType = RefMethodType.DtlToolbarFunc;
    // rm.ClassMethod = 'CheckErr';
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    //生成PK.
    this.MyPK = DBAccess.GenerGUID();
    //关联的PK
    if (this.CondType == 2) {
      const toNode = new Node(this.ToNodeID);
      await toNode.Retrieve();
      this.ToNodeName = toNode.Name;
      this.RefPKVal = this.FK_Flow + '_' + this.FK_Node + '_' + this.ToNodeID;
    }

    return Promise.resolve(true);
  }
}
//条件s
export class Conds extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Cond();
  }
  constructor() {
    super();
  }
}
