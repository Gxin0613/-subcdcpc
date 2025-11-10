import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
import { GloWF } from '../../../GloWF';

// 表格弹窗
export class GPEActiveDDL extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEActiveDDL');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '级联下拉框');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 0, 50, 200);
    map.AddTBString(MapExtAttr.ExtModel, null, 'ActiveDDL', false, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.ExtType, null, 'ActiveDDL', false, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '当前字段', true, true, 0, 50, 200);

    //const sql = ` SELECT KeyOfEn AS No, Name FROM Sys_MapAttr WHERE FK_MapData='@FK_MapData'  AND UIContralType=2  `;
    map.AddDDLSQL(MapExtAttr.AttrsOfActive, null, '联动的字段', GloWF.SQLOfAttrsOfActive(), true);

    map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBString(MapExtAttr.Doc, null, '数据源表达式', true, false, 0, 50, 200, true, this.DescDoc);

    this._enMap = map;
    return this._enMap;
  }

  public readonly DescSearchtip = ` 
  #### 说明
  - 显示在搜索文本框的背景文字.
  - 输入城市名称,比如:beijing,bj,进行搜索.
  - 人员的编号,名称,拼音,进行模糊搜索.
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
