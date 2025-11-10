import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';
import { EntityWorkID } from '/@/bp/en/EntityWorkID';

//状态
export class BillState {
  public static readonly Blank = 0;
  public static readonly Draft = 1;
  public static readonly Editing = 2;
  public static readonly Checking = 3;
  public static readonly ReturnSta = 5;
  public static readonly Cancel = 7; //作废后填报人员可编辑
  public static readonly FrmOver = 100;
  public static readonly FlowOver = 200;
}
// 单据
export class GenerBill extends EntityWorkID {
  constructor(no?: number) {
    super('TS.CCBill.GenerBill');
    this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerBill', '单据控制表');

    map.AddTBIntPK('WorkID', 0, 'WorkID', true);

    map.AddTBString('FK_FrmTree', null, '单据类别', true, false, 0, 10, 10);
    map.AddTBString('FrmID', null, '单据ID', true, false, 0, 100, 10);
    map.AddTBString('FrmName', null, '单据名称', true, false, 0, 200, 10);

    map.AddTBString('BillNo', null, '单据编号', true, false, 0, 100, 10);
    map.AddTBString('Title', null, '标题', true, false, 0, 1000, 10);
    // map.AddDDLSysEnum(GenerBillAttr.BillSta, 0, '状态(简)', true, false, GenerBillAttr.BillSta, '@0=运行中@1=已完成@2=其他');
    map.AddDDLSysEnum('BillState', 0, '单据状态', true, false, 'BillState', '@0=空白@1=草稿@2=编辑中@100=归档');

    map.AddTBString('Starter', null, '创建人', true, false, 0, 200, 10);
    map.AddTBString('StarterName', null, '创建人名称', true, false, 0, 200, 10);
    map.AddTBString('Sender', null, '发送人', true, false, 0, 200, 10);

    map.AddTBDateTime('RDT', null, '记录日期', true, true);
    map.AddTBDateTime('SendDT', null, '单据活动时间', true, true);

    map.AddTBString('CurrCheckerNos', null, '审核人编号', true, false, 0, 200, 10);
    map.AddTBString('CurrCheckerNames', null, '审核人名称', true, false, 0, 200, 10);
    map.AddTBInt('CurrIdx', 1, '当前审核人步骤', true, true);
    map.AddTBString('Msg', null, '审核信息', true, false, 0, 200, 10);

    map.AddTBString('DeptNo', null, '部门', true, false, 0, 100, 10);
    map.AddTBString('DeptName', null, '部门名称', true, false, 0, 100, 10);
    map.AddTBInt('PRI', 1, '优先级', true, true);

    map.AddTBDateTime('SDTOfNode', null, '节点应完成时间', true, true);
    map.AddTBDateTime('SDTOfFlow', null, '单据应完成时间', true, true);

    //父子单据信息.
    map.AddTBString('PFrmID', null, '父单据编号', true, false, 0, 3, 10);
    map.AddTBInt('PWorkID', 0, '父单据ID', false, false);
    map.AddDDLSysEnum('TSpan', 0, '时间段', true, false, 'TSpan', '@0=本周@1=上周@2=上上周@3=更早');

    //参数.
    map.AddTBString('AtPara', null, '参数(单据运行设置临时存储的参数)', true, false, 0, 2000, 10);
    map.AddTBString('Emps', null, '参与人', true, false, 0, 4000, 10);
    map.AddTBString('GUID', null, 'GUID', false, false, 0, 36, 10);
    map.AddTBString('FK_NY', null, '年月', false, false, 0, 7, 7);
    map.AddTBAtParas(500);
    this._enMap = map;
    return this._enMap;
  }
}

//单据s
export class GenerBills extends Entities {
  get GetNewEntity(): Entity {
    return new GenerBill();
  }
  constructor() {
    super();
  }
}
