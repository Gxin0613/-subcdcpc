import { DataType } from '/@/bp/en/DataType';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { GloComm } from '/@/WF/Comm/GloComm';
export class GL_AskFrmHistory extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_AskFrmHistory');
    this.PageTitle = '历史活动';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '参加日期'; //日期字段名.
    this.LinkField = 'Title'; //焦点字段.
    this.Icon = '';
    this.BtnOfToolbar = '';
    // this.BtnOfToolbar = '批处理,导出,打印';
    this.PageSize = 200; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    const frmID = this.RequestVal('FrmID');
    if (frmID == null || frmID == undefined || frmID == '') {
      //this.GroupFields = 'FrmName'; //分组字段.
      //定义列,这些列用于显示
      this.Columns = [
        { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
        { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
        { Key: 'FrmID', Name: '表单ID', IsShow: false, IsShowMobile: true, DataType: 1, width: 100 },
        { Key: 'FrmName', Name: '表单名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
        { Key: 'StarterName', Name: '下发人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
        { Key: 'RDT', Name: '下发日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
        { Key: 'SDT', Name: '应完成日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
      ];
    } else {
      this.Columns = [
        { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
        { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 350 },
        { Key: 'StarterName', Name: '下发人', IsShow: true, IsShowMobile: true, DataType: 1, width: 150 },
        { Key: 'RDT', Name: '下发日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
        { Key: 'SDT', Name: '应完成日期', IsShow: true, IsShowMobile: true, DataType: DataType.AppDateTime, width: 150 },
      ];
    }

    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    const data: any = await handler.DoMethodReturnJson('GL_AskFrmHistory');
    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    let url = '';
    if (object.AskFrmApp === 'AskBill') {
      const paras = `&RefMyPK=${object.RefMyPK}&FrmID=${object.FrmID}&RoutFrom=MyAskFrm&Frm=Todolist&U=${WebUser.No} `;
      url = GloComm.UrlAskFrm(object.MyPK, paras);
    }
    if (object.AskFrmApp === 'AskFlow') {
      const paras = `&RefMyPK=${object.RefMyPK}&FlowNo=${object.FrmID}&RoutFrom=MyAskFlow&Frm=Todolist&U=${WebUser.No} `;
      url = GloComm.UrlMyView(object.WorkID, paras);
    }
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  BtnClick(btnName: string, _object: Record<string, any>) {
    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
