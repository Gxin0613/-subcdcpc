import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';
import { AskBillInside } from '../AskBill/AskBillInside';

export class GL_AskExamDtl extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    //  throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_AskExamDtl');
    this.PageTitle = '调查详情';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    this.DTFieldOfLabel = '创建日期'; //日期字段名.
    this.LinkField = 'Name';
    this.Icon = 'icon-drop';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    // this.GroupFields = 'FrmName';
    this.LabFields = 'AskFrmStateDtl'; //可以控制内容的转义输出比如 @Red=警告.

    const askBill = new AskBillInside(this.RequestVal('RefMyPK'));
    await askBill.RetrieveFromDBSources();

    // 设计中
    if (askBill.AskFrmState == 0) this.BtnOfToolbar = '设置,下发,删除活动,连接';
    // 进行中
    if (askBill.AskFrmState == 1) this.BtnOfToolbar = '批量催办,设置,下发,强制结束,强制删除,连接';
    // 已完成
    if (askBill.AskFrmState == 2) this.BtnOfToolbar = '';
    // 强制结束
    if (askBill.AskFrmState == 3) this.BtnOfToolbar = '';

    this.ShowCheckBox = true;

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'AskFrmStateDtl', Name: '状态1', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'UserID', Name: '用户编号', IsShow: true, IsShowMobile: false, DataType: 2 },
      { Key: 'UserName', Name: '用户名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '记录日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'SubmitDT', Name: '提交日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'IP', Name: 'IP', IsShow: false, IsShowMobile: false, DataType: 1, width: 100 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    // //获得数据源.
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    handler.AddPara('MyPK', this.RequestVal('RefMyPK'));
    const data: any = await handler.DoMethodReturnJson('GL_AskFrmDtl_Init');

    data.forEach((en) => {
      en.Btns = '';
      if (en.AskFrmStateDtl == -1) {
        en.Btns = '催办,删除';
        en.AskFrmStateDtl = '@已下发=yellow';
      }
      if (en.AskFrmStateDtl == 0) {
        en.Btns = '催办,删除';
        en.AskFrmStateDtl = '@已访问=orange';
      }
      if (en.AskFrmStateDtl == 1) {
        en.Btns = '催办,删除';
        en.AskFrmStateDtl = '@草稿=red';
      }
      if (en.AskFrmStateDtl == 2) {
        en.Btns = '表单,删除';
        en.AskFrmStateDtl = '@提交=green';
      }
      if (en.AskFrmStateDtl == 3) {
        en.Btns = '';
        en.AskFrmStateDtl = '@运行中=blue';
      }
      if (en.AskFrmStateDtl == 8) {
        en.Btns = '';
        en.AskFrmStateDtl = '@结束=red';
      }
      if (en.AskFrmStateDtl == 9) {
        en.Btns = '';
        en.AskFrmStateDtl = '@强制结束=red';
      }
    });

    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const url = GloComm.UrlEn('TS.CCBill.AskBillInside', object.MyPK);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url);
  }

  async BtnClick(btnName: string, _object: Record<string, any>, rowKeys: string) {
    if (btnName == '删除') {
      if (window.confirm('您确定要删除吗?') == false) return new GPNReturnObj(GPNReturnType.DoNothing);
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', _object.MyPK);
      const data: any = await handler.DoMethodReturnJson('GL_AskFrmDtl_Delete');
      return new GPNReturnObj(GPNReturnType.Reload, data);
    }

    if (btnName == '催办') {
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', _object.MyPK);
      const data: any = await handler.DoMethodReturnJson('GL_AskFrmDtl_Press');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (btnName == '批量催办') {
      if (rowKeys == '') return new GPNReturnObj(GPNReturnType.DoNothing, 'data');
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', rowKeys);
      const data: any = await handler.DoMethodReturnJson('GL_AskFrmDtl_Press');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (btnName === '表单') {
      //@yln 要处理这部分.
      const paras = `&RefMyPK=${_object.RefMyPK}&FrmID=${_object.FrmID}&RoutFrom=MyAskFrm&Frm=Todolist&U=${WebUser.No} `;
      const url = GloComm.UrlAskFrm(_object.MyPK, paras);
      const flowOpenModel = CommonConfig.FlowOpenModel || 0;
      if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
      if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
      if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
      if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
      // const mypk = _object.MyPK;
      // const url = GloComm.UrlAskFrm(mypk);
      // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName === '设置') {
      const url = GloComm.UrlEn('TS.AskFrm.AskBillInside', this.RequestVal('RefMyPK'));
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName === '下发') {
      const mypk = this.RequestVal('RefMyPK');
      const url = GloComm.UrlEnOnly('TS.AskFrm.RelToEmp', mypk);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName == '删除活动' || btnName == '强制删除') {
      if (window.confirm('您确定要删除活动吗?') == false) return new GPNReturnObj(GPNReturnType.DoNothing);
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', this.RequestVal('RefMyPK'));
      const data: any = await handler.DoMethodReturnJson('AskFrm_Delete');
      return new GPNReturnObj(GPNReturnType.Close, data);
    }
    if (btnName == '强制结束') {
      if (window.confirm('强制结束该活动吗?') == false) return new GPNReturnObj(GPNReturnType.DoNothing);
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', this.RequestVal('RefMyPK'));
      const data: any = await handler.DoMethodReturnJson('AskFrm_SetOver');
      return new GPNReturnObj(GPNReturnType.Close, data);
    }
    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
