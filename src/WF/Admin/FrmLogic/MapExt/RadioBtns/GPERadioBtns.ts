import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';

// 表格弹窗
export class GPERadioBtns extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPERadioBtns');
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
    const map = new Map('Sys_MapExt', '');

    map.AddGroupAttr('未完成');
    map.AddMyPK();

    map.AddTBString(MapExtAttr.Tag1, null, '执行JS脚本(可以为空)', true, true, 0, 50, 200, true, this.JSDesc);
    map.AddTBString(MapExtAttr.Tag2, null, 'Tip 提示信息(可以为空)', true, true, 0, 50, 200, true, this.DescDoc);

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
