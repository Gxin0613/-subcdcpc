import { GloComm } from '../../Comm/GloComm';
import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { SFTable, SFTables } from '../FrmLogic/SFTable/SFTable';
import { SysEnumMain } from '../FrmLogic/SysEnum/SysEnumMain';
import { GloWF } from '../GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { UIContralType } from '/@/bp/en/EnumLab';
import { SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import Event from '/@/utils/Events';

export class GPN_NewDDL extends PageBaseGroupNew {
  static SelectedEnum_FieldName(arg0: string, arg1: string, SelectedEnum_FieldName: any, arg3: string, arg4: () => any, arg5: string) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GPN_NewDDL');
    this.PageTitle = '新建枚举/外键字段';
  }
  public async Init() {
    //this.AddGroup('C', '基本字段'); //增加分组.
    // this.AddGoToUrl('Admin2Enum', '基本字段', GloComm.UrlSearch('TS.FrmUI.SysEnumMain'));
    //this.AddBlank('GoBack', '返回', '返回表单设计器');

    // const  db=new DBank_GloWF();
    // await db.Init();

    //增加子页面.
    this.AddGroup('A', '枚举字段'); //增加分组.
    const sql = GloWF.SQLEnumMain;
    this.SelectItemsByList('SelectedEnum', '新建枚举字段', GPN_NewDDL.SelectedEnum, false, sql);
    this.AddIcon('icon-options', 'SelectedEnum');
    this.TextBox1_Name(
      'SelectedEnum.FieldName',
      '输入字段ID',
      this.SelectedDict_Name,
      '字段ID',
      () => (SystemConfig.CCBPMRunModel === 0 ? this.RequestVal('tb1', 'SelectedEnum') : this.RequestVal('tb1', 'SelectedEnum').replace(WebUser.OrgNo + '_', '')),
      '英文字母或者下划线开头.',
    );
    // this.AddBlank('AdminEnum', '枚举库维护', this.HelpAdminEnum);
    this.AddGoToUrl('NewEnum', '新建枚举', GloComm.UrlGPN('GPN_Enum', '', '&FrmID=' + this.RequestVal('FrmID')));
    this.AddGoToUrl('AdminEnum', '枚举库维护', GloComm.UrlSearch('TS.FrmUI.SysEnumMain'));
    this.AddGoToUrl('AdminEnum1', '枚举库维护(GL)', GloComm.UrlGenerList('GL_NewEnum'));

    //增加子页面.
    this.AddGroup('B', '外部数据源(外键)字段'); //增加分组.

    //let sqlList ='';
    // if (SystemConfig.CCBPMRunModel == 0) sqlList = ` SELECT No, Name, DBSrcType as GroupNo FROM Sys_SFTable WHERE No!='Blank' `;
    // else sqlList = ` SELECT No,Name,DBSrcType as GroupNo FROM Sys_SFTable WHERE No!='Blank' AND OrgNo='@WebUser.OrgNo'`;

    this.SelectItemsByList('SelectedDict', '新建外键字段', this.SelectedDict, false, GloWF.SQLOfNewDDLDict);
    this.AddIcon('icon-list', 'SelectedDict');

    this.TextBox1_Name('SelectedDict.Name', '输入字段ID', this.SelectedDict_Name, '字段ID', () => this.RequestVal('tb1', 'SelectedDict'), '英文字母或者下划线开头.');

    //this.TextBox2_NameNo('Blank', '无数据源下拉框', this.Blank, 'FK_', '字段英文名', '字段中文名', '');
    //this.TextBox2_NameNo('Blank', '无外键下拉框', this.SelectedDict_Name, '字段ID', () => this.RequestVal('tb1', 'SelectedDict'), '英文字母或者下划线开头.');
    //this.SelectItemsByList('Blank', '无外键下拉框', this.SelectedDict, false, sqlList);

    //分步表单.
    // this.AddBlank('AdminDict', '字典库维护', this.HelpDict);
    this.AddGoToUrl('AdminDict', '字典库维护', GloComm.UrlSearch('TS.FrmUI.SFTable'));
    //this.AddBlank('AdminDBSrc', '数据源维护', this.HelpDBSrc);
    this.AddGoToUrl('AdminDBSrc', '数据源维护', GloComm.UrlSearch('TS.Sys.SFDBSrc'));
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    if (pageNo == 'SelectedEnum') return;

    if (pageNo == 'GoBack') {
      Event.emit('goback', {
        drawerVisible: false,
      });
      return;
    }

    if (pageNo == 'Blank') {
      await SFTables.Init_Blank(); //预制数据.
      return this.InitDDL(tb2, tb1, 'Blank');
    }

    //编辑枚举.
    if (pageNo === 'AdminEnum.ToUrl' || pageNo === 'AdminEnum') {
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlSearch('TS.FrmUI.SysEnumMain'));
    }

    //.
    if (pageNo === 'AdminDict.ToUrl' || pageNo === 'AdminDict') {
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlSearch('TS.FrmUI.SFTable'));
    }

    //数据源维护.
    if (pageNo === 'AdminDBSrc') {
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlSearch('TS.Sys.SFDBSrc'));
    }

    //新建枚举字段
    if (pageNo === 'SelectedEnum.FieldName') {
      const frmID = this.RequestVal('FrmID');
      const groupID = this.RequestVal('GroupField');
      const ctrlType = this.RequestVal('CtrlType'); //控件类型，是下拉，或者单选.

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
      if (await mapAttr.IsExits()) return new GPNReturnObj(GPNReturnType.Error, '字段在表单已经存在' + tb1);

      mapAttr.Name = enumName;
      mapAttr.KeyOfEn = tb1;
      mapAttr.FK_MapData = frmID;
      mapAttr.UIVisible = 1;
      mapAttr.UIIsEnable = 1;
      mapAttr.GroupID = groupID;
      mapAttr.DefVal = 0;

      mapAttr.LGType = 1; //枚举类型.
      mapAttr.MyDataType = ctrlType === '2' ? 1 : enumMain.EnumType === 0 ? 2 : 1; //int 类型.
      mapAttr.SetPara('RBShowModel', 3);

      mapAttr.UIContralType = parseInt(ctrlType) || UIContralType.DDL; //修改类型.
      mapAttr.UIBindKey = enumMain.EnumKey;
      await mapAttr.Insert();
      //转向.
      const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrEnum&PKVal=' + mapAttr.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //新建外键字段
    if (pageNo === 'SelectedDict.Name') {
      //执行通用创建接口.
      const sfTableNo = this.RequestVal('tb1', 'SelectedDict');
      return this.InitDDL(tb1, '', sfTableNo);
    }
  }
  public async InitDDL(attrKey: string, attrName: string, sfTableNo: string) {
    const frmID = this.RequestVal('FrmID');
    const groupID = this.RequestVal('GroupField');
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
    mapAttr.GroupID = groupID;
    mapAttr.LGType = 0; //普通类型.
    mapAttr.MyDataType = 1; //String类型.
    mapAttr.UIContralType = UIContralType.DDL; //下拉框.
    mapAttr.UIBindKey = sfTable.No; //绑定的值.
    mapAttr.SetPara('SrcType', sfTable.DBSrcType);
    await mapAttr.Insert();
    const mypk = mapAttr.MyPK;
    //插入影子字段.
    mapAttr.UIVisible = 0;
    mapAttr.MyPK = frmID + '_' + attrKey + 'T';
    mapAttr.KeyOfEn = attrKey + 'T';
    mapAttr.Name = mapAttr.Name + 'T';
    mapAttr.UIContralType = UIContralType.TB;
    await mapAttr.Insert();
    //转向.
    const url = '/@/WF/Comm/En.vue?EnName=TS.FrmUI.MapAttrSFSQL&PKVal=' + mypk;
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
  public readonly HelpAdminEnum = `
  #### 帮助
  - 枚举库维护, 进入枚举库后，在工具栏点击新建按钮.
  `;
  public readonly HelpDBSrc = `
  #### 帮助
  - 数据源分为关系数据库类型的数据源与web服务的数据源.
  - 首先需要维护数据源，然后在数据源上创建字典.
  `;
  public readonly HelpDict = `
  #### 帮助
  - 字典表管理,在数据源上创建字典表.
  - 如果没有数据源，请首先创建数据源.
  `;
  public readonly Blank = `
  #### 帮助
  - 空白的字段: 用于加载表单的时候，他的数据源是通过，由参数的字典获得的.
  - 比如：表单里由，片区、省份、地市、区县四个下拉框字段. 当表单加载的时候，在没有确定片区其他的三个字段都无法确定值。
  - 省份、地区、区县就需要绑定空白数据源外键.
  - 使用级联关系，把其他的字段数据实现数据级联查询.
  `;
  public readonly Docs1 = `
  #### 帮助 
  - 待完善.
  `;

  public readonly SelectedDict_Name = `
  #### 帮助
  - 请输入要生成的字段名, 格式:英文字母开头下划线数字.
  - 该名称将会是数据库的真实字段.
  `;

  public readonly SelectedDict = `
  #### 帮助
  - 请选择一个外键字典表，如果没有请在左侧创建一个字典表.
  - 创建外键字段,必须选定外键的字典表.
  - 列出来的都是无参数的字典.

  #### 关于外键字典表
  - 具有编码，名称数据我们称为字典表，比如：片区、省份、税种、税目、部门.
  - 创建外键字典表必须依托一个数据源.
  - 从其他系统获得的数据, 
  - 外键字典表可以链接到

  #### 字典数据来源类型
  - SQL语句：从关系数据库中获得来的.
  - WebApi: 通过web服务获得.
  - Javascript: 通过脚本的function方法获得.
  - ccform内置的数据维护,维护在ccbpm系统中的字典.

  #### 两种格式数据格式
  - 编号名称格式: 比如片区、省份.
  - 树结构模式: 比如部门、产品目录树.
  #### 数据源的类型
  - 关系数据库
  - web服务.

  `;

  // 选择自定的枚举
  public static readonly SelectedEnum = `
  #### 帮助 
   - 选择枚举库的枚举.
   - 如果没有该数据，请点击枚举库管理，新建枚举.
  #### 定义.
   - 枚举分为int类型的枚举与string类型的枚举.
   - Int类型的枚举:政治面貌, 0=群众1=团员,2=党员.
   - String类型的枚举:政治面貌, qz=群众 ty=团员, dy=党员 .
   - 格式为(Item用逗号分开): 事假,病假,婚假,其它

  #### 枚举的存储
   - 枚举主表: Sys_EnumMain 
   - 枚举从表: Sys_Enum
  `;

  // 新建string枚举
  public readonly NewStrEnum = `
  #### 帮助
   - 填写格式: 枚举值=枚举标签; 
   - 例如: ty=团员,dy=党员,qz=群众
   - 系统解析为: ty是团员, dy是党员, qz是群众.

  #### 数据存储.
   - string类型的枚举也称为标记枚举,字母存储一个列,标签存储一个列.
   - 在表单里字段是abc,那系统就会自动创建一个影子字段 abcT.
   - abc字段存储的是标记, abcT存储的是标签.
   - 这一点与外部数据源存储一致.
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

  // 选择系统枚举
  public readonly Docs2 = `

  #### 帮助
   - 依托富文本编辑器,实现对表单的编辑.
   - 优点:格式灵活,展现效果随心所欲.
   - 缺点:业务人员入手需要一定的学习成本.
   - 适用于:效果
    
  `;
}
