import { message } from 'ant-design-vue';
import { FlowAdms } from '../TSClass/Admin/FlowAdm';
import { FlowAttr } from '../TSClass/Flow';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import WebUser from '/@/bp/web/WebUser';
import BSEntity from '/@/utils/gener/BSEntity';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { GloComm } from '../Comm/GloComm';
import { Orgs } from './SaaS/Org';
import { useUserStore } from '/@/store/modules/user';

/**
 * 流程类别流程
 */
export class TreeEns_PortOrg2Flow extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_PortOrg2Flow');
    this.PageTitle = '流程模板';
  }

  //重写的构造方法.
  override async Init() {
    //判断权限.
    if (WebUser.IsAdmin == false) {
      message.error('err@您好:' + WebUser.Name + ',非管理员用户不能查看.');
      //没有权限自动退出登录
      const userStore = useUserStore();
      userStore.logout(true);
      return;
    }
    if (WebUser.CCBPMRunModel != CCBPMRunModel.SAAS) {
      message.error('err@仅SAAS模式可以访问此页面.');
      return;
    }
    //分组数据.
    const trees = new Orgs();
    await trees.RetrieveAll(); // No,Name,ParentNo
    this.TreeEns = trees;
    this.RootNo = WebUser.OrgNo; //定义树的根目录.

    // 定义列，这些列用于显示.
    this.Columns = [
      { id: FlowAttr.No, name: '编号', width: 60 },
      { id: FlowAttr.Name, name: '名称', Width: '500px' },
      { id: FlowAttr.PTable, name: '存储表' },
      { id: 'FlowDevModelText', name: '模式' },
      { id: FlowAttr.IsCanStart, name: '启动?', dataType: DataType.AppBoolean },
      { id: 'CreateDate', name: '创建日期', dataType: DataType.AppDate },
    ];

    this.RefKey = 'OrgNo'; //关联的字段.
    // this.BtnsOfToolbar = '视频教程'; //超链接时间
    this.BtnsOfToolbar = '运维,移交'; //超链接时间

    this.BtnsOfTableTop = '目录属性,AI创建,新建,导入';
    this.BtnsOfItemOptions = '编辑,删除,测试,'; //行操作的按钮.
    this.IsEnMove = true; //实体是否可以移动？
    this.DtlEns = new FlowAdms();
    this.DtlEns.forEach((en) => {
      if (en.IsCanStart === 1) en.IsCanStart = '是';
      else en.IsCanStart = '否';
    });

    // this.IsShowAddClick = true; //显示新建按钮.
    // this.IsShowEditGroupIcon = true; //显示分组实体按钮.
    // this.IsGroupMove = true; //分组是否可以移动？
    // 调用方法 /WF/Comm/PanelGroup.vue?EnName=FlowSort2Flow
  }
  public override async GetDtls(nodeID: string) {
    const flows = new FlowAdms();
    await flows.Retrieve('OrgNo', nodeID, 'Idx');
    return flows;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string) {
    if (btnLab === '删除' || btnLab === 'Delete') {
      if (window.confirm('您确定要删除[' + itemIDs + ']吗?') == false) return;
      try {
        const en = new BSEntity('BP.WF.Flow', itemIDs);
        en.No = itemIDs;
        await en.Retrieve();
        const msg = await en.DoMethodReturnJSON('DoDelete');
        message.success(msg);
      } catch (error: any) {
        message.info(error);
      }
      return new GPNReturnObj(GPNReturnType.Update, null); //要刷新.
      // return this.Items_Delete(itemIDs);
    }

    if (btnLab === '编辑' || btnLab === '双击行') {
      // const { VITE_GLOB_WFPlant } = getAppEnvConfig();
      // if (VITE_GLOB_WFPlant == 'Flowable') {
      //   const url = '/#/WF/Designer/EditFlow?FlowNo=' + itemIDs;
      //   return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
      // }
      //  const url = '/#/WF/Designer/EditFlow?FlowNo=' + itemIDs;
      const url = GloComm.UrlFlowD(itemIDs);

      //  const url = '/#/WF/Designer/EditFlow?FlowNo=' + itemIDs;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
    if (btnLab === '测试') {
      //需要选择测试人员
      const url = GloComm.UrlGenerList('GL_FlowTester', '&FlowNo=' + itemIDs);
      //const url = '/#/WF/TestingContainer/Default?FlowNo=' + itemIDs + '&CurrPage=MyFlow';
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '移交') {
      const url = GloComm.UrlGPN('GPN_WorkShiftBatch', '&SortNo=' + treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === 'AI流程' || btnLab === 'AI创建') {
      const url = GloComm.UrlGPN('GPN_AIFlowNew', '&SortNo=' + treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '新建流程' || btnLab === '新建') {
      const url = GloComm.UrlGPN('GPN_NewFlowOfSaaS', '&SortNo=' + treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnLab === '导入流程' || btnLab === '导入') {
      const url = GloComm.UrlGPN('GPN_ImpFlow', treeNodeID); // '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_ImpFlow&SortNo=' + treeNodeID;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    if (btnLab === '视频教程') {
      const url = 'http://doc.ccbpm.cn';
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (btnLab === '实例运维' || btnLab === '运维') {
      const url = '/src/WF/Comm/Search.vue?EnName=TS.FlowData.GenerWorkFlowView&OrgNo=' + WebUser.OrgNo; // GloComm.UrlEn('TS.FlowData.GenerWorkFlowView', '&OrgNo=' + WebUser.OrgNo);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnLab === '目录属性' || btnLab === '目录维护') {
      const url = GloComm.UrlEn('TS.WF.Admin.FlowSort', '&PKVal=' + treeNodeID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    alert('没有判断的类型按钮类型:[' + btnLab + ']');
    return false;
  }
}
