import { GloComm } from '../../Comm/GloComm';
import { MapAttr, MapAttrs } from '../FrmLogic/MapAttrs/MapAttr';
import { MapData } from '../FrmLogic/MapData';
import { MapDtls } from '../FrmLogic/MapDtl';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import WebUser from '/@/bp/web/WebUser';
import { getAppEnvConfig } from '/@/utils/env';
import { getVstoHost } from '/@/utils/VstoUtils';
type DataColumn = {
  MyPK: string;
  Name: string;
  KeyOfEn: string;
  FieldDataType: string;
  Src: string;
  Visible: string;
  Enable: string;
  Icon: string;
};
export class GL_VSTOFrm extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_VSTOFrm');
    this.PageTitle = 'VSTO表单';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.GroupFields = 'Src'; //分组字段.
    this.GroupFieldDefault = 'Src'; //分组字段.
    this.Icon = '';

    const md = new MapData();
    md.No = this.RequestVal('FrmID');
    await md.RetrieveFromDBSources();
    const isHiddenBtn = this.RequestVal('IsHiddenBtn') || '0'; 

    if (md.EntityType == 1) this.BtnOfToolbar = '新建元素,VSTO设计器,单据设计,运行单据';
    if (md.EntityType == 2) this.BtnOfToolbar = '新建元素,VSTO设计器,实体设计,运行实体';
    if (this.BtnOfToolbar == '') this.BtnOfToolbar = '新建元素,VSTO设计器,预览,经典表单';
    if (md.EntityType == 100) this.BtnOfToolbar = '';
    if(isHiddenBtn === '1')  this.BtnOfToolbar = '';

    this.PageSize = 300; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, DataType: 1, width: 100 },
      { Key: 'Src', Name: '来源', IsShow: true, DataType: 1 },
      { Key: 'KeyOfEn', Name: '字段名', IsShow: true, DataType: 1, width: 200 },
      { Key: 'Name', Name: '中文名', IsShow: true, DataType: 1, width: 400 },
      { Key: 'FieldDataType', Name: '字段类型', IsShow: true, DataType: 1, width: 150 },
      { Key: 'Visible', Name: '是否可见', IsShow: true, DataType: 1, width: 150 },
      { Key: 'Enable', Name: '是否可用', IsShow: true, DataType: 1, width: 150 },
      { Key: 'Icon', Name: 'Icon', IsShow: false, DataType: 1, width: 150 },
    ];

    //构造数据.
    const data: Array<DataColumn> = [];
    const convertToBoolean = (val: unknown) => {
      if (typeof val === 'string') {
        return val;
      }
      if (typeof val === 'number') {
        return val === 1 ? '是' : '否';
      }
      return !!val ? '是' : '否';
    };
   // debugger;
    //获得数据.
    let frmID = this.RequestVal('FrmID');
    if (frmID == null || frmID == undefined) frmID = this.RequestVal('PKVal');

    // const pubCols = ',OID,Title,StarterName,Starter,FK_Dept,OrgNo,RDT,BillState,BillNo,AtPara,FID,';
    const pubCols = '';

    const mapAttrs = new MapAttrs(); //获得主表字段.
    await mapAttrs.Retrieve('FK_MapData', frmID, 'Idx');
    //1. todo:把主表字段集合追加进去.
    for (const attr of mapAttrs) {
      if (pubCols.includes(',' + attr.KeyOfEn + ',') == true) continue;

      const { MyPK, Src = '主表' + frmID, KeyOfEn, Name, FieldDataType = '未判断', UIVisible = true, UIIsEnable = true, MaxLen = 10 } = attr;

      data.push({ MyPK, Src, KeyOfEn, Name, FieldDataType: attr.DescIt(), Visible: convertToBoolean(attr.UIVisible), Enable: convertToBoolean(attr.UIIsEnable), Icon: attr.Icon });
    }

    const mapDtls = new MapDtls();
    await mapDtls.Retrieve('FK_MapData', frmID);

    // const mapDtls = new MapDtls(); //获得从表字段.
    // await mapDtls.Retrieve('FK_MapData', frmID, 'Idx');

    //2. 便利从表,把从表字段集合追加进去.
    for (let index = 0; index < mapDtls.length; index++) {
      const dtl = mapDtls[index];
      const mapAttrs = new MapAttrs(); //获得主表字段.
      await mapAttrs.Retrieve('FK_MapData', dtl.No, 'Idx');
      //3. todo:便利从表,把从表字段集合追加进去.
      for (const subTableAttr of mapAttrs) {
        if (subTableAttr.KeyOfEn == 'OID' || subTableAttr.KeyOfEn == 'MyPK') continue;
        if (subTableAttr.KeyOfEn == 'FID' || subTableAttr.KeyOfEn == 'AtPara') continue;
        if (subTableAttr.KeyOfEn == 'Idx' || subTableAttr.KeyOfEn == 'RefPK') continue;
        if (subTableAttr.KeyOfEn == 'Rec' || subTableAttr.KeyOfEn == 'RDT') continue;

        const { MyPK, Src = `${dtl.Name}:${dtl.No}`, KeyOfEn, Name, DataType = 1, UIVisible, UIIsEnable, MaxLen } = subTableAttr;
        let dataTypeStr = '';
        if (DataType == 1) {
          dataTypeStr += `str(${MaxLen})`;
        }
        data.push({ MyPK, Src, KeyOfEn, Name, FieldDataType: dataTypeStr, Visible: convertToBoolean(UIVisible), Enable: convertToBoolean(UIIsEnable) });
      }
    }

    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const mapAttr = new MapAttr();
    mapAttr.MyPK = object.MyPK;
    await mapAttr.RetrieveFromDBSources();

    const enName = mapAttr.GetEnName();
    const url = GloComm.UrlEn(enName, mapAttr.MyPK);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
  }

  /***
   * 获取当前浏览器名称
   */
  getBrowserName() {
    const userAgent = navigator.userAgent;
    let browserName;

    // 判断用户代理字符串中是否包含特定的标识符来识别浏览器
    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
      browserName = 'IE';
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
    } else {
      browserName = 'Unknown';
    }

    return browserName;
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    const frmID = this.RequestVal('FrmID');
    if (btnName == '新建元素') {
      const url = GloComm.UrlGPN('GPN_VSTONewField', '&FrmID=' + frmID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName == 'VSTO设计器') {
      let url = 'excelform://-fromccflow,AppID=TemplateDesinger,FrmID=';
      const frmID = this.RequestVal('FrmID');

      url += frmID + ',Token=' + WebUser.Token?.replace(',,', '');
      url += ',browserName=' + this.getBrowserName();
      url += ',backUrl=' + window.location.href;
      const host = getVstoHost();
      url += ',WSUrl=' + host;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
    if (btnName == '经典表单') {
      const url = `/#/WF/Designer/Form?FrmID=${frmID}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (btnName == '单据设计') {
      const url = GloComm.UrlEn('TS.CCBill.FrmBill', frmID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName == '运行单据') {
      const url = GloComm.UrlEn('TS.CCBill.BillSettingOne', frmID);
      const md = new BSEntity('BP.Sys.MapData');
      //await md.Init();
      md.No = frmID;
      md.setPK(frmID);
      await md.RetrieveFromDBSources();
      await md.DoMethodReturnString('ClearCache');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    if (btnName == '实体设计') {
      const url = GloComm.UrlEn('TS.CCBill.FrmDict', frmID);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnName == '运行实体') {
      const url = GloComm.UrlEn('TS.CCBill.DictSettingOne', frmID);
      const md = new BSEntity('BP.Sys.MapData');
      md.No = frmID;
      md.setPK(frmID);
      await md.RetrieveFromDBSources();
      await md.DoMethodReturnString('ClearCache');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    return;
    // throw new Error('Method not implemented.');
  }
}
