import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { DirectionAttr, Directions } from './Direction';
import { GPE_CondModel } from './GPE_CondModel';

// 节点属性
export class NodeDir extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.NodeDir');
    if (!!pkval) this.NodeID = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    uac.IsView = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Node', '方向条件');

    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    // map.AddTBString(NodeExtAttr.Name, null, '名称', true, false, 0, 50, 200);

    /**************************** 方向条件.  **********************/
    map.AddGroupMethod('方向条件');
    //优先级.
    map.AddRM_DtlSearch('设置条件', new Directions(), DirectionAttr.Node, '', '', 'ToNode,ToNodeName', 'icon-drop', true, '&Node=@NodeID');
    //转向规则.
    map.AddRM_GPE(new GPE_CondModel(), 'icon-directions');

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
          url = '/src/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.WF.Cond&RefPK=RefPKVal&ButsTableTop=检查条件正确性&ButsItem=&IsMove=true&OrderBy=Idx';
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
}
