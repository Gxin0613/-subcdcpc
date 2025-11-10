import { MapExt, MapExtAttr } from '../MapExt';
import { DtlImpEn1 } from './DtlImpEn1';
import { DtlImpEn3 } from './DtlImpEn3';
import { DtlTreeEns } from './DtlTreeEns';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DtlImp extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DtlImp');
    this.PageTitle = '从表导入';
  }
  Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段，要编辑的字段.
    this.AddGroup('A', '从表导入模式'); //增加分组.
    this.Blank('0', '无,不设置(默认)', '不设置导入.');
    this.AddEntity('1', '表格查询(简单模式-SQL)', new DtlImpEn1(), this.Desc1);
    //this.AddEntity('4', '表格查询(简单模式-配置查询)', new DtlImpEn4(), this.Desc4);
    this.AddEntity('3', '表格查询模式（高级）', new DtlImpEn3(), this.Desc3);
    this.AddEntity('4', '左树右表(TreeEns)', new DtlTreeEns(), this.Desc3);
    // this.Blank('5', '自定义url模式', '');

    //this.Blank('2', 'Excel文件模式', this.Desc2);

    this.AddGroup('B', '自定义模式'); //增加分组.
    this.SingleTB('5', '自定义url模式', 'Tag1', this.help5, '请输入URL:比如/src/DataUser/DtlImpDemo.vue');
    this.SingleTB('6', '自定义GPN模式', 'Tag1', this.helpGPN, '请输入GPN的ClassID,比如:GPN_XXXX');
  }
  public async AfterSave(_pageID: string, _pageVal: any) {
    const en = new MapExt();
    const refPK = this.params.RefPKVal;
    const mypk = this.params.RefPKVal + this.params.suffix;
    en.setPKVal(mypk);
    await en.Retrieve();
    en.SetValByKey('FK_MapData', refPK);
    en.DirectUpdate();
    // const refPK = this.params.RefPKVal;
    // this.entity?.SetValByKey('FK_MapData', refPK);
    // this.entity?.DirectUpdate();
  }
  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {}

  public readonly helpGPN = `
  #### 帮助
  - 首先写一个GPN, 增加一个 AddFileUpload 的方法.
  - 参考
  - 系统提供一个Demo,请参考/DataUser/DtlImpDemo.vue
  - 如何使用参考Demo.
  `;
  public readonly help5 = `
  #### 帮助
  - 对于比较复杂的导入，系统满足不了，需要个性化实现,就使用该模式.
  - 系统提供一个Demo,请参考/DataUser/DtlImpDemo.vue
  - 如何使用参考Demo.
  `;

  public readonly Desc1 = `
  #### 帮助
  - 按照要求配置数据源.
  - 在从表上显示导入功能,如下图:
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapDtl/EditModel/Card1.png "表格模式")

  #### 说明
   - 系统首先检查数据是否正确，如果有非法的数据，系统就会 0 导入.
   #### 检查内容：
    1. 数值类型的字段是否为空合法.
    1. 日期字段格式是否合理. 
    1. 枚举字段是否完整,比如：性别字段，枚举是男,女. 
    1. 外键字段(外部数据源)是否符合要求. 
  #### 效果图
  - ![从表导入:效果图.](./resource/WF/CCForm/DtlImpByTable.png "从表导入")
  `;

  public readonly Desc2 = `
  #### 帮助
   - 制作 excel模板, 放入到: \DataUser\TempleteOfImp\从表ID.xls
   - 在excel模板中填写数据.
   - 执行导入
   #### 说明
   - 系统首先检查数据是否正确，如果有非法的数据，系统就会 0 导入.
   #### 检查内容：
    1. 数值类型的字段是否为空合法.
    1. 日期字段格式是否合理. 
    1. 枚举字段是否完整,比如：性别字段，枚举是男,女. 
    1. 外键字段(外部数据源)是否符合要求. 

  `;

  public readonly Desc3 = `
  #### 表格查询(简单模式-SQL)
   - 按照要求配置数据源.
   - 在从表上显示导入功能,如下图:
   #### 说明
   - 系统首先检查数据是否正确，如果有非法的数据，系统就会 0 导入.
   #### 检查内容：
    1. 数值类型的字段是否为空合法.
    1. 日期字段格式是否合理. 
    1. 枚举字段是否完整,比如：性别字段，枚举是男,女. 
    1. 外键字段(外部数据源)是否符合要求. 

    
  #### 设置
  - ![从表导入:效果图.](./resource/WF/CCForm/DtlImpByTableSetting.png "从表导入")
  #### 效果图1
  - ![从表导入:效果图.](./resource/WF/CCForm/DtlImpByTable.png "从表导入")
  `;
}
