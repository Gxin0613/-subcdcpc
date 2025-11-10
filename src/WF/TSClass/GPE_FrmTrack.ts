import { FrmTrack } from '../Comm/Components/FrmTrack';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FrmTrack extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmTrack');
    this.PageTitle = '轨迹组件';
  }
  Init() {
    this.entity = new FrmTrack(); //对应的类.
    this.KeyOfEn = 'FrmTrackSta'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '组件状态'); //增FrmTransferCustom加分组.
    this.Blank('0', '禁用', this.Desc0);
    // this.Blank('1', '显示轨迹图', this.Desc1);
    this.AddEntity('1', '显示轨迹图', new FrmTrack(), this.Desc2);
    // this.Blank('2', '可设置人员', this.Desc1);
    this.AddEntity('2', '显示轨迹表', new FrmTrack(), this.Desc2);
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = ` 
  #### 帮助
  - 

  #### 流程图
  - 

  
  `;

  public readonly Desc1 = ` 
  #### 帮助
  - 只读状态下，仅仅可以查看工序，不能对工序进行编排.
  `;
  public readonly Desc2 = ` 
  #### 帮助
  - 
....`;
}
