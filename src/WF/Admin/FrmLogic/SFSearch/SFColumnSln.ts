import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloWF } from '../../GloWF';

// 转化方案
export class SFColumnSln extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFColumnSln');
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
    const map = new Map('Sys_SFColumnSln', '转化方案');
    // MyPK= RefPK+'_'+BH;
    map.AddMyPK();
    //对应的是： MapExt的 MyPK
    map.AddTBString('RefPKVal', null, '实体主键', false, false, 1, 200, 20);
    map.AddTBString('FrmID', null, '表单', false, false, 1, 200, 20);
    map.AddTBString('AttrKey', null, '列英文名', true, true, 1, 200, 100);
    map.AddTBString('AttrName', null, '列中文名', true, true, 0, 200, 100);
    map.AddBoolean('IsEnable', true, '启用?', true, true);
    map.AddDDLStringEnum('DataType', 'String', '数据类型', '@String=String@Int=Int@Float=Float', false);
    // const sql=''
    map.AddDDLSQL('ToField', null, '转换列名', GloWF.srcFrmFields, true, null, false, 300);

    // map.AddTBString('ToField', null, '转换列名', true, false, 0, 200, 200);
    //   map.AddTBString('ToName', null, '中文名', true, false, 0, 200, 100);
    //角色选择.
    // map.SetPopGroupList('ToField', GloWF.srcFrmGroups, GloWF.srcFrmFields, true, '300px', '500px', '选择字段', 'icon-people');
    // map.AddDDLStringEnum('IsSys', 'String', '格式转换', '@0=不转换@1=转换ccbpm日期格式@2=内置函数转换', true);
    // map.AddTBString('FuncName', null, '函数名称', true, false, 0, 200, 100);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = DBAccess.GenerGUID(); // this.RefPK + '_' + this.BH;
    return Promise.resolve(true);
  }
}

//转化方案 s
export class SFColumnSlns extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFColumnSln();
  }
  constructor() {
    super();
  }
}
