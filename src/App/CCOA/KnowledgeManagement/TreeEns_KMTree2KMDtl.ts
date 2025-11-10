import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { KMTree, KMTrees } from './KMTree';
import { KMDtls } from './KMDtl';
import { GloComm } from '/@/WF/Comm/GloComm';
import DBAccess from '/@/utils/gener/DBAccess';
import { message } from 'ant-design-vue';
/**
 * 表单类别-表单
 */
export class TreeEns_KMTree2KMDtl extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_KMTree2KMDtl');
    this.PageTitle = '知识库';
  }
  //重写的构造方法.
  override async Init() {
    const KnowNo = this.RequestVal('KnowledgeNo');
    const name = this.RequestVal('KnowledgeName');
    //  this.PageTitle = name;

    this.RootNo = KnowNo;
    //分组数据.
    const trees = new KMTrees();
    const num = await trees.Retrieve('KnowledgeNo', KnowNo, 'Idx'); // No,Name,ParentNo
    if (num == 0) {
      const en = new KMTree();
      en.No = this.RootNo;
      en.KnowledgeNo = KnowNo;
      en.Name = name;
      en.ParentNo = '0';
      en.Idx = -1;
      await en.Insert();

      en.No = DBAccess.GenerGUID();
      en.Name = '子目录1';
      en.ParentNo = KnowNo;
      en.Idx = -1;
      await en.Insert();

      en.No = DBAccess.GenerGUID();
      en.Name = '子目录2';
      en.Idx = -2;
      en.ParentNo = KnowNo;
      await en.Insert();
      await trees.Retrieve('KnowledgeNo', KnowNo, 'Idx'); // No,Name,ParentNo
    }
    this.TreeEns = trees;

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'No', name: '编号' },
      { id: 'Name', name: '名称', Width: 300 },
      { id: 'FrmTypeText', name: '表单类型' },
      { id: 'EntityTypeText', name: '应用模式' },
    ];
    // 关联的字段
    this.RefKey = 'RefTreeNo'; //关联的字段.
    this.BtnsOfTableTop = '新建目录';
    this.BtnsOfItemOptions = '删除'; //行操作的按钮.
    this.IsEnMove = true; //实体是否可以移动？
    this.DtlEns = new KMDtls();
  }

  public override async GetDtls(nodeID: string) {
    const frms = new KMDtls();
    await frms.Retrieve('RefTreeNo', nodeID, 'Idx');
    return frms;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, _selectTreeOrg, _record: Nullable<RowData> = null) {
    if (btnLab === '新建') {
      // const url = GloComm.UrlGenerList('GL_DictStart');
      //   return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    message.info('演示环境,不允许新建.');
    //return false;
  }
}
