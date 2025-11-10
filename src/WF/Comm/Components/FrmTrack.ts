import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import DBAccess from '/@/utils/gener/DBAccess';
import WebUser from '/@/bp/web/WebUser';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// 表单轨迹表
export class FrmTrack extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.FrmTrack');
    if (!!pkval) this.setPKVal(pkval);
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
    const map = new Map('Frm_Track', '开发中');

    map.AddMyPK(); //组合主键.

    map.AddTBString('FrmID', null, '表单ID', true, false, 0, 50, 200);
    map.AddTBString('FrmName', null, '表单名称', true, false, 0, 50, 200);
    map.AddTBString('WorkID', null, '工作ID/OID', true, false, 0, 100, 100);

    map.AddTBString('FlowNo', null, '动作编号', true, false, 0, 30, 100);
    map.AddTBString('FlowName', null, '动作名称', true, false, 0, 100, 100);

    map.AddTBString('ActionType', null, '类型', true, false, 0, 30, 100);
    map.AddTBString('ActionTypeText', null, '类型(名称)', true, false, 0, 30, 100);
    map.AddTBString('Msg', null, '消息', true, false, 0, 300, 3000);

    map.AddTBString('DB', null, '数据', true, true, 0, 4000, 100);

    map.AddTBString('RecNo', null, '记录人', true, false, 0, 200, 100);
    map.AddTBString('RecName', null, '名称', true, false, 0, 200, 100);
    map.AddTBDateTime('RDT', null, '日期时间', true, false);
    map.AddTBString('DeptNo', null, '部门编号', true, false, 0, 200, 100);
    map.AddTBString('DeptName', null, '部门名称', true, false, 0, 200, 100);
    map.AddTBInt('FrmTrackSta', 0, '组件状态', false, true, false);
    map.AddTBAtParas(3000);

    // //流程信息.
    // map.AddTBInt('FID', 0, 'FID', true, false);
    // map.AddTBString('FlowNo', null, '流程ID', true, false, 0, 20, 20);
    // map.AddTBString('FlowName', null, '流程名称', true, false, 0, 200, 200);
    // map.AddTBInt('NodeID', 0, '节点ID', true, false);
    // map.AddTBString('NodeName', null, '节点名称', true, false, 0, 200, 200);
    // map.AddTBInt('WorkIDOfFlow', 0, '工作ID/OID', true, false);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    this.Rec = WebUser.No;
    this.RecName = WebUser.Name;
    this.DeptNo = WebUser.DeptNo;
    // this.DeptName=WebUser.DeptNo;
    return Promise.resolve(true);
  }
}

//表单轨迹表s
export class FrmTracks extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmTrack();
  }
  constructor() {
    super();
  }
}
