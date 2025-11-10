import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CCRoleAttr } from './CCRole';
import { GloWF } from '../../GloWF';
/// 按角色抄送
export class CCRoleByStation extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.CCRoleByStation');
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
    const map = new Map('WF_CCRole', '按角色抄送');
    map.AddMyPK();
    map.AddTBString(CCRoleAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    // 执行类型.
    const val2 = `
     @0=仅按角色计算
     @1=按角色智能计算(当前节点)
     @2=按角色智能计算(发送到节点)
     @3=按角色与部门的交集
     @4=按直线上级部门找角色下的人员(当前节点)
     @5=按直线上级部门找角色下的人员(接受节点)
     `;
    map.AddDDLSysEnum(CCRoleAttr.CCStaWay, 0, '角色计算规则', true, true, CCRoleAttr.CCStaWay, val2);
    map.AddTBStringDoc(CCRoleAttr.EnIDs, null, '角色', true, false, true);
    map.SetPopGroupList(CCRoleAttr.EnIDs, GloWF.srcStationTypes, GloWF.srcStations, true);
    map.AddTBStringDoc(CCRoleAttr.Tag2, null, '部门', true, false, true, '只有选择按角色与部门的交集时配置部门信息');
    map.SetPopTree(CCRoleAttr.Tag2, GloWF.srcDepts, GloWF.srcDeptRoot, true, '300px', '500px', '选择部门', 'icon-people');
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
}
