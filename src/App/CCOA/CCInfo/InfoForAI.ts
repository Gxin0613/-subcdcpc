import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { InfoType } from './InfoType';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
/// 信息
export class InfoForAI extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCInfo.InfoForAI');
    if (!!pkVal) this.setPKVal(pkVal);
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
    const map = new Map('OA_Info', '信息');

    map.AddGroupAttr('AI');
    map.AddTBString('AIWord', null, 'AI提示词', true, false, 0, 300, 100, true);
    map.AddTBString('TopicNo', null, '关键字', false, false, 0, 300, 100, true);

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', false, true, 1, 59, 59);

    map.AddTBString('KeyWords', null, '关键字', true, false, 0, 300, 100, true);
    map.SetPopList('KeyWords', 'App_Info_Keywords', true, '400px', '500px', '选择', 'icon-people');
    map.AddTBString('Name', null, '标题', true, false, 0, 100, 200, true);
    map.AddRichText('Docs', null, '内容', true, false, true);
    map.AddDDLEntities('InfoType', '01', '类型', new InfoType(), true);
    map.AddDDLSysEnum('InfoSta', 0, '状态', true, true, 'InfoSta', '@0=发布中@1=禁用');
    map.AddTBString('NianYue', null, '隶属年月', false, false, 0, 10, 10);

    map.AddGroupAttr('记录信息');
    map.AddTBDateTime('RDT', null, '记录日期', true, true);
    map.AddTBString('RecNo', null, '记录人编号', true, true, 0, 150, 100);
    map.AddTBString('RecName', null, '记录人名称', true, true, 0, 200, 100);
    map.AddTBString('RecDeptNo', null, '部门编号', true, true, 0, 150, 100);
    map.AddTBString('RecDeptName', null, '部门名称', true, true, 0, 200, 100);

    map.AddGroupMethod('基础设置');
    const rm = new RefMethod();
    rm.Title = 'AI生成';
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    //记录信息.
    this.RDT = DataType.CurrentDateTime;
    this.RecNo = WebUser.No;
    this.RecName = WebUser.Name;
    this.RecDeptNo = WebUser.DeptNo;
    this.RecDeptName = WebUser.DeptName;
    return Promise.resolve(true);
  }
}

/**
 * 信息 s
 */
export class InfoForAIs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new InfoForAI();
  }
  constructor() {
    super();
  }
}
