import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GL_FieldsORM } from '/@/CCFast/CCBill/DBList/GL_FieldsORM';
import HttpHandler from '/@/utils/gener/HttpHandler';
// import { FrmBillAttr } from './FrmBill';

//属性列表
export class DBListAttr extends FrmAttr {
  public static readonly MainTable = 'MainTable';
  public static readonly MainTablePK = 'MainTablePK';
}

// 数据源实体
export class DBList extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.DBList');
    if (!!pkval) this.No = pkval;
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
    const map = new Map('Sys_MapData', '数据源实体');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddTBString(MapDataAttr.PTable, null, '视图名称', false, false, 0, 500, 20, true);

    //#region 数据源.
    map.AddGroupAttr('数据源&实体数据');
    //map.AddDDLSysEnum(MapDataAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=数据库SQL查询@1=WebAPI返回的JSON数据@2=执行存储过程');
    map.AddDDLEntities(MapDataAttr.DBSrc, 'local', '数据源', new SFDBSrc(), true, null, true);
    map.AddTBStringDoc(MapDataAttr.ExpEn, null, '实体数据源表达式', true, false, true);
    map.SetHelperAlert('ExpEn', '可以创建视图的SQL表达式:必须包含:OID,BillNo,Title,字段.');
    map.AddTBStringDoc(MapDataAttr.ExpList, null, '列表数据源', true, false, true);

    // #endregion 数据源实体.
    //增加参数字段.
    map.AddTBAtParas(4000);

    map.AddRM_GL(new GL_FieldsORM(), '编辑数据字段格式', 'icon-eye');
    const rm = new RefMethod();
    rm.Title = '同步数据字段';
    rm.ClassMethod = 'DTSField';
    rm.Icon = 'icon-energy';
    rm.Visable = true;
    rm.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm);
    this._enMap = map;
    return this._enMap;
  }
  public async DTSField() {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_DBList');
    handler.AddPara('FrmID', this.No);
    handler.AddPara('Ver', 'Vue3');
    const reuslt = await handler.DoMethodReturnString('FieldsORM_App');
    return '同步成功' + reuslt;
  }
}

//数据源实体s
export class DBLists extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new DBList();
  }
  constructor() {
    super();
  }
}
