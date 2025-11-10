import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkRecDtl, WorkRecDtlAttr, WorkRecDtls } from './WorkRecDtl';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { DataType } from '/@/bp/en/DataType';
import { SubTablePostion } from '/@/bp/en/Config';
/// 工作日志
export class WorkRec extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCOA.WorkRec');
    if (!!pkVal) {
      this.MyPK = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('OA_WorkRec', '工作日志');
    map.AddMyPK();
    map.AddDDLSysEnum('WorkRecModel', 0, '模式', true, false, 'WorkRecModel', '@0=日志@1=周报@2=月报');
    map.AddTBDateTime('RDT', '@RDT', '记录时间', true, true);

    map.AddTBStringDoc('Doc1', null, '总结', true, false, true);
    map.SetHelperAlert('Doc1', '本日内容，明日计划，遇到的问题.');
    // map.AddTBStringDoc('Doc2', null, '明日内容', true, false, true);
    // map.AddTBStringDoc('Doc3', null, '遇到的问题', true, false, true);

    map.AddTBFloat('HeiJiHour', 0, '合计小时', true, true);
    map.AddTBInt('NumOfItem', 0, '项目数', true, true);

    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString('RecNo', null, '记录人', false, false, 0, 100, 10, true);
    map.AddTBString('RecName', null, '记录人名称', false, false, 0, 100, 10, true);

    map.AddTBDate('RiQi', null, '隶属日期', false, false);
    map.AddTBString('NianYue', null, '年月', false, false, 0, 10, 10);
    map.AddTBString('NianDu', null, '年度', false, false, 0, 10, 10);
    // map.AddMyFile('附件');
    map.AddRM_DtlBatch('日志Batch', new WorkRecDtls(), WorkRecDtlAttr.RefPK, '', '', 'icon-drop', '', SubTablePostion.Tab);
    // map.AddRM_DtlSearch('日志Search', new WorkRecDtls(), WorkRecDtlAttr.RefPK, '', '', '', 'icon-settings', false);

    //日志.
    map.AddSearchAttr('WorkRecModel');
    map.DTSearchKey = 'RDT';
    map.DTSearchWay = DTSearchWay.ByDateRange;
    map.DTSearchLabel = '记录日期'; // = DTSearchWay.ByDate;

    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeInsert(): Promise<boolean> {
    //日期.
    this.RDT = DataType.CurrentDateTime;

    for (let index = 0; index < 3; index++) {
      const en = new WorkRecDtl();
      en.RefPK = this.MyPK;
      await en.Insert();
    }

    return Promise.resolve(true);
  }
}

/**
 * 工作日志 s
 */
export class WorkRecs extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new WorkRec();
  }
  constructor() {
    super();
  }
}
