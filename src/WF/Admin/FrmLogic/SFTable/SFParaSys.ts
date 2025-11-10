import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import WebUser from '/@/bp/web/WebUser';

// 参数
export class SFParaSys extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFParaSys');
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
    const map = new Map('Sys_SFPara', '内置参数');

    map.AddMyPK();
    map.AddTBString('RefPKVal', null, '实体主键', false, false, 1, 200, 20);
    map.AddTBString('ParaKey', null, '参数标记', true, true, 1, 200, 100);
    map.AddTBString('Alias', null, '别名', true, false, 0, 200, 100);

    map.AddTBString('ParaName', null, '参数名称', true, true, 0, 200, 100);

    map.AddDDLStringEnum('DataType', 'String', '数据类型', '@String=String@Int=Int@Float=Float@Json=Json', false, '', false, 100);
    map.AddDDLStringEnum('IsSys', 'String', '获取类型', '@0=内部@1=外部', false, '', false, 100);
    map.AddTBString('DefVal', null, '默认值', true, false, 0, 200, 100);
    map.AddTBString('OrgNo', null, 'OrgNo', false, false, 0, 200, 100);
    map.AddTBInt('Idx', 0, '序号', true, true);
    map.AddTBAtParas(1000);
    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = this.GetValStringByKey('RefPKVal') + '_' + this.GetValStringByKey('ParaKey');

    this.OrgNo = WebUser.OrgNo;
    return Promise.resolve(true);
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    this.MyPK = this.GetValStringByKey('RefPKVal') + '_' + this.GetValStringByKey('ParaKey');
    if (!this.DataType) this.DataType = 'String';
    return Promise.resolve(true);
  }
}
