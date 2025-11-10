import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GenerWorkers } from '../GenerWorker';
import Dev2InterfaceCCBill from '../../Dev2InterfaceCCBill';

export class GPN_BillReturn extends PageBaseGroupNew {
  constructor() {
    super('GPN_BillReturn');
    this.PageTitle = '退回';
    this.SortNameLabel = '退回到';
  }
  public Init() {
    this.TextArea('Info', '退回信息', this.HelpTodo, '退回原因', '不同意，请重新修改', '请输入退回原因，不能为空');
  }

  public async GenerSorts(): Promise<any[]> {
    const tks = new GenerWorkers();
    await tks.Retrieve('WorkID', this.RequestVal('WorkID'), 'PassSta', 2, 'Idx');

    for (let i = 0; i < tks.length; i++) {
      const obj = tks[i];
      // 创建新的字段名称，并将原始字段的值赋给新字段
      obj.No = obj.Idx;
      obj.Name = obj.EmpNo + ',' + obj.EmpName;
      // 删除原始字段
      // delete obj.name;
    }
    return tks;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //本机模板
    if (pageNo == 'Info') {
      try {
        const workID = this.RequestVal('WorkID');
        const info = await Dev2InterfaceCCBill.ReturnWork(Number.parseInt(workID), Number.parseInt(sortNo), tb1);
        // alert(info);
        // const handler = new HttpHandler('BP.WF.HttpHandler.GPMPage');
        // handler.AddFile(this.UploadFile);
        // handler.AddPara('FK_Sort', sortNo);
        // handler.AddPara('ImpWay', tb1);
        // const data = await handler.DoMethodReturnString('Template_Save');

        alert(info);
        return new GPNReturnObj(GPNReturnType.Message, info);
      } catch (error: any) {
        message.error(error);
      }
    }
  }

  public readonly Imp = `
  #### 帮助
   - 上传模板、选择模式进行导入流程操作.
  ##### 选择模式说明
   - 作为新流程导入1：由ccbpm自动生成新的流程编号
   - 作为新流程导入2：使用流程模版里面的流程编号，如果该编号已经存在系统则会提示错误
   - 作为新流程导入3：使用流程模版里面的流程编号，如果该编号已经存在系统则会覆盖此流程
  `;

  public readonly BPMN2 = `
  #### 帮助
  - 导入符合bpmn2.0格式的文件.
  `;
}
