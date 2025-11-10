import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNodeID, EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeAttr } from '../../TSClass/Node';
import { BaseEntityExt } from '/@/bp/UIEntity/BaseEntityExt';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { WGEntity_NodeBatchWorkCheck } from './WGEntity_NodeBatchWorkCheck';
import { NodeWorkCheckAttr } from './NodeWorkCheck';

/// <summary>
/// 节点
/// </summary>
export class NodeBatchWorkCheck extends EntityNodeID {
  public override GetRefExt(): WaiGuaBaseEntity | BaseEntityExt | null {
    return new WGEntity_NodeBatchWorkCheck();
  }
  constructor(pkval?: number) {
    super('TS.WF.NodeBatchWorkCheck');
    if (!!pkval) {
      this.NodeID = pkval;
    }
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
    const map = new Map('WF_Node', '节点组件');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeAttr.Name, null, '名称', true, true, 0, 200, 150);
    map.AddTBString(NodeAttr.FK_Flow, null, '流程编号', false, false, 0, 5, 50);
    map.AddDDLSysEnum(NodeAttr.FWCSta, 0, '审核组件', true, true, NodeAttr.FWCSta, '@0=禁用@1=启用@2=只读', '', false, 100);
    // map.AddDDLSysEnum('GovDocSta', 0, '公文组件', true, true, NodeAttr.FWCSta, '@0=禁用@1=启用@2=只读', '', false, 100);
    const str = '@0=不签名@1=图片签名@2=写字板@3=电子签名@4=电子盖章@5=电子签名+盖章';
    map.AddDDLSysEnum('SigantureEnabel', 0, '签名方式', true, true, null, str);
    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCAth, 0, '附件上传', true, true, NodeWorkCheckAttr.FWCAth, '@0=不启用@1=多附件@2=单附件(暂不支持)@3=图片附件(暂不支持)');

    map.AddDDLSysEnum('FWCShowModel', 2, '工作模式', true, true, 'FWCShowModel', '@0=审核组件@1=轨迹模式@2=轨迹时间轴模式');
    map.AddDDLSysEnum('FWCTimeModel', 0, '时序模式', true, true, 'FWCTimeModel', '@0=倒序@1=正序');
    map.AddDDLSysEnum(NodeWorkCheckAttr.FWCMsgShow, 0, '审核意见显示方式', true, true, NodeWorkCheckAttr.FWCMsgShow, '@0=都显示@1=仅显示自己的意见');
    map.AddBoolean(NodeWorkCheckAttr.FWCIsShowTruck, false, '审核的轨迹？', true, true, true);
    map.AddBoolean(NodeWorkCheckAttr.FWCIsShowAllStep, false, '在轨迹表里是否显示所有的步骤？', true, true);

    map.AddTBString(NodeWorkCheckAttr.FWCView, null, '审核意见立场', true, false, 0, 200, 200, true);

    //map.SetHelperUrl(SigantureEnabel, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5415110&doc_id=31094');
    // map.attrsOfOneVSM.AddListModel(new NodeStations(), new Stations(), NodeStationAttr.FK_Node, NodeStationAttr.FK_Station);
    // map.attrsOfOneVSM.AddListModel(new NodeEmps(), new Emps(), NodeStationAttr.FK_Node, NodeEmpAttr.FK_Emp);
    // map.attrsOfOneVSM.AddListModel(new NodeDepts(), new Depts(), NodeDeptAttr.FK_Node, NodeDeptAttr.FK_Dept);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 节点s
 */
export class NodeBatchWorkChecks extends EntitiesNodeID {
  get GetNewEntity(): EntityNodeID {
    return new NodeBatchWorkCheck();
  }
  constructor() {
    super();
  }
}
