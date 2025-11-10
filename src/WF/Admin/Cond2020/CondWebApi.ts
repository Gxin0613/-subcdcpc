import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';

// 条件
export class CondWebApi extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondWebApi');
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
    const map = new Map('WF_Cond', '条件-WebApi');

    map.AddMyPK();
    map.AddTBStringDoc(CondAttr.OperatorValue, '', 'WebApi', true, false, true);
    map.AddTBString(CondAttr.Note, null, '备注', true, false, 0, 4000, 400, true);
    map.AddTBAtParas(2000);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return true;
  }
}
