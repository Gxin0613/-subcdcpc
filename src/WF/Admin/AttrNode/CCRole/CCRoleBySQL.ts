import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { CCRoleAttr } from './CCRole';
import { SFDBSrc } from '../../FrmLogic/SFDBSrc/SFDBSrc';
/// <summary>
/// 按SQL抄送
/// </summary>
export class CCRoleBySQL extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.CCRoleBySQL');
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
    const map = new Map('WF_CCRole', '按SQL抄送');
    map.AddMyPK();
    map.AddTBString(CCRoleAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    map.AddDDLEntities('DBSrc', null, '数据源', new SFDBSrc(), true, null, true);
    map.AddTBStringDoc(CCRoleAttr.EnIDs, null, 'SQL', true, false, true);
    map.AddTBAtParas();

    //  const attrs = `DataFromText,Note,`;
    //  map.AddRM_DtlSearch('抄送条件', new Conds(), 'RefPKVal', '', '', attrs, 'icon-drop', true, '');

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
