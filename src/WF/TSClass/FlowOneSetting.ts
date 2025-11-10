import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GL_Todolist } from '../GenerList/GL_Todolist';
import { GL_Runing } from '../GenerList/GL_Runing';
import { GL_Complete } from '../GenerList/GL_Complete';
import { GL_RecentStart } from '../GenerList/GL_RecentStart';
import { FlowAttr } from '/@/WF/TSClass/Flow';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { DataV_OneFlowEmp } from './DataV_OneFlowEmp';

// 人员
export class FlowOneSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.TSClass.FlowOneSetting');
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
    const map = new Map('WF_Flow', '流程');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', false, false, 1, 3, 50);
    map.AddTBString(FlowAttr.Name, null, '名称', false, false, 0, 50, 10, true);
    map.AddGroupMethod('我的流程');

    map.AddRM_GL(new GL_Todolist(), '待办', 'icon-clock', '&FlowNo=@No');
    map.AddRM_GL(new GL_Runing(), '在途', 'icon-hourglass', '&FlowNo=@No');
    map.AddRM_GL(new GL_Complete(), '已完成', 'icon-check', '&FlowNo=@No');
    map.AddRM_GL(new GL_RecentStart(), '我的发起', 'icon-home', '&FlowNo=@No');
    // const rm = new RefMethod();
    // rm.Title = '批量发起';
    // rm.ClassMethod = 'BatchStart';
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.IsCanBatch = false;
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    // map.AddMapLoader(() => {
    map.AddGroupMethod('查询分析');
    map.AddRM_UrlTabOpen('查询', '/src/WF/Rpt/SearchFlow.vue?FlowNo=@No&FlowName=@Name', 'icon-list');
    map.AddRM_UrlTabOpen('分析', '/src/WF/Rpt/GroupFlow.vue?FlowNo=@No&FlowName=@Name', 'icon-chart');
    map.AddRM_DataV(new DataV_OneFlowEmp(), 'icon-chart');

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
  public async BatchStart() {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddPara('FlowNo', this.No);
      const data = await handler.DoMethodReturnString('BatchStartFlow');
      if (typeof data == 'number' || data.includes(',') == false) {
        //生成url连接.
        const paras = `&WorkID=${data}`;
        // paras
        const url = GloComm.UrlMyFlow(this.No, paras);
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      }
      //生成url连接.
      const paras = `&FlowNo=${this.No}`;
      const url = GloComm.UrlGenerList('GL_Draft', paras);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    } catch (e) {
      return new GPNReturnObj(GPNReturnType.Error, e as string);
    }
  }
}
