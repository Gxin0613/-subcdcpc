import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';

// 枚举
export class SysEnum extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Sys.SysEnum');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map(GloWF.SysEnum(), '枚举');
    /*
     * 为了能够支持 cloud 我们做了如下变更.
     * 1. 增加了 OrgNo 字段.
     * 2. 如果是单机版用户,原来的业务逻辑不变化. MyPK= EnumKey+"_"+IntKey+'_'+Lang
     * 3. 如果是SAAS模式, MyPK= EnumKey+"_"+IntKey+'_'+Lang +"_"+OrgNo
     */
    map.AddMyPK();
    map.AddTBString('EnumKey', null, '枚举值', false, false, 1, 100, 100);
    map.AddTBString('StrKey', null, '值', false, false, 1, 100, 100);
    map.AddTBInt('IntKey', 0, '值', true, true);
    map.AddTBString('Lab', null, '标签', true, false, 1, 1000, 200);
    //不管是那个模式  就是短号.
    map.AddTBString('ValColor', '#000', '颜色', true, false, 0, 30, 120);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 50, 8);
    map.AddTBString('RefPK', null, 'RefPK', false, false, 0, 50, 8);

    this._enMap = map;
    return this._enMap;
  }
}

//枚举s
export class SysEnums extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SysEnum();
  }

  constructor() {
    super();
  }
}
