import { DeadLineRole1 } from './DeadLineRole1';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Flow } from '/@/WF/TSClass/Flow';

export class GPE_DeadLineRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DeadLineRole');
    this.PageTitle = '流程完成时限规则';
  }
  Init() {
    this.entity = new Flow(); //对应的类.
    this.KeyOfEn = 'DeadLineRole'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '流程完成时限规则'); //增加分组.
    this.Blank('0', '不设置', this.Desc0);
    this.AddEntity('1', '不计算节假日', new DeadLineRole1(), this.Desc1);
    this.AddEntity('2', '计算节假日', new DeadLineRole1(), this.Desc1);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  public readonly Desc0 = `
  #### 帮助
   - 不设置，整个流程没有时间限制。
  `;
  public readonly Desc1 = `
  #### 帮助
   - 该设置，可以为空。
   - 用来限制该流程可以在什么时间段内完成。
   - WF_CH 这个表用于存储时效考核数据,您可以仔细研究该表的结构并做想用的考核数据的使用。
  #### 配置图
   ![输入图片说明](./resource/WF/Admin/AttrFlow/DeadLineRole/Img/DeadLineRole.png "屏幕截图.png")  
  `;

  public AfterSave(pageID: string, pageVal?: any) {
    // if (pageID == '11111') {
    //   // await mapExt.Init();
    // }
    // const val = pageID + pageVal;
    // if (!!val) {
    //   alert(val);
    // }
    //throw new Error("Method not implemented.");
  }
}
