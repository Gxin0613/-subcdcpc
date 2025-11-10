import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { APP_MENU_CACHE_KEY } from '/@/enums/cacheEnum';
import { setAuthCache } from '/@/utils/auth';
import { ClassFactory } from '../da/ClassFactory';
import { UIContralType } from '../en/EnumLab';
import { FrmAttachment } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';
import { GloComm } from '/@/WF/Comm/GloComm';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

export class GL_UIContralSetting extends PageBaseGenerList {
  constructor() {
    super('GL_UIContralSetting');
    this.PageTitle = '控件设置';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.Icon = '';
    this.BtnOfToolbar = '新建应用,排序';
    this.HisGLShowModel = GenerListPageShowModel.Table;

    const enName = this.RequestVal('PKVal');
    const en = await ClassFactory.GetEn(enName);

    const data = [];
    const attrs = en.EnMap.attrs;
    attrs.forEach((attr) => {
      if (attr.UIContralType == UIContralType.AthShow) {
        data.push({
          No: attr.Key || attr.Field,
          Name: attr.Desc,
          UIContralType: '附件',
          UIBindKey: attr.UIBindKey,
          IsReadonly: attr.UIIsReadonly,
        });
      }

      if (attr.UIContralType == UIContralType.TB && (attr.MyDataType == 2 || attr.MyDataType == 3 || attr.MyDataType == 5 || attr.MyDataType == 8)) {
        data.push({
          No: attr.Key || attr.Field,
          Name: attr.Desc,
          UIContralType: '数值字段',
          UIBindKey: attr.UIBindKey,
          IsReadonly: attr.UIIsReadonly,
          DataType: attr.MyDataType,
        });
      }
    });

    //定义列,这些列用于显示.IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: '编号', IsShow: false, DataType: 2 },
      { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 350 },
      { Key: 'UIContralType', Name: '类型', IsShow: true, DataType: 1, width: 350 },
      { Key: 'DataType', Name: '数值类型字段', IsShow: false, DataType: 1, width: 350 },
    ];

    this.Data = data;
    // 进入低代码页面清理缓存
    setAuthCache(APP_MENU_CACHE_KEY, []);
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const frmID = this.RequestVal('PKVal');
    if (object.UIContralType == '附件') {
      const athPK = frmID + '_' + object.No;
      const ath = new FrmAttachment(athPK);
      const num = await ath.RetrieveFromDBSources();
      if (num == 0) {
        ath.Name = object.Name;
        ath.FK_MapData = frmID;
        ath.NoOfObj = object.No;
        if (object.UIBindKey.toString().includes('AthType=AthSingle')) ath.TopNumOfUpload = 1;
        if (object.IsReadonly) ath.IsUpload = false;
        await ath.Insert();
      }
      const url = GloComm.UrlEn('TS.FrmUI.FrmAttachmentExt', ath.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (object.UIContralType == '数值字段') {
      const athPK = frmID + '_' + object.No;
      const attr = new MapAttr(athPK);
      const num = await attr.RetrieveFromDBSources();
      if (num == 0) {
        attr.Name = object.Name;
        attr.FK_MapData = frmID;
        attr.KeyOfEn = object.No; //字段.
        attr.UIContralType = 0; //文本框.
        attr.MyDataType = object.MyDataType; //字段.
        attr.DefValType = '0'; //默认值.
        attr.SetPara('EnName', 'TS.FrmUI.MapAttrNum');
        await attr.Insert();
      }
      const url = GloComm.UrlEn('TS.FrmUI.MapAttrNum', attr.MyPK);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
  }
  override BtnClick(btnName: string, record: Record<string, any>) {
    if (btnName === '应用排序' || btnName === '排序') {
      const url = GloComm.UrlDtlSearch('', 'TS.GPM.MySystem', '', '', '', '', 'Name,Icon', true, '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    if (btnName === '新建应用') {
      // WF/Comm/GroupPageNew?EnName=GPN_NewFlow
      // GotoUrl 文件地址  例如打开GPN /@/WF/Comm/UIEntity/GroupPageNew.vue?xxx=xxx
      // OpenUrlByNewWindow 路由地址 例如打开GPN /#/WF/Comm/GroupPageNew?xxx=xxx  这里看路由文件的配置
      const url = '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_System';
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    alert('没有判断的BtnName=' + btnName + record);
    return;
  }
}
