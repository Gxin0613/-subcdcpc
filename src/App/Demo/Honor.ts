import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

// 荣誉
export class Honor extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Demo.Honor');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Honor', '荣誉');
    map.AddMyPK();
    map.AddTBString('StudentNo', null, '学生编号', false, false, 0, 200, 10);
    map.AddTBDate('NianYue', null, '月份', true, false, false, '', { type: 'month', format: 'YYYY-MM' });
    map.AddTBString('RongYuMC', null, '荣誉', true, false, 0, 150, 150);
    map.AddTBString('BFDW', null, '颁发单位', true, false, 0, 100, 100);
    map.AddTBString('BeiZhu', null, '备注', true, false, 0, 60, 100);
    map.AddBoolean('SubmitFile', false, '是否提交材料', true, true, true);
    map.AddTBDate('SubmitTime', null, '提交日期', true, false, false, '', { type: 'date', format: 'YYYY-MM-DD' });
    map.AddTBInt('Idx', 0, '显示顺序', true, false);
    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 荣誉s
 */
export class Honors extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Honor();
  }
  protected override async BeforeSave(): Promise<boolean> {
    // 判断存在年月为202402的记录
    for (const en of this) {
      if (en.NianYue == '202402') {
        return true;
      }
    }
    // throw new Error('保存前检查失败，却少记录为xxx的数据');
    return true;
  }
  constructor() {
    super();
  }
}
