import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import WebUser from '/@/bp/web/WebUser';
import { Sort1 } from './Sort1';
import { Sort2 } from './Sort2';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 学生考核
export class KaoHeDtl extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Demo.KaoHeDtl');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    if (WebUser.No === 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsUpdate = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_KaoHeDtl', '学生考核');
    map.CodeStruct = '3';
    map.AddMyPK();
    map.AddTBString('StudentNo', null, '学生编号', true, false, 0, 600, 600);
    map.AddDDLEntities('Sort1', null, '大类', new Sort1(), true);
    map.AddDDLEntities('Sort2', null, '小类', new Sort2(), true);

    map.AddTBString('YF', null, '月份', true, false, 0, 20, 100); //月份.
    map.AddTBString('ND', null, '年度', true, false, 0, 20, 100); //年度.
    map.AddTBString('NY', null, '年月', true, false, 0, 20, 100); //年月.

    map.AddTBString('Msg', null, '消息', true, false, 0, 20, 100); //年月.

    map.AddTBFloat('Cent', null, '分值', true, false);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.MyPK = this.NY + '_' + this.StudentNo + '_' + this.Sort2; // DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

//学生考核s
export class KaoHeDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new KaoHeDtl();
  }
  constructor() {
    super();
  }
}
