import { FrmAttachment } from './FrmAttachment';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_AthCtrlWay extends PageBaseGroupEdit {
  constructor() {
    super('GPE_AthCtrlWay');
    this.PageTitle = '显示权限';
  }
  Init() {
    this.entity = new FrmAttachment(); //对应的类.
    this.KeyOfEn = 'CtrlWay'; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '数据开放规则'); //增加分组.
    this.Blank('0', 'PK-主键+附件标识+表单ID', this.Desc0);
    this.Blank('1', 'FID-干流程WorkID', this.Desc1);
    this.Blank('2', 'PWorkID-父流程ID', this.Desc2);

    this.Blank('3', '仅能查看自己上传的附件', this.Desc3);
    this.Blank('4', 'WorkID-按照WorkID计算(对流程节点表单有效)', this.Desc4);
    this.Blank('5', 'P2WorkID', this.Desc5);
    this.Blank('6', 'P3WorkID', this.Desc6);
    this.Blank('7', 'RootFlowWorkID', this.Desc7);
    this.Blank('8', '按照PFID计算', this.Desc8);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `
  #### Help
  - 默认规则，任何人上传的附件，其他人都可以看到.
  - 过滤条件：表单ID + 附件标识 + 主键
  `;

  public readonly Desc1 = `
   #### Help
   -  用到分合流： 合流节点如果需要看到子线程数据，就需要此规则.
   - 前提：两个控件的ID保持一致.
   - 过滤条件： 字段FID + 附件标识 + 主键
  `;

  public readonly Desc2 = `
   #### Help
   - 用于父子流程, 子流程的控件，要看到父流程的附件数据.
   - 前提：两个控件的ID保持一致.
   - 过滤条件:  附件上传的主键 +附件标识 + PWorkID
   `;
  public readonly Desc3 = `
    #### Help
    - 仅仅查看自己的上传附件, 
    - 用于流程的协作节点，自己的附件自己看到， 也可以用于单据的数据上传.
   - 过滤条件:  表单ID + 附件标识+  + PWorkID
      `;

  public readonly Desc4 = `
  #### Help
  - WorkID-按照WorkID计算(对流程节点表单有效)
  - 场景: 第1个节点上传的附件，能被第2个节点看到
  - 过滤条件:  表单ID + 附件标识+  + WorkID
  `;
  public readonly Desc5 = `
  #### Help
  - P2WorkID
  - 上级父流程的WorkID
  - 过滤条件:  RefPK + 附件标识+  + WorkID
  `;
  public readonly Desc6 = `
  #### Help
  - P3WorkID
  `;
  public readonly Desc7 = `
  #### Help
  -  RootFlowWorkID
  `;

  public readonly Desc8 = `
  #### Help
  - 按照PFID计算
  - 场景： 在子线程上启动子流程, 子流程上要看到父流程上传的附件数据.
  `;
}
