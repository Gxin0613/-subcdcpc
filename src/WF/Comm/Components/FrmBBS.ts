import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import DBAccess from '/@/utils/gener/DBAccess';
import WebUser from '/@/bp/web/WebUser';

// 评论
export class FrmBBS extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.User.FrmBBS');
    if (!!pkval) this.No = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_BBS', '评论组件表');

    //  #region 基本字段.
    map.AddTBStringPK('No', null, '编号', true, false, 0, 50, 200);
    map.AddTBString('Name', null, '标题', true, false, 0, 4000, 200);
    map.AddTBString('ParentNo', null, '父节点', true, false, 0, 50, 200);
    map.AddTBString('PKVal', null, '工作ID/OID/PKVal/No', true, false, 0, 50, 200);
    map.AddTBString('WorkID', null, '工作ID/OID/PKVal/No', true, false, 0, 50, 200);
    map.AddTBString('Docs', null, '内容', true, false, 0, 50, 200);

    map.AddTBString('Rec', null, '记录人', true, false, 0, 200, 100);
    map.AddTBString('RecName', null, '名称', true, false, 0, 200, 100);
    map.AddTBDateTime('RDT', null, '日期时间', true, false);

    //记录人部门.
    map.AddTBString('DeptNo', null, '部门编号', true, false, 0, 200, 100);
    //  map.AddTBString(FrmBBSAttr.DeptName, null, '名称', true, false, 0, 200, 100);

    //隐藏字段.
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    this.No = DBAccess.GenerGUID();
    this.Rec = WebUser.No;
    this.RecName = WebUser.Name;
    this.DeptNo = WebUser.DeptNo;
    // this.DeptName=WebUser.DeptNo;
    return Promise.resolve(true);
  }
}

//评论s
export class FrmBBSs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmBBS();
  }
  constructor() {
    super();
  }
}
