import { GloWF } from '../../Admin/GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
export class GPN_WorkShiftBatch extends PageBaseGroupNew {
  constructor() {
    super('GPN_WorkShiftBatch');
    this.PageTitle = '工作批量移交';
  }

  public Init() {
    this.AddGroup('A', '请选择规则'); //增加分组.

    this.SelectItemsByTreeEns('Shift', '选择当事人', this.HelpNo, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '@No=账号@Name=名称@Tel=电话', true);
    this.SelectItemsByList('Shift.Flows', '要移交的流程实例', this.HelpNo, true, () => {
      return 'Flow_WorkShiftBatchFlows@Key=' + this.RequestVal('tb1', 'Shift');
    }); //`SELECT WorkID AS No,Title AS Name FROM wf_generworkflow WHERE TodoEmps LIKE '%${this.RequestVal('tb1', 'Shift')}%' AND (WFState=2 OR WFState=5)`;})

    this.SelectItemsByTreeEns('Shift.Flows.ToEmp', '移交给', this.HelpNo, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '@No=账号@Name=名称@Tel=电话', true);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo != 'Shift.Flows.ToEmp') return;
    const fromUserNo = this.RequestVal('tb1', 'Shift'); //单选.
    const workIDs = this.RequestVal('tb1', 'Shift.Flows'); //多选.
    const toEmpNo = this.RequestVal('tb1', 'Shift.Flows.ToEmp'); //单选.

    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('FromOneUserNo', fromUserNo);
    handler.AddPara('WorkIDs', workIDs);
    handler.AddPara('ToOneUserNo', toEmpNo);
    const data: any = await handler.DoMethodReturnJson('Batch_Shift');
    return new GPNReturnObj(GPNReturnType.Message, data);
  }
}
