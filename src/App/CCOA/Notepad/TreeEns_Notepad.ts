import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import WebUser from '/@/bp/web/WebUser';
import { Notepads } from './Notepad';
import { Dept, Depts } from '/@/bp/port/Dept';
/**
 * 表单类别-表单
 */
export class TreeEns_Notepad extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_Notepad');
    this.PageTitle = '记事本';
  }
  //重写的构造方法.
  override async Init() {
    this.RootNo = '0';
    const trees = new Depts();
    const tree = new Dept();
    tree.No = '2025';
    tree.Name = '2025';
    tree.ParentNo = '0';
    trees.push(tree);

    const pads = new Notepads();
    await pads.RetrieveAll();
    let strs = '';
    for (const pd of pads) {
      if (strs.includes(pd.NY) == true) continue;
      strs += ',' + pd.NY;
      // 字典
      const dept = new Dept();
      dept.No = pd.NY;
      dept.Name = pd.NY;
      dept.SetValByKey('ParentNo', '2025');
      dept.SetValByKey('Icon', 'icon-list');
      trees.push(dept);
    }

    this.TreeEns = trees;

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'MyPK', name: '编号' },
      { id: 'Name', name: '名称', Width: 300 },
      { id: 'IsStar', name: '是否标星?', Width: 300 },
      { id: 'RDT', name: '日期', Width: 300 },
    ];
    // 关联的字段
    this.RefKey = 'TreeNo'; //关联的字段.
    if (WebUser.IsAdmin) {
      this.BtnsOfTableTop = '新建';
      this.BtnsOfItemOptions = '删除,权限,'; //行操作的按钮.
      this.IsEnMove = true; //实体是否可以移动？
    }
    this.DtlEns = pads;
  }

  public override async GetDtls(nodeID: string) {
    const dtls = new Notepads();
    await dtls.Retrieve('NY', nodeID, 'Idx');
    return dtls;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, _selectTreeOrg, _record: Nullable<RowData> = null) {
    if (btnLab === '新建') {
      const url = GloComm.UrlGPN('GPN_Notepad', '', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer30, url);
    }
    if (btnLab === '双击行') {
      const url = GloComm.UrlEnOnly('TS.CCOA.Notepad', _record.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, url);
    }

    alert(btnLab);
  }
}
