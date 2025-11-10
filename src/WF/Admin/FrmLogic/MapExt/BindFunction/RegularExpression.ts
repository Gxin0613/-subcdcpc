import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { MapExtAttr } from '../../MapExt';
/// <summary>
/// 绑定函数
/// </summary>
export class RegularExpression extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.RegularExpression');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '正则表达式');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 0, 10, 100);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '字段ID', true, true, 0, 10, 100);

    map.AddTBString(MapExtAttr.Tag6, null, '模式名称', true, true, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag, null, '事件类型', true, true, 0, 10, 100, false);
    map.AddTBString(MapExtAttr.Tag1, null, '事件名称', true, true, 0, 10, 100, false);
    const h1 = `
    #### 帮助
    - 当验证不通过的时，提示的信息.
    - 提示信息不要有特殊字符.
    - 比如：电话号码输入不正确.
    `;
    map.AddTBString(MapExtAttr.Tag2, null, '提示信息', true, false, 0, 100, 200, true, h1);
    const h2 = `
    #### 帮助
    - 输入正则表达式内容.
    - 格式: xxewssssss
    `;
    map.AddTBStringDoc(MapExtAttr.Doc, null, '表达式', true, false, true, h2);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 绑定函数s
 */
export class RegularExpressions extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new RegularExpression();
  }
  constructor() {
    super();
  }
}
