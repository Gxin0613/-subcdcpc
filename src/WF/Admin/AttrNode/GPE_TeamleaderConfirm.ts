import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node } from '/@/WF/TSClass/Node';
import { DataType } from '/@/bp/en/DataType';

export class GPE_TeamleaderConfirm extends PageBaseGroupEdit {
  constructor() {
    super('GPE_TeamleaderConfirm');
    this.PageTitle = '组长确认规则';
  }

  Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = 'TeamleaderConfirm'; //.

    //增加子页面.
    this.AddGroup('A', '组长确认规则'); //增加分组.
    this.Blank('0', '都是组长', this.Desc0);
    this.SingleTB('1', '包含如下人员账号的是组长', 'TeamleaderCfmVal', this.Desc0, '输入人员账号:比如 zhangsan,lisi,', DataType.AppString);
    this.SingleTB('2', '包含如下岗位的是组长', 'TeamleaderCfmVal', this.Desc0, '输入岗位编号:比如 001,002', DataType.AppString);
  }
  public async AfterSave(_pageID: string, _pageVal: any) {}
  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {}

  public readonly Desc0 = `
  #### 定义
  - 组长确认规则,是指如何在当前节点的接收人集合里确认那些是组长.
  #### 组长的权限
  - 可以邀请其他人处理.
  - 可以执行退回，移交，删除等按钮操作。
  `;
}
