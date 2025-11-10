import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { KeMu } from './KeMu';

/// 学生科目
export class StudentKeMu extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Demo.StudentKeMu');
    if (!!mypk) {
      this.setPKVal(mypk);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Demo_StudentKeMu', '学生科目');
    map.AddMyPK();
    map.AddTBString('StudentNo', null, '学生', true, false, 0, 50, 200);
    //map.AddDDLEntities('KeMuNo', null, '科目', new KeMu(), true);
    map.AddDDLSQL('KeMuNo', null, '科目', 'SELECT No,Name FROM Demo_KeMu ', true);
    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.MyPK = this.StudentNo + '_' + this.KeMuNo;
    return Promise.resolve(true);
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    this.MyPK = this.StudentNo + '_' + this.KeMuNo;
    return Promise.resolve(true);
  }
}

//学生科目s
export class StudentKeMus extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new StudentKeMu();
  }
  constructor() {
    super();
  }
}
