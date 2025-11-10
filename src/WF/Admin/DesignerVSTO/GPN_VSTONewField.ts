import { GloComm } from '../../Comm/GloComm';
import HttpHandler from '../FoolFormDesigner/dto/HttpHandler';
import { GPN_NewDDL } from '../FrmLogic/GPN_NewDDL';
import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { MapDtl, MapDtls } from '../FrmLogic/MapDtl';
import { SFTable, SFTables } from '../FrmLogic/SFTable/SFTable';
import { SysEnumMain } from '../FrmLogic/SysEnum/SysEnumMain';
import { GloWF } from '../GloWF';
import { DataType } from '/@/bp/en/DataType';
import { UIContralType } from '/@/bp/en/EnumLab';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GroupFields } from '/@/WF/Admin/FrmLogic/GroupField';

export class GPN_VSTONewField extends PageBaseGroupNew {
  constructor() {
    super('GPN_VSTONewField');
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

    this.AddGroup('Enum', '枚举字段');
    const sql = GloWF.SQLEnumMain;
    this.SelectItemsByList('SelectedEnum', '新建枚举字段', GPN_NewDDL.SelectedEnum, false, sql);
    this.TextBox1_Name(
      'SelectedEnum.FieldName',
      '输入字段ID',
      GPN_NewDDL.SelectedEnum_FieldName,
      '字段ID',
      () => this.RequestVal('tb1', 'SelectedEnum'),
      '英文字母或者下划线开头.',
    );
    //分步表单.
    this.AddFunction('AdminEnum', '枚举库维护', this.AdminEnum);

    this.AddGroup('FK', '外键字段');
    this.SelectItemsByList('SelectedDict', '新建外键字段', this.HelpEnumDDL, false, GloWF.SQLSFTable);
    this.TextBox1_Name('SelectedDict.Name', '输入字段ID', this.HelpEnumDDL, '字段ID', () => this.RequestVal('tb1', 'SelectedDict'), '英文字母或者下划线开头.');
    // this.TextBox2_NameNo('Blank', '无数据源下拉框', this.Blank, 'FK_', '字段英文名', '字段中文名', '');
    //分步表单.
    this.AddFunction('AdminDict', '外键库维护', this.AdminDict);
    this.AddGroup('Component', '组件');
    this.TextBox2_NameNo('Dtl', '从表', this.FieldAth, 'Dtl', '从表ID', '从表名称', '我的从表');
    this.AddIcon('iconfont icon-attach', 'Dtl');
    return;
  }

  public AdminEnum() {
    const url = GloComm.UrlSearch('TS.FrmUI.SysEnumMain');
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  public AdminDict() {
    const url = GloComm.UrlSearch('TS.FrmUI.SFTable');
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }

  public async GenerSorts(): Promise<any> {
    const frmID = this.RequestVal('FrmID');
    const mapDtls = new MapDtls();
    await mapDtls.Retrieve('FK_MapData', frmID);

    const json = [{ Name: '主表:' + frmID, No: frmID }];
    for (const dtl of mapDtls) {
      json.push({ Name: dtl.Name + ':' + dtl.No, No: dtl.No });
    }
    return Promise.resolve(json);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //普通类型的字段.
    const frmID = sortNo; // this.RequestVal('FrmID');
    const gfs = new GroupFields();
    await gfs.Retrieve('FrmID', frmID, 'Idx');
    const data = gfs.filter((gf) => gf.CtrlType === null || gf.CtrlType === '');
    const groupID = data.length === 0 ? 0 : data[0].OID;
    if (pageNo == 'Blank') {
      await SFTables.Init_Blank(); //预制数据.
      return this.InitDDL(tb2, tb1, 'Blank');
    }
    if (pageNo === 'String' || pageNo === 'Int' || pageNo === 'Number' || pageNo === 'DT' || pageNo === 'Boolean' || pageNo === 'JE' || pageNo === 'Time') {
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
        await mapAttr.Insert();
      }

      if (pageNo === 'Int') {
        mapAttr.MyDataType = DataType.AppInt;
        enName = 'TS.FrmUI.MapAttrNum';
        mapAttr.SetPara('EnName', enName);
        await mapAttr.Insert();
      }

      if (pageNo === 'Number') {
        mapAttr.MyDataType = DataType.AppFloat;
        enName = 'TS.FrmUI.MapAttrNum';
        mapAttr.SetPara('EnName', enName);
        await mapAttr.Insert();
      }

      if (pageNo === 'JE') {
        mapAttr.MyDataType = DataType.AppMoney;
        enName = 'TS.FrmUI.MapAttrNum';
        mapAttr.SetPara('EnName', enName);
        await mapAttr.Insert();
      }

      if (pageNo === 'DT') {
        mapAttr.MyDataType = DataType.AppDate;
        mapAttr.IsSupperText = '0';
        enName = 'TS.FrmUI.MapAttrDT';
        mapAttr.SetPara('EnName', enName);
        await mapAttr.Insert();
      }
      if (pageNo === 'Time') {
        mapAttr.MyDataType = DataType.AppDateTime;
        mapAttr.IsSupperText = '1';
        enName = 'TS.FrmUI.MapAttrDT';
        mapAttr.SetPara('EnName', enName);
        await mapAttr.Insert();
      }

      if (pageNo === 'Boolean') {
        mapAttr.MyDataType = DataType.AppBoolean;
        enName = 'TS.FrmUI.MapAttrBoolean';
        mapAttr.SetPara('EnName', enName);
        await mapAttr.Insert();
      }
      //const url = `/@/WF/Comm/En.vue?EnName=${enName}&PKVal=${mapAttr.MyPK}`;
      //return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      return new GPNReturnObj(GPNReturnType.Message, '创建成功');
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
      // const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrEnum&PKVal=' + mapAttr.MyPK;
      const url = GloComm.UrlEn('TS.FrmUI.MapAttrEnum', mapAttr.MyPK);
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
      mapAttr.LGType = 0; //普通类型.
      mapAttr.MyDataType = 1; //String类型.
      mapAttr.UIContralType = UIContralType.DDL; //下拉框.
      mapAttr.UIBindKey = sfTable.No; //绑定的值.
      mapAttr.SetPara('SrcType', sfTable.DBSrcType);
      await mapAttr.Insert();
      //插入影子字段.
      mapAttr.UIVisible = 0;
      mapAttr.UIContralType = UIContralType.TB;
      mapAttr.MyPK = frmID + '_' + tb1 + 'T';
      mapAttr.KeyOfEn = tb1 + 'T';
      mapAttr.Name = mapAttr.Name + 'T';
      await mapAttr.Insert();
      //转向.
      const url = GloComm.UrlEn('TS.FrmUI.MapAttrSFSQL', mapAttr.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //新建字段-字段附件.
    if (pageNo === 'Dtl') {
      const dtl = new MapDtl();
      dtl.No = frmID + tb2;
      if ((await dtl.IsExits()) == true) return new GPNReturnObj(GPNReturnType.Error, '从表ID[' + dtl.No + ']已存在');

      const mydtl = new BSEntity('BP.Sys.MapDtl');
      mydtl.No = dtl.No;
      mydtl.Name = tb1;
      mydtl.FK_MapData = frmID;
      await mydtl.Insert();
      mydtl.DoMethodReturnString('IntMapAttrs');
      const url = GloComm.UrlEn('TS.Frm.MapDtlExt', dtl.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
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
