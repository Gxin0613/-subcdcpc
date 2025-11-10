import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
export class MyEnumAttr {
  // 标签
  public static readonly Lab = 'Lab';
  // Int值
  public static readonly IntKey = 'IntKey';
  // 枚举值
  public static readonly EnumKey = 'EnumKey';
  // 语言
  public static readonly Lang = 'Lang';
  // 组织编号
  public static readonly OrgNo = 'OrgNo';
}

// 字典表
export class MyEnum extends EntityMyPK {
  constructor(no?: string) {
    super('TS.FrmUI.MyEnum');
    if (!!no) this.MyPK = no;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SysEnum', '枚举');
    /*
     * 为了能够支持 cloud 我们做了如下变更.
     * 1. 增加了 OrgNo 字段.
     * 2. 如果是单机版用户,原来的业务逻辑不变化. MyPK= EnumKey+"_"+IntKey+'_'+Lang
     * 3. 如果是SAAS模式, MyPK= EnumKey+"_"+IntKey+'_'+Lang +"_"+OrgNo
     */

    map.AddMyPK();
    map.AddTBString(MyEnumAttr.Lab, null, '标签', true, false, 1, 300, 200);

    //不管是那个模式  就是短号.
    map.AddTBString(MyEnumAttr.EnumKey, null, '枚举值', true, false, 1, 100, 100);
    map.AddTBInt(MyEnumAttr.IntKey, 0, '值', true, false);

    map.AddTBString(MyEnumAttr.Lang, 'CH', '语言', false, false, 0, 10, 8);
    map.AddTBString(MyEnumAttr.OrgNo, null, 'OrgNo', false, false, 0, 50, 8);
    this._enMap = map;
    return this._enMap;
  }
}

//字典表 s
export class MyEnums extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MyEnum();
  }
  constructor() {
    super();
  }
}
