import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '../../GloWF';

// 参数
export class SFPara extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFPara');
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

    map.AddMyPK();
    map.AddTBString('RefPKVal', null, '实体主键', false, false, 1, 200, 20);
    map.AddTBString('ParaKey', null, '参数标记', true, false, 1, 200, 100);
    map.AddTBString('ParaName', null, '参数名称', true, false, 0, 200, 100);
    map.AddDDLStringEnum('DataType', 'String', '数据类型', '@String=String@Int=Int@Float=Float', true, '', false, 100);
    map.AddDDLStringEnum('IsSys', 'String', '获取类型', '@0=内部@1=外部', true, '', false, 100);
    map.AddTBString('DefVal', null, '默认值', true, false, 0, 200, 100);

    //const sql = `SELECT No,Name FROM Sys_GloVar WHERE GroupKey='DefVal' `;
    map.AddDDLSQL('Exp', null, '内参表达式', GloWF.SQLOfSFPara, true, null, false, 200);
    map.AddTBInt('Idx', 0, '序号', true, false);
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
export class SFParas extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFPara();
  }
  constructor() {
    super();
  }
}
