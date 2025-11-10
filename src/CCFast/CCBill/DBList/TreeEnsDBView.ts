import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import BSEntity from '/@/utils/gener/BSEntity';

// 数据源实体
export class TreeEnsDBView extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.TreeEnsDBView');
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
    const map = new Map('Sys_MapData', '左树右表视图');
    map.CodeStruct = '4';
    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20);
    map.AddTBString(MapDataAttr.PTable, null, '视图名称', false, false, 0, 500, 20);

    //#region 数据源.
    map.AddDDLEntities(MapDataAttr.DBSrc, 'local', '数据源', new SFDBSrc(), true, null, true);
    map.AddTBStringDoc(MapDataAttr.ExpList, null, '左树表达式', true, false, true);
    map.SetHelperAlert('ExpList', 'SQL表达式:必须包含:No,Name,ParentNo,字段.');
    map.AddTBStringDoc(MapDataAttr.ExpEn, null, '实体表达式', true, false, true);
    map.AddTBStringDoc('Tag0', null, '实体查询表达式', true, false, true);

    map.AddTBString('Note', null, '实体列对应的中文名字', true, false, 0, 200, 200, true);
    //map.AddTBString('RefPK',null,'树形和实体关联的字段',true,false,0,20,20,true);
    map.AddTBString('RootNo', null, '根节点', true, false, 0, 20, 20);
    map.AddBoolean('IsLazy', false, '是否懒加载', true, true, true);

    map.ParaFields = ',Note,IsLazy,RootNo,';
    map.AddTBAtParas(4000);

    this._enMap = map;
    return this._enMap;
  }
  public async DTSField() {
    const dbEntity = new BSEntity('BP.CCBill.SearchBillView');
    dbEntity.setPK(this.No);
    await dbEntity.Retrieve();
    const data = await dbEntity.DoMethodReturnString('CheckGLGenerList');

    return '执行成功:' + data;
  }
}

//数据源实体s
export class TreeEnsDBViews extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new TreeEnsDBView();
  }
  constructor() {
    super();
  }
}
