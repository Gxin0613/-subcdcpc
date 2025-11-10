import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import DBAccess from '/@/utils/gener/DBAccess';
import { DirectoryTree, DirectoryTrees } from './DirectoryTree';
import { FileDtl, FileDtls } from './FileDtl';
import WebUser from '/@/bp/web/WebUser';
/**
 * 表单类别-表单
 */
export class TreeEns_DirectoryTree2FileDtl extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_DirectoryTree2FileDtl');
    this.PageTitle = '网盘';
  }
  //重写的构造方法.
  override async Init() {
    this.RootNo = '0';
    //分组数据.
    const trees = new DirectoryTrees();
    const num = await trees.RetrieveAll(); // No,Name,ParentNo
    if (num == 0) {
      const en = new DirectoryTree();
      en.No = '100';
      en.Name = '主页';
      en.ParentNo = '0';
      en.Idx = -1;
      en.Icon = 'icon-home';
      await en.Insert();

      en.No = DBAccess.GenerGUID();
      en.Name = '子目录1';
      en.ParentNo = '100';
      en.Idx = -1;
      en.Icon = '';
      await en.Insert();

      en.No = DBAccess.GenerGUID();
      en.Name = '子目录2';
      en.ParentNo = '100';
      en.Idx = -2;
      en.Icon = '';
      await en.Insert();
      await trees.RetrieveAll(); // No,Name,ParentNo
    }
    this.TreeEns = trees;

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'No', name: '编号' },
      { id: 'Name', name: '名称', Width: 300 },
      { id: 'FrmTypeText3', name: '在线预览' },
      { id: 'EntityTypeText4', name: '在线编辑' },
      { id: 'EntityTypeText4', name: 'KKView' },

    ];
    // 关联的字段
    this.RefKey = 'TreeNo'; //关联的字段.
    if (WebUser.IsAdmin) {
      this.BtnsOfTableTop = '新建';
      this.BtnsOfItemOptions = '删除,权限,'; //行操作的按钮.
      this.IsEnMove = true; //实体是否可以移动？
    }
    this.DtlEns = new FileDtls();
  }

  public override async GetDtls(nodeID: string) {
    const dtls = new FileDtl();
    await dtls.Retrieve('TreeNo', nodeID, 'Idx');
    return dtls;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, _selectTreeOrg, _record: Nullable<RowData> = null) {
    if (btnLab === '新建') {
      const url = GloComm.UrlGPN('GPN_NetDiskNewDtl', '', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer30, url);
    }
    return false;
  }
}
