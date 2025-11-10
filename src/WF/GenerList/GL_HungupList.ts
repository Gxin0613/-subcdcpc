import { message } from 'ant-design-vue';
import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GetPara } from '/@/utils/gener/StringUtils';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { AtPara } from '/@/bp/da/AtPara';
import WebUser from '/@/bp/web/WebUser';

export class GL_HungupList extends PageBaseGenerList {
  constructor() {
    super('GL_HungupList');
    this.PageTitle = '挂起';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title'; //焦点字段.
    this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = 'FlowName'; //默认分组字段.
    this.LabFields = 'State';
    this.Icon = '';
    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
      { Key: 'FlowName', Name: '流程', IsShow: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 160 },
      { Key: 'NodeID', Name: '节点ID', IsShow: false, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'NodeName', Name: '停留节点', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'HungupTime', Name: '挂起时间', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'HunguperName', Name: '挂起人员', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'HungupWay', Name: '挂起方式', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
      { Key: 'Sender', Name: '发送人', IsShow: true, DataType: 1, width: 121 },
      { Key: 'State', Name: '状态', IsShow: true, IsShowMobile: true, DataType: 2, width: 150 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    const data: any = await handler.DoMethodReturnJson('HungupList_Init');
    //处理数据,增加标签.
    this.Data = [];
    data.forEach((en) => {
      const atpara = new AtPara(en.AtPara);
      const name = atpara.GetValStrByKey('HunguperName');
      const hunguperNo = atpara.GetValStrByKey('Hunguper');
      if (name != null && name != '' && name != undefined) {
        en.HunguperName = name.split(',').length == 2 ? name.split(',')[1].replace(';', '') : name;
      }
      const way = atpara.GetValIntByKey('HungupWay');
      if (way === 0) {
        en.HungupWay = '永久挂起';
      }
      const hungupSta = atpara.GetValIntByKey('HungupSta');
      const checkerNo = atpara.GetValStrByKey('HungupChecker');
      if (WebUser.No === hunguperNo) {
        if (hungupSta === 0) en.State = '申请中';
        if (hungupSta === 1) en.State = '申请通过,挂起';
        if (hungupSta === 2) en.State = '申请驳回';
        this.Data.push(en);
      }
      if (WebUser.No === checkerNo) {
        if (hungupSta === 0) {
          en.State = '待审批';
          en.Btns = '同意,不同意';
          this.Data.push(en);
        }
      }
    });
    //设置数据源.
    //this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    const atpara = new AtPara(object.AtPara);
    const hunguperNo = atpara.GetValStrByKey('Hunguper');
    const checkerNo = atpara.GetValStrByKey('HungupChecker');
    let url = '';
    if (WebUser.No === hunguperNo) url = '/src/WF/MyFlow.vue?WorkID=' + workID;
    if (WebUser.No === checkerNo) url = '/src/WF/MyView.vue?WorkID=' + workID;

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
  //按钮事件.
  BtnClick(btnName: string, object: Record<string, any>) {
    const workID = object.WorkID;
    if (btnName === '同意') {
      return this.Agree(object.FK_Flow, workID);
    }
    if (btnName === '不同意') {
      this.Reject(object.FK_Flow, workID);
      return;
    }
  }

  //执行同意挂起.
  async Agree(flowNo: string, workID: string) {
    if (window.confirm('您确定要同意吗?') == false) return;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('WorkID', workID);
    handler.AddPara('FK_Flow', flowNo);
    const data = await handler.DoMethodReturnString('HungupList_Agree');
    if (data.indexOf('err@') == 0) {
      message.warning(data);
      return;
    }
    message.info(data);
    return new GPNReturnObj(GPNReturnType.DoNothing);
  }

  //执行不同意挂起.
  async Reject(flowNo: string, workID: string) {
    const msg = window.prompt('输入要拒绝的原因？');
    if (msg == null) return;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('WorkID', workID);
    handler.AddPara('FK_Flow', flowNo);
    handler.AddPara('Msg', msg);
    const data: string = await handler.DoMethodReturnString('HungupList_Reject');
    if (data.indexOf('err@') == 0) {
      message.warning(data);
      return;
    }
    message.success(data.replace('@', ''));
    return new GPNReturnObj(GPNReturnType.DoNothing);
  }
}
