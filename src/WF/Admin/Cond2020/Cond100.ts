import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
// 条件
export class Cond100 extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.Cond100');
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
    const map = new Map('WF_Cond', '表达式');

    map.AddMyPK();

    map.AddTBString(CondAttr.OperatorValue, '', '表达式', true, true, 0, 12, 20);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
