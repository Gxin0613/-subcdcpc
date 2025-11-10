import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GloWF } from '../../GloWF';
import { GPE_ARStaModel } from './GPE_ARStaModel';
import { NodeDept, NodeDepts } from '../NodeDept';

// 节点属性
export class ARBindStationSpecSta extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.ARBindStationSpecSta');
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
    const map = new Map('WF_Node', '按指定的岗位集合与设置的部门交集计算');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);

    map.AddTBString('ARStaModel', null, '部门规则', false, false, 0, 100, 100, true);
    map.AddTBString('ARStaPara', null, '参数', false, false, 0, 100, 100, true);

    //角色选择. NodeDepts
    map.AddTBString('NodeDepts', null, '部门', true, false, 0, 500, 100, true);
    map.SetPopTree('NodeDepts', GloWF.srcDepts, GloWF.srcDeptRoot, true, '300px', '500px', '选择部门', 'icon-people');

    map.AddTBAtParas(4000);
    map.ParaFields = ',ARStaModel,ARStaPara,';
    map.AddRM_GPE(new GPE_ARStaModel(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据. liyongchao, 2024-12-20
    const ens = new NodeDepts();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeDepts !== 'string') {
      return Promise.resolve(true);
    }
    const strs = this.NodeDepts.split(',');
    strs.forEach(async (str) => {
      const en = new NodeDept();
      en.FK_Node = this.NodeID;
      en.FK_Dept = str;
      en.MyPK = this.NodeID + '_' + str;
      await en.Insert(); //插入到数据表.
    });

    return Promise.resolve(true);
  }
}
