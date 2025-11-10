import { GloComm } from '/@/WF/Comm/GloComm';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import WebUser from '/@/bp/web/WebUser';
import { GenerAskFrm } from '../AskFrm/GenerAskFrm';

export class GL_AskFrmMyCreate extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_AskFrmMyCreate');
    this.PageTitle = '我创建的';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = 'Title'; //关键字段.
    this.GroupFields = 'FrmName'; //分组字段.
    this.LabFields = 'AskFrmState';
    //this.GroupFieldDefault = 'FK_FlowSortText'; //默认分组字段.
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    // if (WebUser.IsAdmin == true) this.BtnOfToolbar = '新建活动';
    // this.BtnOfToolbar = '宫格展示';
    // this.GroupFieldDefault='';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'FrmID', Name: 'FrmID', IsShow: false, IsShowMobile: true, DataType: 1, width: 50 },
      { Key: 'FrmName', Name: '表单', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
      { Key: 'Title', Name: '标题', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      //  { Key: 'AskModelText', Name: '问卷模式', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      // { Key: 'UserScropText', Name: '用户范围', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'AskFrmState', Name: '状态', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
      { Key: 'DTFrom', Name: '日期从', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
      { Key: 'DTTo', Name: '到', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },

      { Key: 'NumRelEmp', Name: '下发', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
      { Key: 'NumVisite', Name: '访问', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
      { Key: 'NumSubmit', Name: '提交', IsShow: true, IsShowMobile: true, DataType: 1, width: 20 },
      { Key: 'RDT', Name: '创建日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
      //  { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    const data = await handler.DoMethodReturnJson('GL_AskFrmMyCreate');

    //处理数据,增加ICON.
    data.forEach((en) => {
      en.Btns = '';
      if (en.AskFrmState == 0) {
        en.AskFrmState = '@设计中=orange';
        en.Btns = '连接,下发';
      }
      if (en.AskFrmState == 1) {
        en.AskFrmState = '@运行中=green';
        en.Btns = '连接,下发,表单,进度';
      }
      if (en.AskFrmState == 2) {
        en.AskFrmState = '@调查完毕=blue';
        en.Btns = '表单,进度';
      }
      if (en.AskFrmState == 3) {
        en.AskFrmState = '@强制结束=red';
        en.Btns = '';
      }
    });

    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const mypk = object.MyPK;
    const en = new GenerAskFrm(mypk);
    await en.Retrieve();
    let enName = 'GL_AskBillDtl';
    if (en.AskFrmApp === 'AskFlow') enName = 'GL_AskFlowDtl';
    const url = GloComm.UrlGenerList(enName, '&FrmID=' + en.FrmID + '&RefMyPK=' + mypk + '&AskFrmType=' + en.AskFrmApp + 'Inside');
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  async BtnClick(btnName: string, _object: Record<string, any>) {
    if (btnName == '新建活动') {
      const frmID = this.RequestVal('FrmID');
      if (frmID == '' || frmID == null || frmID == undefined) {
        const url = GloComm.UrlGPN('GPN_SelectedAskFrm', '', '');
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url);
      }

      const name = window.prompt('请输入名称', '我的问卷');
      if (name == undefined) return;

      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('FrmID', frmID);
      handler.AddPara('Title', name);
      await handler.DoMethodReturnString('CreateAskFrm');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, '创建成功');

      // const en = new GenerAskFrm();
      // en.Title = name;
      // en.FrmID = this.RequestVal('FrmID'); //表单ID.

      // const frm = new MapData(en.FrmID);
      // await frm.Retrieve();
      // //en.AskModel = frm.AskModel; //问卷模式.
      // en.AskFrmUserType = 'AskBill.' + frm.GetParaString('AskFrmUserType'); //问卷模式
      // //en.Copy(frm);
      // en.FrmName = frm.Name; //表单名称.
      // en.RDT = DataType.CurrentDateTime;
      // en.RecNo = WebUser.No;
      // en.RecName = WebUser.Name;
      // await en.Insert();

      // const url = GloComm.UrlEn('TS.CCBill.' + 'AskBill' + frm.GetParaString('AskFrmUserType'), en.MyPK);
      // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url);
    }
    alert('没有解析:' + btnName);
  }
}
