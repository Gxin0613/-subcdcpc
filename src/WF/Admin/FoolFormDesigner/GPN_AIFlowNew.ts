import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from './dto/HttpHandler';
import { GloComm } from '../../Comm/GloComm';

export class GPN_AIFlowNew extends PageBaseGroupNew {
  constructor() {
    super('GPN_AIFlowNew');
    this.PageTitle = 'AI流程';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', 'AI流程'); //增加分组.
    // this.TextBox1_Name('AIFlow', '输入名称', '请输入流程名称.', '流程名称', '', '比如：请假流程.');
    const words = '我要创建一个请假流程 包括但不限于：填写申请单、部门审批、人力资源审批等节点。';
    this.TextArea('AIFlow', '输入提示词', this.WordAlert, '提示词', words, '请点击帮助参考如何输入提示词?');

    const words2 = '创建请假表单，包括但不限于如下字段：请假日期从、到、请假天数、请假原因。';
    this.TextArea('AIFlow.Frm', '输入表单要求', this.WordAlert, '提示词', words2, '请点击帮助参考如何输入提示词?');

    this.FileUpload('File', '根据文件生成流程', '请上传Excel,word,图片文件.', this.HelpFile);

    this.AddGroup('B', '提示词参考'); //增加分组.
    this.TextArea('Demo1', '用车审批流程', this.WordAlert, '提示词', this.AlertCar, '请点击帮助参考如何输入提示词?');
    this.Table('Demo1.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerNodes);

    this.TextArea('QingJia', '请假流程', this.WordAlert, '请输入流程要求', this.AlertQingJia0, '请点击帮助参考如何输入提示词?');
    this.TextArea('QingJia.Frm', '表单要求', this.WordAlert, '表单要求', this.AlertQingJia1, '请点击帮助参考如何输入提示词?');

    this.TextArea('Demo3', '收文流程', this.WordAlert, '提示词', this.AlertQingJia1, '请点击帮助参考如何输入提示词?');
    this.Table('Demo3.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerNodes);
  }
  public async GenerNodes() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    let val = this.RequestVal('tb1', 'AIFlow');
    if (val == null || val == undefined || val == '') val = this.RequestVal('tb1', 'Demo1');
    if (val == null || val == undefined || val == '') val = this.RequestVal('tb1', 'Demo2');
    if (val == null || val == undefined || val == '') val = this.RequestVal('tb1', 'Demo3');
    handler.AddPara('Words', val);
    const data: any = await handler.DoMethodReturnJson('AiFlow_GenerNodes');
    return JSON.stringify(data);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(_pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
   // debugger;

    if (_pageNo == 'AIFlow.Frm') {
      const flowWord = this.RequestVal('tb1', 'AIFlow');
      const frmWord = this.RequestVal('tb1', 'AIFlow.Frm');

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('SortNo', this.RequestVal('SortNo'));
      handler.AddPara('FlowWords', flowWord);
      handler.AddPara('FrmWords', frmWord);
      const data: any = await handler.DoMethodReturnString('AiFlow_SaveFlow');

      //  const url = '/#/WF/Designer/EditFlow?FlowNo=' + data;
      const url = GloComm.UrlFlowD(data);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (_pageNo.includes('QingJia.Frm')) {
      const flowWord = this.RequestVal('tb1', 'QingJia');
      const frmWord = this.RequestVal('tb1', 'QingJia.Frm');

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('SortNo', this.RequestVal('SortNo'));
      handler.AddPara('FlowWords', flowWord);
      handler.AddPara('FrmWords', frmWord);
      const data: any = await handler.DoMethodReturnString('AiFlow_SaveFlow');

      //const url = '/#/WF/Designer/EditFlow?FlowNo=' + data;
      const url = GloComm.UrlFlowD(data);

      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    //上传文件解析表单.
    if (_pageNo == 'File') {
      alert('开发中.');
      const handler = new HttpHandler('BP.WF.HttpHandler.Admin_AI');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
      let data = await handler.DoMethodReturnString('AiFlow_File');
      if (typeof data === 'string') {
        if (data.includes('@')) {
          data = data.split('@').join('\n');
        }
      }
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }
  public readonly AlertCar = `
    我要做一个车辆申请流程，如
    员工审批路线： 填写申请、部门审批、办公室审批、反馈给申请人.
    `;

  public readonly AlertEmp = `
    我要做一个员工入职流程。
    `;
  public readonly AlertQingJia0 = `
    请假流程，流程节点包括，填写申请单、部门审批、人力资源审批、反馈给申请人节点等，请补齐。
    `;

  public readonly AlertQingJia1 = `
    请假表单内容包括，请假日期从，到，请假天数，请假原因，请假类型等内容。
   `;

  // 新建string枚举
  public readonly WordAlert = `
#### 帮助
- 请填写提示词，AI将会根据提示词，自动生成流程和表单内容.
- 例如：我要创建一个请假流程 包括但不限于：填写申请单、部门审批、人力资源审批等节点。
- 例如：创建请假表单，包括但不限于如下字段：请假日期从、到、请假天数、请假原因。
- 例如：我要做一个车辆申请流程，如员工审批路线：填写申请、部门审批、办公室审批、反馈给申请人等。
- 例如：创建车辆表单，包括但不限于如下字段：车辆类型、使用时间、使用事由、申请人等内容.
- 例如：我要创建一个收文流程，流程节点包括：填写申请单、部门审批、办公室审批、反馈给申请人等，请补齐。
- 例如：创建收文表单，包括但不限于如下字段：收文日期、收文单位、收文标题、收文内容等内容.
- 例如：我要创建一个员工入职流程，流程节点包括：填写申请单、部门审批、人力资源审批、反馈给申请人等，请补齐。
- 例如：创建员工入职表单，包括但不限于如下字段：姓名、性别、年龄、入职日期、部门等内容.
`;
  public readonly HelpFile = `
#### 帮助
- 请上传excel，word,表单图片文件，AI将会根据内容，自动生成内容.
`;

  // 新建int枚举
  public readonly SelectAttrs = `
#### 帮助
- 系统根据提示词，生成如下字段.
#### 数据存储
- int类型的枚举值是常用的数据类型，ccfrom是格式化的存储到数据表里.
- 创建一个int类型的字段，用于存储枚举的数据.
`;
}
