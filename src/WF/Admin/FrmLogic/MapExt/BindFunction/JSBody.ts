import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
/// <summary>
/// 绑定函数
/// </summary>
export class JSBody extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.JSBody');
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
    const map = new Map('Sys_MapExt', '函数体');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 0, 10, 100);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '字段ID', true, true, 0, 10, 100);
    map.AddTBString(MapExtAttr.Tag6, null, '模式名称', true, true, 0, 10, 100, true);
    map.AddTBString(MapExtAttr.Tag, null, '事件类型', true, true, 0, 10, 100, false);
    map.AddTBString(MapExtAttr.Tag1, null, '事件名称', true, true, 0, 10, 100, false);
    const h2 = `
    #### 帮助
    - 输入正则表达式内容.
    - 格式: xxewssssss
    `;
    map.AddTBStringDoc(MapExtAttr.Doc, null, 'JS函数体', true, false, true, h2);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
