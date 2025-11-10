import { FrmNode, FrmNodeAttr } from '../FrmNode';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
export class GPE_FrmCtrlSln extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmCtrlSln');
    this.PageTitle = '表单权限方案';
  }
  Init() {
    this.entity = new FrmNode(); //对应的类.
    this.KeyOfEn = FrmNodeAttr.FrmSln; //对应的字段.
    //@liang, 补充说明.
    this.AddGroup('A', '表单权限方案');
    this.Blank('0', '默认方案', this.Desc0);
    this.Blank('1', '只读方案', this.Desc1);
    this.Blank('2', '自定义表单元素权限', this.Desc1);
    this.Btns = [{ pageNo: '2', list: ['设置权限'] }];
  }

  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == '2' && btnName === '设置权限') {
      const url = GloComm.UrlEn('TS.AttrNode.FrmNodeCtrlSln', this.entity.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '设置权限');
    }
  }
  //默认方案.
  public Desc0 = `
  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAYgmfqbFS
   - 定义: 表单权限方案就是，一个表单在不同的节点上，需要控制不同的权限，我们称为表单权限方案.
   - 比如: 开始节点可编辑，第2个节点只读，第3个节点部门字段可编辑. 这样的场景，可以使用权限方案来定义.
   #### 默认方案
   - 按照在设计表单时的表单权限, 呈现给操作者.

  #### 参考流程
   - 演示流程: 014.立项审批流程.
   - 该流程绑定多个表单,在每个节点，绑定的表单权限不同。
     1401节点，绑定的表单为默认方案，可以编辑。
     1402节点，绑定的表单为只读方案，接收人只可以查看表单，不可以对表单字段内容进行编辑。
     1403节点，绑定的表单为自定义表单权限，接收人可以根据设定的表单元素对表单进行编辑，包括表单内的字段，从表，附件等。
     1404节点，绑定的表单位为只读方案。
  #### 配置图
   - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Sln5/Img/FrmCtrlSlnSetting1.png "屏幕截图.png") 
   - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Sln5/Img/FrmCtrlSlnSetting4.png "屏幕截图.png")     
   - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Sln5/Img/FrmCtrlSlnSetting2.png "屏幕截图.png")   
   - ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Sln5/Img/FrmCtrlSlnSetting3.png "屏幕截图.png")   
    `;

  //只读方案
  public Desc1 = `
  #### 帮助
   - 视频教程: https://drive.weixin.qq.com/s?k=AOsAZQczAAYgmfqbFS
   - 只读：表单元素只有只读功能，不能修改数据。
   - 场景: 项目申报流程中，第1个节点填写申报单、第2个节点评审委员评审，就不可以编辑表单,我们就设置只读方案.

      `;

  //自定义表单元素权限
  public Desc2 = `
  #### 帮助
   - 自定义：对于表单里的每个元素，可以进行个性化的设置。
   - 可以自定义的元素: 基本字段、组件、从表、一般附件、图片附件.
   - 
  #### 配置图
   -  ![输入图片说明](./resource/WF/Admin/AttrNode/FrmSln/Sln5/Img/FrmCtrlSlnSetting.png "屏幕截图.png") 
      `;
}
