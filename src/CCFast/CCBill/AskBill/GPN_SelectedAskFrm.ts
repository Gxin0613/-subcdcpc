import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GPN_SelectedAskFrm extends PageBaseGroupNew {
  public Init() {
    this.PageTitle = '选择活动';
    //增加子页面.
    this.AddGroup('A', '选择活动');
    // this.SelectItemsByGroupList('ByGroupList', '选择活动', this.Desc100, true, GloWF.srcFrmTree, GloWF.srcFrmListAskFrm);
    this.SelectItemsByList('ByGroupList', '选择活动', this.Desc100, false, GloWF.srcFrmListAskFrm);
  }

  constructor() {
    super('GPN_SelectedAskFrm');
  }
  public readonly Desc100 = `
  #### 帮助
  - 请按您的需要勾选表单，点击下一步按钮就可以绑定到该节点
  `;

  /**
   *
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3 第3个文本框的值
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const val = window.prompt('请输入活动标题:', tb2);
    if (val == null || val == undefined) return new GPNReturnObj(GPNReturnType.DoNothing, '');
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    handler.AddPara('FrmID', tb1);
    handler.AddPara('Title', val);
    const data = await handler.DoMethodReturnString('CreateAskFrm');
    // alert('创建成功');
    return new GPNReturnObj(GPNReturnType.CloseAndReload, '创建成功');
  }

  //不需要分组,就返回空.
  GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    //  return null;
  }
}
