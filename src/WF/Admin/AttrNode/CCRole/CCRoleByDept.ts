import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { CCRoleAttr } from './CCRole';
import { GloWF } from '../../GloWF';
/// <summary>
/// 按角色抄送
/// </summary>
export class CCRoleByDept extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.CCRoleByDept');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_CCRole', '按部门抄送');
    map.AddMyPK();
    map.AddTBString(CCRoleAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    map.AddTBStringDoc(CCRoleAttr.EnIDs, null, '抄送到部门', true, false, true);
    map.SetPopTree(CCRoleAttr.EnIDs, GloWF.srcDepts, GloWF.srcDeptRoot, true);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}
