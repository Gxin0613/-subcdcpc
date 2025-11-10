import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmNodeAttr } from '../FrmNode';
/// <summary>
/// 节点表单属性
/// </summary>
export class FrmNodeBatch extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmNodeBatch');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_FrmNode', '批量修改');

    map.AddMyPK();
    map.AddTBInt(FrmNodeAttr.FK_Node, 0, '节点ID', false, false);
    //   map.AddTBString(FrmNodeAttr.FK_Frm, null, '表单', true, true, 0, 300, 150);
    map.AddTBString(FrmNodeAttr.FrmNameShow, null, '表单名称', true, false, 0, 100, 100, true);

    const help2 = '控制该表单数据元素权限的方案，如果是自定义方案，就要设置每个表单元素的权限.';
    map.AddDDLSysEnum(FrmNodeAttr.FrmSln, 0, '控制方案', true, true, FrmNodeAttr.FrmSln, '@0=默认方案@1=只读方案@2=自定义方案', help2, false);

    //  map.AddBoolean(FrmNodeAttr.IsPrint, false, '打印?', true, true);
    // #region 隐藏字段.
    // const cfg = `@0=始终启用@1=有数据时启用@2=有参数时启用@3=按表单的字段表达式@4=按SQL表达式@5=不启用@6=按角色@7=按部门.`;
    // map.AddDDLSysEnum(FrmNodeAttr.FrmEnableRole, 0, '启用规则', true, true, FrmNodeAttr.FrmEnableRole, cfg);

    const help1 = '用来控制谁是表单事例的主键的方案，对于父子流程如果子流程需要在看到父流程的表单，就需要设置ParentID是主键。';
    const cfgVals = '@0=WorkID是主键@1=FID是主键(干流程的WorkID)@2=父流程OID是或者单据OID是主键@3=延续流程ID是主键@4=P2WorkID是主键@5=P3WorkID是主键';
    map.AddDDLSysEnum(FrmNodeAttr.WhoIsPK, 0, '谁是主键?', true, true, FrmNodeAttr.WhoIsPK, cfgVals, help1);
    map.AddDDLSysEnum(FrmNodeAttr.IsEnableFWC, 0, '审核组件', true, true, 'FWCSta', '@0=禁用@1=启用@2=只读');
    //签批字段
    // map.AddDDLSQL(FrmNodeAttr.CheckField, null, '签批字段', Glo.SQLOfCheckField, true);
    map.AddDDLSysEnum(FrmNodeAttr.SFSta, 0, '父子流程组件', true, true, FrmNodeAttr.SFSta, '@0=禁用@1=启用@2=只读');
    map.AddTBInt(FrmNodeAttr.Idx, 0, '序', true, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class FrmNodeBatchs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmNodeBatch();
  }
  constructor() {
    super();
  }
}
