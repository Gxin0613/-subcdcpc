import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 节点属性
export class GovDocTemplate extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrFlow.GovDocTemplate');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Part', '公文模板');
    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString('FlowNo', null, 'FlowNo', false, false, 0, 4, 100, false);
    map.AddTBString('RefPKVal', null, '字段属性', false, false, 0, 100, 100, false);
    map.AddTBString('Mark', 'GovDoc', '标记', false, false, 0, 100, 100, false);
    map.AddTBString('Name', null, '名称', true, false, 0, 800, 100, true, this.Help);
    map.AddMyFile('公文模板', 'doc,docx', '');

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    this.Mark = 'GovDoc';
    if (this.Name == '') this.Name = this.MyFileName;
    return Promise.resolve(true);
  }
}

//流程属性s
export class GovDocTemplates extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GovDocTemplate();
  }
  constructor() {
    super();
  }
}
