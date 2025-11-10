import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
import { GloWF } from '../GloWF';
import { GPE_CondShenFenDept } from './GPE_CondShenFenDept';

// 条件
export class CondDept extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondDept');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Cond', '条件-部门');

    map.AddMyPK();
    map.AddTBInt(CondAttr.FK_Node, 0, '节点ID', true, true);
    map.AddTBInt(CondAttr.ToNodeID, 0, '到节点ID', true, true);
    map.AddTBString(CondAttr.ToNodeName, '', '到节点', true, true, 0, 200, 20, true);

    map.AddTBString(CondAttr.OperatorValue, '', '部门', true, true, 0, 3000, 20, true);
    // map.SetPopGroupList(CondAttr.OperatorValue, GloWF.srcStationTypes, GloWF.srcStations, true, CondAttr.Note);
    map.AddDDLSysEnum('JSFX', 0, '计算方向', true, true, 'JSFX', '@0=正向计算@1=反向计算');
    const help = `
#### 帮助
- **默认行为**：不递归子部门。
- **递归选项**：如果选择此选项，则会递归包含子部门以及所有层级的子子部门。
    `;
    map.AddBoolean('Tag1', false, '是否计算子部门?', true, true, false, help);
    map.AddTBString(CondAttr.Note, null, '备注', false, false, 0, 4000, 400);
    map.AddTBAtParas(2000);

    //部门选择
    map.SetPopTree(CondAttr.OperatorValue, GloWF.srcDepts, GloWF.srcDeptRoot, true, '300px', '500px', '选择部门', 'icon-people');

    //人员身份.
    map.AddRM_GPE(new GPE_CondShenFenDept(), 'icon-people');
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.Note = this.OperatorValueT;
    return true;
  }
  override beforeUpdateInsertAction(): Promise<boolean> {
    this.Note = this.OperatorValueT;
    return Promise.resolve(true);
  }
}
