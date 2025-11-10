import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '/@/utils/gener/HttpHandler';
export class GL_AskFrmDtl extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    //  throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_AskFrmDtl');
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
    this.LabFields = 'EntityState'; //可以控制内容的转义输出比如 @Red=警告.
    this.BtnOfToolbar = '批量催办';
    this.ShowCheckBox = true;

    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'UserID', Name: '用户编号', IsShow: true, IsShowMobile: false, DataType: 2 },
      { Key: 'UserName', Name: '用户名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'RDT', Name: '记录日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'SubmitDT', Name: '提交日期', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'EntityState', Name: '状态', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'IP', Name: 'IP', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    // //获得数据源.
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    handler.AddPara('MyPK', this.RequestVal('RefMyPK'));
    const data: any = await handler.DoMethodReturnJson('GL_AskFrmDtl_Init');

    data.forEach((en) => {
      // en.Btns = '操作';
      if (en.EntityState == 0) {
        //  en.Btns = '删除,催办';
        en.EntityState = '@已下发=orange';
      }
      if (en.EntityState == 1) {
        // en.Btns = '删除,催办';
        en.EntityState = '@草稿=red';
      }
      if (en.EntityState == 2) {
        //en.Btns = '查看,删除';
        en.EntityState = '@提交=green';
      }
    });
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const url = GloComm.UrlGenerList('GL_AskBillDtl', '&RefMyPK=' + object.MyPK);
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
      const data: any = await handler.DoMethodReturnJson('GL_AskFrm_Press');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (btnName == '批量催办') {
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', rowKeys);
      const data: any = await handler.DoMethodReturnJson('GL_AskFrm_Press');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
    if (btnName === '表单') {
      const mypk = _object.MyPK;
      const url = '/src/CCFast/CCBill/AskFrm/MyAskFrm.vue?No=' + mypk;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName === '生成连接' || btnName === '连接') {
      const frmID = this.RequestVal('FrmID');
      const refMyPK = this.RequestVal('RefMyPK');
      const url = `分享连接:${location.origin}/#/ShareUrl?MyPK=${refMyPK}&FrmID=${frmID}`;
      return new GPNReturnObj(GPNReturnType.Message, url);
    }
    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
