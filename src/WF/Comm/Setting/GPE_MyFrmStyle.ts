import { MySetting } from './MySetting';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

export class GPE_MyFrmStyle extends PageBaseGroupEdit {
  constructor() {
    super('GPE_MyFrmStyle');
    this.PageTitle = '表单风格';
  }
  Init() {
    this.entity = new MySetting(); //对应的类.
    this.KeyOfEn = 'FrmStyle'; //对应的字段，要编辑的字段.
    this.AddGroup('A', '经典风格'); //增加分组.
    this.Blank('0', '默认', this.Desc0);
    this.Blank('1', '时尚', this.Desc1);
    // this.Blank('2', '黑色', this.Desc2);
    this.Blank('5', '传统', this.Desc5);

    this.AddGroup('B', '简洁风格'); //增加分组.
    this.Blank('3', '清晰', this.Desc3);
    this.Blank('4', '紧凑', this.Desc4);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 表单风格有两种风格：经典风格,简洁风格;
   - 经典风格有三种模式：1.默认模式，2.时尚模式，3.黑色模式。
   - 简洁风格有两种模式：1.简洁清晰模式，2.简洁紧凑模式。
   - 现在采用的是经典风格的默认模式。
   #### 运行效果图
   - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FrmStyle.png "屏幕截图.png")
 `;
  public readonly Desc1 = `
 #### 帮助
  - 表单风格有两种风格;
  - 经典风格有三种模式：1.默认模式，2.时尚模式，3.黑色模式，5.传统模式。
  - 简洁风格有两种模式：1.简洁清晰模式，2.简洁紧凑模式。
  - 现在采用的是经典风格的时尚模式。
  #### 运行效果图
  - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FrmStyle1.png "屏幕截图.png")
`;
  public readonly Desc2 = `
#### 帮助
 - 表单风格有两种风格;
 - 经典风格有三种模式：1.默认模式，2.时尚模式，3.黑色模式，5.传统模式。
 - 简洁风格有两种模式：1.简洁清晰模式，2.简洁紧凑模式。
 - 现在采用的是经典风格的黑色模式。
 #### 运行效果图
![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FrmStyle2.png "屏幕截图.png")
`;
  public readonly Desc3 = `
#### 帮助
 - 表单风格有两种风格;
 - 经典风格有三种模式：1.默认模式，2.时尚模式，3.黑色模式，5.传统模式。
 - 简洁风格有两种模式：1.简洁清晰模式，2.简洁紧凑模式。
 - 现在采用的是时尚风格的简洁清晰模式。
 #### 运行效果图
![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FrmStyle3.png "屏幕截图.png")
`;
  public readonly Desc4 = `
#### 帮助
 - 表单风格有两种风格;
 - 经典风格有三种模式：1.默认模式，2.时尚模式，3.黑色模式，5.传统模式。
 - 简洁风格有两种模式：1.简洁清晰模式，2.简洁紧凑模式。
 - 现在采用的是经典风格的简洁紧凑模式。
 #### 运行效果图
![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FrmStyle4.png "屏幕截图.png")
`;
  public readonly Desc5 = `
#### 帮助
 - 表单风格有两种风格;
 - 经典风格有三种模式：1.默认模式，2.时尚模式，3.黑色模式，5.传统模式。
 - 简洁风格有两种模式：1.简洁清晰模式，2.简洁紧凑模式。
 - 现在采用的是经典风格的传统模式。
 #### 运行效果图
![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Img/FrmStyle5.png "屏幕截图.png")
`;

  public readonly Desc11 = `

  #### 说明

   - 仅仅对当前节点启用了审批组件(或者签批组件)有效.
   - 审核组件的信息会记录到审核信息表里面.
   - 通过设置批量审批属性可以灵活的满足不同的客户需求.
   
  #### 运行效果图
  
  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRole.png "屏幕截图.png")

  #### 流程案例图
  - 减刑假释流程
  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRoleFlow.png "屏幕截图.png")
  - 批次减刑流程
  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRoleFlow1.png "屏幕截图.png")

  
  #### 配置说明

  ![输入图片说明](./resource/WF/Admin/AttrNode/BatchRole/Img/NodeBatchRoleFlow2.png "屏幕截图.png")

 `;
  public readonly Desc21 = `
  #### 帮助
  - 对于节点表单有效.
  - 建议使用审核组件.
  #### 其它 
  - 该功能在2022.10以后的版本取消了.
  `;
}
