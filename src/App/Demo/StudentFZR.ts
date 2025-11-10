/// <summary>
/// 到过的城市 属性
/// </summary>
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 到过的城市
/// </summary>
export class StudentFZR extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Demo.StudentFZR');
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
    const map = new Map('Demo_StudentFZR', '学生负责人');
    map.AddMyPK();
    map.AddTBString('StudentNo', null, '学生', true, false, 0, 50, 200);
    map.AddTBString('FZR', null, '负责人', true, true, 0, 100, 200);
    map.AddTBString('FZRT', null, '负责人名称', true, false, 0, 100, 200);
    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.MyPK = this.StudentNo + '_' + this.FZR;
    return Promise.resolve(true);
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    this.MyPK = this.StudentNo + '_' + this.FZR;
    return Promise.resolve(true);
  }
}

//到过的城市s
export class StudentFZRs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new StudentFZR();
  }
  constructor() {
    super();
  }
}
