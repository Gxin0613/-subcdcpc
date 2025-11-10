import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { DataType } from '/@/bp/en/DataType';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_BillFocus extends PageBaseGenerList {
  constructor() {
    super('GL_BillFocus');
    this.PageTitle = '我的关注(收藏)';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '保存日期'; //日期字段名.
    this.LinkField = 'Title';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.GroupFields = 'FrmName';
    this.LabFields = 'WFState'; //可以控制内容的转义输出比如 @Red=警告.

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
      { Key: 'BillNo', Name: '单号', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'FrmName', Name: '单据名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'StarterName', Name: '发起人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'Sender', Name: '发送人', IsShow: true },
      { Key: 'RDT', Name: '发起日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
      { Key: 'IsRead', Name: '是否读取', IsShow: false, IsShowMobile: false, DataType: 2, RefFunc: 'IsRead' },
      { Key: 'WFState', Name: '标签', IsShow: false, IsShowMobile: true, DataType: 2, width: 150 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    const data: any = await handler.DoMethodReturnJson('Focus_Init');
    console.log('data', data);

    //处理数据,增加标签. @liuwei.
    data.forEach((en) => {
      if (en.BillState == 1) en.WFState = '@草稿=orange';
      if (en.BillState == 2) en.WFState = '@编辑中=yellow';
      if (en.BillState == 3) en.WFState = '@审核中=blue';
      if (en.BillState == 5) en.WFState = '@退回=red';
      if (en.BillState == 7) en.WFState = '@删除=red';
      if (en.BillState == 100 || en.BillState == 200) en.WFState = '@归档=green';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
    });

    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    let url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + object.No + '&WorkID=' + workID + '&RoutFrom=MyBill';
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
