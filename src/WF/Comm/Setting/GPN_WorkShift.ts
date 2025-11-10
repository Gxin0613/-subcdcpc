import { message } from 'ant-design-vue';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloWF } from '/@/WF/Admin/GloWF';
import Dev2Interface from '../../TSClass/Dev2Interface';
export class GPN_WorkShift extends PageBaseGroupNew {
  constructor() {
    super('GPN_WorkShift');
    this.PageTitle = '工作移交';
  }

  public async Init() {
    this.AddGroup('A', '请选择规则'); //增加分组.
    // const flows = 'SELECT No,Name FROM WF_Flow';
    this.SelectItemsByList('Flows', '选择待办流程', this.Docs0, true, this.getTodoList);
    this.SelectItemsByTreeEns('Flows.Emps', '选择被移交人', this.Docs1, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '@No=账号@Name=名称@Tel=电话', true);
  }

  public async getTodoList() {
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    const data = await handler.DoMethodReturnJson('Todolist_Init');
    console.log({ data });
    if (!Array.isArray(data)) {
      throw new Error('获取待办列表失败，请检查数据源');
    }
    const result: any[] = [];
    for (const item of data) {
      if ((item['AtPara'] || '').includes('@IsCC=1')) continue;
      if (parseInt(item.WFState) === 1) continue;
      item.No = item.WorkID;
      item.Name = item.FlowName + ' (标题：' + item.Title + ')';
      result.push(item);
    }
    return JSON.stringify(result);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _1: string, _2: string, _3: string, _4: string) {
    if (pageNo === 'Flows.Emps') {
      const msg = window.prompt('请输入移交原因');
      if (!msg?.trim()) {
        message.warn('需要输入移交原因');
        return;
      }
      const workID = this.RequestVal('tb1', 'Flows');
      const toEmpNo = this.RequestVal('tb1', 'Flows.Emps');
      const res = await Dev2Interface.Node_ShiftWork(workID, toEmpNo, msg);
      message.info(res);
      return;
    }
  }
  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 按照节点表单的字段作为抄送人.
  - 通常是在节点表单上加一个字段,这个字段存储的是人员账号，多个人员使用逗号分开.
  #### 运行图例
  - @liang.

`;

  //按人员计算
  public readonly Docs1 = `
  #### 帮助
  - 自动抄送给要绑定的人员.
`;
  //按角色计算
  public readonly Docs2 = `
  #### 帮助
  - 按照绑定的部角色下的人员集合作为抄送人.
  - 有一个规则
  
`;
}
