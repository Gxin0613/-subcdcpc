import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { SysEnumMains } from '../../SysEnum/SysEnumMain';
import { GloWF } from '../../../GloWF';

export class GPE_MultipleChoiceSmall extends PageBaseGroupEdit {
  constructor() {
    super('GPE_MultipleChoiceSmall');
    this.PageTitle = '小范围多选';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    await this.entity.InitDataForMapAttr('MultipleChoiceSmall', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '小范围多选'); //增加分组.
    this.Blank('0', '不设置', this.Desc0);
    this.SingleTB('1', '按文本输入的值', 'Tag1', this.Desc1, '');
    this.SingleDDLEntities('2', '按照枚举值', 'Tag1', this.Desc2, new SysEnumMains(), false);
    this.SingleDDLSQL('3', '按照系统外键表计算', 'Tag1', this.Desc3, GloWF.SQLOfChoiceSmall, false);
    this.SingleTBSQL('4', '按照SQL计算', 'Tag4', '查询sql返回No,Name两列');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 就是用户录入相对固定的文本时，在文本框里提前输入相关的选项，可以直接进行多选操作。
  #### 应用场景
   - 比如，请假类型，出行方式等
  #### 效果图
  - 按文本输入的值
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSmall/Img/MultipleChoiceSmall1.png "屏幕截图.png")
  - 按系统外键表计算
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSmall/Img/MultipleChoiceSmall.png "屏幕截图.png")

  `;
  public readonly Desc1 = `
  #### 说明
  值用逗号分开,比如: 飞机,火车,轮船,火箭,其他 
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSmall/Img/MultipleChoiceSmallPeizhi.png "屏幕截图.png")
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSmall/Img/MultipleChoiceSmall1.png "屏幕截图.png")
  
  `;
  public readonly Desc2 = `
  #### 说明
  系统用枚举值作为该字段的多选.
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSmall/Img/MultipleChoiceSmall.png "屏幕截图.png")
  
  `;

  public readonly Desc3 = `
  #### 说明
  系统用系统外键作为该字段的多选.
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSmall/Img/MultipleChoiceSmall.png "屏幕截图.png")
  
  `;
}
