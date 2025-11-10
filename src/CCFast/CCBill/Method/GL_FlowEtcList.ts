import { message } from 'ant-design-vue';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GenerWorkFlowExts } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GL_FlowEtcList extends PageBaseGenerList {
  constructor() {
    super('GL_FlowEtcList');
    this.PageTitle = '流程';
  }
  //重写的构造方法.
  async Init() {
  //  debugger;
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.PageTitle = '在途';
    // this.BtnsOfRow = '催办,撤销发送'; //行操作按钮.
    //  this.BtnOfToolbar = '待办,草稿'; //table按钮.
    //this.GroupFields = 'NodeName'; //可以分组显示的字段..
    this.GroupFieldDefault = '';
    this.PageSize = 10; // 分页的页面行数, 0不分页.

    const workID = this.RequestVal('WorkID');
    const frmID = this.RequestVal('FrmID');
    const flowNo = this.RequestVal('FlowNo');

    //检查该流程是否可以新建.
    if (WebUser.IsAdmin) this.BtnOfToolbar = '发起流程,设计流程';
    else this.BtnOfToolbar = '发起流程';

    this.Icon = '';
    this.LabFields = 'WFState';
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false },
      { Key: 'Title', Name: '标题', width: 250 },
      { Key: 'StarterName', Name: '发起人', width: 120 },
      { Key: 'NodeName', Name: '停留节点', width: 160 },
      // { Key: 'DeptName', Name: '发起人部门', width: 150 },
      { Key: 'RDT', Name: '到达时间', width: 160 },
      { Key: 'TodoEmps', Name: '当前处理人', width: 150 },
      { Key: 'WFState', Name: '状态', width: 100 },
    ];

    // :src="`/#/WF/GenerList?EnName=GL_FlowEtcList&OID=
    // ${props.params?.WorkID}
    // &FlowNo=${tab.methodID}
    // &FrmID=${props.params?.FrmID}
    // &MethodNo=${tab.key}`"

    const ens = new GenerWorkFlowExts();
    await ens.Retrieve('PWorkID', workID, 'FK_Flow', flowNo, 'PFlowNo', frmID, 'RDT');

    ens.forEach((en) => {
      //到达时间友好提示.
      en.RDT = this.FirendlyDT(en.RDT);
      const lab = '';
      if (en.WFState == 1) en.WFState = lab + '@草稿=blue';
      if (en.WFState == 2) en.WFState = lab + '@新工作=green';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 7) en.WFState = '@作废=red';
      if (en.WFState == 5) en.WFState = lab + '@退回=red';
      if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      if (en.WFState == 6) en.WFState = lab + '@移交=red';
      if (en.WFState == 8) en.WFState = lab + '@加签=green';

      // en.Btns = '催办,撤销发送';
      // 处理当前处理人
      if (typeof en.TodoEmps === 'string') {
        en.TodoEmps = en.TodoEmps.split(';')
          .filter((str) => !!str)
          .map((str) => {
            if (str.includes(',')) {
              const [_, name] = str.split(',');
              return name;
            }
            return '';
          })
          .join(',');
        if (en.TodoEmps == '') en.TodoEmps = '无';
      } else {
        en.TodoEmps = '无';
      }
    });

    // var ens = new Entities("BP.WF.GenerWorkFlows");
    // //获得数据源.
    // const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    // handler.AddUrlData(); //获得页面参数.
    // handler.AddPara('FlowNo', this.RequestVal('FlowNo'));
    // const data: any = await handler.DoMethodReturnJson('Runing_Init');
    // //处理数据,增加标签.
    // data.forEach((en) => {
    //   //到达时间友好提示.
    //   en.RDT = this.FirendlyDT(en.RDT);
    //   en.Btns = '催办,撤销发送';
    // });

    //设置数据源.
    this.Data = ens;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    let url = '/#/WF/MyView?';
    if (object.WFState == 0 || object.WFState == 1) {
      url = '/#/WF/MyFlow?';
    }

    const keys = Object.keys(object);
    const useKeys = ['FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID'];
    for (const key of keys) {
      if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
    }
    url = url + '&WorkID=' + object['WorkID'];
    console.log(url, object);
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  //按钮事件.
  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '设计流程') {
      const flowNo = this.RequestVal('FlowNo');
      const url = GloComm.UrlFlowD(flowNo);
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (btnName == '发起流程' || btnName == '启动流程' || btnName == '新建') {
      //const rls = new DBRoles();
      //rls.Retrieve('');
      // const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      // handler.AddPara('FrmID', frmID);
      // handler.AddPara('FlowNo', flowNo);
      // const data = await handler.DoMethodReturnString('MyBillBtnsEnable_FlowEtcIsCanStartFlow');
      // if (data === '1')

      const oid = this.RequestVal('WorkID'); //单据与实体都会调用他.
      const frmID = this.RequestVal('FrmID');
      const methodNo = this.RequestVal('MethodNo');
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('WorkID', oid);
      handler.AddPara('RefNo', oid); //有可能是实体编号.
      handler.AddPara('FrmID', frmID);
      handler.AddPara('MethodNo', methodNo); //方法ID.
      // handler.AddPara('EntityType', 'EntityNoName'); //方法ID.

      let data = (await handler.DoMethodReturnString('MyDict_DoFlowEtc_StartFlow')) as string;
      if (data.includes('err@') == true) {
        alert(data);
        return;
      }

      data = '/#/WF' + data;
      data = data.replace('../', '/');
      data = data.replace('.htm', '');
      return new GPNReturnObj(GPNReturnType.GoToUrl, data);
    }

    const workID = object.WorkID;
    if (btnName === '撤销发送') {
      return this.UnSend(workID, object.FK_Flow);
    }

    if (btnName === '催办') {
      this.Prsss(workID);
      return;
    }
  }

  //执行催办.
  async Prsss(workID: string) {
    // @hyh , 这里是Js的，目前需要翻译.
    const msg = window.prompt('请输入催办原因...');
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
    return new GPNReturnObj(GPNReturnType.DoNothing);
  }

  //撤销发送工作.
  async UnSend(workID: string, flowNo: string) {
    if (window.confirm('您确定要撤销本次发送吗？') == false) return;

    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    handler.AddPara('WorkID', workID);
    handler.AddPara('UnSendToNode', 0); //撤销发送到的节点.
    const data: String = await handler.DoMethodReturnString('Runing_UnSend');
    if (data.indexOf('err@') == 0) {
      return alert(data);
    }

    if (data.indexOf('KillSubThared') == 0) {
      message.error(data.replace('KillSubThared@', ''));
      return;
    }
    const url = '/#/WF/MyFlow?WorkID=' + workID + '&FK_Flow=' + flowNo;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
}
