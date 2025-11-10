import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

// Api参数
export class SFApiPara extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SFApiPara');
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
    const map = new Map('Sys_SFApiPara', 'WebApi数据源参数');
    // MyPK= RefPK+'_'+BH;
    map.AddMyPK();
    map.AddTBString('DBSrcNo', null, '数据源', false, false, 1, 200, 20);
    map.AddTBString('AttrKey', null, '参数ID', true, true, 1, 200, 100);
    map.AddTBString('AttrName', null, '参数名称', true, false, 0, 200, 100);
    map.AddDDLSysEnum('ApiParaModel', 0, '模式', true, false, 'ApiParaModel', '@0=常量@1=业务单元@2=SQL表达式');
    map.AddDDLSysEnum('ApiParaStore', 0, '存储位置', true, true, 'ApiParaStore', '@0=存储到Cookies(比如:token)@1=(不存储)即时计算');
    map.AddDDLSysEnum('DataType', 1, '数据类型', true, true, 'ParaDataType', '@1=String@2=Int@3=Float');
    map.AddTBStringDoc('ExpDoc', null, '表达式', true, false, true);
    // map.AddTBInt('Idx', 0, '序', true, false, false);

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

//Api参数 s
export class SFApiParas extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SFApiPara();
  }
  constructor() {
    super();
  }
}
