import { DataType } from '/@/bp/en/DataType';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Flow } from '/@/WF/TSClass/Flow';

export class GPE_BatchStart extends PageBaseGroupEdit {
  constructor() {
    super('GPE_BatchStart');
    this.PageTitle = '批量发起';
  }
  Init() {
    this.entity = new Flow(); //对应的类.
    this.KeyOfEn = 'BatStartRole'; //对应的字段.
    //增加子页面.
    this.AddGroup('A', '批量发起'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    this.SingleTB('1', '启用批量发起', 'BatchListCount', this.Desc1, '一次发起多少条记录', DataType.AppString);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = ` 
  #### 帮助
   - 不启动：不启动流程的批量发起。
   - 启用批量发起:一次批量发起多个流程。
 
     
    `;
  public readonly Desc1 = ` 
  #### 帮助
   
    
    `;
}
