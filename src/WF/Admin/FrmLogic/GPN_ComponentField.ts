import { GloComm } from '../../Comm/GloComm';
import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { GroupFields } from './GroupField';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { UIContralType } from '/@/bp/en/EnumLab';
import { MapExt } from '/@/WF/Admin/FrmLogic/MapExt';
import { DataType } from '/@/bp/en/DataType';
import { MapDtl } from './MapDtl';
import { FrmAttachment } from './FrmAttachment/FrmAttachment';

export class GPN_ComponentField extends PageBaseGroupNew {
  constructor() {
    super('GPN_ComponentField');
    this.PageTitle = '新建字段自定义组件';
  }
  public Init() {
    this.AddGroup('A', '通用组件'); //增加分组.
    this.TextBox2_NameNo('ExtScore', '评分', this.ScoreDesc, 'Score', '字段ID', '名称', '评分');
    this.AddIcon('icon-like', 'ExtScore');

    this.TextBox2_NameNo('FrmBtn', '按钮', this.FrmBtnDesc, 'FrmBtn', '组件ID', '组件名称', '按钮1');
    this.AddIcon('icon-drop', 'FrmBtn');

    this.TextBox2_NameNo('FrmLink', '超链接', this.FrmLinkDesc, 'FrmLink', '字段ID', '连接标签', '我的连接');
    this.AddIcon('icon-link', 'FrmLink');

    this.TextBox2_NameNo('Location', '定位', this.LocationDesc, 'Location', '字段ID', '名称', '定位组件');
    this.AddIcon('icon-location-pin', 'Location');

    this.TextBox2_NameNo('FrmHtml', '大块说明', this.HelpUn, '', '字段ID', '名称', '大块说明');
    this.AddIcon('icon-doc', 'FrmHtml');

    this.TextBox2_NameNo('ExtMap', '地图', this.MapDesc, 'Map', '字段ID', '名称', '地图');
    this.AddIcon('icon-doc', 'ExtMap');

    this.TextBox2_NameNo('LabColor', '颜色组件', this.LabColorDesc, 'LabColor', '字段ID', '名称', '颜色组件');
    this.AddIcon('icon-drop', 'LabColor');

    this.AddGroup('F', 'OCR组件'); //增加分组.&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    this.TextBox2_NameNo('id_card_upload', '身份证', this.HelpUn, 'Card', '组件ID', '组件名称', '身份证1');

    this.AddIcon('icon-user', 'id_card_upload');
    const pageFrom = this.RequestVal('PageFrom') || '';
    if (pageFrom === 'Dtl') this.AddBlank('Invoice', '发票', this.HelpUn, 'icon-layers');

    this.AddGroup('B', '流程组件'); //增加分组.&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    this.TextBox2_NameNo('FlowRefLink', '关联流程', this.HelpUn, 'FlowRefLink', '字段ID', '名称', '关联流程');
    this.AddIcon('icon-share', 'FlowRefLink');

    this.TextBox2_NameNo('BillRefLink', '关联单据', this.HelpUn, 'BillRefLink', '字段ID', '名称', '关联单据');
    this.AddIcon('icon-share', 'BillRefLink');

    this.AddBlank('GovAth', '公文正文', this.HelpUn);
    //this.TextBox2_NameNo('GovAth', '公文正文', this.HelpUn, 'GovAth', '字段ID', '公文正文', '公文正文');
    this.AddIcon('icon-doc', 'GovAth');

    this.AddBlank('WordNum', '公文字号', this.HelpUn);
    this.AddIcon('icon-star', 'WordNum');

    this.AddBlank('FlowBBS', '流程评论', this.HelpUn);
    this.AddIcon('icon-bubble', 'FlowBBS');

    this.TextBox2_NameNo('SignCheck', '签批组件', this.HelpUn, 'SC', '字段ID', '名称', '签批组件');
    this.AddIcon('icon-check', 'SignCheck');

    this.AddGroup('C', '实验中'); //增加分组.&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    this.TextBox3_NameNoNote('img', '图片', this.HelpUn, 'Img', '组件ID', '图片名称', '图片URL', '通用图片');
    this.AddIcon('icon-picture', 'img');

    this.TextBox2_NameNo('Progress', '流程进度图', this.HelpUn, 'Progress', '字段ID', '名称', '流程进度图');
    this.AddIcon('icon-check', 'Progress');

    // this.TextBox2_NameNo('Dtl', '从表', this.FieldAth, 'Card', '组件ID', '组件名称', '身份证1');
    // this.TextBox2_NameNo('map', '地图', this.FieldAth, 'Map', '字段ID', '名称', '我的地图');
    // this.AddIcon('icon-map', 'map');
    this.TextBox2_NameNo('iframe', '框架', this.FieldAth, 'Iframe', '字段ID', '名称', '我的框架');
    this.AddIcon('icon-loop', 'iframe');
  }

  // 返回类别,显示分组.: 需要是 No,Name 类型的json.
  public async GenerSorts(): Promise<any[]> {
    const frmID = this.RequestVal('FrmID');
    const gfs = new GroupFields();
    await gfs.Retrieve('FrmID', frmID, 'Idx');
    return gfs.filter((gf) => gf.CtrlType === '' || gf.CtrlType === 'Attr').map((gf) => ({ No: gf.PKVal, Name: gf.Lab }));

    //字段名是 OID,Lab ,怎么转化为 No,Name类型的json?
    // return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = this.RequestVal('FrmID');
    //评分控件.
    if (
      pageNo === 'ExtScore' ||
      pageNo === 'ExtMap' ||
      pageNo == 'FrmHtml' ||
      pageNo == 'FlowRefLink' ||
      pageNo == 'BillRefLink' ||
      pageNo == 'FrmBtn' ||
      pageNo == 'FrmLink' ||
      pageNo == 'LabColor' ||
      pageNo == 'SignCheck'
    ) {
      const mapAttr = new MapAttr();
      mapAttr.GroupID = _sortNo;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      let extPK = mapAttr.MyPK;
      if (await mapAttr.IsExits()) return new GPNReturnObj(GPNReturnType.Message, '字段ID=[' + tb2 + ']已经存在');
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1; //名称.

      //控件ID.
      let ctrlID = 0;
      if (pageNo == 'ExtScore') ctrlID = 101; //评分控件.
      if (pageNo == 'ExtMap') ctrlID = 4; //地图.
      if (pageNo == 'FlowRefLink') ctrlID = 200; //相关单据.
      if (pageNo == 'BillRefLink') ctrlID = 201; //相关单据.
      if (pageNo == 'SignCheck') ctrlID = UIContralType.SignCheck; //签批组件.
      if (pageNo == 'FrmBtn') ctrlID = UIContralType.Btn; //签批组件.
      if (pageNo == 'FrmLink') ctrlID = UIContralType.HyperLink; //FrmLink.
      if (pageNo == 'LabColor') ctrlID = UIContralType.LabColor; //LabColor.
      if (pageNo == 'FrmHtml') {
        ctrlID = UIContralType.FrmHtml; //大块文本说明.
        //创建对应的MapExt
        extPK = 'HtmlText_' + mapAttr.MyPK;
        const mapExt = new MapExt('BP.Sys.MapExt');
        mapExt.setPKVal(extPK);
        const count = await mapExt.RetrieveFromDBSources();
        if (count == 0) {
          mapExt.MyPK = extPK;
          mapExt.FK_MapData = frmID;
          mapExt.ExtType = 'HtmlText';
          mapExt.ExtModel = 'HtmlText';
          mapExt.AttrOfOper = mapAttr.KeyOfEn;
          await mapExt.Insert();
        }
      }
      //实体名称.
      const enName = 'TS.FrmUI.SelfCommonent.' + pageNo;
      mapAttr.UIContralType = ctrlID; //标识 0=文本框,1=xxxx
      mapAttr.SetPara('CtrlType', pageNo); //修改它的类。
      mapAttr.SetPara('EnName', enName); //修改它的类.
      await mapAttr.Insert();
      if (pageNo == 'FlowRefLink') {
        // mapAttr.MyPK = frmID + '_' + tb2 + 'T';
        mapAttr.KeyOfEn = tb2 + 'T';
        mapAttr.MyPK = mapAttr.MyPK + 'T';
        mapAttr.Name = mapAttr.Name + 'T';
        mapAttr.UIVisible = 0;
        mapAttr.UIIsEnable = 0;
        await mapAttr.Insert();
      }
      //转向.
      const url = GloComm.UrlEn(enName, extPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo == 'Invoice') {
      const mapAttr = new MapAttr();
      mapAttr.GroupID = _sortNo;
      mapAttr.FK_MapData = frmID;
      mapAttr.SetPara('GroupName', 'Invoice');
      mapAttr.DataType = DataType.AppString;
      mapAttr.UIIsEnable = 0; //是否启用?

      mapAttr.Name = '发票代码';
      mapAttr.KeyOfEn = 'InvoiceID';
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if (await mapAttr.IsExits()) return new GPNReturnObj(GPNReturnType.Message, '发票已经存在.');
      await mapAttr.Insert();

      mapAttr.Name = '发票号码';
      mapAttr.KeyOfEn = 'InvoiceCode';
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.Name = '开票日期';
      mapAttr.KeyOfEn = 'InvoiceRelDT';
      mapAttr.DataType = DataType.AppDate;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.Name = '发票类型'; //普通发票、专用发票、电子发票
      mapAttr.KeyOfEn = 'InvoiceTypeStr';
      mapAttr.DataType = DataType.AppString;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.Name = '发票金额'; //发票的总金额，可能包括价税合计、大写金额等。
      mapAttr.KeyOfEn = 'InvoiceJE';
      mapAttr.DataType = DataType.AppMoney;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.Name = '税额'; //发票上显示的税额
      mapAttr.KeyOfEn = 'InvoiceTaxJE';
      mapAttr.DataType = DataType.AppMoney;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.Name = '税率'; //适用的税率
      mapAttr.KeyOfEn = 'InvoiceTaxRate';
      mapAttr.DataType = DataType.AppMoney;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      //购买方信息
      mapAttr.Name = '购买方名称';
      mapAttr.KeyOfEn = 'InvoiceBuyName';
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      mapAttr.UIWidth = 200;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceBuyCode';
      mapAttr.Name = '购买方ID';
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      mapAttr.UIWidth = 150;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceBuyAddr';
      mapAttr.Name = '购买方地址电话';
      mapAttr.DataType = DataType.AppString;
      mapAttr.MaxLen = 200;
      mapAttr.UIWidth = 200;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceBuyBankInfo';
      mapAttr.Name = '购买方开户行及账号';
      mapAttr.DataType = DataType.AppString;
      mapAttr.MaxLen = 200;
      mapAttr.UIWidth = 200;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      //销售方信息
      mapAttr.Name = '销售方名称';
      mapAttr.KeyOfEn = 'InvoiceSaleName';
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceSaleCode';
      mapAttr.Name = '销售方ID';
      mapAttr.MaxLen = 150;
      mapAttr.UIWidth = 150;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceSaleAddr';
      mapAttr.Name = '销售方地址电话';
      mapAttr.UIWidth = 200;
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceSaleBankInfo';
      mapAttr.Name = '销售方开户行及账号';
      mapAttr.MaxLen = 200;
      mapAttr.UIWidth = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      mapAttr.KeyOfEn = 'Note';
      mapAttr.Name = '备注';
      mapAttr.MaxLen = 500;
      mapAttr.UIWidth = 500;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();

      //增加字段附件
      mapAttr.KeyOfEn = 'InvoiceFJ';
      mapAttr.Name = '附件';
      mapAttr.MaxLen = 500;
      mapAttr.UIWidth = 500;
      mapAttr.UIContralType = 6;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      if ((await mapAttr.IsExits()) == false) await mapAttr.Insert();
      //插入附件属性
      const ath = new FrmAttachment();
      ath.MyPK = mapAttr.MyPK;
      if ((await ath.IsExits()) == false) {
        //插入附件信息.
        ath.FK_MapData = frmID;
        ath.NoOfObj = tb2;
        ath.Name = tb1;
        ath.IsDtlAth = 1;
        ath.IsVisable = 0;
        // ath.GroupID = groupID;
        await ath.Insert();
      }

      //启用发票导入功能.
      const mapDtl = new MapDtl(mapAttr.FK_MapData);
      await mapDtl.Retrieve();
      mapDtl.SetPara('IsInvoice', 1);
      mapDtl.IsInsert = 0; //设置不可以插入.
      await mapDtl.Update();
      // mapAttr.KeyOfEn = pageNo;
      // mapAttr.Name = tb1; //名称.
    }

    // 表单唯一组件:
    if (pageNo === 'FlowBBS' || pageNo == 'Location' || pageNo == 'WordNum' || pageNo == 'GovAth') {
      const mapAttr = new MapAttr();
      mapAttr.GroupID = _sortNo;
      mapAttr.Name = this.GetPageName(pageNo);
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + pageNo;
      if (await mapAttr.IsExits()) return new GPNReturnObj(GPNReturnType.Message, '字段ID=[' + pageNo + ']已经存在');

      mapAttr.KeyOfEn = pageNo;
      mapAttr.Name = tb1; //名称.

      //控件ID.
      let ctrlID = 0;
      if (pageNo == 'FlowBBS') ctrlID = UIContralType.FlowBBS; //评论组件.

      if (pageNo == 'Location') ctrlID = UIContralType.Location; //Location.
      if (pageNo == 'WordNum') ctrlID = UIContralType.WordNum; //Location.
      if (pageNo == 'GovAth') {
        ctrlID = UIContralType.GovDocFile; //公文附件.
        mapAttr.Name = '公文正文';
      }

      //实体名称.
      const enName = 'TS.FrmUI.SelfCommonent.' + pageNo;
      mapAttr.UIContralType = ctrlID; //标识 0=文本框,1=xxxx
      mapAttr.SetPara('CtrlType', pageNo); //修改它的类.
      mapAttr.SetPara('EnName', enName); //修改它的类.
      if (pageNo == 'GovAth') {
        mapAttr.ColSpan = 3;
      }
      await mapAttr.Insert();
      //转向.
      const url = GloComm.UrlEn(enName, mapAttr.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //身份证.
    if (pageNo === 'id_card_upload') {
      const frmID = this.RequestVal('FrmID');
      const mapAttr = new MapAttr();
      mapAttr.GroupID = _sortNo;
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      if (await mapAttr.IsExits()) return new GPNReturnObj(GPNReturnType.Message, '字段ID=[' + pageNo + ']已经存在');
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1; //名称.
      mapAttr.UIContralType = 13; //身份证
      mapAttr.UIIsEnable = 0;
      await mapAttr.Insert();

      mapAttr.MyPK = frmID + '_' + tb2 + 'Name';
      mapAttr.KeyOfEn = tb2 + 'Name';
      mapAttr.Name = '姓名';
      await mapAttr.Insert();

      mapAttr.MyPK = frmID + '_' + tb2 + 'Address';
      mapAttr.KeyOfEn = tb2 + 'Address';
      mapAttr.ColSpan = 3;
      mapAttr.Name = '地址';
      await mapAttr.Insert();
      //转向.
      const url = GloComm.UrlEn('TS.FrmUI.MapAttrString', frmID + '_' + tb2);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }

  // 评分控件
  public readonly ScoreDesc = `
  #### 帮助
  - 评分控件: 对当前记录的数据进行打分的控件.
  - 使用属性可以控制打分的长度，比如：5分，10分.
  - 设置图片:
  - 运行图片：
  #### 数据存储.
  - 设置信息存储在：Sys_MapAttr表里.
  - 数据存储在,控件ID对应的字段里.
    `;
  // 地图控件
  public readonly MapDesc = `
  #### 帮助
  - 地图控件: 对当前记录的数据进行打分的控件.
  - 使用属性可以控制打分的长度，比如：5分，10分.
  - 设置图片:
  - 运行图片：
  #### 数据存储.
  - 设置信息存储在：Sys_MapAttr表里.
  - 数据存储在,控件ID对应的字段里.
    `;
  // 颜色控件
  public readonly LabColorDesc = `
  #### 帮助
  - 颜色控件: 可以自定义颜色的控件.
  - 设置图片:
  - 运行图片：
  - 设置信息存储在：Sys_MapAttr表里.
    `;
  // 按钮控件
  public readonly FrmBtnDesc = `
  #### 帮助
  - 按钮控件: 可以点击后执行Js脚本的控件, 利用onclick来承载编写的js.
  - 应用场景: 编写脚本可以实现帮助或者提示等信息.
  - 如下图:
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/FrmBtnShow.png "按钮展示") 
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/FrmBtnuUse.png "弹窗展示") 
  - 
  #### 数据存储.
  - 设置信息存储在：Sys_MapAttr表里.
    `;

  //超链接
  public readonly FrmLinkDesc = `
  #### 帮助
  - 按钮控件: 可以点击后执行Js脚本的控件, 利用onclick来承载编写的js.
  - 如下图:
  - 
  #### 数据存储.
  - 设置信息存储在：Sys_MapAttr表里.
  - 数据信息存储：无
    `;
  //定位
  public readonly LocationDesc = `
    #### 帮助
    - 按钮控件: 定位信息
    - 如下图:
    - 
    #### 数据存储.
    - 设置信息存储在：Sys_MapAttr表里.
    - 数据信息存储：控件对应的字段.
      `;

  // 新建string枚举
  public readonly FieldAth = `
  #### 帮助
  - 字段附件; 
  #### 数据存储.
    `;

  // 新建int枚举
  public readonly NewIntEnum = `
  #### 帮助
  - int类型
 - 填写格式1: 团员,党员,群众
  - 系统解析为: 0是团员， 1是党员，2是群众.
  - 填写格式2: @0=团员@1=党员@2=群众
  - 系统解析为: 0是团员， 1是党员，2是群众，这样就可以自己定义枚举值.
 - string类型
  - 填写格式2: @ty=团员@dy=党员@qz=群众
  - 系统解析为: ty是团员， dy是党员，qz是群众.
  #### 数据存储
  - int类型的枚举值是常用的数据类型，ccfrom是格式化的存储到数据表里.
  - 创建一个int类型或者string类型的字段，用于存储枚举的数据.
    `;

  // 选择自定的枚举
  public readonly Docs1 = `
  #### 帮助 
   - 该表单是固定格式的表单,可以展现4列6列展现.
   - 优点:开发效率高,展现简洁,学习成本低,业务人员可以入手.
   - 缺点:展示样式固定.
  `;

  // 选择系统枚举
  public readonly Docs2 = `

  #### 帮助
   - 依托富文本编辑器,实现对表单的编辑.
   - 优点:格式灵活,展现效果随心所欲.
   - 缺点:业务人员入手需要一定的学习成本.
   - 适用于:效果
  `;
}
