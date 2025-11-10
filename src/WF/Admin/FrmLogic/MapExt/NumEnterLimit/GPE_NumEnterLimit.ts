import { MapAttr } from '../../MapAttrs/MapAttr';
import { MapExt, MapExtAttr } from '../../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_NumEnterLimit extends PageBaseGroupEdit {
  constructor() {
    super('GPE_NumEnterLimit');
    this.PageTitle = '输入值限制';
  }
  Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '数值输入值限制'); //增加分组.
    this.Blank('0', '禁用', this.Desc1);
    this.SingleTB('1', '启用限制', '', this.Desc2, '格式:0-18');
  }
  public async AfterSave(pageID: string, pageVal: any) {
    if (this.entity == null) return;
    const attrPK = this.entity?.AttrOfOper;
    const mapAttr = new MapAttr(attrPK);
    await mapAttr.Retrieve();
    if (pageID === '0') mapAttr.SetPara('NumEnterLimit', '');
    else mapAttr.SetPara('NumEnterLimit', this.entity.Tag);
    if (pageVal == null) return;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc1 = ` 
  #### 帮助
   - 禁用：不对格式有限制。
   - 启用限制：请按照格式输入值, 比如:您的输入在18岁到40岁,请输入18-40。
  `;
  public readonly Desc2 = ` 
  1. 请按照格式输入值, 比如:您的输入在18岁到40岁,请输入18-40。
  2. 中间不要有空格区分大小写,不能用全角的减号。
  3. 如果您会写正则表达式，您也可以使用绑定函数正则来实现。
....`;
}
