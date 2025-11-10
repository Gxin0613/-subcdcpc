import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import BSEntity from '/@/utils/gener/BSEntity';
import WebUser from '/@/bp/web/WebUser';

export class SrcType extends EntityNoNameAttr {
  //本地的类
  public static readonly BPClass = '0';
  //创建表
  public static readonly CreateTable = '1';
  //表或视图
  public static readonly LocalDBTableOrView = '2';
  //SQL查询表
  public static readonly SQLTable = '3';
  // WebServices
  public static readonly WebServices = '4';
  // 微服务Handler外部数据源
  public static readonly Handler = '5';
  // JavaScript外部数据源
  public static readonly JSFunction = '6';
  // 系统字典表
  public static readonly SysDict = '7';
  // WebApi接口
  public static readonly WebApi = '8';
}

export class SFTableAttr extends EntityNoNameAttr {
  public static readonly DBSrcType = 'DBSrcType';
  public static readonly CodeStruct = 'CodeStruct';
  public static readonly FK_Val = 'FK_Val';
  public static readonly TableDesc = 'TableDesc';
  public static readonly DefVal = 'DefVal';
  public static readonly FK_SFDBSrc = 'FK_SFDBSrc';
  public static readonly SrcTable = 'SrcTable';

  public static readonly ColumnValue = 'ColumnValue';
  public static readonly ColumnText = 'ColumnText';
  public static readonly ParentValue = 'ParentValue';
  public static readonly SelectStatement = 'SelectStatement';
  public static readonly RDT = 'RDT';
  //系统字典表的编号生成规则?
  public static readonly NoGenerModel = 'NoGenerModel';
  public static readonly RootVal = 'RootVal';
}

// 字典表
export class SFTable extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTable');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Sys_SFTable', '字典表');

    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 200, 100);
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 100);

    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), true);
    map.AddTBString(SFTableAttr.DBSrcType, null, '数据源类型', false, false, 0, 200, 100);
    map.SetHelperAlert('DBSrcType', ' WebApi,SQL,SysDict,EnTable,');
    //'@0=无参@1=有1参数@2=有n参数'
    //map.AddTBInt('IsPara', 0, '参数', false, false);
    //map.AddDDLSysEnum('IsPara', 0, '参数个数', true, true, 'IsPara', '@0=无参数@1=有1个参数@2=有多个参数');

    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典结构', true, false, 'CodeStruct', '@0=编号名称类型@1=树结构类型');
    map.AddTBString(SFTableAttr.RootVal, null, 'RootVal', false, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.FK_Val, null, '默认创建的字段名', false, false, 0, 200, 150);
    map.AddTBString(SFTableAttr.DefVal, null, '默认值', false, false, 0, 200, 50);
    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, false, 'IsPara', '@0=无参数@1=有参数');

    // //数据源.
    // map.AddTBString(SFTableAttr.FK_SFDBSrc, null, '数据源', false, false, 0, 18, 50);
    map.AddTBString(SFTableAttr.ParentValue, null, '父级值(父级列)', false, false, 0, 200, 20);
    map.AddTBString(SFTableAttr.SelectStatement, null, '查询语句', false, false, 0, 1000, 600, true);
    map.AddTBString(SFTableAttr.TableDesc, null, '备注', true, true, 0, 200, 190);
    map.AddDDLSysEnum(SFTableAttr.NoGenerModel, 1, '编号生成规则', true, true, SFTableAttr.NoGenerModel, '@0=自定义@1=流水号@2=标签的全拼@3=标签的简拼@4=按GUID生成');
    map.AddTBDate(SFTableAttr.RDT, null, '创建日期', false, false);
    map.AddTBString('ConnString', null, 'Web服务地址', false, false, 0, 200, 20, true);

    map.AddTBString('OrgNo', null, 'OrgNo', true, true, 0, 200, 190);
    map.AddTBAtParas();

    //设置查询查询.
    map.AddSearchAttr('FK_SFDBSrc');
    map.AddSearchAttr('CodeStruct');
    //map.AddSearchAttr('IsPara');

    //map.AddSearchAttr('CodeStruct');
    // const rm = new RefMethod();
    // rm.Title = '查看数据';
    // rm.ClassMethod = this.ToString() + '.DoEdit';
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.OrgNo = WebUser.OrgNo;
    return Promise.resolve(true);
  }
  //生成数据.
  public async GenerData(paras = '&Para=xxx&Key=xxx') {
    const en = new BSEntity('BP.Sys.SFTable', this.No);
    en.setPK(this.No);
    await en.RetrieveFromDBSources();
    const da = await en.DoMethodReturnJSON('GenerJsonByPara', paras);
    return da;
  }
}

//字典表 s
export class SFTables extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTable();
  }
  constructor() {
    super();
  }
  //获得空白的SQL实体,用于创建外部字段.
  public static async Init_Blank() {
    const en = new SFTable();
    en.No = 'Blank';
    if ((await en.RetrieveFromDBSources()) == 1) return en;

    en.IsPara = 0;
    en.Name = '空白(系统内置)';
    //en.DictSrcType = 3;
    en.IsPara = 0;
    en.DBSrcType = 'SQL';
    en.FK_Val = 'Blank';
    en.SelectStatement = 'SELECT No,Name FROM Port_StationType WHERE 1=2';
    en.SetPara('EnName', 'TS.FrmUI.SFTableSQLNoName');
    await en.Insert();
    return en;
  }
}
