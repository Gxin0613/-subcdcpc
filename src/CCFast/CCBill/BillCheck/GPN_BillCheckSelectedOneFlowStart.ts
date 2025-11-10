import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmBill } from '../FrmBill';
import { GloWF } from '/@/WF/Admin/GloWF';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_BillCheckSelectedOneFlowStart extends PageBaseGroupNew {
  constructor() {
    super('GPN_BillCheckSelectedOneFlowStart');
    this.PageTitle = '启动流程';
  }
  public async Init() {
    this.AddGroup('A', '启动流程');

    const frmID = this.RequestVal('FrmID');
    const frmBill = new FrmBill();
    frmBill.No = frmID;
    await frmBill.Retrieve();
    const flowNos = frmBill.BillCheckTag.toString().split(',');
    const flowNames = frmBill.BillCheckTagT.toString().split(',');

    let atParas = '';
    for (let index = 0; index < flowNos.length; index++) {
      const no = flowNos[index];
      const name = flowNames[index];
      atParas += '@' + no + '=' + name;
    }
    const json = GloWF.AtParaStringToJson(atParas);
    const jsonKeys = Object.keys(json);
    const list: { No: string; Name: string }[] = [];
    for (const key of jsonKeys) {
      list.push({
        No: key,
        Name: json[key],
      });
    }
    this.SelectItemsByList('Imp', '选择要启动的流程', this.Imp, false, JSON.stringify(list));

    // this.TextBox3_NameNoNote('ImpDingDing', '钉钉组织', this.HelpTodo, '', '规划中', 'Key2', 'Key3', '');
    // this.TextBox3_NameNoNote('ImpWeiXin', '企业组织', this.HelpTodo, '', '规划中', 'Key2', 'Key3', '');
    // this.TextBox3_NameNoNote('ImpHongShu', '小红书', this.HelpTodo, '', '规划中', 'Key2', 'Key3', '');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FlowNo', tb1);
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    const data = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    //格式为:  1001@003  , workid@flowNo.
    const strs = data.split('@');
    const flowNo = strs[1];
    const workID = strs[0];
    const url = GloComm.UrlMyFlow(flowNo, '&WorkID=' + workID + '&FrmID=' + this.RequestVal('FrmID'));

    //  const url = '';
    //const url = '/#/WF/Designer/EditFlow?FlowNo=' + tb1 + '&FK_Flow=' + tb1;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
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
