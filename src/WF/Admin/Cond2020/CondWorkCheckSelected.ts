import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';

// 条件
export class CondWorkCheckSelected extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondWorkCheckSelected');
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
    const map = new Map('WF_Cond', '条件-审核组件立场');

    map.AddMyPK();
    map.AddTBInt(CondAttr.FK_Node, 0, '节点ID', false, false);
    map.AddTBInt(CondAttr.ToNodeID, 0, '到节点ID', false, false);
    map.AddTBString(CondAttr.ToNodeName, '', '到节点', false, false, 0, 200, 20, false);
    map.AddTBString(CondAttr.OperatorValue, '', '审核组件立场名称', true, false, 0, 300, 20, true);
    map.AddTBString(CondAttr.Note, '', '备注', false, false, 0, 300, 20, false);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
  override beforeUpdateInsertAction(): Promise<boolean> {
    this.Note = '当立场=[' + this.OperatorValue + ']时.';
    return Promise.resolve(true);
  }
}
