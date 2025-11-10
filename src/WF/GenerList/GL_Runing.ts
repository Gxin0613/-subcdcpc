import { message } from 'ant-design-vue';
import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Flow } from '/@/WF/TSClass/Flow';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Node } from '/@/WF/TSClass/Node';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { isComPage } from '/@/utils/gl';
import { router } from '/@/router';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_Runing extends PageBaseGenerList {
  constructor() {
    super('GL_Runing');
    this.PageTitle = `${'在途'}`;
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.PageTitle = '在途';
    this.BtnOfToolbar = '帮助';

    // this.BtnsOfRow = '催办,撤销发送'; //行操作按钮.
    //  this.BtnOfToolbar = '待办,草稿'; //table按钮.
    this.GroupFields = 'NodeName,FlowName'; //可以分组显示的字段..
    this.GroupFieldDefault = 'FlowName';
    this.PageSize = 10; // 分页的页面行数, 0不分页.
    this.Icon = '';
    this.ShowIdx = false; //是否显示序号列?
    // this.ShowCheckBox = true;
    // this.BtnOfToolbar = 'ceshi';
    let flowNo = this.RequestVal('FlowNo'); //流程编号参数.
    if (!flowNo) flowNo = this.RequestVal('PKVal');

    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.
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
          { Key: 'NodeName', Name: '停留节点', width: 160 },
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

    // 定义列，这些列用于显示.
    if (isShowColumn == true)
      this.Columns = [
        { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false },
        { Key: 'Title', Name: '标题', IsShow: true, width: 350 },
        { Key: 'StarterName', Name: '发起人', IsShow: true, width: 120 },
        { Key: 'FlowName', Name: '流程', IsShow: true, width: 120 },
        { Key: 'NodeName', Name: '停留节点', IsShow: true, width: 160 },
        { Key: 'RDT', Name: '发起日期', IsShow: true, width: 160 },
        { Key: 'HS', Name: '耗时', IsShow: true, width: 170 },
        { Key: 'TodoEmps', Name: '当前处理人', IsShow: true, width: 200 },
        { Key: 'DeptName', Name: '发起人部门', IsShow: true, width: 150 },
        { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
      ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddUrlData(); //获得页面参数.
    handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    const data: any = await handler.DoMethodReturnJson('Runing_Init');

    const curr = dayjs(DataType.CurrentDateTime).toDate();

    //处理数据,增加标签.
    dayjs.extend(duration);
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      let lab = '';
      if (en.SDT != '无' && dayjs(en.SDT).toDate() < curr) lab = '@逾期=red';
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
      if (en.WFState == 8) en.WFState = lab + '@加签=green';

      //到达时间友好提示.
      // en.RDT = this.FirendlyDT(en.RDT);
      //处理发送人 for ningbogang
      const sender = en.TodoEmps || '';
      const emps = sender.split(';')
      let todoEmps = ',';
      emps.forEach(item=>{
        const strs = item.split(',');
        if(strs.length==1 && todoEmps.includes(strs[0])==false)
          todoEmps+=strs[0]+',';
        if(strs.length==2 && todoEmps.includes(strs[1])==false)
          todoEmps+=strs[1]+',';
      })
      todoEmps = todoEmps.substring(1);
      if(todoEmps.endsWith(','))
        todoEmps = todoEmps.substring(0,todoEmps.length-1);
       en.TodoEmps = todoEmps;
       //if (sender != null && sender != '' && sender != undefined) {
       //  en.TodoEmps = sender.split(',').length == 2 ? sender.split(',')[1].replace(';', '') : sender;
       //}
      if (en.Starter == WebUser.No) {
        en.Btns = '催办' + ',' + '撤销';
      } else {
        en.Btns = '催办';
      }
      const givenDate = dayjs(en.RDT); // "2024-08-02 17:50:17"
      const currentDataTimes = dayjs(DataType.CurrentDateTimes); // "2024-08-02 18:49:31"
      // 计算 givenDate 和 currentDataTimes 之间的差异（秒）
      const diffInSeconds = currentDataTimes.diff(givenDate, 'second');
      // 使用 dayjs.duration 来创建一个持续时间对象
      const duration = dayjs.duration(diffInSeconds * 1000); // 注意：dayjs.duration 需要毫秒数
      // 根据时间差的不同部分来格式化字符串
      if (duration.asHours() < 1) {
        en.HS = duration.format('m分'); // 使用方括号可以避免当分钟或秒数为 1 时前面的 'm' 或 's' 被解释为 'minute' 或 'second' 的缩写
      } else if (duration.asDays() < 1) {
        en.HS = duration.format('H时m分');
      } else {
        en.HS = duration.format('D天H时m分');
      }
    });
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    // let url = '/#/WF/MyView?';
    let url = '/src/WF/MyView.vue?';
    const workBillNo = object.BillNo || '';
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID', 'CurrNode'];
    let nodeID = object['FK_Node'];
    const node = new Node();
    node.setPKVal(nodeID);
    const i = await node.RetrieveFromDBSources();
    if (i == 0) {
      message.warning('节点[' + nodeID + ']已经删除,打开开始节点的流程信息');
      nodeID = parseInt(parseInt(object.FK_Flow || object.FlowNo) + '01');
    }
    let workID = object['WorkID'];
    let fid = object['FID'];
    if (node.RunModel != 4 && node.RunModel != 5 && fid != 0) {
      workID = fid;
      fid = 0;
    }
    for (const key of keys) {
      if (key === 'FK_Node') {
        url += `&${key}=${nodeID}`;
        continue;
      }
      if (key === 'WorkID') {
        url += `&${key}=${workID}`;
        continue;
      }
      if (key === 'FID') {
        url += `&${key}=${fid}`;
        continue;
      }
      if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
    }
    url += '&WorkBillNo=' + workBillNo;
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    const PathHash = location.hash;
    let urlPath: any = '';
    if (IsMobile()) {
      const mobileUrl = url.replace('/src/WF/', '/CCMobile/').replace('.vue', '');
      try {
        router.push(mobileUrl);
      } catch (e: any) {
        location.hash = '#' + mobileUrl;
      }
      return;
    }
    if (PathHash.includes('/WF/Port') || flowOpenModel == 3) {
      urlPath = isComPage(url);
      url = urlPath + '&win=true';
      // 新标签页打开;
      window.open(url);
      return;
    }
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, object.NodeName);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url, object.NodeName);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, object.NodeName);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url, object.NodeName);
  }

  //按钮事件.
  BtnClick(btnName: string, object: Record<string, any>, _ids: string) {
    const workID = object?.WorkID;
    if (btnName === '撤销') {
      return this.UnSend(workID, object.FK_Flow, object);
    }
    if (btnName === '催办') {
      this.Prsss(workID);
      return;
    }
    if (btnName === '帮助') {
      message.info('在途：我参与的工作，但是这个流程没有结束，我可以执行催办与撤销操作。');
      return;
    }
  }

  //执行催办.
  async Prsss(workID: string) {
    // @hyh , 这里是Js的，目前需要翻译.
    const msg = window.prompt('请输入催办原因:');
    if (msg == null) return;

    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('WorkID', workID);
    handler.AddPara('Msg', msg);
    const data = await handler.DoMethodReturnString('Runing_Press');

    if (data.indexOf('err@') == 0) {
      message.warning(data);
      return;
    }
    message.info(data);
    return;
    //return new GPNReturnObj(GPNReturnType.DoNothing);
  }

  //撤销发送工作.
  async UnSend(workID: string, _flowNo: string, object: Record<string, any>) {
    if (window.confirm('您确定要撤销本次发送吗？') == false) return;
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyView');
      handler.AddPara('WorkID', workID);
      handler.AddPara('UnSendToNode', 0); //撤销发送到的节点.
      const data: string = await handler.DoMethodReturnString('MyView_UnSend');
      if (data.indexOf('err@') == 0) {
        return alert(data);
      }

      if (data.indexOf('KillSubThared') == 0) {
        message.error(data.replace('KillSubThared@', ''));
        return;
      }
      message.success(data.replace('@', ''));
      let url = '/src/WF/MyFlow.vue?';
      const keys = Object.keys(object);
      const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID'];
      for (const key of keys) {
        if (key === 'FK_Node') {
          let nodeID = object[key];
          const node = new Node();
          node.setPKVal(nodeID);
          const i = await node.RetrieveFromDBSources();
          if (i == 0) {
            message.warning('节点[' + nodeID + ']已经删除,打开开始节点的流程信息');
            nodeID = parseInt(parseInt(object.FK_Flow || object.FlowNo) + '01');
          }
          url += `&${key}=${nodeID}`;
          continue;
        }
        if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
      }
      const flowOpenModel = CommonConfig.FlowOpenModel || 0;
      const PathHash = location.hash;
      let urlPath: any = '';
      if (IsMobile()) {
        const mobileUrl = url.replace('/src/WF/', '/CCMobile/').replace('.vue', '');
        try {
          router.push(mobileUrl);
        } catch (e: any) {
          location.hash = '#' + mobileUrl;
        }
        return;
      }
      if (PathHash.includes('/WF/Port') || flowOpenModel == 3) {
        urlPath = isComPage(url);
        url = urlPath + '&win=true';
        // 新标签页打开;
        window.open(url);
        return;
      }
      if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
      if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
      if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url, object.FlowName);
      if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    } catch (e) {
      message.error(e as string);
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }
    // const url = '/#/WF/MyFlow?WorkID=' + workID + '&FK_Flow=' + flowNo;
    // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
}
