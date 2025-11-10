import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';

// 表格弹窗
export class MultipleChoiceSearchEn1 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.MultipleChoiceSearchEn1');
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
    const map = new Map('Sys_MapExt', '搜索多选');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, this.DescSearchTip);
    map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddRadioBtn('MultipleSelectType', 1, '选择类型', true, true, 'MultipleSelectType', '@0=单选@1=多选', null, true);
    map.AddTBString(MapExtAttr.Doc, null, '数据源表达式', true, false, 0, 2000, 200, true, this.DescTag2);
    map.ParaFields = ',SearchTip,MultipleSelectType,';
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
  public readonly DescSearchTip = `
  #### 说明
  - 显示在搜索文本框的背景文字.
  - 输入城市名称,比如:beijing,bj,进行搜索.
  - 人员的编号,名称,拼音,进行模糊搜索.
  
  `;
  public readonly DescTag2 = ` 
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
