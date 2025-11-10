import { GenerBill } from '../GenerBill';
import { DataType } from '/@/bp/en/DataType';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { FrmTracks } from '/@/WF/Comm/Components/FrmTrack';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_BillCheck extends PageBaseGenerList {
  constructor() {
    super('GL_BillCheck');
    this.PageTitle = '单据审核';
  }
  //重写的构造方法.
  async Init() {
    // this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    // this.DTFieldOfLabel = '发起日期'; //日期字段名.
    // this.LinkField = 'Title'; //焦点字段.
    // this.GroupFields = 'StarterName,FrmName'; //分组字段.
    //this.LabFields = 'BillState';
    this.Icon = '';
    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 1000; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    const workID = this.RequestVal('WorkID');
    const gb = new GenerBill();
    gb.WorkID = workID;
    await gb.Retrieve();

    if (gb.BillState == 3) {
      if (gb.CurrCheckerNos.indexOf(WebUser.No) >= 0) {
        this.BtnOfToolbar = '审核通过,不同意退回';
      }
    }

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    this.Columns = [
      { Key: 'ActionTypeText', Name: '操作', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'Msg', Name: '消息', IsShow: true, IsShowMobile: true, DataType: 1, width: 300 },
      { Key: 'RecName', Name: '相关操作员', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
    ];

    const tks = new FrmTracks();
    await tks.Retrieve('WorkID', workID, 'RDT');
    //设置数据源.
    this.Data = tks;
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
