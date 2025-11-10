import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import dayjs from 'dayjs';
import { Flow } from '../TSClass/Flow';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
export class GL_TodolistConfirmTrue extends PageBaseGenerList {
  constructor() {
    super('GL_TodolistConfirmTrue');
    this.PageTitle = '确认待办';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title'; //焦点字段.

    let flowNo = this.RequestVal('FlowNo'); //流程编号参数.
    if (!!flowNo) flowNo = this.RequestVal('PKVal');

    if (!!flowNo) {
      this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
      this.GroupFieldDefault = 'FlowName'; //默认分组字段.
    } else {
      this.GroupFields = 'NodeName,StarterName'; //分组字段.
    }
    this.LabFields = 'WFState';
    this.Icon = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    let isShowColumn = true;
    if (!!flowNo) {
      const flow = new Flow();
      flow.No = flowNo;
      await flow.Retrieve();
      //自定义显示列.
      if (flow.BuessFieldRole == 1) {
        isShowColumn = false;
        this.Columns = [
          { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
          { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
          { Key: 'FlowStarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
          { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
          { Key: 'WFState', Name: '标签', IsShow: true, IsShowMobile: true, DataType: 2, width: 150 },
        ];
        const keys = flow.BuessFields.split(',');
        const bussFieldNames = flow.BuessFieldNames || flow.GetParaString('BuessFieldNames', '');
        const names = bussFieldNames.split(',');
        for (let i = 0; i < keys.length; i++) {
          this.Columns.push({
            Key: keys[i],
            Name: names[i],
            IsShow: true,
            IsShowMobile: false,
            DataType: 2,
          });
        }
      }
    }

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    // if (this.Columns == null) {

    //   // 增加字段.
    //   // 增加标签.
    // }
    if (isShowColumn == true)
      this.Columns = [
        { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
        { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
        { Key: 'StarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
        { Key: 'WFState', Name: '标签', IsShow: true, IsShowMobile: true, DataType: 2, width: 150 },
        { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
        { Key: 'NodeID', Name: '节点ID', IsShow: false, IsShowMobile: false, DataType: 1, width: 150 },
        { Key: 'NodeName', Name: '停留节点', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
        { Key: 'FlowName', Name: '流程', IsShow: true, IsShowMobile: false, DataType: 1, width: 150 },
        { Key: 'Sender', Name: '发送人', IsShow: true, DataType: 1, width: 121 },
        // { Key: 'PRI', Name: 'PRI', IsShow: true, IsShowMobile: false, DataType: 1, width: 50, RefFunc: 'PRI' },
        { Key: 'SDT', Name: '应完成日期', IsShow: true, IsShowMobile: false, DataType: DataType.AppDateTime, width: 225 },
        {
          Key: 'ADT',
          Name: '接收时间',
          IsShow: true,
          IsShowMobile: true,
          DataType: DataType.AppDateTime,
          width: 80,
          RefFunc: 'FirendlyDT',
        },
        { Key: 'IsRead', Name: '是否读取', IsShow: false, IsShowMobile: false, DataType: 2, RefFunc: 'IsRead' },
      ];
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    const data: any = await handler.DoMethodReturnJson('Confim_True_Init');
    const curr = dayjs(DataType.CurrentDateTime).toDate();
    //处理数据,增加标签.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      let lab = '';
      if (en.SDT != '无' && dayjs(en.SDT).toDate() < curr) lab = '@逾期=red'; //@lyc
      if (en.WFState == 1) {
        en.WFState = '@草稿=orange';
        en.SDT = '';
      }
      if (en.WFState == 2) en.WFState = lab + '@新工作=green';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 7) en.WFState = '@作废=red';
      if (en.WFState == 5) en.WFState = lab + '@退回=red';
      if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      if (en.WFState == 6) en.WFState = lab + '@移交=red';
      if (en.WFState == 8) en.WFState = lab + '@加签=gree';
      if (en.AtPara.includes('@IsCC=1')) {
        en.WFState = '@抄送=blue';
        en.SDT = ''; //没有应完成日期.
      }
      // if (en.PRI == 0) en.PRI = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
      en.ADT = this.FirendlyDT(en.ADT);
      en.SDT = !!en.SDT && en.SDT != '无' ? dayjs(en.SDT).format('YYYY-MM-DD HH:mm') : '无';
      en.RDT = !!en.RDT ? (en.RDT == '无' ? '无' : dayjs(en.RDT).format('YYYY-MM-DD HH:mm')) : '';
      //处理发送人 for ningbogang
      const sender = en.Sender;
      if (sender != null && sender != '' && sender != undefined) {
        en.Sender = sender.split(',').length > 1 ? sender.split(',')[1].replace(';', '') : sender.split(',')[0];
      }
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

  BtnClick(btnName: string, object: Record<string, any>) {
    return;
  }
}
