import { MapExt } from '../../MapExt';
import { PopGroupList } from './PopGroupList';
import { PopList } from './PopList';
import { PopSelfUrl } from './PopSelfUrl';
import { PopTree } from './PopTree';
import { PopTreeEns } from './PopTreeEns';
import { PopTreeEnsSFTable } from './PopTreeEnsSFTable';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { PopTableSearch } from './PopTableSearch';
import { PopTableSimple } from './PopTableSimple';

export class GPE_Pop extends PageBaseGroupEdit {
  public async AfterSave(pageID: string, pageVal: any) {
    if (pageID != 'None') {
      let pkval = this.GetRequestVal('PKVal');
      if (pkval.endsWith('_Pop')) pkval = pkval.replace('_Pop', '');
      const en = new MapAttr();
      const mypk = pkval;
      en.setPKVal(pkval + 'T');
      //插入一条对应的T字段
      if ((await en.RetrieveFromDBSources()) == 0) {
        en.setPKVal(mypk);
        await en.RetrieveFromDBSources();
        en.MyPK = en.MyPK + 'T';
        en.KeyOfEn = en.KeyOfEn + 'T';
        en.Name = en.Name + 'T';
        en.UIVisible = 0;
        en.UIIsEnable = 0;
        await en.Insert();
      }
    }
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  // @ts-ignore
  public async BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (btnName === '落值填充' || btnName === '填充') {
      const url = GloComm.UrlEn('TS.MapExt.FullData', this.entity?.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
  }
  // public async AfterSave(pageID: string, pageVal: any) {}

  constructor() {
    super('GPE_Pop');
    this.PageTitle = '弹窗返回值';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = 'DoWay'; //要修改的字段.

    this.Btns = [
      { pageNo: 'PopBranches', list: ['填充'] },
      { pageNo: 'PopBranches2025', list: ['填充'] },

      { pageNo: 'PopBranchesAndLeaf', list: ['填充'] },
      { pageNo: 'PopBranchesAndLeaf2025', list: ['填充'] },

      { pageNo: 'PopGroupList', list: ['填充'] },
      { pageNo: 'PopGroupList2025', list: ['填充'] },

      { pageNo: 'PopTableList', list: ['填充'] },
      { pageNo: 'PopTableList2025', list: ['填充'] },

      { pageNo: 'PopTable', list: ['填充'] },
      { pageNo: 'PopTable2025', list: ['填充'] },

      { pageNo: 'PopTableSimple', list: ['填充'] },
      { pageNo: 'PopTableSimple2025', list: ['填充'] },

      { pageNo: 'PopSelfUrl', list: ['填充'] },
      { pageNo: 'PopSelfUrl2025', list: ['填充'] },

      { pageNo: 'PopBranches', list: ['填充'] },
      { pageNo: 'PopBranches2025', list: ['填充'] },
    ];

    await this.entity.InitDataForMapAttr('Pop', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '树形结构'); //增加分组.

    this.AddEntity('PopBranches', '树干模式', new PopTree(), this.PopBranches);
    this.AddEntity('PopBranchesAndLeaf', '树干叶子模式', new PopTreeEns(), this.PopBranchesAndLeaf);
    //this.AddEntity('PopBranchesAndLeaf2025', '树干叶子模式2025', new PopTreeEns2025(), this.PopBranchesAndLeaf);
    this.AddEntity('PopBranchesAndLeafSFTable', '树干叶子模式(绑定字典表)', new PopTreeEnsSFTable(), this.PopBranchesAndLeaf);
    this.Blank('None', '无,不设置(默认).', this.Desc1);

    this.AddGroup('B', '分组模式');
    this.AddEntity('PopGroupList', '分组列表平铺', new PopGroupList(), this.PopGroupList);
    this.AddEntity('PopTableList', '单实体平铺', new PopList(), this.PopTableList);

    this.AddGroup('C', '其他模式');
    this.AddEntity('PopTableSimple', '表格-简洁模式', new PopTableSimple(), this.PopTableSearch);
    this.AddEntity('PopTable', '表格-分页模式', new PopTableSearch(), this.PopTableSearch);
    //this.AddEntity('PopTable2025', '表格-分页模式2025', new PopTableSearch2025(), this.PopTableSearch);

    this.AddEntity('PopSelfUrl', '自定义URL', new PopSelfUrl(), this.PopSelfUrl);

    // //设置 存储字段为 “” 说明不存储.
    // this.AddEntity('1', '启用扫码录入', new QRCodeEn1(), this.Desc1);
    // this.AddGroup('Z', '树形结构'); //增加分组.
    // this.Blank('0', '不启用', '禁用扫码录入.');
    ///resize,p_80
  }

  public readonly Desc1 = `

  #### 帮助
  
  - **弹窗（Pop）返回值**：点击文本框后面的小齿轮会弹出一个窗体，用户在窗体中选择内容并点击“确定”按钮后，所选的值将被填充到该文本框中。
  - **填充设置**：在文本框中填充值后，想要填充将其他相关值填充到其他控件中时，可以在配置页面设置填充。
  - **数据源维护**：默认会使用本机数据源（local），如果您需要查询其他数据源请参考 [数据源配置](https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=7671494&doc_id=31094)
  #### 应用场景
  - **获取外部数据**：当需要对一个文本框输入的数据进行外部数据获取时。
    - 例如：选择参与人、选择产品、选择客户等。
  - **数据选择**：当输入的数据需要进行选择时。

  #### 运行效果图
  ![运行效果图](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/Demo.png "效果图.png") 
  
  #### 弹窗-效果图
  - **多种弹窗返回值**：为了满足不同模式下的弹窗内容显示需求，我们提供了多种弹窗返回值。您可以根据不同的场景设置不同的模式。
  #### 树干叶子模式
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/BranchesAndLeaf.png "屏幕截图.png") 
  #### **树干模式**
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/Branches.png "树结构效果图.png")
  #### **分组列表模式**
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/GroupList.png "屏幕截图.png") 
  #### **单实体平铺模式**
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/TableList.png "屏幕截图.png")
  #### **表格分页模式**
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/TableSearch.png "屏幕截图.png")
  #### 数据存储格式
  - 在表单创建字段时，系统默认创建一个影子字段。
  - 字段abc, 系统在创建一个abcT, 在abc字段中存储的是编号, 在abcT字段中存储的是名称, 多个数据用逗号分开.
  - 如下图所示：
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/DataSave.png "屏幕截图.png")
     `;

  public readonly PopBranchesAndLeaf = ` 
  #### 说明
  - **树干叶子模式**：该模式下最经典的是部门树与人员的结构。部门作为树干，人员作为叶子。我们将这种模式称为“树干叶子模式”。
  - **类似模式**：与此相类似的还有流程树与流程的关系、表单库与表单的关系。
  - **数据源维护**：默认会使用本机数据源（local），如果您需要查询其他数据源请参考 [数据源配置](https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=7671494&doc_id=31094)
  
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/BranchesAndLeaf2.png "屏幕截图.png")    
    
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/BranchesAndLeaf.png "屏幕截图.png")
  `;

  public readonly PopBranches = ` 
  #### 说明
   - 弹窗的数据展现为树结构，比如：部门、类别等等。
   - 数据结构为常见通用的编号、名称、父节点编号规则。
   - 点击上方按钮可以设置属性。
   
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/Branches2.png "屏幕截图.png") 
  
  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/Branches.png "树结构效果图.png")
  `;

  public readonly PopTableSearch = ` 

  #### 帮助
   - 数据是以表格的模式展现，可以设置查询条件, 比如选择单据、产品、所在班级。
   - 适应数据量较大，需要搜索完成。
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/TableSearch2.png "屏幕截图.png")
  #### 运行效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/TableSearch.png "屏幕截图.png")
  
  `;
  public readonly PopSelfUrl = ` 
  #### 帮助
   - 当ccflow提供的模式不能满足您的要求的时候，这个方案就是终极解决办法。
   - 您自己定义一个页面，配置到系统中去. 
   - 返回的数据，需要满足ccflow的规范，需返回两个列checkedNames和checkedList，格式请参考示例如下：
   - {
      "checkedList": [
        "001",
        "002",
        "003"
      ],
      "checkedNames": [
        "类型1",
        "类型2",
        "类型3"
      ]
}

  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/Url2.png "屏幕截图.png")


  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/Url.png "屏幕截图.png")

  
  `;

  public readonly PopTableList = ` 

  #### 帮助
   - 单实体平铺，就是对数据源进行简单的宫格列表展示，方便用户选择。
   - 是最简单的一种弹窗数据展现模式，适用于数据量较小，没有数据展示分组的需要。
  
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/TableList2.png "屏幕截图.png")  

  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/TableList.png "屏幕截图.png")


   `;
  public readonly PopGroupList = ` 

  #### 帮助
   - 分组列表平铺,就是对实体进行分组展示. 例如: 产品类别与产品。 角色类型与角色。
   - 产品类别角色类型就是分组数据源，产品与角色就是实体数据源。
   - 实体数据源要求返回三个列，最后一列就是与分组数据源对应的外键列。
   - 请参考配置图。
  
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/GroupList2.png "屏幕截图.png") 

  #### 效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/Pop/Img/GroupList.png "屏幕截图.png")
  
    `;
}
