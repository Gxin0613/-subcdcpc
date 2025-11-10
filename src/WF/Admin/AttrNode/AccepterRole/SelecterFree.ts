import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { NodeAttr } from '/@/WF/TSClass/Node';
import { GloWF } from '../../GloWF';
import { message } from 'ant-design-vue';
import { NodeEmp, NodeEmps } from '../NodeEmp';
/// <summary>
/// Selector属性
/// </summary>
export class SelecterAttr extends NodeAttr {
  /// <summary>
  /// 接受模式
  /// </summary>
  public static readonly SelectorModel = 'SelectorModel';
  /// <summary>
  /// 选择人分组
  /// </summary>
  public static readonly SelectorP1 = 'SelectorP1';
  /// <summary>
  /// 操作员
  /// </summary>
  public static readonly SelectorP2 = 'SelectorP2';
  /// <summary>
  /// 默认选择的数据源
  /// </summary>
  public static readonly SelectorP3 = 'SelectorP3';
  /// <summary>
  /// 强制选择的数据源
  /// </summary>
  public static readonly SelectorP4 = 'SelectorP4';
  /// <summary>
  /// 数据显示方式(表格与树)
  /// </summary>
  public static readonly FK_SQLTemplate = 'FK_SQLTemplate';
  /// <summary>
  /// 是否自动装载上一笔加载的数据
  /// </summary>
  public static readonly IsAutoLoadEmps = 'IsAutoLoadEmps';
  /// <summary>
  /// 是否单项选择？
  /// </summary>
  public static readonly IsSimpleSelector = 'IsSimpleSelector';
  /// <summary>
  /// 是否启用部门搜索范围限定
  /// </summary>
  public static readonly IsEnableDeptRange = 'IsEnableDeptRange';
  /// <summary>
  /// 是否启用角色搜索范围限定
  /// </summary>
  public static readonly IsEnableStaRange = 'IsEnableStaRange';
  /// <summary>
  /// 节点默认发送人
  /// </summary>
  public static readonly NodeEmps = 'NodeEmps';
  /// <summary>
  //是否加载默认的人员
  /// </summary>
  public static readonly IsEnableLoadDefaulEmps = 'IsEnableLoadDefaulEmps';
}

// 节点属性
export class SelecterFree extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.SelecterFree');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '自由选择(海选)');
    map.AddTBIntPK(NodeExtAttr.NodeID, 0, '节点ID', false);
    //map.AddTBString(SelecterAttr.Name, null, '节点名称', true, true, 0, 100, 100, true, null);

    map.AddBoolean(SelecterAttr.IsAutoLoadEmps, true, '是否自动加载上一次选择的人员？', true, true, true);
    map.AddBoolean(SelecterAttr.IsSimpleSelector, false, '是否单项选择(只能选择一个人)？', true, true, true);
    map.AddBoolean(SelecterAttr.IsEnableDeptRange, false, '是否启用部门搜索范围限定(对使用通用人员选择器有效)？', true, true, true);
    map.AddBoolean(SelecterAttr.IsEnableStaRange, false, '是否启用角色搜索范围限定(对使用通用人员选择器有效)？', true, true, true);

    map.AddBoolean(SelecterAttr.IsEnableLoadDefaulEmps, false, '是否加载节点默认接收人(对使用通用人员选择器有效)？', true, true, true, '', SelecterAttr.NodeEmps);
    map.AddTBString(SelecterAttr.NodeEmps, null, '人员', false, false, 0, 1000, 100, true);
    map.SetPopTreeEns(SelecterAttr.NodeEmps, GloWF.srcDeptLazily, '@WebUser.DeptNo', GloWF.srcEmpLazily, '', true, '800px', '400px', '选择接收人', 'icon-people', '0', true, true);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    if (!this.IsEnableLoadDefaulEmps) {
      return Promise.resolve(true);
    }
    if (this.NodeEmps == null || this.NodeEmps === '') {
      message.config({ top: '100px' });
      message.error('请选择接受人');
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }
  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据. liyongchao, 2022-12-19
    const ens = new NodeEmps();
    await ens.Delete('FK_Node', this.NodeID);
    const node_emps = this.NodeEmps;
    if (typeof node_emps == 'string' && node_emps.includes(',')) {
      for (const emp of node_emps.split(',').filter((emp) => !!emp)) {
        const en = new NodeEmp();
        en.FK_Node = this.NodeID;
        en.FK_Emp = emp;
        en.MyPK = this.NodeID + '_' + emp;
        await en.Insert(); //插入到数据表.
      }
    }
    return Promise.resolve(true);
  }
}
