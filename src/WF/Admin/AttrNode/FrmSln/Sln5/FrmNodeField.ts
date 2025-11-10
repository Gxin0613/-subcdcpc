import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
/// 节点表单属性
export class FrmNodeField extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmNodeField');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmSln', '字段权限');

    map.AddMyPK(); // FrmID+'_'+FK_Node+'_'+KeyOfEn
    map.AddTBAtParas(4000);
    //该表单对应的表单ID
    map.AddTBString('FK_Flow', null, '流程编号', false, true, 0, 4, 4);
    map.AddTBInt('FK_Node', 0, '节点', false, true);
    map.AddTBString('FK_MapData', null, '表单ID', false, false, 0, 100, 10);
    map.AddTBString('KeyOfEn', null, '字段', false, false, 0, 200, 100);
    map.AddTBString('Name', null, '字段名', true, false, 0, 500, 100);

    //控制内容.
    map.AddBoolean('UIIsEnable', true, '可用?', true, true);
    map.AddBoolean('UIVisible', true, '可见?', true, true);
    // map.AddBoolean(MapAttrAttr.IsSigan, false, '是否签名', true, true);
    // Add 2013-12-26.
    map.AddBoolean('IsNotNull', false, '是否必填?', true, true);
    map.AddTBString('RegularExp', null, '正则表达式', true, false, 0, 500, 150);
    map.AddTBString('DefVal', null, '默认值', true, false, 0, 200, 150);
    map.AddTBString('EleType', null, 'EleType', false, true, 0, 22, 20);
    map.AddTBInt('Idx', 0, 'Idx', false, true);
    //map.AddBoolean('IsWriteToFlowTable', false, '是否写入流程表', true, true);
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class FrmNodeFields extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmNodeField();
  }

  // override async setEnActions() {
  //   this.enActions = [
  //     {
  //       label: '导入',
  //       onClick: (_pk, _selectedKeys: string) => {
  //         const myurl = GloComm.UrlGPN('GPN_ImpPMTSEntity', '&type=ZhuanYe&impType=0');
  //         return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, myurl);
  //       },
  //     },
  //   ];
  // }
  constructor() {
    super();
  }
}
