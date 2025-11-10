import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';

// 数据源 属性列表
export class SFDBSrcAttr extends EntityNoNameAttr {
  /// 数据源类型
  public static readonly DBSrcType = 'DBSrcType';
  /// 用户编号
  public static readonly UserID = 'UserID';
  /// 密码
  public static readonly Password = 'Password';
  /// IP地址
  public static readonly IP = 'IP';
  /// 数据库名称
  public static readonly DBName = 'DBName';
  /// 链接串.
  public static readonly ConnString = 'ConnString';
}

// 数据源
export class SFDBSrc extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.SFDBSrc');
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
    const map = new Map('Sys_SFDBSrc', '数据源');
    map.AddTBStringPK(SFDBSrcAttr.No, null, '编号', true, true, 1, 50, 20);
    map.AddTBString(SFDBSrcAttr.Name, null, '名称', true, false, 0, 30, 20);
    map.AddTBString(SFDBSrcAttr.DBSrcType, null, '类型', true, true, 0, 30, 20);

    //map.AddDDLSysEnum(SFDBSrcAttr.DBSrcType, 0, '类型', true, true, SFDBSrcAttr.DBSrcType, cfg);
    map.AddTBString(SFDBSrcAttr.ConnString, null, '连接', true, false, 0, 300, 20, true);

    // 0=不转换使用标准格式,1=使用自定义的格式.
    map.AddTBInt('WebApiResultModel', 0, '数据对象标准转换模式', true, false);
    map.AddTBString('WebApiResultObjEnName', null, '业务单元', true, false, 0, 300, 20, true);
    map.AddTBString('WebApiResultObjEnNameT', null, '名称', true, false, 0, 300, 20, true);

    map.AddTBAtParas(300); //参数.
    const rm = new RefMethod();
    rm.Title = '连接测试';
    rm.ClassMethod = 'TestConn';
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  public async TestConn() {
    const en = new BSEntity('BP.Sys.SFDBSrc', this.No);
    await en.Init();
    en.No = this.No;
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoConn');
    return data;
  }

  public async GenerTables() {
    const db = new BSEntity('BP.Sys.SFDBSrc', this.No);
    await db.Retrieve();
    return await db.DoMethodReturnJSON('GetTablesJson');
  }

  public async GenerTableFields(tableName: string) {
    const db = new BSEntity('BP.Sys.SFDBSrc', this.No);
    await db.Retrieve();
    return await db.DoMethodReturnJSON('GetTableFieldsJson', tableName);
  }

  //根据内容，返回数据.
  public async ExecSrc(src: string) {
    const db = new BSEntity('BP.Sys.SFDBSrc', this.No);
    await db.Retrieve();
    return await db.DoMethodReturnJSON('xxx', src);
  }
}

//数据源s
export class SFDBSrcs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFDBSrc();
  }
  constructor() {
    super();
  }
}
