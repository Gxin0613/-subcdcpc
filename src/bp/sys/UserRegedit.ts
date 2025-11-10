import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
// 用户注册表
export class UserRegedit extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Self.UserRegedit');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Sys_UserRegedit', '用户注册表');
    /*
     * 为了能够支持 cloud 我们做了如下变更.
     * 1. 增加了 OrgNo 字段.
     * 2. 如果是单机版用户,原来的业务逻辑不变化. MyPK= EnumKey+"_"+IntKey+'_'+Lang
     * 3. 如果是SAAS模式, MyPK= EnumKey+"_"+IntKey+'_'+Lang +"_"+OrgNo
     */
    map.AddMyPK();
    map.AddTBString('FK_Emp', null, '用户', false, false, 0, 30, 20);
    map.AddTBString('CfgKey', null, '键', true, false, 0, 200, 20);
    map.AddTBString('Vals', null, '值', true, false, 0, 2000, 20);
    map.AddTBString('GenerSQL', null, 'GenerSQL', true, false, 0, 2000, 20);
    map.AddTBString('Paras', null, 'Paras', true, false, 0, 2000, 20);
    map.AddTBString('NumKey', null, '分析的Key', true, false, 0, 300, 20);
    map.AddTBString('OrderBy', null, 'OrderBy', true, false, 0, 300, 20);
    map.AddTBString('OrderWay', null, 'OrderWay', true, false, 0, 300, 20);
    map.AddTBString('SearchKey', null, 'SearchKey', true, false, 0, 300, 20);
    map.AddTBString('MVals', null, 'MVals', true, false, 0, 2000, 20);
    map.AddBoolean('IsPic', false, '是否图片', true, false);

    map.AddTBString('DTFrom', null, '查询时间从', true, false, 0, 20, 20);
    map.AddTBString('DTTo', null, '到', true, false, 0, 20, 20);
    map.AddTBString('DTSearchKey', null, '日期字段查询', true, false, 0, 150, 20);
    map.AddTBString('OrgNo', null, 'OrgNo', true, false, 0, 32, 32);
    //增加属性.
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
}
//用户注册表s
export class UserRegedits extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new UserRegedit();
  }

  constructor() {
    super();
  }
}
