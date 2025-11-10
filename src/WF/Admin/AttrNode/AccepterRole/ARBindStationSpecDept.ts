import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';
import { GloWF } from '../../GloWF';
import { NodeStation, NodeStations } from '../NodeStation';
import { GPE_ARDeptModel } from './GPE_ARDeptModel';

// 节点属性
export class ARBindStationSpecDept extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.ARBindStationSpecDept');
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
    const map = new Map('WF_Node', '按指定的部门集合与设置的角色交集计算');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);

    map.AddTBString('ARDeptModel', null, '部门规则', false, false, 0, 100, 100, true);
    map.AddTBString('ARDeptPara', null, '参数', false, false, 0, 100, 100, true);

    //角色选择. NodeStationsT
    map.AddTBString('NodeStations', null, '角色', true, false, 0, 100, 100, true);
    map.SetPopGroupList('NodeStations', GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择角色', 'icon-people', '1');

    const helpDG = `
    #### 帮助
    - 指定的部门集合递归模式.
    - 0=递归并累加,递归到根节点,并把找到的人累加起来.
    - 1=递归不累加,向根节点递归,如果找到人,就不在递归了.
    - 2=不递归, 仅仅按照指定的部门寻找.
    `;

    map.AddDDLSysEnum('DGModel56', 0, '递归模式', true, true, 'DGModel56', '@0=递归并累加@1=递归不累加@2=不递归', helpDG, true);

    map.AddTBString('ARDeptPara', null, '参数', false, false, 0, 100, 100, true);

    map.AddTBAtParas(4000);
    map.ParaFields = ',ARDeptModel,ARDeptPara,DGModel56,';
    map.AddRM_GPE(new GPE_ARDeptModel(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterUpdate(): Promise<boolean> {
    //删除原来的数据. liyongchao, 2022-12-19
    const ens = new NodeStations();
    await ens.Delete('FK_Node', this.NodeID);
    if (typeof this.NodeStations !== 'string') {
      return Promise.resolve(true);
    }
    const strs = this.NodeStations.split(',');
    strs.forEach(async (str) => {
      const en = new NodeStation();
      en.FK_Node = this.NodeID;
      en.FK_Station = str;
      en.MyPK = this.NodeID + '_' + str;
      await en.Insert(); //插入到数据表.
    });

    return Promise.resolve(true);
  }
}
