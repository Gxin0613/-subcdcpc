import { DataType } from '/@/bp/en/DataType';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
import { message } from 'ant-design-vue';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_AdminGenerList extends PageBaseGenerList {
  constructor() {
    super('GL_AdminGenerList');
    this.PageTitle = '管理处理人';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 按照日期范围查询的字段，为空就不需要日期段查询.
    // this.DTFieldOfLabel = '发起日期'; //日期字段名.
    // this.LinkField = 'Title'; //焦点字段.

    const workID = this.RequestVal('PKVal'); //流程编号参数.
    const gwf = new GenerWorkFlowExt(workID);
    await gwf.RetrieveFromDBSources();
    if (gwf.WFState == 3) {
      message.error('只有审批、退回、草稿中的流程才能管理处理人,流程运行到:[' + gwf.NodeName + '],状态:[' + gwf.WFStateText + ']');
      return;
    }

    this.LabFields = 'IsPass';
    this.Icon = '';
    this.BtnOfToolbar = '新增处理人';

    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    //定义列,这些列用于显示, IsPass, PRI是特殊字段.
    this.Columns = [
      { Key: 'FK_Emp', Name: '人员账号', IsShow: true, IsShowMobile: false, DataType: 2, width: 350 },
      { Key: 'FK_EmpText', Name: '人员名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 200 },
      { Key: 'FK_Node', Name: '节点编号', IsShow: true, IsShowMobile: false, DataType: 2 },
      { Key: 'FK_NodeText', Name: '节点名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
      { Key: 'RDT', Name: '日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 160 },
      { Key: 'IsPass', Name: '状态', IsShow: true, IsShowMobile: true, DataType: 2, width: 150 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];
    const en = new BSEntity('BP.WF.GenerWorkFlow', workID);
    await en.Retrieve();
    const data = await en.DoMethodReturnJSON('GenerTrackForReback');

    //处理数据,增加标签.
    data.forEach((en) => {
      en.Btns = '移除';
      const lab = '';
      if (en.IsPass == 0) en.IsPass = lab + '@未审批=green';
      if (en.IsPass == 1) en.IsPass = lab + '@已审批=green';
      en.RDT = en.RDT.substring(0, en.RDT.length - 3);
    });

    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    let url = '/#/WF/MyFlow?WorkID=' + workID;
    const atpara = object.AtPara;
    if (!!atpara && (atpara.includes('@IsCC=1') || atpara.includes('@IsAuto=1'))) url = '/#/WF/MyCC?WorkID=' + workID;
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID', 'PFlowNo', 'PNodeID'];
    for (const key of keys) {
      if (key === 'WorkID') continue;
      if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
    }
    //   window.open(url); //打开页面。
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    const hashUrl = window.location.hash;
    const url = '';
    if (btnName == '新增处理人') {
      const nodeID = this.RequestVal('NodeID');
      const flowNo = this.RequestVal('FlowNo');
      //开始节点不能增加处理人只能调整
      if (parseInt(parseInt(flowNo) + '01') === parseInt(nodeID)) {
        return new GPNReturnObj(GPNReturnType.Message, '开始节点不能增加处理人只能调整处理人'); //要刷新.
      }
      const workID = this.RequestVal('PKVal'); //流程编号参数.

      const emps = window.prompt('请输入处理人的账号', '');
      if (emps === '' || emps == null) return;

      const en = new BSEntity('BP.WF.GenerWorkFlow', workID);
      await en.Retrieve();
      await en.DoMethodReturnString('AddEmps', emps, '增加处理人.');
      return new GPNReturnObj(GPNReturnType.Reload); //要刷新.
    }

    if (btnName == '移除') {
      const workID = this.RequestVal('PKVal'); //流程编号参数.

      if (window.confirm('您确定要移除[' + object.FK_EmpText + ']吗？') == false) return;

      const en = new BSEntity('BP.WF.GenerWorkFlow', workID);
      await en.Retrieve();
      const str = await en.DoMethodReturnString('RemoveEmps', object.FK_Emp);
      alert(str);
      return new GPNReturnObj(GPNReturnType.Reload); //要刷新.
    }
    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
