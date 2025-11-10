import { NodeExtAttr } from '../../AttrNode/NodeExt';
import { DirectionAttr, Directions } from '../Direction';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { Map } from '/@/bp/en/Map/Map';
import { UAC } from '/@/bp/en/Map/UAC';
import HttpHandler from '/@/utils/gener/HttpHandler';

// 节点属性
export class NodeExtCond extends EntityNodeID {
  //表单ID.
  get NodeFrmID() {
    return this.GetValStringByKey('NodeFrmID');
  }

  constructor(pkval?: number) {
    super('TS.WF.NodeExtCond');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.NodeID = pkval;
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
    const map = new Map('WF_Node', '节点属性');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 50, 200);

    /**************************** 方向条件.  **********************/
    // map.AddRM_DtlSearch('优先级', new Directions(), 'NodeID', '', '移动,设置条件', 'ToNodeID,ToNodeName');
    // map.AddRM_DtlSearch('方向条件', new Directions(), 'NodeID', '', '设置条件', 'ToNodeID,ToNodeName');

    //  map.AddRM_Url_RightFrameOpen("批量设置", "/src/", "高级设置");

    // 添加加载器类型
    if (this.NodeID > 10) {
      map.AddMapLoader(async () => {
        //查询到达的方向.
        const ens = new Directions();
        await ens.Init();
        await ens.Retrieve(DirectionAttr.Node, this.NodeID, 'Idx');
        ens.forEach((dir) => {
          // let url = '/src/WF/Admin/Cond2020/List.vue?MyPK=' + dir.MyPK;
          // url += `&NodeID=${dir.Node}`;
          // url += `&ToNodeID=${dir.ToNode}`;
          // url += '&CondType=2';
          // url += `&FlowNo=${dir.FK_Flow}`;
          // this._enMap.AddRM_UrlTabOpen('' + dir.ToNode + '-' + dir.ToNodeName, url, 'icon-plane');

          let url = '';
          url = '/src/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.WF.Cond&RefPK=RefPKVal&ButsTableTop=检查正确性&ButsItem=&IsMove=true&OrderBy=Idx';
          url += '&FK_Node=' + dir.Node + '&ToNodeID=' + dir.ToNode;
          url += '&NodeID=' + dir.Node + '&FK_Flow=' + dir.FK_Flow;
          url += '&RefPKVal=' + dir.MyPK;
          url += '&ShowAttrs=DataFromText,Note';
          // console.log('url:' + url);
          this._enMap.AddRM_UrlTabOpen('' + dir.ToNode + '-' + dir.ToNodeName, url, 'icon-plane');
        });
      });
    }

    this._enMap = map;
    return this._enMap;
  }

  public DoFrmAttr() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) return 'err@错误,请先设置表单ID.';

    return 'url@/src/WF/Comm/En.vue?EnName=TS.AttrNode.FrmNodeExt&PKVal=' + this.NodeID + '_' + this.NodeFrmID;
  }

  public async DoSetIt() {
    if (this.NodeFrmID == '' || this.NodeFrmID == null) throw new Error('err@错误,请先设置表单ID.');
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode_FrmSln');
    handler.AddPara('FK_Node', this.NodeID);
    return await handler.DoMethodReturnString('RefOneFrmTree_SetAllNodeFrmUseThisSln');
  }
}
