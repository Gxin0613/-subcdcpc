import { MethodDictRefBill } from './MethodDictRefBill';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_DictRefBill extends PageBaseGenerList {
  constructor() {
    super('GL_DictRefBill');
    this.PageTitle = '单据';
  }
  //重写的构造方法.
  async Init() {
    const workID = this.RequestVal('OID');

    const en = new MethodDictRefBill();
    en.No = this.RequestVal('MethodID');
    await en.Retrieve();

    this.PageSize = 10;
    this.BtnOfToolbar = '新建';
    this.Icon = '';
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    this.DTFieldOfSearch = 'RDT'; //按照日期范围查询的字段.
    this.DTFieldOfLabel = '日期'; //日期字段名.

    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('DictFrmID', en.Name);
    handler.AddPara('WorkID', workID);
    handler.AddJson(en);
    const data = await handler.DoMethodReturnJson('GL_DictRefBill');

    const row = data?.['dt']?.[0];
    let keys = [];
    if (row) {
      keys = Object.keys(row);
    }
    const cols = data['Table1'];
    if (Array.isArray(cols)) {
      for (const col of cols) {
        if (keys.includes(col.Key + 'T')) {
          col.Key = col.Key + 'T';
        }
        if (keys.includes(col.Key + 'Text')) {
          col.Key = col.Key + 'Text';
        }
      }
    }
    this.Columns = cols;
    console.log({ cols });
    this.Data = data['dt']; //设置数据源.

    // this.Columns = data['Table1']; //设置列.

    // // 把  mydata 属性转化为json.
    // this.Columns = [
    //   { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false },
    //   { Key: 'DeptName', Name: '部门', width: 160 },
    //   { Key: 'RecName', Name: '执行人', width: 160 },
    //   { Key: 'Msg', Name: '执行消息', width: 500 },
    //   { Key: 'AtPara', Name: '内容', width: 500 },
    //   { Key: 'RDT', Name: '执行日期', width: 160 },
    // ];
    // //获得参数:增加参数列.
    // const attrs = new MapAttrs();
    // await attrs.Retrieve('FK_MapData', mID);
    //设置数据源.
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const en = new MethodDictRefBill();
    en.No = this.RequestVal('MethodID');
    await en.Retrieve();
    const isSinglePages = this.RequestVal('IsSinglePages') || '1';
    let url = `/@/CCFast/CCBill/MyBill.vue?FrmID=${en.Tag1}&WorkID=${object.OID}&RoutFrom=MyBill`;
    const isMobile = IsMobile();
    if (isMobile) url = `/@/CCFastMobile/MyBill.vue?FrmID=${en.Tag1}&WorkID=${object.OID}&RoutFrom=MyBill&IsSinglePages=${isSinglePages}`;

    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  //按钮事件.
  async BtnClick(btnName: string, object: Record<string, any>) {
    const en = new MethodDictRefBill();
    en.No = this.RequestVal('MethodID');
    await en.Retrieve();

    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', en.Tag1);
    const workID = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');

    //查询单据.
    const geBill = new BSEntity(en.Tag1, workID);
    geBill.OID = workID;
    await geBill.Retrieve();

    //查询实体.
    const geFrm = new BSEntity(en.FrmID);
    geFrm.OID = this.RequestVal('OID');
    await geFrm.RetrieveFromDBSources();

    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', en.Tag1);

    for (const attr of attrs) {
      if (!attr.UIVisible) {
        continue;
      }
      geBill.setVal(attr.KeyOfEn, geFrm.getVal(attr.KeyOfEn));
    }

    //设置单据编号名称.
    geBill.setVal(en.RefDictNo, geFrm.getVal('BillNo')); //设置关联主键.
    geBill.setVal(en.RefDictName, geFrm.getVal('Title')); //设置关联主键.

    await geBill.Update();
    const isSinglePages = this.RequestVal('IsSinglePages') || 1;
    let url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + en.Tag1 + '&WorkID=' + workID + '&RoutFrom=MyBill';

    if (IsMobile()) url = '/@/CCFastMobile/MyBill.vue?FrmID=' + en.Tag1 + '&WorkID=' + workID + '&RoutFrom=MyBill&IsSinglePages=' + isSinglePages;
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }
}
