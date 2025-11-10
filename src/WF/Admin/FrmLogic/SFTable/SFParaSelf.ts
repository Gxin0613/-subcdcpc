import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 参数
export class SFParaSelf extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFParaSelf');
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
    const map = new Map('Sys_SFPara', '参数');

    // MyPK= RefPK+'_'+BH;
    map.AddMyPK();
    map.AddTBString('RefPKVal', null, '实体主键', false, false, 1, 200, 20);
    map.AddTBString('ParaKey', null, '参数标记', true, true, 1, 200, 100);
    map.AddTBString('ParaName', null, '参数名称', true, false, 0, 200, 100);
    map.AddTBString('DefVal', null, '默认值', true, false, 0, 200, 100);
    map.AddTBString('IsSys', '0', '获取类型', false, false, 0, 200, 100);
    map.AddDDLStringEnum('DataType', 'String', '数据类型', '@String=String@Int=Int@Float=Float', true, '', false, 100);
    map.AddTBInt('Idx', 0, '序号', false, false);
    map.AddTBAtParas(1000);
    this._enMap = map;
    return this._enMap;
  }

  protected override beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = this.GetValStringByKey('RefPKVal') + '_' + this.GetValStringByKey('ParaKey');
    return Promise.resolve(true);
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    this.MyPK = this.GetValStringByKey('RefPKVal') + '_' + this.GetValStringByKey('ParaKey');
    if (!this.DataType) this.DataType = 'String';
    if (!this.IsSys) this.IsSys = '0';
    return Promise.resolve(true);
  }
}

//参数 s
export class SFParaSelfs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFParaSelf();
  }
  constructor() {
    super();
  }
}
