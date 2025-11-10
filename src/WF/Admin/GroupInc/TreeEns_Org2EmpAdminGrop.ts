import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { Depts } from '/@/bp/port/Dept';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { message } from 'ant-design-vue';
import WebUser from '/@/bp/web/WebUser';
import { GloComm } from '../../Comm/GloComm';
import { Orgs } from '../Organization/AdminGroup/Org';
/**
 * 组织结构维护
 */
export class TreeEns_Org2EmpAdminGrop extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_Org2EmpAdminGrop');
    this.PageTitle = '组织树';
  }

  //重写的构造方法.
  override async Init(rootNo = '0') {
    if (WebUser.No != 'admin') {
      message.error('err@您好:' + WebUser.Name + ',非admin管理员用户不能查看.');
      return;
    }
    this.IsLazy = false; // 是否懒加载.
    //树数据.
    const trees = new Orgs();
    await trees.Init();
    await trees.RetrieveAll('Idx');
    this.RootNo = '0'; //定义树的根目录.
    this.TreeEns = trees;

    //实体数据类.
    this.DtlEns = new Depts();
    this.RefKey = 'OrgNo'; //关联的字段,用于数据查询.

    this.Columns = [
      { id: 'No', name: '编号', IsShow: true, widit: 150 },
      { id: 'Name', name: '名称', IsShow: true, widit: 500 },
      { id: 'ParentNo', name: 'ParentNo', IsShow: false, widit: 150 },
      { id: 'Leader', name: '部门领导', IsShow: true, widit: 150 },
      { id: 'Specer', name: '分管领导', IsShow: true, widit: 150 },
      { id: 'LinkMan', name: '联络员', IsShow: true, widit: 150 },
    ];
    this.TableTreeRootNo = '0';
    this.BtnsOfItemOptions = '编辑,删除'; //行操作的按钮.
    this.IsEnMove = false; //实体是否可以移动？
    this.BtnsOfTableTop = '组织属性';
    // this.IsShowAddClick = true; //显示新建按钮.
    // this.IsShowEditGroupIcon = true; //显示分组实体按钮.
    // this.IsGroupMove = true; //分组是否可以移动？
    // 调用方法 /WF/Comm/PanelGroup.vue?EnName=FlowSort2Flow
  }
  //获得从表的明细.
  public override async GetDtls(nodeID: string) {
    this.TableTreeRootNo = nodeID;
    // const sql = `SELECT a.No FROM Port_Dept A,Port_Org B WHERE A.OrgNo='${nodeID}' AND B.No!='${nodeID}' `;
    // const sql = `SELECT a.No FROM Port_Dept A,Port_Org B WHERE A.OrgNo='${nodeID}' AND B.No!='${nodeID}' `;
    const depts = new Depts();
    //await depts.RetrieveIn('OrgNo', sql);
    await depts.Retrieve('OrgNo', nodeID, 'Idx');
    return depts;
  }

  /**
   * 所有的按钮事件，都调用这个事件.(行事件,BtnsOfTableTop事件,  BtnsOfTop事件)
   * @param btnLab 按钮标签, 用户自定义的按钮, 默认的有"双击行"事件.
   * @param treeNodeID 节点ID,
   * @param selectedRowID 当前选择的行,可以为空.
   * @param selectedRowIDs 当前多选的行多个记录使用逗号分开,格式: 001,002,003,
   * @returns true,false: 是否要刷新当前页面.
   */
  public override async BtnClick(btnLab: string, treeNodeID: string, selectedRowID = '', treeNodeOrgNo = '', row) {
    if (btnLab == '编辑' || btnLab == '双击行') {
      const url = GloComm.UrlEn('TS.Port.Dept', row.No);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnLab == '双击行') return this.Item_Edit(selectedRowID);

    if (btnLab == '组织属性') {
      const enName = 'TS.Port.AdminGroup.Org';
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlEn(enName, treeNodeID));
    }

    alert('按钮:' + btnLab + '没有解析.');
  }
}
