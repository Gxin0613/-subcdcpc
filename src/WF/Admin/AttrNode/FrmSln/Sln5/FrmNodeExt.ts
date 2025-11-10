import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmNodeAttr } from '../FrmNode';
import { Glo } from '/@/WF/TSClass/Glo';
import { GPE_FrmNodeEnableRole } from './GPE_FrmNodeEnableRole';
import { GPE_FrmCtrlSln } from './GPE_FrmCtrlSln';

/// <summary>
/// 节点表单属性
/// </summary>
export class FrmNodeExt extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmNodeExt');
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
    const map = new Map('WF_FrmNode', '节点表单属性');

    map.AddGroupAttr('基本设置');
    map.AddMyPK(true);
    map.AddTBInt(FrmNodeAttr.FK_Node, 0, '节点ID', true, true);
    map.AddTBString(FrmNodeAttr.FK_Frm, null, '表单', true, true, 0, 300, 150);
    map.AddTBString(FrmNodeAttr.FrmNameShow, null, '表单名称', true, false, 0, 100, 100, true);
    map.AddBoolean(FrmNodeAttr.IsPrint, false, '是否可以打印', true, true);
    map.AddBoolean(FrmNodeAttr.IsEnableLoadData, false, '是否启用装载填充事件?', true, true);
    map.AddBoolean('IsEnableFWC', false, '是否加载审核组件?', true, true);
    map.AddBoolean('IsEnableSF', false, '是否加载父子流程组件?', true, true);

    const help = '默认为不关闭,当该表单以tab标签也打开时,是否关闭其它的tab页?';
    map.AddBoolean(FrmNodeAttr.IsCloseEtcFrm, false, '打开时是否关闭其它的页面？', true, true, true, help);

    const help1 = '用来控制谁是表单事例的主键的方案，对于父子流程如果子流程需要在看到父流程的表单，就需要设置ParentID是主键。';
    const cfgVals = '@0=WorkID是主键@1=FID是主键(干流程的WorkID)@2=父流程OID是或者单据OID是主键@3=延续流程ID是主键@4=P2WorkID是主键@5=P3WorkID是主键';
    map.AddDDLSysEnum(FrmNodeAttr.WhoIsPK, 0, '谁是主键?', true, true, FrmNodeAttr.WhoIsPK, cfgVals, help1);

    // // #region 隐藏字段.
    // const cfg = `@0=始终启用@1=有数据时启用@2=有参数时启用@3=按表单的字段表达式@4=按SQL表达式@5=不启用@6=按角色@7=按部门.`;
    //const help2 = `控制该表单数据元素权限的方案，如果是自定义方案，就要设置每个表单元素的权限.`;
    //map.AddDDLSysEnum(FrmNodeAttr.FrmSln, 0, '控制方案', true, true, FrmNodeAttr.FrmSln, '@0=默认方案@1=只读方案@2=自定义方案', help2, false);

    //单据编号对应字段
    map.AddDDLSQL(FrmNodeAttr.BillNoField, null, '单据编号对应字段', Glo.SQLOfBillNo, true);
    map.SetHelperAlert(FrmNodeAttr.FrmNameShow, '显示在表单树上的名字,默认为空,表示与表单的实际名字相同.多用于节点表单的名字在表单树上显示.');
    //map.AddDDLSysEnum(TS.WF.Template.FrmWorkCheckAttr.FWCSta, 0, "审核组件(是否启用审核组件？)", true, true);
    //add 2016.3.25.
    map.AddBoolean(FrmNodeAttr.Is1ToN, false, '是否1变N？(分流节点有效)', true, true, true);
    map.AddTBString(FrmNodeAttr.HuiZong, null, '汇总的数据表名', true, false, 0, 300, 20);
    map.SetHelperAlert(FrmNodeAttr.HuiZong, '子线程要汇总的数据表，对当前节点是子线程节点有效。');

    //模版文件，对于office表单有效.
    map.AddTBString(FrmNodeAttr.TempleteFile, null, '模版文件', true, false, 0, 500, 20);

    //是否显示.
    //map.AddTBString(FrmNodeAttr.GuanJianZiDuan, null, "关键字段", true, false, 0, 20, 20);
    map.AddGroupAttr('流程组件');
    const help1IsEnableFWC = '控制该表单是否启用审核组件？如果启用了就显示在该表单上;';
    map.AddDDLSysEnum(FrmNodeAttr.IsEnableFWC, 0, '审核组件状态', true, true, 'FWCSta', '@0=禁用@1=启用@2=只读', help1IsEnableFWC, false);
    //签批字段
    map.AddDDLSQL(FrmNodeAttr.CheckField, null, '签批字段', Glo.SQLOfCheckField, true);
    map.AddDDLSysEnum(FrmNodeAttr.SFSta, 0, '父子流程组件状态', true, true, FrmNodeAttr.SFSta, '@0=禁用@1=启用@2=只读');
    // #endregion
    map.AddTBInt(FrmNodeAttr.Idx, 0, '序号', true, false);
    // map.AddTBString(FrmNodeAttr.FrmEnableExp, null, '启用的表达式', true, false, 0, 900, 20);
    map.AddTBString(FrmNodeAttr.FK_Flow, null, '流程编号', false, false, 0, 4, 20);
    map.AddBoolean(FrmNodeAttr.IsEnableFWC, false, '启用审核组件？', true, true, true);
    map.AddTBAtParas();
    //#endregion 隐藏字段.
    //显示的.启用规则.
    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_FrmNodeEnableRole(), 'icon-drop');
    map.AddRM_GPE(new GPE_FrmCtrlSln(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class FrmNodeExts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmNodeExt();
  }
  constructor() {
    super();
  }
}
