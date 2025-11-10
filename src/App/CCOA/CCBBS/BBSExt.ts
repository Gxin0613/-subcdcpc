import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { BBSAttr } from './BBS';
import { BBSType } from './BBSType';

/// 类型
export class BBSExt extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCBBS.BBSExt');
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
    const map = new Map('OA_BBS', '信息');

    map.AddTBStringPK(BBSAttr.No, null, '编号', false, true, 1, 59, 59);
    map.AddTBString(BBSAttr.Name, null, '标题', true, false, 0, 100, 10, true);

    map.AddTBStringDoc(BBSAttr.Docs, null, '内容', true, false, true);

    map.AddDDLSysEnum(BBSAttr.BBSPRI, 0, '重要性', true, true, 'BBSPRI', '@0=普通@1=紧急@2=火急');

    map.AddDDLEntities(BBSAttr.BBSType, null, '类型', new BBSType(), true);

    map.AddTBString(BBSAttr.Rec, null, '记录人', false, false, 0, 100, 10);
    map.AddTBString(BBSAttr.RecName, null, '记录人', false, true, 0, 100, 10, false);
    map.AddTBString(BBSAttr.RecDeptNo, null, '记录人部门', false, false, 0, 100, 10, false);

    map.AddTBString(BBSAttr.RelerName, null, '发布人', true, false, 0, 100, 10, false);
    map.AddTBString(BBSAttr.RelDeptName, null, '发布单位', true, false, 0, 100, 10, false);

    map.AddTBDateTime(BBSAttr.RDT, null, '发布日期', false, false);
    map.AddTBString(BBSAttr.NianYue, null, '隶属年月', false, false, 0, 10, 10);

    map.AddTBString(BBSAttr.OrgNo, null, '组织', true, true, 0, 100, 10);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 类型s
 */
export class BBSExts extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new BBSExt();
  }
  constructor() {
    super();
  }
}
