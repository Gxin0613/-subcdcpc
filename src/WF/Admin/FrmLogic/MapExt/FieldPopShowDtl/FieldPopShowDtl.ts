import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';

// 表格弹窗
export class FieldPopShowDtl extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.FieldPopShowDtl');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('Sys_MapExt', 'Pop数据撰取');
    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, 'FrmID', false, false, 0, 50, 200, true, this.DescDoc);
    map.AddTBStringDoc(MapExtAttr.Doc, null, '数据源SQL', true, false, true, this.DescTag1);

    map.AddTBString(MapExtAttr.Tag1, '70%', '窗体宽度px', true, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.Tag2, '100%', '窗体高度px', true, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }

  public readonly DescTag1 = ` 
   #### 说明
   - 请输入SQL表达式，
   - 表达式里支持@字段名变量.
    `;
}
