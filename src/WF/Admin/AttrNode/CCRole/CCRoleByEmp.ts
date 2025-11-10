import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { CCRoleAttr } from './CCRole';
import { GloWF } from '../../GloWF';
/// <summary>
/// 按人员抄送
/// </summary>
export class CCRoleByEmp extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.CCRoleByEmp');
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
    const map = new Map('WF_CCRole', '按人员抄送');
    map.AddMyPK();
    map.AddTBString(CCRoleAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    map.AddTBStringDoc(CCRoleAttr.EnIDs, null, '抄送的人员', true, false, true);
    //设置pop
    map.SetPopTreeEns(
      CCRoleAttr.EnIDs,
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      false,
      '800px',
      '400px',
      '抄送人员',
      '',
      '0',
      false,
      true,
    );

    //  const attrs = `DataFromText,Note,`;
    // map.AddRM_DtlSearch('方向条件', new Conds(), 'RefPKVal', '', '移动,设置条件', attrs, 'icon-drop', true, '');

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
