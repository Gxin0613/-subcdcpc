import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { DiQu } from './DiQu';

// 区县
export class QuXian extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.AD.QuXian');
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
    const map = new Map('CN_QuXian', '区县');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 0, 30, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddDDLEntities('DiQu', null, '地区编号', new DiQu(), true, null, false);
    map.AddSearchAttr('DiQu');
    this._enMap = map;
    return this._enMap;
  }
}

//区县s
export class QuXians extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new QuXian();
  }


  //查询全部
  override async RetrieveAll() {
    if (WebUser.DeptNo.length <= 4) return await super.RetrieveAll();
    else return await this.Retrieve('DiQu', WebUser.DeptNo);
  }


  constructor() {
    super();
  }
}
