import { GloComm } from '/@/WF/Comm/GloComm';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { MapAttr, MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

export class GL_FieldsORM extends PageBaseGenerList {
  constructor() {
    super('GL_FieldsORM');
    this.PageTitle = '数据源实体字段的同步';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.Columns = [
      { Key: 'Idx', Name: '序号', IsShow: true },
      { Key: 'KeyOfEn', Name: '字段', IsShow: true },
      { Key: 'Name', Name: '字段名', IsShow: true },
      { Key: 'DBType', Name: '返回类型', IsShow: true },
      { Key: 'ORMType', Name: '映射的类型', IsShow: true },
      { Key: 'FileType', Name: '业务类型', IsShow: true },
      { Key: 'Btns', Name: '操作', IsShow: false, width: 350 },
    ];

    const handler = new HttpHandler('BP.CCBill.WF_CCBill_Admin_DBList');
    handler.AddPara('FrmID', this.RequestVal('PKVal'));
    const reuslt = await handler.DoMethodReturnString('FieldsORM_Init');
    const data = JSON.parse(JSON.stringify(reuslt));
    const bakAttrs = new MapAttrs();
    await bakAttrs.Retrieve('FK_MapData', this.RequestVal('PKVal') + 'Bak');

    //处理数据,增加ICON.
    let idx = 0;
    for (const en of data) {
      let attr = new MapAttr();
      const bakAttr = bakAttrs.filter((item) => item.KeyOfEn == en.No);
      if (bakAttr.length == 0) {
        attr.FK_MapData = this.RequestVal('PKVal') + 'Bak';
        attr.KeyOfEn = en.No;
        attr.Name = en.No;
        if (en.Name == 'Title') attr.Name = '名称';
        attr.DataType = 1; //string类型.
        if (en.DBType == 'Int32' || en.DBType == 'Int64' || en.DBType == 'Boolean') {
          attr.MyDataType = 2; //int类型.
        }
        if (en.DBType == 'Decimal' || en.DBType == 'Float') {
          attr.MyDataType = 3; //float 类型.
        }
        attr.MyPK = attr.FK_MapData + '_' + attr.KeyOfEn;
        await attr.Insert();
      } else attr = bakAttr[0];
      en.Idx = idx + 1;
      en.KeyOfEn = en.No;
      //把常用的字段转化为 中文.
      if (attr.KeyOfEn == attr.Name) {
        if (attr.KeyOfEn == 'OID') attr.Name = '内部OID';
        if (attr.KeyOfEn == 'BillNo') attr.Name = '编号';
        if (attr.KeyOfEn == 'Title') attr.Name = '标题';
        if (attr.KeyOfEn == 'Tel') attr.Name = '电话';
        if (attr.KeyOfEn == 'Email') attr.Name = '邮件';
        if (attr.KeyOfEn == 'Addr') attr.Name = '地址';
        if (attr.KeyOfEn == 'RDT') attr.Name = '记录日期';
        if (attr.KeyOfEn == 'DeptNo') attr.Name = '部门编号';
        if (attr.KeyOfEn == 'DeptT') attr.Name = '部门名称';
      }
      en.MyDataType = attr.MyDataType;
      en.Name = attr.Name;
      en.ORMType = this.GetDataType(attr.MyDataType);
      if (attr.LGType == 0) en.FileType = '普通';
      if (attr.LGType == 1) en.FileType = '枚举';
      if (attr.LGType == 2 || (attr.LGType == 0 && attr.UIContralType == 1)) en.FileType = '外键';
      let btns = '编辑,';
      if (attr.LGType != 0 || attr.MyDataType == 2 || attr.MyDataType == 4 || attr.MyDataType == 6 || attr.MyDataType == 7 || (attr.LGType == 0 && attr.UIContralType == 1)) {
        btns += '取消映射';
      }
      en.LGType = attr.LGType;
      en.UIContralType = attr.UIContralType;
      en.Btns = btns;
      idx++;
    }

    //设置数据源.
    this.Data = data;
  }
  private GetDataType(datatype) {
    if (datatype == 1) return 'String';
    if (datatype == 2) return 'Int';
    if (datatype == 3) return 'Float';
    if (datatype == 4) return 'Boolean';
    if (datatype == 5) return 'Double';
    if (datatype == 6) return 'Date';
    if (datatype == 7) return 'DateTime';
    if (datatype == 8) return 'Money';
  }

  //打开页面.
  async LinkFieldClick(_object: Record<string, any>) {}

  async BtnClick(btnName: string, object: Record<string, any>) {
    const frmID = this.RequestVal('PKVal');

    if (btnName === '编辑') {
      let enName = 'TS.FrmUI.MapAttrString';

      if (object.MyDataType == 1) {
        enName = 'TS.FrmUI.MapAttrString';
        if (parseInt(object.LGType) == 0 && object.UIContralType == 1) enName = 'TS.FrmUI.MapAttrSFSQL';
        if (parseInt(object.LGType) == 2) enName = 'TS.FrmUI.MapAttrSFTable';
      }

      if (object.MyDataType == 2 || object.MyDataType == 3 || object.MyDataType == 5) {
        if (object.MyDataType == 2 && object.LGType == 1 && (object.UIContralType == 1 || object.UIContralType == 3)) enName = 'TS.FrmUI.MapAttrEnum';
        else enName = 'TS.FrmUI.MapAttrNum';
      }

      if (object.MyDataType == 6 || object.MyDataType == 7) enName = 'TS.FrmUI.MapAttrDT';

      if (object.MyDataType == 4) enName = 'TS.FrmUI.MapAttrBoolean';
      const url = GloComm.UrlEn(enName, frmID + 'Bak_' + object.No); // `/src/WF/Rpt/SearchFlow.vue?FlowNo=${object.No}&FlowName=${object.Name}`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }
    //,转成int类型,转成外键,转成日期,转成日期时间,转成boolen类型,转成枚举类型,取消映射
    const mypk = frmID + 'Bak_' + object.No;
    if (btnName === '取消映射') {
      if (window.confirm('您确定要取消吗？') == false) return false;
      const en = new MapAttr();
      en.MyPK = mypk;
      await en.Delete();
      return new GPNReturnObj(GPNReturnType.Reload);
    }
    alert('没有解析:' + btnName);
  }
}
