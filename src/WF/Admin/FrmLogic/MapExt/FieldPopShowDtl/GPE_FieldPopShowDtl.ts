import { FieldPopShowDtl } from './FieldPopShowDtl';
import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FieldPopShowDtl extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FieldPopShowDtl');
    this.PageTitle = '数据pop展示';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('FieldPopShowDtl', this.GetRequestVal('PKVal'));
    //增加子页面.
    this.AddGroup('A', '数据pop展示'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    this.AddEntity('1', '内置的GenerList.', new FieldPopShowDtl(), this.Desc1);
    this.SingleTextArea('2', '自定义的GenerList.', 'Doc', '请输入GenerList类名:', this.Desc2GL);
    this.SingleTextArea('3', '按照自定义URL设置.', 'Doc', '请输入URL', this.DescSelf);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 数据pop展示，也称为数据挖掘或者说数据下攥，数据攥取.
   - 一般用于数值类型的字段,比如:费用,点击费用数值显示费用的组成.
   - 显示在Search列表上或者单实体数据主表字段里.
   
  #### 运行图例
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDtlField/Img/AutoFull.png "屏幕截图.png") 

  `;

  public readonly Desc1 = `
  #### 内置GenerList帮助
   - 首先请参考高代码认识什么是GenerList,内置的GenrList,是指系统自定义的 GL_FieldPopShowDtl.ts 
   - 通过读取配置项,生成简单的列表,让实施人员不用开发代码就可以完成.
   - 仅仅需要配置一个数据源.

  `;
  public readonly Desc2GL = `
  #### 帮助: 自定义的GenerList.
   - 首先请参考高代码认识什么是GenerList.
   - 自定义的GenerList是指自己写一个,然后把类名配置到这里.
   - 适合比较复杂的应用场景,对数据安全，效率比较高.
  #### 编写注意事项
  - 系统向GenerList 实体类写入 FrmID, PKVal, AttrKey 参数.
  - GenerList可以通过这些参数获取数据.
  `;
  public readonly DescSelf = `
  #### 帮助
  - 自己写一个url，系统自动带入 FrmID, PKVal, AttrKey  三个参数.
  `;
}
