import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';

/// 记事本
export class Notepad extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCOA.Notepad');
    if (!!pkVal) {
      this.No = pkVal;
    }
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('OA_Notepad', '记事本');
    map.AddMyPK();
    map.AddGroupAttr('信息');
    map.AddTBString('Name', null, '标题', true, false, 0, 300, 10, true);
    map.AddTBString('Label', null, '标签', true, false, 0, 300, 10, true);
    map.AddTBStringDoc('Docs', null, '内容', true, false, true);
    map.AddGroupAttr('系统信息');
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 100, 10);
    map.AddTBDateTime('RDT', null, '记录日期', true, true);
    map.AddTBDate('NY', null, '年月', false, false);
    map.AddTBString('RecNo', null, '记录人编号', true, true, 0, 150, 100);
    map.AddTBString('RecName', null, '记录人名称', true, true, 0, 200, 100);
    map.AddTBInt('IsStar', 0, '是否标星', false, false);
    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddHidden('RecNo', '=', '@WebUser.No');
    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    //记录信息.
    this.RDT = DataType.CurrentDateTime;
    this.NY = DataType.CurrentDate;
    this.OrgNo = WebUser.OrgNo;
    this.RecNo = WebUser.No;
    this.RecName = WebUser.Name;
    this.RecDeptNo = WebUser.DeptNo;
    this.RecDeptName = WebUser.DeptNoText;
    return Promise.resolve(true);
  }
}

/**
 * 记事本 s
 */
export class Notepads extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Notepad();
  }
  constructor() {
    super();
  }
}
