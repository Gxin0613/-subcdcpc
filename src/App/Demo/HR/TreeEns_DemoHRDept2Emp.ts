import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { HREmps } from './HREmp';
import { GloComm } from '/@/WF/Comm/GloComm';
import { HRDepts } from './HRDept';
/**
 * 组织结构维护
 */
export class TreeEns_DemoHRDept2Emp extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_DemoHRDept2Emp');
    this.PageTitle = '组织结构';
  }

  //重写的构造方法.
  override async Init(rootNo = '0') {
    //树数据.
    const trees = new HRDepts();
    await trees.Init();
    this.RootNo = '0'; //定义树的根目录.
    await trees.Retrieve('ParentNo', rootNo, 'Idx'); // No,Name,ParentNo
    if (rootNo === '0') {
      const treeNexts = new HRDepts();
      await treeNexts.Retrieve('ParentNo', trees[0].No, 'Idx');
      for (const treeNextsKey of treeNexts) {
        trees.push(treeNextsKey);
      }
    }
    this.TreeEns = trees;

    //实体数据类.
    this.DtlEns = new HREmps();
    this.RefKey = 'DeptNo'; //关联的字段,用于数据查询.
    this.Columns = [
      { id: 'No', name: '账号', IsShow: false },
      { id: 'Name', name: '名称', IsShow: true, Width: 300 },
      { id: 'Tel', name: '电话', IsShow: true },
      { id: 'Email', name: '邮件', IsShow: true },
    ];
    this.BtnsOfTableTop = '新建人员,批量删除';
    this.BtnsOfItemOptions = '编辑,删除'; //行操作的按钮.
    this.IsEnMove = false; //实体是否可以移动？
    this.IsTreeEnMove = true; //实体是否可以移动？
    this.IsPartTimeJob = true; //实体是否加载兼职部门。
  }

  //获得从表的明细.
  public override async GetDtls(nodeID: string) {
    const emps = new HREmps();
    await emps.Retrieve('DeptNo', nodeID);
    return emps;
  }
  public override async BtnClick(btnLab: string, treeNodeID: string, selectedRowID = '', _treeNodeOrgNo = '', _row) {
    //调用父类方法.
    if (btnLab == '新建' || btnLab === '新建人员') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlGPN('GPN_Emp', '') + '&DeptNo=' + treeNodeID);
    }
    //调用父类的方法.
    if (btnLab == '批量删除') return this.Items_Delete(selectedRowID, treeNodeID);
    if (btnLab == '编辑' || btnLab == '双击行') {
      const url = GloComm.UrlEn('TS.Demo.HREmp', selectedRowID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnLab == '双击行') return this.Item_Edit(selectedRowID);
    alert('按钮:' + btnLab + '没有解析.');
  }
}
