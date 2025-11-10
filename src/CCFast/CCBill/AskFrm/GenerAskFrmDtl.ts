import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
// 调查问卷
export class GenerAskFrmDtl extends EntityMyPK {
  constructor(no?: string) {
    super('TS.CCBill.GenerAskFrmDtl');
    this.setPKVal(no);
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
    const map = new Map('Frm_GenerAskFrmDtl', '调查问卷');
    map.AddGroupAttr('基本设置');
    map.AddMyPK(); //主键, 对于单次格式; Frm_GenerAskFrm.MyPK +"_" + UserID , 多次的是GUID.
    map.AddTBString('RefMyPK', null, '主表MyPK', true, true, 0, 100, 10);
    map.AddTBString('UserID', null, '用户ID', true, true, 0, 100, 10);
    map.AddTBString('UserName', null, '用户名称', true, true, 0, 200, 10);
    // map.AddDDLSysEnum('UserScrop', 0, '用户类型', true, true, 'UserScrop', '@0=微信用户@1=内部用户');

    map.AddTBDateTime('RDT', null, '来访日期', true, false);
    map.AddTBDateTime('SubmitDT', null, '提交日期', true, false);

    //   map.AddTBString('AskFrmUserType', null, '问卷模式', true, false, 0, 100, 10); //AskBill.Inside,AskBill.Outside,.....

    //表单状态. askFlow= 0草稿,
    // map.AddDDLSysEnum('EntityState', 0, '状态', true, true, 'EntityState', '@0=草稿@1=保存@2=提交');

    map.AddDDLSysEnum('AskFlowState', 0, '流程状态', true, true, 'AskFlowState', '@-1=下发@0=已访问@1=草稿@2=运行中@3=已完成@9=强制结束');

    map.AddDDLSysEnum('AskBillState', 0, '表单状态', true, true, 'AskBillState', '@-1=下发@0=已访问@1=草稿@2=提交@9=强制结束');

    map.AddDDLSysEnum('AskExamState', 0, '问卷状态', true, true, 'AskExamState', '@-1=下发@0=已访问@1=草稿@2=提交@9=强制结束');

    map.AddTBString('IP', null, 'IP', true, true, 0, 100, 10);

    this._enMap = map;
    return this._enMap;
  }
}

//调查问卷s
export class GenerAskFrmDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GenerAskFrmDtl();
  }
  constructor() {
    super();
  }
}
