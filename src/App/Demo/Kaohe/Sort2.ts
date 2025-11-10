import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '/@/bp/web/WebUser';
import { Sort1 } from './Sort1';

// 考核小类
export class Sort2 extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.Sort2');
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
    const map = new Map('Demo_Sort2', '考核小类');
    map.CodeStruct = '3';
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 600, 300);
    map.AddDDLEntities('Sort1', null, '大类', new Sort1(), true);
    map.AddTBFloat('Cent', null, '分值', true, false);
    map.AddTBString('LabColor', '#FFFFFF', '颜色', true, false, 0, 100, 10, false);
    map.enMapExts.SetColor('LabColor');

    //map.AddTBString('RowExpModel', '', '行计算表达式', true, false, 0, 100, 10, false);
    map.AddDDLSysEnum('RowExpModel', 0, '行计算表达式', true, true, 'RowExpModel', '@0=不计算@1=求和@2=求平均');
    map.SetHelperAlert('RowExpModel', 'SUM=求和,AVG=求平均,None=不计算，为空的时候不计算.');

    this._enMap = map;
    return this._enMap;
  }
}

//考核小类s
export class Sort2s extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Sort2();
  }
  constructor() {
    super();
  }
}
