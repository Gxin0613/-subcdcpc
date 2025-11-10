import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';

// 报表设计
export class FlowDataSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.WF.Template.FlowDataSetting');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('WF_Flow', '报表设计');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', true, true, 1, 3, 50);

    // map.AddGroupMethod('我的流程');
    // map.AddRM_GL(new GL_Todolist(), '待办', 'icon-drop', '&FlowNo=@No');
    // map.AddRM_GL(new GL_Runing(), '在途', 'icon-drop', '&FlowNo=@No');
    // map.AddRM_GL(new GL_Complete(), '已完成', 'icon-drop', '&FlowNo=@No');
    // map.AddRM_GL(new GL_RecentStart(), '我的发起', 'icon-drop', '&FlowNo=@No');

    // map.AddGroupMethod('高级查询');
    // map.AddRM_GL(new GL_Todolist(), '我发起的', 'icon-drop', '&FlowNo=@No');
    // map.AddRM_GL(new GL_Todolist(), '我参与的', 'icon-drop', '&FlowNo=@No');

    // map.AddGroupMethod('统计分析');
    // map.AddRM_GL(new GL_Todolist(), '我发起的', 'icon-drop', '&FlowNo=@No');
    // map.AddRM_GL(new GL_Todolist(), '我参与的', 'icon-drop', '&FlowNo=@No');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
