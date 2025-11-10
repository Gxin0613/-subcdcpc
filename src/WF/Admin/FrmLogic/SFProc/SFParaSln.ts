import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '../../GloWF';

// 转化方案
export class SFParaSln extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFParaSln');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFParaSln', '转化方案');
    // MyPK= RefPK+'_'+BH;
    map.AddMyPK();
    //对应的是： MapExt的 MyPK
    map.AddTBString('RefPKVal', null, '实体主键', false, false, 1, 200, 20);
    map.AddTBString('FrmID', null, '表单', false, false, 1, 200, 20);
    map.AddTBString('ParaKey', null, '参数标记', true, true, 1, 200, 100);
    map.AddTBString('ParaName', null, '参数名', true, true, 0, 200, 100);
    map.AddDDLStringEnum('DataType', 'String', '数据类型', '@String=String@Int=Int@Float=Float', false);
    map.AddDDLStringEnum('DBFrom', 'Frm', '数据源', '@Frm=表单数据@Normal=常量', true);
    map.AddDDLSQL('FrmAttr', null, '表单字段', GloWF.srcFrmFields, true, null, false, 300);
    map.AddTBString('Vals', null, '常量值', true, false, 0, 200, 100);
    const help = `
    #### 帮助
    - 常量是固定的值，比如：1,2,3
    - 支持ccbpm表达式，比如： @WebUser.No,  @WebUser.Name,  @WebUser.DeptNo,  @WebUser.DeptName,  @WebUser.OrgNo, 
    - 获得当前用户登录信息.
    `;
    map.SetHelperAlert('Vals', help);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = this.GetValStringByKey('RefPKVal') + '_' + this.GetValStringByKey('ParaKey');

    //DBAccess.GenerGUID(); // this.RefPK + '_' + this.BH;
    return Promise.resolve(true);
  }
}

//转化方案 s
export class SFParaSlns extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFParaSln();
  }
  constructor() {
    super();
  }
}
