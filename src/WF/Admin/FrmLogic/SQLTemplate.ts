import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';

// SQL模板属性
export class SQLTemplate extends EntityNoName {
  // 扩展
  get Docs() {
    return this.GetValStringByKey('Docs');
  }
  set Docs(value: any) {
    this.SetValByKey('Docs', value);
  }

  constructor(mypk?: string) {
    super('TS.FrmUI.SQLTemplate');
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('WF_SQLTemplate', 'SQL模板');

    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);

    map.AddDDLSysEnum('SQLType', 0, '模版SQL类型', true, true, 'SQLType', '@0=方向条件@1=接受人规则@2=下拉框数据过滤@3=级联下拉框@4=PopVal开窗返回值@5=人员选择器人员选择范围');

    map.AddTBString('Name', null, 'SQL说明', true, false, 0, 200, 20, true);
    map.AddTBStringDoc('Docs', null, 'SQL模版', true, false, true);

    this._enMap = map;
    return this._enMap;
  }
}

//SQL模板属性s
export class SQLTemplates extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SQLTemplate();
  }
  constructor() {
    super();
  }
}
