import { FrmBillFlowSingleRole } from './FrmBillFlowSingleRole';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MethodFlowHostBill } from '/@/CCFast/CCBill/Method/MethodFlowHostBill';

export class GPN_FrmBillFlowSingleRole extends PageBaseGroupNew {
  constructor() {
    super('GPN_FrmBillFlowSingleRole');
    this.ForEntityClassID = 'TS.MapExt.FrmBillFlowSingleRole';
    this.PageTitle = '单次流程规则';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('SingleRole', '单次流程规则');
    this.AddBlank('AfterOverCanStartFlow', '只能在归档后发起流程.', this.HelpUn, 'icon-drop');
    this.AddBlank('FlowOverUpdateFrmBillData', '流程结束后,更新主表数据.', this.HelpUn, 'icon-drop');
    this.AddBlank('FlowOverDeleteFrmBillData', '流程删除后删除单据数据.', this.HelpUn, 'icon-drop');

    this.AddGroup('StartLimit', '发起限制规则');
    this.AddBlank('OnlyStartSelfCreateRec', '只能发起自己创建的数据.', this.OnlyStartSelfCreateRec, 'icon-drop');
    this.AddBlank('UnOverFlow', '如果该流程没有完成则不能发起新流程.', this.OnlyStartSelfCreateRec, 'icon-drop');
    this.AddBlank('OnlyOnce', '只能发起一次.', this.OnlyStartOneRec, 'icon-drop');
  }
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // return Promise.resolve([
    //   {
    //     No: 'FrmBillFlowSingleRole',
    //     Name: '单次发起流程规则',
    //   },
    // ]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    const refPKVal = this.RequestVal('RefPKVal'); //主键.

    //方法属性.
    const mfs = new MethodFlowHostBill(refPKVal);
    await mfs.Retrieve();

    const mypk = mfs.FlowNo + '_' + mfs.FrmID + '_' + pageNo;
    const en = new FrmBillFlowSingleRole(mypk);
    if ((await en.IsExits()) == true) {
      return new GPNReturnObj(GPNReturnType.Message, '改项目已经存在.');
    }
    en.MyPK = mypk;
    if (pageNo == 'OnlyStartSelfCreateRec' || pageNo == 'UnOverFlow' || pageNo == 'OnlyOnce') en.DBRole = 'StartLimit';
    else en.DBRole = 'SingleRole';

    en.MarkID = pageNo; //类型.
    en.MarkName = this.GetPageName(pageNo); //标记名称.
    en.FrmID = mfs.FrmID;
    en.Docs = mfs.FlowNo;
    en.RefPKVal = refPKVal;
    const enName = 'TS.MapExt.FrmBillFlowSingleRole';
    en.SetPara('EnName', enName);
    await en.Insert();
    return new GPNReturnObj(GPNReturnType.Message, '增加成功.');
  }

  public readonly OnlyStartOneRec = `
  #### 帮助
  - 只能发起一次.
  - 
`;

  public readonly OnlyStartSelfCreateRec = `
  #### 帮助
  - 只能发起自己创建的记录.
  - 
`;
  public readonly RegularExpressionSelf = `
  #### 帮助
  - 自定义正则表达式, 请在文本框输入正则表达式，然后执行创建。
  - 请正确的选择事件然.
`;

  public readonly SelfFunc = `
  #### 帮助
  - 自定义函数，就是在服务器上创建一个js文件，写入一个函数.
  -  
`;

  public readonly JSBody = `
#### 帮助
-  输入函数的脚本.
-  系统就会执行这些脚本，在您指定的事件里.
`;
}
