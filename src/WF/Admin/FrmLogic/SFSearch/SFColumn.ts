import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 列
export class SFColumn extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFColumn');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('Sys_SFColumn', '参数');
    // MyPK= RefPK+'_'+BH;
    map.AddMyPK();
    map.AddTBString('RefPKVal', null, '实体主键', false, false, 1, 200, 20);
    map.AddTBString('AttrKey', null, '列英文名', true, false, 1, 200, 100);
    map.AddTBString('AttrName', null, '列中文名', true, false, 0, 200, 100);
    map.AddDDLStringEnum('DataType', 'String', '数据类型', '@String=String@Int=Int@Float=Float', true);
    map.AddTBInt('Idx', 0, '序', true, false, false);
    // map.AddDDLStringEnum('IsSys', 'String', '格式转换', '@0=不转换@1=转换ccbpm日期格式@2=内置函数转换', true);
    // map.AddTBString('FuncName', null, '函数名称', true, false, 0, 200, 100);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

//列 s
export class SFColumns extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFColumn();
  }
  constructor() {
    super();
  }
}
