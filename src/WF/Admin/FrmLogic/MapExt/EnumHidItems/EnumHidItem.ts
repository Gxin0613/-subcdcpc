import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { GloWF } from '../../../GloWF';
export class EnumHidItem extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.EnumHidItem');
    this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
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
    const map = new Map('Sys_MapExt', '点击事件隐藏选项');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 100);
    // const sql = `
    // SELECT KeyOfEn as No, Name FROM Sys_MapAttr
    // WHERE LGType=1 AND UIVisible=1 AND UIIsEnable=1 AND FK_MapData='@FK_MapData' AND KeyOfEn!='@AttrKey'`;

    map.AddDDLSQL(MapExtAttr.Tag, null, '联动的控件', GloWF.SQLOfEnumHidItem, true, null, false, 100);
    map.AddTBStringDoc(MapExtAttr.Tag4, null, '配置项', true, false, true, this.Desc1);

    this._enMap = map;
    return this._enMap;
  }

  public readonly Desc1 = `
  #### 说明
   - 设置格式
   - @0=1,2,3
   - @1=4,5
   - 标识当选项是0的时候,枚举值隐藏1,2,3 当选项=1的时候，隐藏4,5.
   #### 枚举值
   - 请打开枚举库查看, 对应的IntKey.
   - 也可以通过,select * from sys_enum WHERE EnumKey='xxxxx' 查看 枚举的键值.
  `;
}
