import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmNodeAttr } from '../FrmNode';
import { FrmNodeFields } from './FrmNodeField';
import { MapDtlSlns } from './MapDtlSln';
import { FrmAttachmentSlns } from '/@/WF/Admin/AttrNode/FrmSln/Sln5/FrmAttachmentSln';

/// <summary>
/// 节点表单属性
/// </summary>
export class FrmNodeCtrlSln extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.FrmNodeCtrlSln', 'BP.WF.Template.FrmNode');
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
    const map = new Map('WF_FrmNode', '表单权限方案');

    map.AddMyPK();
    map.AddTBInt(FrmNodeAttr.FK_Node, 0, '节点ID', true, true);
    map.AddTBString(FrmNodeAttr.FK_Frm, null, '表单', false, true, 0, 300, 150);
    map.AddTBString(FrmNodeAttr.FK_Flow, null, '流程编号', false, true, 0, 300, 150);

    map.AddTBString('SelectedAttrs', null, '表单字段', false, true, 0, 3000, 150);
    map.AddTBString('SelectedDtls', null, '表单从表', false, true, 0, 200, 150);
    map.AddTBString('SelectedAths', null, '表单附件', false, true, 0, 200, 150);

    // map.AddRM_DtlSearch('影响字段', new FrmNodeFields(), FrmNodeFieldAttr.FK_Node, '', '', '', 'icon-drop', false, '&EleType=Field');
    // map.AddRM_DtlSearch(
    //   '字段权限',
    //   new FrmNodeFields(),
    //   '',
    //   '',
    //   '',
    //   'Name,KeyOfEn,UIIsEnable,UIVisible,IsNotNull,RegularExp,DefVal,IsWriteToFlowTable',
    //   'icon-drop',
    //   false,
    //   '&FK_Node=@FK_Node&FrmID=@FK_Frm',
    // );
    map.AddRM_DtlBatch('字段权限', new FrmNodeFields(), '', '', '', 'icon-drop', '&FK_Node=@FK_Node&FK_MapData=@FK_Frm');
    map.AddRM_DtlSearch('从表权限', new MapDtlSlns(), '', '', '', 'No,Name,Alias,PTable', 'icon-drop', false, '&FK_Node=@FK_Node&FK_MapData=@FK_Frm');
    map.AddRM_DtlSearch('附件权限', new FrmAttachmentSlns(), '', '', '', 'MyPK,Name,NoOfObj,FileType', 'icon-drop', false, '&FK_Node=@FK_Node&FK_MapData=@FK_Frm');
    //批量设置。
    //审核组件设置
    // map.AddRM_GPE;

    this._enMap = map;
    return this._enMap;
  }
}
