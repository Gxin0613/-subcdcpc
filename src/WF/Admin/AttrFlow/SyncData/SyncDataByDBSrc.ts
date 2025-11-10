import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { SyncDataAttr } from './SyncData';
import { SyncDataFields } from './SyncDataField';

/// 数据同步
export class SyncDataByDBSrc extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrFlow.SyncDataByDBSrc');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_SyncData', '同步到数据库');

    map.AddMyPK();
    map.AddTBString(SyncDataAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    map.AddTBString('FrmID', null, '数据源表单', true, true, 0, 100, 50, true);
    map.AddTBString('FrmName', null, '表单名称', true, true, 0, 100, 50, true);

    map.AddTBString('DBSrc', null, '数据源ID', true, true, 0, 10, 50, true);
    map.AddTBString('DBSrcT', null, '数据源名称', true, true, 0, 10, 50, true);
    map.AddTBString('PTable', null, '数据表', true, true, 0, 100, 50);
    map.AddTBString('PTableName', null, '表名', true, true, 0, 100, 50);

    map.AddTBString('TablePKName', null, '表的主键', true, true, 0, 100, 50);
    map.AddTBString('TablePKType', null, '主键类型', true, true, 0, 100, 50);

    // map.AddTBString(SyncDataAttr.SQLTables, null, '查询表的集合SQL', false, false, 0, 100, 50);
    // map.AddTBString(SyncDataAttr.SQLFields, null, '查询表字段的SQL', false, false, 0, 100, 50);
    //  map.AddTBStringDoc(SyncDataAttr.Note, null, '备注', true, false, true);
    // const rm = new RefMethod();
    // rm.ClassMethod = 'DoDTS';
    // rm.RefMethodType = RefMethodType.Func;
    // rm.Title = '更新字段';
    // map.AddRefMethod(rm);

    // const showAttrs1 = ''; // 'EventNo,EventName,AccepterID,AccepterDoc1,AccepterDoc2,IsEnableSMS,IsEnableEmail';
    map.AddRM_DtlSearch('字段对应', new SyncDataFields(), 'RefPKVal', '', '', '', 'icon-speech', false, '');

    // map.AddRM_DtlBatch('同步字段2Batch', new SyncDataFields(), 'RefPKVal', '', '', 'icon-speech');

    this._enMap = map;
    return this._enMap;
  }
  public DoDTS() {
    return '更新成功...';
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}
