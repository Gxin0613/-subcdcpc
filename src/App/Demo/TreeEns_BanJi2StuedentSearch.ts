import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Students } from './Student';
import { GloComm } from '/@/WF/Comm/GloComm';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { BanJis } from './BanJi';
/**
 * 班级学生
 */
export class TreeEns_BanJi2StuedentSearch extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_BanJi2StuedentSearch');
    this.PageTitle = '班级学生Search';
  }

  //重写的构造方法.
  override async Init() {
    this.IsLazy = false; // 是否懒加载.

    //列表显示模式
    this.ListMode = 'Search'; //列表查询模式.

    const banJis = new BanJis();
    await banJis.RetrieveAll();
    this.TreeEns = banJis;
    //实体数据类.
    this.RefKey = 'BanJiNo'; //关联的字段,用于数据查询.
    this.DtlEns = new Students();
 
    this.BtnsOfTableTop = '新建,批量删除';
    this.BtnsOfItemOptions = '编辑,删除'; //行操作的按钮.
    this.IsEnMove = false; //实体是否可以移动？
    this.IsTreeEnMove = true; //实体是否可以移动？
    this.IsPartTimeJob = true; //实体是否加载兼职部门。
  }
  //获得从表的明细.
  public override async GetDtls(nodeID: string) {
    //主部门.
    const emps = new Students();
    await emps.Retrieve('BanJiNo', nodeID);
    return emps;
  }

  /**
   * 所有的按钮事件，都调用这个事件.(行事件,BtnsOfTableTop事件,  BtnsOfTop事件)
   * @param btnLab 按钮标签, 用户自定义的按钮, 默认的有"双击行"事件.
   * @param treeNodeID 节点ID,
   * @param selectedRowID 当前选择的行,可以为空.
   * @param selectedRowIDs 当前多选的行多个记录使用逗号分开,格式: 001,002,003,
   * @returns true,false: 是否要刷新当前页面.
   */
  override BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, treeNodeOrgNo: Nullable<string>, record: Nullable<RowData>) {

    //调用父类方法.
    if (btnLab == '新建' || btnLab === '新建人员') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlGPN('GPN_Student', '') + '&DeptNo=' + treeNodeID);
    }

    //调用父类的方法.
    if (btnLab == '批量删除') return this.Items_Delete(itemIDs, treeNodeID);

    //调用父类的方法.
    if (btnLab == '删除') {
      if (window.confirm('您确定要删除[' + itemIDs + ']吗?') == false) return new GPNReturnObj(GPNReturnType.DoNothing); //要刷新.;
      return this.Items_Delete(itemIDs, treeNodeID);
    }
    if (btnLab == '编辑' || btnLab == '双击行') {
      const url = GloComm.UrlEn('TS.Demo.Student', itemIDs);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    //调用父类的方法.
    // if (btnLab == '编辑') return this.Item_Edit(selectedRowID);
    if (btnLab == '双击行') return this.Item_Edit(itemIDs);

    alert('按钮:' + btnLab + '没有解析.');
  }
}
