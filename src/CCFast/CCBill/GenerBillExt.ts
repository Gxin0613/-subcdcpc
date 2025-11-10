import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';
import { EntityWorkID } from '/@/bp/en/EntityWorkID';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
// 单据
export class GenerBillExt extends EntityWorkID {
  constructor(no?: number) {
    super('TS.CCBill.GenerBillExt');
    this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    uac.IsView = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerBill', '单据查询');

    map.AddTBIntPK('WorkID', 0, 'WorkID');
    map.AddTBString('FrmID', null, '单据ID', false, false, 0, 100, 10);
    map.AddTBString('FrmName', null, '单据', true, true, 0, 200, 130);
    map.AddTBString('BillNo', null, '单号', true, true, 0, 100, 80);
    map.AddTBString('Title', null, '标题', true, true, 0, 500, 220);

    map.AddDDLSysEnum('BillState', 0, '单据状态', true, false, 'BillState', '@0=空白@1=草稿@2=编辑中@3=审核中@100=归档');

    map.AddTBString('Starter', null, '创建人', false, false, 0, 200, 10);
    map.AddTBString('StarterName', null, '创建人', true, true, 0, 200, 80);

    map.AddTBDateTime('RDT', null, '创建日期', true, true);
    map.AddTBString('DeptName', null, '部门名称', true, true, 0, 100, 130);

    //父子单据信息.
    map.AddTBString('PFrmID', null, '父单据编号', false, false, 0, 3, 10);
    map.AddTBInt('PWorkID', 0, '父单据ID', false, false);

    //参数.
    map.AddTBString('AtPara', null, '参数(单据运行设置临时存储的参数)', false, false, 0, 300, 10);
    map.AddTBString('Emps', null, '参与人', true, true, 0, 300, 180);
    map.AddTBString('GUID', null, 'GUID', false, false, 0, 36, 10);
    map.AddTBString('FK_NY', null, '年月', false, false, 0, 7, 7);
    map.AddSearchAttr('BillState');
    map.AddHidden('BillState', '>', '0');
    map.DTSearchWay = DTSearchWay.ByDateRange;
    map.DTSearchKey = 'RDT';
    this._enMap = map;
    return this._enMap;
  }
}

//单据s
export class GenerBillExts extends Entities {
  get GetNewEntity(): Entity {
    return new GenerBillExt();
  }
  constructor() {
    super();
  }
}
