import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { message } from 'ant-design-vue';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { FrmSorts } from '../../TSClass/Admin/FrmSort';
import { FrmAdms } from '../../TSClass/Admin/FrmAdm';
import { GloComm } from '../../Comm/GloComm';
import GloFrm from '../FrmLogic/GloFrm';
import { MapData } from '../FrmLogic/MapData';
/**
 * 表单类别-表单
 */
export class TreeEns_FrmSort2FrmAdminGrop extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_FrmSort2FrmAdminGrop');
    this.PageTitle = '表单模板库';
  }
  //重写的构造方法.
  override async Init() {
    if (WebUser.No != 'admin') {
      message.error('err@您好:' + WebUser.Name + ',非admin管理员用户不能查看.');
      return;
    }

    //分组数据.
    const trees = new FrmSorts();
    await trees.RetrieveAll(); // No,Name,ParentNo
    this.TreeEns = trees;
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) this.RootNo = '0';
    else this.RootNo = WebUser.OrgNo; //定义树的根目录.

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'No', name: '编号' },
      { id: 'Name', name: '名称', Width: 300 },
      { id: 'FrmTypeText', name: '表单类型' },
      { id: 'PTable', name: '存储表' },
    ];
    // 关联的字段
    this.RefKey = 'FK_FormTree'; //关联的字段.
    // this.BtnsOfToolbar = '目录维护,分组模式,查询模式'; //超链接时间
    // this.BtnsOfToolbar = '查询模式';
    // this.BtnsOfTableTop = '目录属性,新建表单,导入表单,批量删除';
    this.BtnsOfTableTop = '目录属性,新建表单,导入,实体,单据';

    this.BtnsOfItemOptions = '设置,删除,运行,'; //行操作的按钮.
    this.IsEnMove = true; //实体是否可以移动？
    this.DtlEns = new FrmAdms();
  }

  public override async GetDtls(nodeID: string) {
    const frms = new FrmAdms();
    await frms.Retrieve('FK_FormTree', nodeID, 'Idx');
    return frms;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string) {
    // if (btnLab === '分组模式') {
    //   const url = 'url@/WF/Comm/GroupPanel.vue?EnName=TS.WF.Admin.FlowAdms';
    //   return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    // }
    //@zhoupeng
    if (btnLab === '查询模式') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlSearch('TS.WF.Admin.FrmAdm', ''));
    }

    if (btnLab === '目录维护') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlTree('TS.WF.Admin.FrmSort', ''));
    }

    if (btnLab === '删除' || btnLab === '批量删除') {
      return this.Items_Delete(itemIDs);
    }

    if (btnLab === '编辑' || btnLab === '双击行') {
      // NodeFormType.RefNodeFrm
      await GloFrm.CheckForm(itemIDs);

      //判断表单类型.
      const md = new MapData(itemIDs);
      md.No = itemIDs;
      await md.RetrieveFromDBSources();
      const url = md.UrlDesigner(); //获得设计器的url.
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (btnLab === '新建表单' || btnLab === '表单' || btnLab == '新建项目') {
      const url = GloComm.UrlGPN('GPN_NewFrm', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    //@liyongchao
    if (btnLab === '导入表单' || btnLab == '导入') {
      const url = GloComm.UrlGPN('GPN_ImpFrm', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '目录属性') {
      // const url = '/@/WF/Comm/En.vue?EnName=TS.WF.Admin.FrmSort&PKVal=' + treeNodeID;
      const url = GloComm.UrlEnOnly('TS.WF.Admin.FrmSort', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '设置') {
      const url = GloComm.UrlEn('TS.CCBill.FrmDict', itemIDs);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url + '&FrmID=' + itemIDs);
    }
    if (btnLab === '运行') {
      const url = `/src/CCFast/CCBill/SearchDict.vue?FrmID=${itemIDs}`;
      // const url = GloComm.UrlEn('TS.WF.Admin.FrmSort', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    if (btnLab === '单据') {
      const userNo = WebUser.No;
      const url = GloComm.UrlEn('TS.CCBill.BillSetting', userNo);
      // `/src/CCFast/CCBill/SearchDict.vue?FrmID=${itemIDs}`;
      // const url = GloComm.UrlEn('TS.WF.Admin.FrmSort', treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnLab === '实体') {
      const url = GloComm.UrlGenerList('GL_DictStart');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    alert('没有判断的类型:' + btnLab);
    return false;
  }
}
