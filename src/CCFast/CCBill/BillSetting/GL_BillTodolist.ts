import { DataType } from '/@/bp/en/DataType';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_BillTodolist extends PageBaseGenerList {
  constructor() {
    super('GL_BillTodolist');
    this.PageTitle = '待办';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title'; //焦点字段.

    this.GroupFields = 'StarterName,FrmName'; //分组字段.

    this.LabFields = 'WFState';
    this.Icon = '';
    this.BtnOfToolbar = '批处理';
    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
      { Key: 'BillNo', Name: '单号', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'FrmName', Name: '单据名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'StarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
      // { Key: 'PRI', Name: '优先', IsShow: true, IsShowMobile: false, DataType: 1, width: 50, RefFunc: 'PRI' },
      { Key: 'WFState', Name: '标签', IsShow: false, IsShowMobile: true, DataType: 2, width: 150 },
    ];

    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddUrlData();
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    const data: any = await handler.DoMethodReturnJson('DB_Todolist');
    //处理数据,增加标签.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      //  const lab = '';
      if (en.BillState == 1) en.WFState = '@草稿=orange';
      if (en.BillState == 2) en.WFState = '@编辑中=yellow';
      if (en.BillState == 3) en.WFState = '@审核中=blue';
      if (en.BillState == 5) en.WFState = '@退回=red';
      if (en.BillState == 7) en.WFState = '@删除=red';
      if (en.BillState == 100 || en.BillState == 200) en.WFState = '@归档=green';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
      en.RDT = en.RDT.substring(0, en.RDT.length - 3);
    });

    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    let url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + object.No + '&WorkID=' + workID + '&RoutFrom=MyBill&Frm=Todolist&U=' + WebUser.No;
    const keys = Object.keys(object);
    for (const key of keys) {
      url += `&${key}=${object[key]}`;
    }
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    const hashUrl = window.location.hash;
    let url = '';
    if (btnName == '批处理') {
      if (object) {
        if (hashUrl.includes('WF') == true) url = '/#/WF/Comm/GenerList?EnName=GL_Batch&NodeID=' + object.NodeID;
        else if (hashUrl.includes('Middle') == true) url = '/#/Middle/GenerList?EnName=GL_Batch&NodeID=' + object.NodeID;
        else url = '/#/WF/Comm/GenerList?EnName=GL_Batch&NodeID=' + object.NodeID;
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      } else {
        if (hashUrl.includes('WF') == true) url = '/#/WF/Comm/GenerList?EnName=GL_Batch';
        else if (hashUrl.includes('Middle') == true) url = '/#/Middle/GenerList?EnName=GL_Batch';
        else url = '/#/WF/Comm/GenerList?EnName=GL_Batch';
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }
    }

    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
