import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

// 表格弹窗
export class MultipleChoiceSearchEn22025 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.MultipleChoiceSearchEn22025');
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
    const map = new Map('Sys_MapExt', '搜索+输入多选');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, false, this.DescSearchtip);
    map.AddBoolean(MapExtAttr.Tag, false, '是否显示签名', true, true);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=MultipleChoiceSearch&DBModel=SFTable');
    map.AddLink('Doc', '设置-搜索数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.DescTag1, 'icon-settings');

    const url2 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=MultipleChoiceList&DBModel=SFTable');
    map.AddLink('Tag1', '设置-列表数据源', url2, false, GPNReturnType.OpenUrlByDrawer50, this.DescDoc, 'icon-settings');

    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',Title,SearchTip,';
    map.AddTBAtParas();

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
   - 列表数据源，可以限定显示列表的范围，比如只显示前10行。使用于大量数据时。
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
