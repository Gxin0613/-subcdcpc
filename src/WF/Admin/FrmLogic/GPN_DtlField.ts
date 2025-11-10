import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '../GloWF';
import { GPN_NewDDL } from './GPN_NewDDL';
import { SFTable, SFTables } from './SFTable/SFTable';
import { SysEnumMain } from './SysEnum/SysEnumMain';
import { DataType } from '/@/bp/en/DataType';
import { UIContralType } from '/@/bp/en/EnumLab';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { FrmAttachment } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachment';
import { GroupFields } from '/@/WF/Admin/FrmLogic/GroupField';
import { MapDtl } from '/@/WF/Admin/FrmLogic/MapDtl';
import DBAccess from '/@/utils/gener/DBAccess';

export class GPN_DtlField extends PageBaseGroupNew {
  constructor() {
    super('GPN_DtlField');
  }
  public Init() {
    this.PageTitle = '新建从表字段';
    this.ForEntityClassID = '';

    //增加子页面.
    this.AddGroup('Nurel', '基本字段');
    this.TextBox2_NameNo('String', '文本字段', this.HelpString, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-fuwenbenkuang', 'String');

    this.TextBox2_NameNo('Int', '整数', this.HelpInt, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-zhengshu', 'Int');

    this.TextBox2_NameNo('Number', '数值', this.HelpNumber, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-ziduanleixing-zhengshu', 'Number');

    this.TextBox2_NameNo('JE', '金额', this.HelpJE, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-yifabupiaoju-renminbi-xi', 'JE');

    this.TextBox2_NameNo('Time', '日期时间', this.HelpTime, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-shijian1', 'Time');

    this.TextBox2_NameNo('DT', '日期', this.HelpDT, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-riqiqishu', 'DT');

    this.TextBox2_NameNo('Boolean', '开关', this.HelpBoolean, '', '字段名', '中文名', '');
    this.AddIcon('iconfont icon-fuxuankuang', 'Boolean');

    this.TextBox2_NameNo('write', '写字板', this.FieldAth, 'Ath', '字段ID', '写字板名称', '写字板');
    this.AddIcon('iconfont icon-xiezi', 'write');

    //this.AddGroup('F', 'OCR组件'); //增加分组
    //this.AddBlank('Invoice', '发票', this.HelpUn, 'icon-layers');

    this.AddGroup('Enum', '枚举字段');
    const sql = GloWF.SQLEnumMain;
    this.SelectItemsByList('SelectedEnum', '新建枚举字段', GPN_NewDDL.SelectedEnum, false, sql);
    this.TextBox1_Name('SelectedEnum.FieldName', '输入字段ID', this.HelpEnumDDL, '字段ID', () => this.RequestVal('tb1', 'SelectedEnum'), '英文字母或者下划线开头.');
    //分步表单.
    this.AddFunction('AdminEnum', '枚举库维护', this.AdminEnum);

    this.AddGroup('FK', '外键字段');
    this.SelectItemsByGroupList('SelectedDict', '新建外键字段', this.HelpEnumDDL, false, GloWF.srcDBSrc, GloWF.SQLSFTable);
    this.TextBox1_Name('SelectedDict.Name', '输入字段ID', this.HelpEnumDDL, '字段ID', () => this.RequestVal('tb1', 'SelectedDict'), '英文字母或者下划线开头.');
    // this.TextBox2_NameNo('Blank', '无数据源下拉框', this.Blank, 'FK_', '字段英文名', '字段中文名', '');
    //分步表单.
    this.AddFunction('AdminDict', '外键库维护', this.AdminDict);

    this.AddGroup('Component', '组件');
    this.TextBox2_NameNo('AthField', '字段附件', this.FieldAth, 'Ath', '字段ID', '附件名称', '我的附件');
    this.AddIcon('iconfont icon-attach', 'AthField');

    return;
  }

  public AdminEnum() {
    const url = '/@/WF/Comm/Search.vue?EnName=TS.FrmUI.SysEnumMain';
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  public AdminDict() {
    const url = '/@/WF/Comm/Search.vue?EnName=TS.FrmUI.SFTable';
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, _tb3: string) {
    //普通类型的字段.
    const frmID = this.RequestVal('FrmID');
    const gfOID = this.RequestVal('GroupID') || 0;
    const gfs = new GroupFields();
    await gfs.Retrieve('FrmID', frmID, 'Idx');
    const data = gfs.filter((gf) => gf.CtrlType === null || gf.CtrlType === '');
    const groupID = gfOID!=0 ? gfOID: data.length === 0 ? 0 : data[0].OID;
    if (pageNo == 'Blank') {
      await SFTables.Init_Blank(); //预制数据.
      return this.InitDDL(tb2, tb1, 'Blank');
    }
    const dt = await DBAccess.RunSQLReturnTable(GloWF.SQLOfDtlFieldMaxIdx(frmID)); //`SELECT Max(Idx) as Idx From Sys_MapAttr Where FK_MapData='${frmID}'`;
    const idx = dt[0]['Idx'] + 1;
    if (pageNo === 'String' || pageNo === 'Int' || pageNo === 'Number' || pageNo === 'DT' || pageNo === 'Boolean' || pageNo === 'JE' || pageNo === 'Time' || pageNo === 'write') {
      const mapAttr = new MapAttr();
      mapAttr.MyPK = frmID + '_' + tb2;
      mapAttr.FK_MapData = frmID;
      mapAttr.GroupID = groupID;
      mapAttr.KeyOfEn = tb2;
      if ((await mapAttr.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '字段已经存在');
      }
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;
      let enName = '';
      if (pageNo === 'String') {
        mapAttr.MyDataType = DataType.AppString;
        mapAttr.MaxLen = 50;
        enName = 'TS.FrmUI.MapAttrString';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }

      if (pageNo === 'Int') {
        mapAttr.MyDataType = DataType.AppInt;
        enName = 'TS.FrmUI.MapAttrNum';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }

      if (pageNo === 'Number') {
        mapAttr.MyDataType = DataType.AppFloat;
        enName = 'TS.FrmUI.MapAttrNum';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }

      if (pageNo === 'JE') {
        mapAttr.MyDataType = DataType.AppMoney;
        enName = 'TS.FrmUI.MapAttrNum';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }

      if (pageNo === 'DT') {
        mapAttr.MyDataType = DataType.AppDate;
        mapAttr.IsSupperText = '0';
        enName = 'TS.FrmUI.MapAttrDT';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }
      if (pageNo === 'Time') {
        mapAttr.MyDataType = DataType.AppDateTime;
        mapAttr.IsSupperText = '1';
        enName = 'TS.FrmUI.MapAttrDT';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }

      if (pageNo === 'Boolean') {
        mapAttr.MyDataType = DataType.AppBoolean;
        enName = 'TS.FrmUI.MapAttrBoolean';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }

      //写字板
      if (pageNo === 'write') {
        mapAttr.MyDataType = DataType.AppString;
        mapAttr.UIContralType = UIContralType.HandWriting; //写字板.
        enName = 'TS.FrmUI.FrmHandWriting';
        mapAttr.SetPara('EnName', enName);
        mapAttr.Idx = idx;
        await mapAttr.Insert();
      }
      //const url = `/@/WF/Comm/En.vue?EnName=${enName}&PKVal=${mapAttr.MyPK}`;
      //return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      return new GPNReturnObj(GPNReturnType.Message, '创建成功');
    }

    if (pageNo === 'Invoice') {
      const mapAttr = new MapAttr();
      mapAttr.GroupID = groupID;
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
      await mapAttr.Insert();

      mapAttr.Name = '开票日期';
      mapAttr.KeyOfEn = 'InvoiceRelDT';
      mapAttr.DataType = DataType.AppDate;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.Name = '发票类型'; //普通发票、专用发票、电子发票
      mapAttr.KeyOfEn = 'InvoiceTypeStr';
      mapAttr.DataType = DataType.AppString;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.Name = '发票金额'; //发票的总金额，可能包括价税合计、大写金额等。
      mapAttr.KeyOfEn = 'InvoiceJE';
      mapAttr.DataType = DataType.AppMoney;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.Name = '税额'; //发票上显示的税额
      mapAttr.KeyOfEn = 'InvoiceTaxJE';
      mapAttr.DataType = DataType.AppMoney;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.Name = '税率'; //适用的税率
      mapAttr.KeyOfEn = 'InvoiceTaxRate';
      mapAttr.DataType = DataType.AppMoney;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      //购买方信息
      mapAttr.Name = '购买方名称';
      mapAttr.KeyOfEn = 'InvoiceBuyName';
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      mapAttr.UIWidth = 200;
      await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceBuyCode';
      mapAttr.Name = '购买方ID';
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      mapAttr.UIWidth = 150;
      await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceBuyAddr';
      mapAttr.Name = '购买方地址电话';
      mapAttr.DataType = DataType.AppString;
      mapAttr.MaxLen = 200;
      mapAttr.UIWidth = 200;
      await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceBuyBankInfo';
      mapAttr.Name = '购买方开户行及账号';
      mapAttr.DataType = DataType.AppString;
      mapAttr.MaxLen = 200;
      mapAttr.UIWidth = 200;
      await mapAttr.Insert();

      //销售方信息
      mapAttr.Name = '销售方名称';
      mapAttr.KeyOfEn = 'InvoiceSaleName';
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceSaleCode';
      mapAttr.Name = '销售方ID';
      mapAttr.MaxLen = 150;
      mapAttr.UIWidth = 150;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceSaleAddr';
      mapAttr.Name = '销售方地址电话';
      mapAttr.UIWidth = 200;
      mapAttr.MaxLen = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      mapAttr.KeyOfEn = 'InvoiceSaleBankInfo';
      mapAttr.Name = '销售方开户行及账号';
      mapAttr.MaxLen = 200;
      mapAttr.UIWidth = 200;
      mapAttr.MyPK = frmID + '_' + mapAttr.KeyOfEn;
      await mapAttr.Insert();

      //启用发票导入功能.
      const mapDtl = new MapDtl(mapAttr.FK_MapData);
      await mapDtl.Retrieve();
      mapDtl.SetPara('IsInvoice', 1);
      mapDtl.IsInsert = 0; //设置不可以插入.
      await mapDtl.Update();
    }

    //新建枚举字段
    if (pageNo === 'SelectedEnum.FieldName') {
      //  console.log(frmID, groupID, ctrlType);
      const keyOfEn = tb1; // window.prompt('请输入存储的字段名:', tb1);
      if (!keyOfEn) return;
      //实例化它.
      const enumKey = this.RequestVal('tb1', 'SelectedEnum');
      const enumName = this.RequestVal('tb2', 'SelectedEnum');

      const enumMain = new SysEnumMain(enumKey);
      enumMain.No = enumKey;
      await enumMain.Retrieve();

      if (enumMain.EnumKey === '') enumMain.EnumKey = tb1;

      //  alert('EnumKey:' + enumMain.EnumKey + ', Name:' + enumMain.Name + ',tb1' + tb1);
      const mapAttr = new MapAttr();
      mapAttr.MyPK = frmID + '_' + tb1;
      if ((await mapAttr.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '字段在表单已经存在' + tb1);
      }
      mapAttr.GroupID = groupID;
      mapAttr.Name = enumName;
      mapAttr.KeyOfEn = tb1;
      mapAttr.FK_MapData = frmID;
      mapAttr.UIVisible = 1;
      mapAttr.UIIsEnable = 1;

      mapAttr.LGType = 1; //枚举类型.
      mapAttr.MyDataType = enumMain.EnumType === 0 ? 2 : 1; //int 类型.
      mapAttr.SetPara('RBShowModel', 3);

      mapAttr.UIContralType = 1; //类型:外部传来的,新建 ddl, or  radio. checks
      mapAttr.UIBindKey = enumMain.EnumKey;
      await mapAttr.Insert();
      //转向.
      const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrEnum&PKVal=' + mapAttr.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //新建外键字段
    if (pageNo === 'SelectedDict.Name') {
      const keyOfEn = tb1; // window.prompt('请输入存储的字段名:', tb1);
      if (!keyOfEn) return;
      //实例化它.
      const sfTableNo = this.RequestVal('tb1', 'SelectedDict');

      const sfTable = new SFTable(sfTableNo);
      sfTable.No = sfTableNo;
      await sfTable.Retrieve();

      //  alert('EnumKey:' + enumMain.EnumKey + ', Name:' + enumMain.Name + ',tb1' + tb1);
      const mapAttr = new MapAttr();
      mapAttr.MyPK = frmID + '_' + tb1;
      if ((await mapAttr.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '字段在表单已经存在' + tb1);

      mapAttr.Name = sfTable.Name;
      mapAttr.KeyOfEn = tb1;
      mapAttr.FK_MapData = frmID;
      mapAttr.GroupID = groupID;
      mapAttr.UIVisible = 1;
      mapAttr.UIIsEnable = 1;
      mapAttr.LGType = 0; //外键类型.
      mapAttr.MyDataType = 1; //String类型.
      mapAttr.UIContralType = UIContralType.DDL; //下拉框.
      mapAttr.UIBindKey = sfTable.No; //绑定的值.
      mapAttr.SetPara('SrcType', sfTable.DBSrcType);
      await mapAttr.Insert();
      const mypk = mapAttr.MyPK;
      //插入影子字段.
      mapAttr.UIVisible = 0;
      mapAttr.UIContralType = UIContralType.TB;
      mapAttr.MyPK = frmID + '_' + tb1 + 'T';
      mapAttr.KeyOfEn = tb1 + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      await mapAttr.Insert();
      //转向.
      const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrSFSQL&PKVal=' + mypk;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //新建字段-字段附件.
    if (pageNo === 'AthField') {
      const mapAttr = new MapAttr();
      mapAttr.FK_MapData = frmID;
      mapAttr.MyPK = frmID + '_' + tb2;
      mapAttr.KeyOfEn = tb2;
      mapAttr.Name = tb1;
      mapAttr.GroupID = groupID;
      if ((await mapAttr.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '附件ID[' + mapAttr.MyPK + ']已存在');

      const ath = new FrmAttachment();
      ath.MyPK = mapAttr.MyPK;
      if ((await mapAttr.IsExits()) == false) {
        //插入附件信息.
        ath.FK_MapData = frmID;
        ath.NoOfObj = tb2;
        ath.Name = tb1;
        ath.IsDtlAth = 1;
        ath.SetPara('IsDtlAth', '1');
        //多附件.
        mapAttr.UploadType = 1; //字段附件.
        await ath.Insert();
      }
      //插入字段信息.
      mapAttr.UIContralType = UIContralType.AthShow; //附件.
      mapAttr.SetPara('EnName', 'TS.FrmUI.FrmAttachmentExt');
      await mapAttr.Insert();
    }
  }
  public async InitDDL(attrKey: string, attrName: string, sfTableNo: string) {
    const frmID = this.RequestVal('FrmID');
    const keyOfEn = attrKey; // window.prompt('请输入存储的字段名:', tb1);
    if (!keyOfEn) return;

    //实例化它.

    const sfTable = new SFTable(sfTableNo);
    sfTable.No = sfTableNo;
    await sfTable.Retrieve();

    //  alert('EnumKey:' + enumMain.EnumKey + ', Name:' + enumMain.Name + ',tb1' + tb1);
    const mapAttr = new MapAttr();
    mapAttr.MyPK = frmID + '_' + attrKey;
    if ((await mapAttr.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '字段在表单已经存在' + attrKey);

    //名称.
    if (!attrName) mapAttr.Name = sfTable.Name;
    else mapAttr.Name = attrName;

    mapAttr.KeyOfEn = attrKey;
    mapAttr.FK_MapData = frmID;
    mapAttr.UIVisible = 1;
    mapAttr.UIIsEnable = 1;
    mapAttr.LGType = 0; //普通类型.
    mapAttr.MyDataType = 1; //String类型.
    mapAttr.UIContralType = UIContralType.DDL; //下拉框.
    mapAttr.UIBindKey = sfTable.No; //绑定的值.
    mapAttr.SetPara('SrcType', sfTable.DBSrcType);
    await mapAttr.Insert();

    //插入影子字段.
    mapAttr.UIVisible = 0;
    mapAttr.MyPK = frmID + '_' + attrKey + 'T';
    mapAttr.KeyOfEn = attrKey + 'T';
    mapAttr.UIContralType = UIContralType.TB;
    await mapAttr.Insert();

    //转向.
    const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrSFSQL&PKVal=' + mapAttr.MyPK;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  // 新建格
  public readonly HelpString = `
  #### 帮助
   - 文本类型的字段.
   - 比如:姓名、编号、地址、电话、邮件.
  `;

  // 新建int枚举
  public readonly HelpInt = `
  #### 帮助
   - 整数类型数据.
  `;

  // 新建枚举
  public readonly HelpNumber = `
  #### 帮助
  - 数值类型数据.
  `;

  // 新建枚举下拉框.
  public readonly HelpEnumDDL = `
    #### 帮助
    - 枚举类型数据: 枚举值,枚举标签; 
    `;

  // 新建枚举
  public readonly HelpEnumNew = `
        #### 帮助
        - 填写格式: 枚举值,枚举标签; 
        - 例如: ty,团员;dy=党员;qz,群众;
        - 系统解析为: ty是团员, dy是党员, qz是群众.
      
        #### 数据存储.
        - string类型的枚举也称为标记枚举,字母存储一个列,标签存储一个列.
        - 在表单里字段是abc,那系统就会自动创建一个影子字段 abcT.
        - abc字段存储的是标记, abcT存储的是标签.
        `;
  public readonly Blank = `
  #### 帮助
  - 空白的字段: 用于加载表单的时候，他的数据源是通过，由参数的字典获得的.
  - 比如：表单里由，片区、省份、地市、区县四个下拉框字段. 当表单加载的时候，在没有确定片区其他的三个字段都无法确定值。
  - 省份、地区、区县就需要绑定空白数据源外键.
  - 使用级联关系，把其他的字段数据实现数据级联查询.
  `;
  // Boolean
  public readonly HelpBoolean = `
    #### 帮助
    - 填写格式:开关类型数据.
    `;

  // 金额
  public readonly HelpJE = `
  #### 帮助
  - 金额类型数据; 
  `;

  // 金额
  public readonly HelpTime = `
  #### 帮助
  - 时间类型数据.
  `;

  // 金额
  public readonly HelpDT = `
  #### 帮助
  - 日期类型数据; 
  `;

  // 新建string枚举
  public readonly FieldAth = `
  #### 帮助
  - 字段附件，附件以字段名的形式在页面中显示; 
  #### 图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/SFTable/Img/Ath1.png "屏幕截图.png") 
  #### 数据存储
  - 附件的默认保存在web服务器上。
  - 可以保存到ftp服务器上, ftp的服务器的连接配置在全局的配置文件中。
  - 如果需要保存到数据库，就需要考虑数据库的存储与备份的问题，文件将会存储在 Sys_FrmAttachmentDB 表中。
 
    `;
}
