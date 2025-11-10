import { message } from 'ant-design-vue';
import { GenerWorkFlowExt } from './GenerWorkFlowExt';
import { DataType } from '/@/bp/en/DataType';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_AdminReback extends PageBaseGenerList {
  constructor() {
    super('GL_AdminReback');
    this.PageTitle = '回滚';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 按照日期范围查询的字段，为空就不需要日期段查询.
    // this.DTFieldOfLabel = '发起日期'; //日期字段名.
    // this.LinkField = 'Title'; //焦点字段.
    const workID = this.RequestVal('PKVal'); //流程编号参数.

    const gwf = new GenerWorkFlowExt(workID);
    await gwf.RetrieveFromDBSources();
    if (gwf.WFState != 3) {
      message.warning('只有完成状态下的流程才能被回滚,流程运行到:[' + gwf.NodeName + '],状态:[' + gwf.WFStateText + ']');
      return;
    }
    const flowNo = gwf.FK_Flow;
    this.Icon = '';

    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    //定义列,这些列用于显示, IsPass, PRI是特殊字段.
    this.Columns = [
      { Key: 'FK_Emp', Name: '人员账号', IsShow: true, IsShowMobile: false, DataType: 2, width: 150 },
      { Key: 'EmpName', Name: '人员名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 200 },
      { Key: 'NodeID', Name: '节点ID', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'NodeName', Name: '节点名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 100 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', workID);
    handler.AddPara('FK_Flow', flowNo);
    const data: any = await handler.DoMethodReturnString('Rollback_Init');

    //处理数据,增加标签.
    data.forEach((en) => {
      en.Btns = '回滚到此';
      // // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      // let lab = '';
      // if (en.WFState == 1) en.WFState = '@草稿=orange';
      // if (en.WFState == 2) en.WFState = '@新工作=green';
      // if (en.WFState == 4) en.WFState = '@挂起=green';
      // if (en.WFState == 7) en.WFState = '@删除=red';
      // if (en.WFState == 5) en.WFState = lab + '@退回=red';
      // if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      // if (en.WFState == 6) en.WFState = lab + '@移交=red';
      // if (en.WFState == 8) en.WFState = lab + '@加签=red';
      // if (en.PRI == 0) en.PRI = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>';
      // en.ADT = this.FirendlyDT(en.ADT);
      // en.SDT = en.SDT.substring(0, en.SDT.length);
      en.FK_Emp = en.EmpFrom;
      en.EmpName = en.EmpFromT;
      en.NodeID = en.NDFrom;
      en.NodeName = en.NDFromT;
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
    if (btnName == '回滚到此') {
      const workID = this.RequestVal('WorkID'); //流程编号参数.
      const en = new BSEntity('BP.WF.GenerWorkFlow', workID);
      await en.Init();
      await en.RetrieveFromDBSources();

      const msg = window.prompt('回滚原因', '');
      if (msg === '' || msg == null) return;

      const str = await en.DoMethodReturnString('DoRollback', object.NodeID, msg, object.FK_Emp);
      message.info(str);
      return new GPNReturnObj(GPNReturnType.CloseAndReload);
    }

    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
