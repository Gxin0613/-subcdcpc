import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { GloWF } from '../../GloWF';

// 绑定角色
export class ARWebAPI extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.ARWebAPI');
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
    const map = new Map('WF_Node', '绑定WebAPI');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString('NodeWebAPI', null, 'WebAPI', true, false, 0, 100, 100, true);
    //const sql = `SELECT No,Name From Sys_SFTable WHERE DBSrcType='WebAPI'`;
    map.SetPopList('NodeWebAPI', GloWF.srcWebAPISFTable, false, '300px', '500px', '选择WebAPI字典', 'icon-people');
    map.AddTBAtParas(4000);
    // map.AddBoolean('IsEnter', false, '是否允许手工输入', true, true);
    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',NodeWebAPI,';

    this._enMap = map;
    return this._enMap;
  }
}
