import { GloWF } from '../../Admin/GloWF';
import { GenerWorkFlowExt } from './GenerWorkFlowExt';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

export class GPN_ReSend extends PageBaseGroupNew {
  constructor() {
    super('GPN_ReSend');
    this.PageTitle = '调整';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '调整'); //增加分组.
    this.TextBox1_Name('GenerEmpNo', '人员账号', this.GenerEmpNoHelp, '人员账号', '', '');

    // alert(this.PKVal);
    // alert(this.RefPKVal);

    const gf = new GenerWorkFlowExt();
    gf.WorkID = this.PKVal;
    await gf.Retrieve();
    //const sql = `SELECT NodeID as No, Name FROM WF_Node WHERE FK_Flow='${gf.FK_Flow}' AND (NodeType=0 or  NodeType IS Null) `;
    this.SelectItemsByList('GenerEmpNo.GenerNode', '选择节点', this.GenerNodeHelp, false, GloWF.SQLOfGenerNode(gf.FK_Flow), true);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    if (pageNo == 'GenerEmpNo.GenerNode') {
      const gf = new GenerWorkFlowExt();
      gf.WorkID = this.PKVal;
      await gf.Retrieve();
      const msg = window.prompt('请输入调整原因', '');
      if (msg === '' || msg == null) return;
      try {
        const empNo = this.RequestVal('tb1', 'GenerEmpNo');
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_FlowOperation');
        handler.AddPara('FK_Flow', gf.FK_Flow);
        handler.AddPara('ToNodeID', tb1);
        handler.AddPara('WorkID', gf.WorkID);
        handler.AddPara('Emps', empNo);
        handler.AddPara('Note', msg);
        const data = await handler.DoMethodReturnString('ReSend');
        return new GPNReturnObj(GPNReturnType.Message, data);
      } catch (e) {
        message.error(e as string);
        return new GPNReturnObj(GPNReturnType.DoNothing);
      }
    }
  }

  // 新建string枚举
  public readonly GenerEmpNoHelp = `
  #### 帮助
  - 调整：就是让指定的人在指定的节点有待办;
  - 请输入人员账号，注意不能是中文。 
    `;
  // 新建string枚举
  public readonly GenerNodeHelp = `
  #### 帮助
  - 选择要调整到的节点
  - 点击下一步，就会执行调整.
    `;
}
