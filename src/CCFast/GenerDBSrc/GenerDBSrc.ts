import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
export class GenerDBSrc extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCFast.GenerDBSrc');
    if (!!pkVal) this.setPKVal(pkVal);
  }
  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_GenerDBSrc', '数据源存储');

    map.AddMyPK();
    map.AddTBString('DoWay', null, '执行方式', true, false, 0, 100, 20); // 数据源类型: Node, SelfSQL,SelfWebApiGet,SelfWebApiPost,StaticData,SearchDBSrc,ProDBSrc
    map.AddTBString('ObjModel', null, '控制实体方式', true, false, 0, 100, 20); // Frm,Flow,Node,Rpt   String类型的枚举.
    map.AddTBString('DBModel', null, '数据模式', true, false, 0, 100, 20); // Search,SFTable,SFProc.

    map.AddTBString('RptID', null, '报表ID', true, false, 0, 100, 20); // , PageID
    map.AddTBString('FrmID', null, '表单ID', true, false, 0, 100, 20); // 表单ID, PageID
    map.AddTBString('FlowNo', null, '流程ID', true, false, 0, 30, 20); // string类型的枚举, Rpt,Frm,Node,Flow......
    map.AddTBInt('NodeID', 0, '节点ID', true, false); //操作的模块: 比如:大屏的Windows No.

    map.AddTBString('OperID1', null, '操作对象1', true, false, 0, 300, 20); //对于2级属性
    map.AddTBString('OperID2', null, '操作对象2', true, false, 0, 300, 20);
    map.AddTBString('MarkID', null, '标记ID', true, false, 0, 300, 20); //数据源标识, 比如：大屏的windows 一个数据源.

    //数据源相关.
    map.AddTBString('DBSrc', 'local', '数据源', true, false, 0, 100, 20);
    map.AddTBString('Doc', null, '配置内容', true, false, 0, 2000, 20);

    //WebApi相关.
    map.AddTBString('Url', null, 'Url', true, false, 0, 2000, 20);
    map.AddTBString('PostModel', null, 'PostModel', true, false, 0, 2000, 20);
    map.AddTBString('HeadDoc', null, 'HeadDoc', true, false, 0, 2000, 20);
    map.AddTBString('BodyDoc', null, 'BodyDoc', true, false, 0, 2000, 20);

    map.AddTBString('AtPara', null, 'AtPara', true, false, 0, 2000, 20);

    this._enMap = map;

    return this._enMap;
  }
}

//数据源存储s
export class GenerDBSrcs extends EntitiesMyPK {
  get GetNewEntity(): GenerDBSrc {
    return new GenerDBSrc();
  }

  constructor() {
    super();
  }
}
