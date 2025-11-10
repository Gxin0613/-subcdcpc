import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloWF } from '../../../GloWF';

// 表格弹窗
export class GPEDtlDateFiledMaxMin extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEDtlDateFiledMaxMin');
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
    const map = new Map('Sys_MapExt', '对从表列求值');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    // const sql = `SELECT No,Name From Sys_MapDtl WHERE FK_MapData='@FK_MapData'`;
    map.AddDDLSQL(MapExtAttr.Doc, null, '从表', GloWF.SQLOfAutoFullDtlField, true);
    map.AddTBString(MapExtAttr.FK_MapData, null, '对应的表单', false, false, 0, 50, 200, true, this.DescDoc);

    map.AddTBString(MapExtAttr.Tag1, null, '输入列', true, false, 0, 50, 200, true, this.DescTag1);
    //角色选择.
    map.SetPopList('Tag1', GloWF.sqlMapAttrDTFields, false, '200px', '300px', '选择字段', 'icon-people');
    // map.AddTBString(MapExtAttr.Tag1, null, '输入列', true, false, 0, 50, 200, true, this.DescTag1);
    // map.AddBoolean('Tag2', false, '计算后要触发的脚本函数', true, true, true, this.JSDesc);
    map.AddDDLStringEnum(MapExtAttr.Tag, 'Max', '计算方式', '@Max=求最大@Min=求最小', true);

    this._enMap = map;
    return this._enMap;
  }

  public readonly JSDesc = ` 
  #### 说明
  计算后要触发的脚本函数(比如:求和以后要激活的function)，该脚本要求写入到:DataUserJSLabMyFromID_Self.js
   `;
  public readonly DescTag1 = ` 
   #### 说明
   - zhoupeng 补充
    `;
  public readonly DescDoc = ` 
  #### 说明
  - SQL格式为:
  - SELECT No,Name FROM Port_Emp WHERE PinYin LIKE '%@Key%' OR No LIKE '%@Key%' OR Name LIKE '%@Key%' 
  - SELECT No,Name FROM CN_City WHERE PinYin LIKE '%@Key%' OR Name LIKE '%@Key%'
  - URL格式为:
  - /DataUser/Handler.ashx?xxx=sss 
  - 方法的格式为:
  - MyFunName
   `;
}
