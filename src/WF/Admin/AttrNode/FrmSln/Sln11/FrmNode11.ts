import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmNodeAttr } from '../FrmNode';
import { Glo } from '/@/WF/TSClass/Glo';
import { GPE_FrmCtrlSln } from '../Sln5/GPE_FrmCtrlSln';
import { Flow } from '/@/WF/TSClass/Flow';
import { FlowDevModel } from '../../../EnumLab';

/// <summary>
/// 节点表单属性
/// </summary>
export class FrmNode11 extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmNode11', 'BP.WF.Template.FrmNode');
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
    const map = new Map('WF_FrmNode', '表单节点权限');

    map.AddMyPK(true);
    map.AddTBInt(FrmNodeAttr.FK_Node, 0, '节点ID', true, true);
    map.AddTBString(FrmNodeAttr.FK_Frm, null, '表单', true, true, 0, 300, 150);
    map.AddTBString(FrmNodeAttr.FK_Flow, null, '流程编号', true, true, 1, 10, 20);
    map.AddTBString(FrmNodeAttr.FrmNameShow, null, '表单名称', true, false, 0, 100, 100, true);

    const help1 = '用来控制谁是表单事例的主键的方案，对于父子流程如果子流程需要在看到父流程的表单，就需要设置ParentID是主键。';
    const cfgVals = '@0=WorkID是主键@1=FID是主键(干流程的WorkID)@2=父流程OID是或者单据OID是主键或者实体OID@3=延续流程ID是主键@4=P2WorkID是主键@5=P3WorkID是主键';
    map.AddDDLSysEnum(FrmNodeAttr.WhoIsPK, 0, '谁是主键?', true, true, FrmNodeAttr.WhoIsPK, cfgVals, help1);
    map.AddBoolean(FrmNodeAttr.IsEnableLoadData, false, '是否启用装载填充事件', true, true);
    map.AddBoolean(FrmNodeAttr.IsEnableFWC, false, '是否启用审核组件？(对多表单有效)', true, true);
    map.AddBoolean(FrmNodeAttr.SFSta, false, '是否启用父子流程组件？(对多表单有效)', true, true);

    //单据编号对应字段
    map.AddDDLSQL(FrmNodeAttr.BillNoField, null, '单据编号对应字段', Glo.SQLOfBillNo, true);

    //单据编号对应字段
    //map.AddDDLSQL(FrmNodeAttr.BillNoField, null, '单据编号对应字段', Glo.SQLOfBillNo, true);
    //map.SetHelperAlert(FrmNodeAttr.FrmNameShow, '显示在表单树上的名字,默认为空,表示与表单的实际名字相同.多用于节点表单的名字在表单树上显示.');
    // const help1IsEnableFWC = `控制该表单是否启用审核组件？如果启用了就显示在该表单上;`;
    // map.AddDDLSysEnum(FrmNodeAttr.IsEnableFWC, 0, '审核组件状态', true, true, 'FWCSta', '@0=禁用@1=启用@2=只读', help1IsEnableFWC, false);

    //签批字段
    //  map.AddDDLSQL(FrmNodeAttr.CheckField, null, '签批字段', Glo.SQLOfCheckField, true);
    // map.AddDDLSysEnum(FrmNodeAttr.SFSta, 0, '父子流程组件状态', true, true, FrmNodeAttr.SFSta, '@0=禁用@1=启用@2=只读');

    map.AddTBAtParas();
    //#endregion 隐藏字段.
    //显示的
    //启用规则.
    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_FrmCtrlSln(), 'icon-drop');

    //批量设置审核组件的状态.
    map.AddRM_EnOnly('审核组件', 'TS.WF.Template.NodeWorkCheck', '@FK_Node', 'icon-note');
    map.AddRM_EnOnly('子流程组件', 'TS.WF.Template.FrmSubFlowNode', '@FK_Node', 'icon-organization');

    map.AddMapLoader(async () => {
      const params = new URLSearchParams(location.hash.split('?')[1]);
      const flowNo = (params.get('FlowNo') || params.get('PKVal')) as string;
      const flow = new Flow(flowNo);
      await flow.Retrieve();
      if (flow.FlowDevModel === FlowDevModel.Prefessional) {
        const id = this.GetValByKey('FK_Node');
        const url = '/#/WF/Designer/Form?FrmID=ND' + id;
        map.AddRM_UrlLinkeWinOpen('设计节点表单', url);
      }
    });

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点表单属性s
 */
export class FrmNode11s extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmNode11();
  }
  constructor() {
    super();
  }
}
