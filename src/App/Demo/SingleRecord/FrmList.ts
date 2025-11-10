import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
/** 学生 **/
export class FrmList extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.FrmList');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    uac.IsUpdate = true;
    uac.IsDelete = false;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_FrmList', '学生表单');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 80);
    map.AddTBString('FrmEnName', null, '类名', true, false, 1, 200, 200, false);
    map.AddTBString('FrmDesc', null, '内容描述', true, false, 1, 200, 700, false);
    map.AddTBAtParas(3000); // @EnName=TS.XXX.AA@Key=xxxx

    this._enMap = map;
    return this._enMap;
  }
}
/**
 * 学生s
 */
export class FrmLists extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmList();
  }
  constructor() {
    super();
  }
}
