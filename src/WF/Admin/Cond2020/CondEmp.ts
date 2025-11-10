import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
import { GloWF } from '../GloWF';

// 人员条件
export class CondEmp extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondEmp');
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
    const map = new Map('WF_Cond', '条件-人员');

    map.AddMyPK();

    map.AddTBInt(CondAttr.FK_Node, 0, '节点ID', false, false);
    map.AddTBInt(CondAttr.ToNodeID, 0, '到节点ID', false, false);
    map.AddTBString(CondAttr.ToNodeName, '', '到节点', true, true, 0, 200, 20, true);

    map.AddTBString(CondAttr.OperatorValue, '', '人员', true, false, 0, 4000, 20, true);
    map.SetPopTreeEns(
      'OperatorValue',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '400px',
      '选人',
      'icon-people',
      '1',
      true,
      true,
    );

    map.AddDDLSysEnum('JSFX', 0, '计算方向', true, true, 'JSFX', '@0=正向计算@1=反向计算');
    map.AddTBString(CondAttr.Note, null, '备注', false, false, 0, 3000, 400, false);
    map.AddTBAtParas(2000);

    //人员身份.
    // map.AddRM_GPE(new GPE_CondShenFenStation(), 'icon-people');
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
  override beforeUpdateInsertAction(): Promise<boolean> {
    this.Note = this.OperatorValueT;
    return Promise.resolve(true);
  }
}
