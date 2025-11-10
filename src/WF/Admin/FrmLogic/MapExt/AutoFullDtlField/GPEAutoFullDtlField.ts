import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloWF } from '../../../GloWF';

// 表格弹窗
export class GPEAutoFullDtlField extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEAutoFullDtlField');
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
    //const sql = `SELECT No,Name From Sys_MapDtl WHERE FK_MapData='@FK_MapData'`;
    map.AddDDLSQL(MapExtAttr.Doc, null, '从表', GloWF.SQLOfAutoFullDtlField, true);
    map.AddTBString(MapExtAttr.FK_MapData, null, '对应的表单', false, false, 0, 50, 200, true, this.DescDoc);

    //查询出来，所有数值类型的字段.
    // const mysql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@FK_MapData'
    // AND UIContralType=0 AND MyDataType IN (2,5,8)  AND KeyOfEn!='OID' `;
    map.AddTBString(MapExtAttr.Tag1, null, '输入列', true, false, 0, 50, 200, true, this.DescTag1);
    // map.AddDDLSQL('Tag1', '', '选择列', GloWF.sqlMapAttrNumberFields, true, null, true);
    //角色选择.
    map.SetPopList('Tag1', GloWF.sqlMapAttrNumberFields, false, '400px', '300px', '选择字段', 'icon-people');
    // map.AddTBString(MapExtAttr.Tag1, null, '输入列', true, false, 0, 50, 200, true, this.DescTag1);

    map.AddBoolean('Tag2', false, '计算后要触发的脚本函数', true, true, true, this.JSDesc);
    map.AddDDLStringEnum(MapExtAttr.Tag, 'Sum', '计算方式', '@Sum=求和@Avg=求平均@Max=求最大@Min=求最小', true, null, false);

    map.AddBoolean('Tag3', false, '对其它只读string字段进行大写转换', true, true, true, this.JSDesc);
    map.AddTBString(MapExtAttr.Tag4, null, '只读字段名', true, false, 0, 50, 200, true, this.DescTag1);

    const help = `##### 帮助
    - 过滤表达式是: 从表的字段名=值, 比如:SRType=1
    - 比如从表里有一个枚举字段收入类型(SRType)：营业收入=0，非营业收入=1. 一个数值字段，收入ShouRu:
    - 主表有两个字段数值类型字段：营业收入, 非营业收入, 要对从表列进行求和，这个场景就需要借助表达式.
    - 支持:  SRType = 001,002,003 格式,多个值使用逗号拼接.

    `;
    map.AddTBString(MapExtAttr.Tag5, null, '计算过滤表达式', true, false, 0, 50, 200, true, help);

    // map.AddBoolean('Tag5', false, '过滤表达', true, true, true, this.JSDesc);

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
