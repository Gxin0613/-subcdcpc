import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { GPE_ShenFenModel } from './GPE_ShenFenModel';
import { GloWF } from '../../GloWF';
import { NodeStation, NodeStations } from '../NodeStation';

// 节点属性
export class AccepterRoleBindStation extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.AccepterRoleBindStation');
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
    const map = new Map('WF_Node', '绑定角色');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBInt('ShenFenModel', 0, '身份规则', false, false);
    //角色选择. NodeStationsT
    map.AddTBString('NodeStations', null, '角色', true, false, 0, 100, 100, true);
    map.SetPopGroupList('NodeStations', GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择角色', 'icon-people', '1');

    // 岗位计算方式
    map.AddDDLSysEnum('StationReqEmpsWay', 0, '岗位计算方式', true, true, 'StationReqEmpsWay', '@0=角色集合模式@1=岗位切片-严谨模式@2=岗位切片-宽泛模式', this.Help1, false);
    map.AddDDLSysEnum('StationFindWay', 0, '岗位找人规则', true, true, 'StationFindWay', '@0=递归父级,父级平级寻找@1=递归父级直线寻找@2=向下级寻找', this.Help2, false);

    map.AddTBAtParas(4000);
    map.ParaFields = ',ShenFenModel,StationReqEmpsWay,StationFindWay,';
    map.AddRM_GPE(new GPE_ShenFenModel(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
  public Help1 = `
  1. 岗位切片-严谨模式：如果配置了严谨模式，效果是有部分人员绑定了这几个岗位，这几个岗位必须每个岗位下都有人被绑定，如果有一个岗位下没查到对应岗位的人员，就算所有岗位没查到人员数据。
  2. 岗位切片-宽泛模式：如果配置了宽泛模式，效果是有部分人员绑定了这几个岗位，不深究每个岗位是否有人员被绑定，查找这几个岗位下人员数据的并集，最终查到的人员数据最少一条。如果在这几个岗位下都没有人员被绑定，也就是没有查到人员，会给前台一个提示。

这里的岗位等同于角色，不同的业务场景叫法不同，意义一样。
  `;
  public Help2 = `
  #### 帮助 -岗位找人规则.
  - 寻找人的路径, 在树结构里面.
  #### 岗位找人规则 
  - 递归父级,父级平级寻找.
  - 递归父级寻找.
 `;

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
