import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { QuXian } from './QuXian';
import WebUser from '/@/bp/web/WebUser';
import { DiQu } from './DiQu';

// 乡镇
export class XiangZhen extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.XiangZhen');
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
    const map = new Map('CN_XiangZhen', '乡镇');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 30, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddDDLEntities('DiQu', null, '地区', new DiQu(), true);
    map.AddDDLEntities('QuXian', null, '区县', new QuXian(), true);
    map.enMapExts.SetJiLian('DiQu', 'QuXian', `SELECT No,Name FROM CN_QuXian WHERE DiQu='@Key'`); //级联模式.
    map.AddSearchAttr('DiQu');
    map.AddSearchAttr('QuXian');

    this._enMap = map;
    return this._enMap;
  }
}

//乡镇s
export class XiangZhens extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new XiangZhen();
  }
  constructor() {
    super();
  }
}
