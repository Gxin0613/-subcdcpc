import { message } from 'ant-design-vue';
import { GloWF } from '../GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { FlowSorts } from '../../TSClass/Admin/FlowSort';

export class GPN_ImpFlow extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpFlow');
    this.PageTitle = '流程导入';
  }
  public Init() {
    this.AddGroup('A', '流程导入');
    this.FileUpload('Local', '导入本机模板', '请上传符合ccform表单格式的模式', this.Imp);
    const str = '@0=作为新流程导入（自动生成编号）@1=作为新流程导入（使用模板编号，若已存在则报错）@2=作为新流程导入（使用模板编号，若已存在则覆盖）';
    const json = GloWF.AtParaStringToJson(str);
    const jsonKeys = Object.keys(json);
    const list: { No: string; Name: string }[] = [];
    for (const key of jsonKeys) {
      list.push({
        No: key,
        Name: json[key],
      });
    }
    const list2: { No: string; Name: string }[] = [
      { No: 'XML', Name: 'XML格式' },
      { No: 'JSON', Name: 'JSON格式' },
    ];
    this.SelectItemsByList('Local.Way', '选择模式', this.Imp, false, JSON.stringify(list));
    this.FileUpload('BPMN2', '导入BPM2格式模板', '请上传文件', this.BPMN2);
    this.SelectItemsByList('BPMN2.Way', '选择文件格式', this.BPMN2, false, JSON.stringify(list2));
    this.FileUpload('DingDing', '导入钉钉格式模板', '请上传文件', this.BPMN2);
  }

  public async GenerSorts(): Promise<any[]> {
    const flowSorts = new FlowSorts();
    await flowSorts.RetrieveAll();
    return flowSorts;
    //return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //本机模板
    if (pageNo == 'Local.Way') {
      try {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
        handler.AddFile(this.UploadFile);
        handler.AddPara('FK_Sort', sortNo);
        handler.AddPara('ImpWay', tb1);
        const data: any = await handler.DoMethodReturnString('Imp_Done');
        return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '创建成功');
      } catch (error: any) {
        message.error(error);
      }
    }
    //BPM2格式模板
    if (pageNo == 'BPMN2.Way') {
      // const data = '已经取消了支持.';
      // return new GPNReturnObj(GPNReturnType.Error, data);
      try {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
        handler.AddFile(this.UploadFile);
        handler.AddPara('FK_Sort', sortNo);
        handler.AddPara('ImpWay', tb1);
        const data: any = await handler.DoMethodReturnString('Imp_DoneBPMN');
        return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '创建成功');
      } catch (error: any) {
        message.error(error);
      }
    }
  }

  public readonly Imp = `
  #### 帮助指南

**上传模板并导入流程**

- 上传模板后，选择以下模式之一进行导入：

  ##### 选择模式说明

  1. **作为新流程导入（自动生成编号）**：
     - 系统将由ccbpm自动生成新的流程编号。

  2. **作为新流程导入（使用模板编号，若已存在则报错）**：
     - 使用流程模板中的流程编号。如果该编号已存在于系统中，系统将提示错误。

  3. **作为新流程导入（使用模板编号，若已存在则覆盖）**：
     - 使用流程模板中的流程编号。如果该编号已存在于系统中，系统将覆盖此流程。
  `;

  public readonly BPMN2 = `
  #### 帮助
  - 导入符合bpmn2.0格式的文件.
  `;
}
