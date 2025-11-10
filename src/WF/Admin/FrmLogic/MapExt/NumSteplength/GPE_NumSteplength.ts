import { MapAttr } from '../../MapAttrs/MapAttr';
import { MapExt, MapExtAttr } from '../../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_NumSteplength extends PageBaseGroupEdit {
  constructor() {
    super('GPE_NumSteplength');
    this.PageTitle = '步长输入';
  }
  Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //增加子页面.
    this.AddGroup('A', '数值输入值限制'); //增加分组.
    this.Blank('0', '禁用步长', this.Desc1);
    this.SingleTB('1', '启用步长输入', MapExtAttr.Tag, this.Desc2, '格式:0.5');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public async AfterSave(pageID: string, pageVal: any) {
    if (this.entity == null) return;
    const attrPK = this.entity?.AttrOfOper;
    const mapAttr = new MapAttr(attrPK);
    await mapAttr.Retrieve();
    if (pageID === '0') mapAttr.SetPara('NumSteplength', '');
    else mapAttr.SetPara('NumSteplength', this.entity.Tag);

    if (pageVal === '') return;
  }
  public readonly Desc1 = ` 
  #### 帮助
   - 定义: 为了方便用户数据采集，使用+ - 符号来完成文本框的数值数据录入, 点击+ - 一次的增量或者减量数据.
   - 比如: 设置步长为10，没点击一次+ 文本框的数值就在原来的数据上增加10.
   - 禁用步长： 文本框不是使用 + - 图标 不启用.
   #### 效果图
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/NumSteplength/Img/NumSteplength.png "屏幕截图.png")
  `;
  public readonly Desc2 = ` 
  #### 帮助
  - 请输入步长参数,不能为0或负数.
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/NumSteplength/Img/NumSteplength.png "屏幕截图.png")

....`;
}
