import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { GloWF } from '../../GloWF';
import { NodeEmp, NodeEmps } from '../NodeEmp';
import { message } from 'ant-design-vue';

// 节点属性
export class AccepterRoleBindEmp extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleBindEmp');
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
    const map = new Map('WF_Node', '绑定人员');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);

    map.AddTBString('NodeEmps', null, '人员', true, false, 0, 1000, 100, true);
    map.SetPopTreeEns(
      'NodeEmps',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '400px',
      '选择接收人',
      'icon-people',
      '0',
      true,
      true,
    );

    // //map.AddTBString(NodeExtAttr.Name, null, "名称", true, true, 0, 50, 200);
    // //绑定人员.
    // map.AddGroupMethod('绑定人员');
    // map.AddRM_One2Many_TreeEns(
    //   '部门人员树结构',
    //   new NodeEmps(),
    //   new Depts(),
    //   NodeDeptAttr.FK_Node,
    //   NodeEmpAttr.FK_Emp,
    //   '0',
    //   false,
    //   new Emps(),
    //   EmpAttr.FK_Dept,
    //   'No=编号,Name=名称,Tel=电话',
    //   'icon-tree',
    // );
    // map.AddRM_One2Many_GroupList('部门人员分组结构', new NodeEmps(), new Emps(), NodeEmpAttr.FK_Node, NodeEmpAttr.FK_Emp, new Depts(), 'FK_Dept', 'icon-file');

    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    if (this.NodeEmps == null || this.NodeEmps === '') {
      message.config({ top: '100px' });
      message.error('请选择接受人');
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }
  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据. liyongchao, 2024-12-20
    const ens = new NodeEmps();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeEmps !== 'string') {
      return Promise.resolve(true);
    }
    const strs = this.NodeEmps.split(',');
    strs.forEach(async (str: string) => {
      if (!!str) {
        const en = new NodeEmp();
        en.FK_Node = this.NodeID;
        en.FK_Emp = str;
        en.MyPK = this.NodeID + '_' + str;
        await en.Insert(); //插入到数据表.
      }
    });
    return Promise.resolve(true);
  }
}
