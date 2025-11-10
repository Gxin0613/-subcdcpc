import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { DataType } from '/@/bp/en/DataType';
import { SFTable } from '../../SFTable/SFTable';
import { GloWF } from '../../../GloWF';

// 表格弹窗
export class MENoNameP0 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.MENoNameP0');
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
    const map = new Map('Sys_MapExt', '编号名称字典(无参)');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本设置');
    map.AddMyPK();

    map.AddTBString('FK_MapData', null, '表单ID', true, true, 0, 50, 200);
    map.AddTBString('ExtModel', null, 'ExtModel', false, false, 0, 50, 200);
    map.AddTBString('ExtType', null, 'ExtModel', false, false, 0, 50, 200);
    map.AddTBString('AttrOfOper', null, '当前字段', true, true, 0, 50, 200);

    //const sql1 = `SELECT No,Name FROM Sys_SFTable WHERE IsPara=0 AND No!='Blank' `; //查询出来有参数的字典.
    map.AddDDLSQL('Doc', null, '字典表(无参)', GloWF.SQLOfActiveDDLDoc, true);

    map.AddTBString('Tag1', null, '数据源表达式', true, true, 0, 50, 200, true, this.HelpTag1);
    map.AddTBString('Tag2', null, '主机', true, true, 0, 50, 200, true);
    map.AddTBStringDoc('Tag3', null, '设置信息', true, true, true);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeUpdate(): Promise<boolean> {
    //判断是否选择了数据源.
    if (DataType.IsNullOrEmpty(this.Doc) == true) return Promise.resolve(true);
    const tableEn = new SFTable();
    tableEn.No = this.Doc;
    if ((await tableEn.RetrieveFromDBSources()) == 0) return Promise.resolve(true);

    this.Tag1 = tableEn.SelectStatement;
    this.Tag2 = tableEn.ConnString;

    return Promise.resolve(true);
  }

  // 参数格式
  public readonly HelpTag = ` 
  #### resufull数据源说明
  - 点击保存按钮系统自动出现【数据源表达式】.
  - 比如数据源表达式:/get_BU_PDT/{accesstoken}/{BU}
  - 标识他需要二个参数,{accesstoken} 与  {BU} ， 这个{BU}就是我们的联动的 @Key, 就是当前下拉框的选中的值.
  - 在【参数格式】里我们输入:{BU}=@Key;{accesstoken}=@WebUser.Token
  - 说明: @WebUser.Token 是系统参数, @Key 是ccform约定的参数.
  #### SQL数据源说明
  - 点击保存按钮系统自动出现【数据源表达式】.
  - 比如数据源表达式:SELECT No,Name FROM Port_Emp WHERE Name='@Key'
  - 参数格式:就可以为空,必须要输入.
  - 比如数据源表达式:SELECT No,Name FROM Port_Emp WHERE Name='@BU'
  - 参数格式: @BU=@Key;
   `;
  //数据源表达式.
  public readonly HelpTag1 = ` 
   #### 说明
   - 该字段只读
   - 当您选择一个字典的时候，点击保存该字典要获得数据的表达就会自动填充上来.
    `;

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
