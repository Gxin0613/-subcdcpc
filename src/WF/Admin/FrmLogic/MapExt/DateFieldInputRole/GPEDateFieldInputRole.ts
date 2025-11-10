import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloWF } from '../../../GloWF';

// 表格弹窗
export class GPEDateFieldInputRole extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEDateFieldInputRole');
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
    const map = new Map('Sys_MapExt', '日期输入规则');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();

    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 0, 100, 100);
    map.AddDDLStringEnum(MapExtAttr.Tag, 'GTE', '运算符', '@GT=大于@GTE=大于等于@IT=小于@ITE=小于等于@EQ=等于@NEQ=不等于', true, null, false);

    // const sql = `
    //  SELECT KeyOfEn as No, Name FROM Sys_MapAttr
    //  WHERE MyDataType IN(6,7) AND UIVisible=1 AND UIIsEnable=1 AND FK_MapData='@FK_MapData'`;
    map.AddDDLSQL(MapExtAttr.Tag1, null, '日期字段', GloWF.SQLOfDateFieldInputRole, true, null, true);

    //map.AddRadioBtn(MapExtAttr.Tag, 0, '选择计算方式', true, true, 'JieJiaRi', '@0=不计算节假日@1=计算节假日');
    //参数字段.  @SelectType=1@IsEnter=0
    // map.ParaFields = ',SelectType,IsEnter,Title,BtnLab,SearchTip,ShowModel,MultipleSelectType,';

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
