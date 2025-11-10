export class Map {
  public PhysicsTable = '';
  public ParaFields = ''; //参数字段.
  public EnDesc = '';
  public EnClassID = ''; //实体的类名称.
  public PKs = '';
  public CodeStruct = '2'; //对EntityNoName 有效,编号生成格式.
  public SearchFieldsOfNum = ''; //数值范围的查询.
  //按日期查询.
  public DTSearchKey = '';
  public DTSearchLabel = '日期';
  public DTSearchWay: DTSearchWay = DTSearchWay.None;
  // public EnableDTSearch = true;
  public loaders: Array<Function> = []; // 动态的map加载器
  public attrs = new Attrs(); //属性集合.
  public enMapExts = new EnMapExts(); //外键属性集合.
  public rms = new RefMethods(); //相关功能.
  // public mapExts = new MapExts(); //扩展功能.
  public searchFields = new SearchFields(); //查询条件.
  public searchNumAttrs = new SearchNumAttrs(); //查询条件.
  public searchNormals = new SearchNormals(); //查询条件.
  public searchFKEnums = new SearchFKEnums(); //查询条件.
  public GroupBarShowModel = 0; //分组字段显示方式 0=tab 1=Group
  public ShowSummary = false;
  public _validator = {}; // 校验规则，参考ant-design-vue form规则

  constructor(pTable?: string, enName?: string) {
    this.PhysicsTable = pTable || '';
    this.EnDesc = enName || '';
  }

  /**
   * 增加主键
   * @param uiVisible 是否显示？
   */
  public AddMyPK(uiVisible?: boolean) {
    this.PKs = 'MyPK';
    this.AddTBStringPK('MyPK', null, '主键MyPK', uiVisible, true, 1, 100, 150);
  }

  /**
   * 实现自定义
   * @param rules 规则
   */
  public AddRules(rules: ExtendedRules) {
    this._validator = {
      ...this._validator,
      ...rules,
    };
  }

  public SetHelperAlert(key: string, context: string) {
    // context = context.Replace("@", "＠");
    const attr = this.GetAttrByKey(key);
    attr.HelperUrl = context;
  }

  public SetHelperUrl(key: string, url: string) {
    const attr = this.GetAttrByKey(key);
    attr.HelperUrl = url;
  }
  public GetAttrByKey(key: string): Attr {
    const attr = this.attrs.find((item) => item.Key.toUpperCase() === key.toUpperCase());
    if (attr) return attr;
    throw new Error(`错误:没有找到key=${key}的属性.`);
  }

  /**
   * 增加int主键.
   */
  public AddTBIntPK(key: string, _p0: number, name: string, Visible = false, uiWidth = 100) {
    this.PKs = key;
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = '0';
    attr.MyDataType = DataType.AppInt;
    attr.MyFieldType = FieldType.PK;
    attr.Desc = name;
    attr.UIVisible = Visible;
    attr.UIIsReadonly = true;
    attr.UIWidth = uiWidth;
    this.attrs.Add(attr);
  }

  /**
   * 增加OID主键.
   */
  public AddTBIntPKOID() {
    this.AddTBIntPK('OID', 0, '主键');
  }

  // 增加与实体表单相同的尾部字段，No,Name不包含在内. 可以执行权限控制.
  public AddFrmEntityEndAttrs() {
    this.AddTBString('RecNo', '@WebUser.No', '创建人编号', false, false, 0, 100, 10);
    this.AddTBString('RecName', '@WebUser.Name', '创建人名称', false, false, 0, 100, 10);
    this.AddTBString('DeptNo', '@WebUser.DeptNo', '创建人部门', false, false, 0, 100, 10);
    this.AddTBString('DeptName', '@WebUser.DeptName', '创建人部门', false, false, 0, 100, 10);

    this.AddTBString('OrgNo', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);
    this.AddTBString('RDT', '@RDT', '创建日期', false, false, 0, 100, 10);
    this.AddTBInt('EntityState', 0, '实体状态', false, false);
    this.AddTBAtParas(500);
  }
  // 增加与实体表单相同的尾部字段，No,Name不包含在内.
  public AddFrmBillEndAttrs() {
    this.AddTBString('Starter', '@WebUser.No', '创建人编号', false, false, 0, 100, 10);
    this.AddTBString('StarterName', '@WebUser.Name', '创建人名称', false, false, 0, 100, 10);
    this.AddTBString('DeptNo', '@WebUser.DeptNo', '创建人部门编号', false, false, 0, 100, 10);
    this.AddTBString('DeptName', '@WebUser.DeptNo', '创建人部门名称', false, false, 0, 100, 10);
    this.AddTBString('OrgNo', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);
    this.AddTBString('BillNo', '', '单号', false, false, 0, 100, 10);
    this.AddTBString('Title', '', '标题', false, false, 0, 100, 10);
    this.AddTBString('RDT', '@RDT', '创建日期', false, false, 0, 100, 10);
    this.AddTBInt('BillState', 0, '单据状态', false, false);
    this.AddTBAtParas(500);
  }
  // 流程主表字段.
  public AddFrmNDxxRptEndAttrs() {
    this.AddTBString('FlowEmps', '', '创建人编号', false, false, 0, 100, 10);
    this.AddTBString('FlowEnder', '@WebUser.Name', '创建人名称', false, false, 0, 100, 10);
    this.AddTBString('FlowEnderRDT', '@WebUser.DeptNo', '创建人部门', false, false, 0, 100, 10);
    this.AddTBInt('FlowEndNode', 0, '结束节点ID', false, false);

    this.AddTBString('FlowStarter', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);

    this.AddTBString('FlowStartRDT', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);
    this.AddTBString('PEmp', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);
    this.AddTBString('PFlowNo', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);
    this.AddTBInt('PNodeID', 0, 'PNodeID', false, false);

    this.AddTBString('PrjName', '@WebUser.OrgNo', '隶属组织', false, false, 0, 100, 10);
    this.AddTBString('PrjNo', null, '隶属组织', false, false, 0, 100, 10);
    this.AddTBInt('PWorkID', 0, 'PWorkID', false, false);
    this.AddTBString('Title', '@WebUser.OrgNo', '标题', false, false, 0, 100, 10);
    this.AddTBInt('WFSta', 0, '状态', false, false);
    this.AddTBInt('WFState', 0, '状态', false, false);
  }

  /**
   * 增加参数字段, 存储格式: @Key1=Val1@Key2=Valu2
   * @param fieldLength 长度
   */
  public AddTBAtParas(fieldLength?: number) {
    this.AddTBString('AtPara', null, 'AtPara', false, true, 0, fieldLength, 10);
  }

  /**
   * 增加string类型的主键.
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc 字段名
   * @param uiVisible 是否可见？
   * @param isReadonly 是否只读？
   * @param minLength 最小长度?
   * @param maxLength 最大长度？
   * @param tbWith 宽度
   * @param isUILine 是否整行显示?
   */

  public AddTBStringPK(
    key: string,
    defaultVal?: string | null,
    desc?: string,
    uiVisible?: boolean,
    isReadonly?: boolean,
    minLength?: number,
    maxLength?: number,
    tbWith?: number,
    isUILine?: boolean,
  ) {
    this.PKs = key;

    const attr = new Attr();
    attr.Key = key;

    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;
    attr.Desc = desc || '';
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = tbWith || 0;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = maxLength || 20;
    attr.MinLength = minLength || 0;
    attr.MyFieldType = FieldType.PK;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
    //this.AddTBString(key, field, defaultVal, FieldType.FK, desc, uiVisible, isReadonly, minLength, maxLength, tbWith, isUILine, null)
  }

  /**
   * 增加string类型的字段.
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc 描述
   * @param uiVisible 是否可见？
   * @param isReadonly 是否只读？
   * @param minLength 最小长度
   * @param maxLength  最大长度
   * @param tbWith  宽度？
   * @param isUILine 是否整行显示？
   * @param helpUrl 帮助url.
   */
  public AddTBString(
    key: string,
    defaultVal: string | null,
    desc: string,
    uiVisible: boolean,
    isReadonly: boolean,
    minLength: number,
    maxLength?: number,
    tbWith?: number,
    isUILine?: boolean,
    helpUrl?: string | null,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = tbWith || 0;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = maxLength || 50;
    attr.MinLength = minLength || 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  public AddTBStringDoc(key: string, defaultVal: string | null, desc: string, uiVisible: boolean, isReadonly: boolean, isUILine: boolean, helpUrl?: string | null) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible;
    attr.UIWidth = 300;
    attr.UIIsReadonly = isReadonly;
    attr.MaxLength = 4000;
    attr.MinLength = 0;
    attr.UIHeight = 50;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  /**
   * 增加Int类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isReadonly 是否只读？
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   */
  public AddTBInt(key: string, defaultVal: number | null, desc: string, uiVisible: boolean, isReadonly: boolean, isUILine?: boolean, helpUrl?: string | null, uiWidth = 80) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppInt;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 1;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  /**
   * 增加金额类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isReadonly 是否只读？
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   */
  public AddTBMoney(key: string, defaultVal: number | null, desc: string, uiVisible: boolean, isReadonly: boolean, isUILine?: boolean, helpUrl?: string | null, uiWidth = 80) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppMoney;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 1;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  /**
   * 增加float类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isReadonly 是否只读？
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   * @param uiWidth 宽度=80.
   * @param precision 精度=0.
   */
  public AddTBFloat(
    key: string,
    defaultVal: number | null,
    desc: string,
    uiVisible: boolean,
    isReadonly: boolean,
    isUILine?: boolean,
    helpUrl?: string | null,
    uiWidth = 80,
    precision = 0,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppFloat;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 1;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    attr.Precision = precision;
    this.attrs.Add(attr);
  }

  /**
   * 为浮点数和金额字段设置精度
   * @param key 字段key
   * @param precision 精度
   * @returns undefined
   */
  public SetPrecision(key: string, precision: number) {
    const attr = this.attrs.find((attr) => attr.Key == key);
    if (!attr) {
      alert(`没有找到字段 ${key}, 请检查`);
      return;
    }
    if (![DataType.AppFloat, DataType.AppDouble, DataType.AppMoney].includes(attr.MyDataType)) {
      alert('设置精度只能适用于 浮点数 及 金额类型');
      return;
    }
    attr.Precision = precision;
  }

  /**
   * 增加 Decimal 类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isReadonly 是否只读？
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   */
  public AddTBDecimal(key: string, defaultVal: number | null, desc: string, uiVisible: boolean, isReadonly: boolean, isUILine?: boolean, helpUrl?: string | null, uiWidth = 80) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppDouble;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 0;
    attr.MinLength = 2;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  public SetUIWidth(attrKey: string, uiWidth: number) {
    const attr = this.attrs.find((attr) => attr.Key == attrKey);
    if (attr) attr.UIWidth = uiWidth;
  }

  /**
   * 添加日期字段
   * @param key key名
   * @param defaultVal 默认值
   * @param desc 描述
   * @param uiVisible 可见
   * @param isReadonly 只读
   * @param isUILine 显示整行
   * @param helpUrl 帮助url
   * @param dateConfig 日期配置
   * @param uiWidth 宽度
   */
  public AddTBDate(
    key: string,
    defaultVal: string | null,
    desc: string,
    uiVisible: boolean,
    isReadonly: boolean,
    isUILine?: boolean,
    helpUrl?: string | null,
    dateConfig: DateConfig = {
      type: 'date',
      format: 'YYYY-MM-DD',
    },
    uiWidth = 90,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppDate;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 50;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    attr.DateConfig = dateConfig; // 使用.Tag，
    this.attrs.Add(attr);
  }
  /**
   * 增加 rich-text 类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isReadonly 是否只读？
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   */
  public AddRichText(key: string, defaultVal: string | null, desc: string, uiVisible: boolean, isReadonly: boolean, isUILine?: boolean, helpUrl?: string | null) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = 120;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 10000;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    attr.UIContralType = UIContralType.FrmHtml;
    this.attrs.Add(attr);
  }

  /**
   * 增加 DateTime 类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isReadonly 是否只读？
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   */
  public AddTBDateTime(
    key: string,
    defaultVal: string | null,
    desc: string,
    uiVisible: boolean,
    isReadonly: boolean,
    isUILine?: boolean,
    helpUrl?: string | null,
    datetimeConfig: DateTimeConfig = {
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm',
      showTime: true,
    },
    uiWidth = 145,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppDateTime;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = isReadonly || false;
    attr.MaxLength = 50;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isUILine || false;
    attr.DateTimeConfig = datetimeConfig;
    this.attrs.Add(attr);
  }

  public AddDDLSysEnum(
    key: string,
    defaultVal: number,
    desc: string,
    uiVisible: boolean,
    isEnable: boolean,
    uiBindKey?: string | null,
    cfgVal?: string | null,
    helpUrl?: string | null,
    isUILine?: boolean,
    uiWidth?: number,
    ctrlType = 0,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = Math.max(uiWidth || 0, attr.Desc.length * 20);

    attr.UIIsReadonly = !isEnable;
    attr.MaxLength = 2;
    attr.MinLength = 0;
    attr.UIBindKey = uiBindKey || key;
    attr.UITag = cfgVal || null;
    if (cfgVal != null && cfgVal.indexOf('@') == -1) {
      alert('字段[' + key + ']枚举值cfgVal错误:[' + cfgVal + ']不符合格式@0=xx@1=yy的格式.');
    }

    attr.MyDataType = DataType.AppInt;
    attr.MyFieldType = FieldType.Enum;
    if (ctrlType == 0) attr.UIContralType = UIContralType.DDL;
    else attr.UIContralType = UIContralType.RadioBtn;

    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  public AddRadioBtn(
    key: string,
    defaultVal: number,
    desc: string,
    uiVisible: boolean,
    isEnable: boolean,
    uiBindKey?: string,
    cfgVal?: string | null,
    helpUrl?: string | null,
    isUILine?: boolean,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = 150;

    attr.UIIsReadonly = !isEnable;
    attr.MaxLength = 2;
    attr.MinLength = 0;
    attr.UIBindKey = uiBindKey || key;
    attr.UITag = cfgVal || null;

    attr.MyDataType = DataType.AppInt;
    attr.MyFieldType = FieldType.Enum;
    attr.UIContralType = UIContralType.RadioBtn;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  public AddRate(
    key: string,
    defaultVal: number,
    desc: string,
    uiVisible: boolean,
    isEnable: boolean,
    uiBindKey?: string,
    cfgVal?: string | null,
    helpUrl?: string | null,
    isUILine?: boolean,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = 150;
    attr.UIIsReadonly = !isEnable;
    attr.MaxLength = 2;
    attr.MinLength = 0;
    attr.UIBindKey = uiBindKey || key;
    attr.UITag = cfgVal || null;
    attr.MyDataType = DataType.AppFloat;
    attr.MyFieldType = FieldType.Normal;
    attr.UIContralType = UIContralType.Score;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
  }

  /**
   * 增加Int类型字段。
   * @param key 字段
   * @param defaultVal 默认值
   * @param desc  描述
   * @param uiVisible  是否可见？
   * @param isEnable 是否启用？传入false表示只读
   * @param isUILine 是否整行显示?
   * @param helpUrl 帮助Url.
   * @param UIkeyRef 联动字段
   */
  public AddBoolean(key: string, defaultVal: boolean, desc: string, uiVisible: boolean, isEnable: boolean, isUILine?: boolean, helpUrl?: string | null, keyRef?: string | null) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;

    if (defaultVal) attr.DefaultVal = 1;
    else attr.DefaultVal = 0;
    attr.MyDataType = DataType.AppBoolean;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = 80;
    attr.UIIsReadonly = !isEnable;
    attr.MaxLength = 1;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = !!isUILine;
    attr.UIkeyRef = keyRef || null;
    this.attrs.Add(attr);
  }

  public AddDDLEnsByOptions(option: {
    key: string;
    defaultVal: string | null;
    desc: string;
    en: EntityNoName;
    uiIsEnable: boolean;
    helpUrl?: null;
    isUILine?: boolean;
    UIWidth?: number;
  }) {
    const attr = new Attr();
    attr.Key = option.key;
    attr.Field = option.key;

    attr.DefaultVal = option.defaultVal;
    attr.MyDataType = DataType.AppString;

    attr.MyFieldType = FieldType.FK;
    attr.MaxLength = option.desc.length * 2 * 24;
    attr.MinLength = 0;
    attr.Desc = option.desc;
    attr.UIContralType = UIContralType.DDL;
    attr.UIBindKey = option.en._enMap.PhysicsTable + ',No,Name,' + option.en.classID;
    // attr.HisFKEns =en;
    attr.UIWidth = option.UIWidth || 200;
    // attr.HisFKEns = en; // => [ {} ];
    attr.UIIsReadonly = !option.uiIsEnable;
    attr.HelperUrl = option.helpUrl || null;
    attr.UIIsLine = !!option.isUILine;
    this.attrs.Add(attr);
  }

  public AddDDLEntities(
    key: string,
    defaultVal: string | null,
    desc: string,
    en: EntityNoName,
    uiIsEnable: boolean,
    helpUrl?: null,
    isUILine?: boolean,
    UIWidth?: number,
    refKey = 'No',
    refText = 'Name',
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;

    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;

    attr.MyFieldType = FieldType.FK;
    attr.MaxLength = desc.length * 2 * 24;
    attr.MinLength = 0;
    attr.Desc = desc;
    attr.UIContralType = UIContralType.DDL;
    attr.UIBindKey = 'Ens,' + en._enMap.PhysicsTable + ',No,Name,' + en.classID;
    // attr.HisFKEns =en;
    attr.UIWidth = UIWidth || 200;
    // attr.HisFKEns = en; // => [ {} ];
    attr.UIIsReadonly = !uiIsEnable;
    attr.HelperUrl = helpUrl || null;
    attr.UIIsLine = !!isUILine;
    attr.UIRefKeyText = refText;
    attr.UIRefKeyValue = refKey;
    attr.BindEntityID = en.classID; // 绑定的实体类ID
    this.attrs.Add(attr);

    // const sql = 'SELECT No, Name FROM ' + en._enMap.PhysicsTable;
    //this.AddDDLSQL(key, defaultVal, desc, sql, uiIsEnable, helpUrl, isUILine);
  }

  /**
   * 统一的下拉框添加方法
   * 支持三类数据源：entities/sql/enum；支持多选（配置写入MapExt）；支持分页（配置写入MapExt）
   */
  public AddDDL(option: {
    key: string;
    desc: string;
    defaultVal?: string | number | null;
    uiIsEnable: boolean;
    helpUrl?: string | null;
    isUILine?: boolean;
    uiWidth?: number;
    source: { type: 'entities'; en: EntityNoName; refKey?: string; refText?: string } | { type: 'sql'; sql: string } | { type: 'enum'; cfgString: string };
    multiSelect?: boolean;
    pagination?: boolean | { pageSize?: number };
    config?: { extSearchKeys?: string[]; clearInputWhenChecked?: boolean; optionKeys?: string[]; maxTagCount?: number };
  }) {
    const { key, desc, config, defaultVal = null, uiIsEnable, helpUrl = null, isUILine, uiWidth, source, multiSelect, pagination } = option;

    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = (defaultVal as any) ?? null;
    attr.Desc = desc;
    attr.UIContralType = UIContralType.DDL;
    attr.UIWidth = uiWidth || 200;
    attr.UIIsReadonly = !uiIsEnable;
    attr.HelperUrl = helpUrl;
    attr.UIIsLine = !!isUILine;

    // 数据源与字段类型
    if (source.type === 'entities') {
      attr.MyDataType = DataType.AppString;
      attr.MyFieldType = FieldType.FK;
      attr.UIBindKey = 'Ens,' + source.en._enMap.PhysicsTable + ',No,Name,' + source.en.classID;
      attr.UIRefKeyText = source.refText || 'Name';
      attr.UIRefKeyValue = source.refKey || 'No';
      attr.BindEntityID = source.en.classID;
    } else if (source.type === 'sql') {
      attr.MyDataType = DataType.AppString;
      attr.MyFieldType = FieldType.Normal;
      attr.UIBindKey = source.sql;
      // 名称列
      const nameAttr = new Attr();
      nameAttr.Key = key + 'T';
      nameAttr.Field = key + 'T';
      nameAttr.DefaultVal = (defaultVal as any) ?? null;
      nameAttr.MyDataType = DataType.AppString;
      nameAttr.MyFieldType = FieldType.Normal;
      nameAttr.MaxLength = 200;
      nameAttr.Desc = desc;
      nameAttr.UIContralType = UIContralType.TB;
      nameAttr.HelperUrl = helpUrl;
      nameAttr.UIIsLine = !!isUILine;
      nameAttr.UIIsReadonly = true;
      nameAttr.UIVisible = false;
      this.attrs.Add(nameAttr);
    } else {
      // enum
      attr.MyDataType = DataType.AppString;
      attr.MyFieldType = FieldType.Normal;
      attr.UIBindKey = Glo.DealSQLStringEnumFormat(source.cfgString);
      // 名称列
      const nameAttr = new Attr();
      nameAttr.Key = key + 'T';
      nameAttr.Field = key + 'T';
      nameAttr.DefaultVal = (defaultVal as any) ?? null;
      nameAttr.MyDataType = DataType.AppString;
      nameAttr.MyFieldType = FieldType.Normal;
      nameAttr.MaxLength = 200;
      nameAttr.Desc = desc;
      nameAttr.UIContralType = UIContralType.TB;
      nameAttr.HelperUrl = helpUrl;
      nameAttr.UIIsLine = !!isUILine;
      nameAttr.UIIsReadonly = true;
      nameAttr.UIVisible = false;
      this.attrs.Add(nameAttr);
    }

    this.attrs.Add(attr);

    // 多选与分页配置（写入MapExt）
    if (multiSelect || pagination) {
      const ext = new EnMapExt();
      ext.AtPara = new AtPara();
      ext.ExtModel = ExtModel.DDLSelect;
      // DDLSelect
      ext.ExtType = 'DDLSelect';
      ext.AttrOfOper = key;
      ext.Tag1 = key;
      // 数据源透传
      if (source.type === 'entities') {
        ext.Tag2 = source.en.classID;
      } else if (source.type === 'sql') {
        ext.Tag2 = source.sql;
      } else {
        ext.Tag2 = Glo.DealSQLStringEnumFormat(source.cfgString);
      }
      // 多选
      if (multiSelect) ext.AtPara.SetVal('IsMultipleChoice', '1');
      // 分页
      if (pagination) {
        ext.AtPara.SetVal('Pagination', '1');
        const size = typeof pagination === 'object' && pagination.pageSize ? String(pagination.pageSize) : '20';
        ext.AtPara.SetVal('PageSize', size);
      }
      if (config?.clearInputWhenChecked) {
        ext.AtPara.SetVal('ClearInputWhenChecked', '1');
      }
      if (config?.optionKeys) {
        ext.AtPara.SetVal('OptionKeys', config.optionKeys.join(','));
      }
      if (config?.maxTagCount) {
        ext.AtPara.SetVal('MaxTagCount', config.maxTagCount.toString());
      }
      if (config?.extSearchKeys) {
        ext.AtPara.SetVal('ExtSearchKeys', config.extSearchKeys.join(','));
      }
      this.enMapExts.push(ext);

      // 为多选场景补充文本列，用于显示已选择项的名称集合
      const textAttr = new Attr();
      textAttr.Key = key + 'T';
      textAttr.Field = key + 'T';
      textAttr.DefaultVal = (defaultVal as any) ?? null;
      textAttr.MyDataType = DataType.AppString;
      textAttr.MyFieldType = FieldType.Normal;
      textAttr.MaxLength = 4000;
      textAttr.Desc = desc;
      textAttr.UIContralType = UIContralType.TB;
      textAttr.HelperUrl = helpUrl;
      textAttr.UIIsLine = !!isUILine;
      textAttr.UIIsReadonly = true;
      textAttr.UIVisible = false;
      this.attrs.Add(textAttr);
    }
  }

  /**
   * String类型的枚举.
   * @param key 字段
   * @param defaultVal 默认值
   * @param name 名称
   * @param cfgString string枚举配置格式: @xx=xxx@aq=xxx@ccc=xxx
   * @param uiIsEnable 是否可用？
   * @param helpUrl 帮助url
   * @param isUILine 是否整行显示?
   */
  public AddDDLStringEnum(key: string, defaultVal: string | null, name: string, cfgString: string, uiIsEnable: boolean, helpUrl?: string, isUILine?: boolean, UIWidth?: number) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;

    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;

    // 设置外部数据源类型字段.
    attr.MyFieldType = FieldType.Normal;
    attr.UIContralType = UIContralType.DDL;
    attr.MaxLength = 50;
    attr.MinLength = 0;

    attr.Desc = name;

    //转化为sql.
    attr.UIBindKey = Glo.DealSQLStringEnumFormat(cfgString);
    // alert(attr.UIBindKey);

    attr.UIIsReadonly = !uiIsEnable;
    attr.HelperUrl = helpUrl || null;
    attr.UIIsLine = !!isUILine;
    attr.UIWidth = UIWidth || 100;
    this.attrs.Add(attr);

    //他的名称列.
    const attr2 = new Attr();
    attr2.Key = key + 'T';
    attr2.Field = key + 'T';
    attr2.DefaultVal = defaultVal;
    attr2.MyDataType = DataType.AppString;
    attr2.MyFieldType = FieldType.Normal;
    attr2.MaxLength = 200;
    attr2.Desc = name;
    attr2.UIContralType = UIContralType.TB;
    attr2.HelperUrl = helpUrl || null;
    attr2.UIIsLine = !!isUILine;
    //	attr.UIBindKey = sql;
    attr2.UIIsReadonly = true;
    attr2.UIVisible = false;
    this.attrs.Add(attr2);
  }

  /**
   * 多选
   * @param key key
   * @param defaultVal 默认值
   * @param desc 描述
   * @param uiVisible 是否可见
   * @param isEnable 启用？
   * @param uiBindKey 关联key
   * @param cfgVal 枚举值
   * @param helpUrl 帮助url
   * @param isUILine 是否整行显示?
   */
  public AddCheckbox(
    key: string,
    defaultVal: string | number,
    desc: string,
    uiVisible: boolean,
    isEnable: boolean,
    uiBindKey?: string,
    cfgVal?: string | null,
    helpUrl?: string | null,
    isUILine?: boolean,
  ) {
    const attr = new Attr();
    attr.Key = key;
    attr.HelperUrl = helpUrl || null;
    attr.Field = key;
    attr.DefaultVal = defaultVal;
    attr.Desc = desc || key;
    attr.UIVisible = uiVisible || false;
    attr.UIWidth = 150;
    attr.UIIsReadonly = !isEnable;
    attr.MaxLength = 2;
    attr.MinLength = 0;
    attr.UIBindKey = uiBindKey || key;
    attr.UITag = cfgVal || null;
    attr.MyDataType = DataType.AppString;
    attr.MyFieldType = FieldType.Enum;
    attr.UIContralType = UIContralType.CheckBok;
    attr.UIIsLine = isUILine || false;
    this.attrs.Add(attr);
    const attr2 = new Attr();
    attr2.Key = key + 'T';
    attr2.Field = key + 'T';
    attr2.DefaultVal = defaultVal;
    attr2.MyDataType = DataType.AppString;
    attr2.MyFieldType = FieldType.Normal;
    attr2.MaxLength = 200;
    attr2.Desc = desc;
    attr2.UIContralType = UIContralType.TB;
    attr2.HelperUrl = helpUrl || null;
    attr2.UIIsLine = !!isUILine;
    //	attr.UIBindKey = sql;
    attr2.UIIsReadonly = true;
    attr2.UIVisible = false;
    this.attrs.Add(attr2);
  }

  public AddDDLSQL(key: string, defaultVal: string | null, desc: string, exp: string, uiIsEnable: boolean, helpUrl?: null, isUILine?: boolean, UIWidth?: number) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;

    attr.DefaultVal = defaultVal;
    attr.MyDataType = DataType.AppString;

    attr.MyFieldType = FieldType.Normal;
    attr.MaxLength = 50;
    attr.MinLength = 0;

    attr.Desc = desc;
    attr.UIContralType = UIContralType.DDL;
    attr.UIBindKey = exp;

    attr.UIIsReadonly = !uiIsEnable;
    attr.HelperUrl = helpUrl || null;
    attr.UIIsLine = !!isUILine;
    attr.UIWidth = UIWidth || 100;
    this.attrs.Add(attr);

    //他的名称列.
    const attr2 = new Attr();
    attr2.Key = key + 'T';
    attr2.Field = key + 'T';
    attr2.DefaultVal = defaultVal;
    attr2.MyDataType = DataType.AppString;
    attr2.MyFieldType = FieldType.Normal;
    attr2.MaxLength = 200;
    attr2.Desc = desc;
    attr2.UIContralType = UIContralType.TB;
    attr2.HelperUrl = helpUrl || null;
    attr2.UIIsLine = !!isUILine;
    //	attr.UIBindKey = sql;
    attr2.UIIsReadonly = true;
    attr2.UIVisible = false;
    this.attrs.Add(attr2);
  }

  /**
   * 单附件:只能上传一个文件.
   * @param key 附件标记
   * @param fileDesc 附件名称
   * @param isEnable 是否可以编辑
   * @param isLine 是否整行显示?
   * @param foramt 格式要求?
   * @param saveTo 保存方式 0=保存到web服务器@1=保存到数据库@2=ftp服务器@4=存储链接(只能接受外部数据)@5=保存到MiNiO分布式存储
   * @param uiWidth 宽度
   * @param initFileMaxSize 文件大小限制，默认10M
   */
  public AddAthSingle(key: string, fileDesc: string, isEnable: boolean, isLine: boolean, format = '*.*', saveTo = '', uiWidth = 200, initFileMaxSize = 10 * 1024) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = '';
    attr.MyDataType = DataType.AppString;
    attr.MyFieldType = FieldType.Normal;
    attr.MaxLength = 200;
    attr.MinLength = 0;
    attr.UIWidth = uiWidth;
    attr.Desc = fileDesc;
    attr.UIContralType = UIContralType.AthShow; //附件
    // attr.UIBindKey = '@AthType=AthSingle@Format=' + format + '@SaveTo=' + saveTo;
    attr.UIBindKey = `@AthType=AthSingle@Format=${format}@SaveTo=${saveTo}@initFileMaxSize=${initFileMaxSize}`;
    attr.UIIsReadonly = !isEnable;
    //  attr.HelperUrl = helpUrl || null;
    attr.UIIsLine = !!isLine;
    this.attrs.Add(attr);
  }

  /**
   * 多附件:可以上传多个文件，在列表里体现.
   * @param key 附件标记
   * @param fileDesc 附件名称
   * @param isEnable 是否可以编辑
   * @param isLine 是否整行显示?
   * @param foramt 格式要求?
   * @param uiWidth 宽度
   * @param saveTo 保存方式 0=保存到web服务器@1=保存到数据库@2=ftp服务器@4=存储链接(只能接受外部数据)@5=保存到MiNiO分布式存储
   * @param visible 是否显示
   * @param initFileMaxSize 文件大小限制，默认10M
   */
  public AddAthMulti(key: string, fileDesc: string, isEnable: boolean, isLine: boolean, foramt = '*.*', uiWidth = 200, saveTo = '', visible = true, initFileMaxSize = 10 * 1024) {
    const attr = new Attr();
    attr.Key = key;
    attr.Field = key;
    attr.DefaultVal = '';
    attr.MyDataType = DataType.AppString;
    attr.MyFieldType = FieldType.Normal;
    attr.MaxLength = 200;
    attr.MinLength = 0;
    attr.Desc = fileDesc;
    attr.UIContralType = UIContralType.AthShow; //附件
    attr.UIBindKey = `@AthType=AthMulti@Format=${foramt}@SaveTo=${saveTo}@initFileMaxSize=${initFileMaxSize}`;
    attr.UIWidth = uiWidth;
    attr.UIIsReadonly = !isEnable;
    //  attr.HelperUrl = helpUrl || null;
    attr.UIIsLine = !!isLine;
    attr.UIVisible = visible;
    this.attrs.Add(attr);
  }
  // 合并Attrs
  public AddAttrs(attrs: Attrs) {
    for (const attr of attrs) {
      if (!this.attrs.Contains(attr.Key)) {
        this.attrs.currGroupName = attr.GroupName;
        this.attrs.Add(attr);
      }
    }
  }

  public AddLang() {
    this.AddTBString('NameFT', null, '繁体', true, false, 0, 200, 150, false);
    this.AddTBString('NameEN', null, '英文', true, false, 0, 500, 150, false);
    this.AddTBString('NameJA', null, '日文', true, false, 0, 500, 150, false);
    //  this.AddTBString('NameALB', null, '阿拉伯', true, false, 0, 500, 150, false);
    this.AddTBString('NameVI', null, '越南', true, false, 0, 500, 150, false);
  }
  public FJSavePath = ''; //对EntityNoName 有效,编号生成格式.

  public ToJson() {
    return this.attrs;
  }

  public AddRefMethod(rm: RefMethod) {
    rm.GroupName = this.currRMGroupName;
    rm.GroupIcon = this.currRMGroupIcon;
    if (rm.RefMethodType == RefMethodType.Dtl && typeof rm.ClassMethod == 'string' && rm.ClassMethod.includes('EnName')) {
      const args = getAllRequestParams(rm.ClassMethod as string);
      rm.RefDtlRefPK = args.RefPK;
      rm.RefDtlClsID = args.EnName;
    }
    this.rms.push(rm);
  }

  public AddRM_En(title: string, enName: string, pkval: string, icon = 'icon-drop') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    //rm.Tag = en;
    rm.RefMethodType = RefMethodType.En; //修改属性.
    //rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/En.vue.vue?EnName=' + enName + '&PKVal=' + pkval;
    this.AddRefMethod(rm);
  }
  public AddRM_EnOnly(title: string, enName: string, pkval: string, icon = 'icon-drop') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    //rm.Tag = en;
    rm.RefMethodType = RefMethodType.EnOnly; //修改属性.
    //rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/EnOnly.vue?EnName=' + enName + '&PKVal=' + pkval;
    this.AddRefMethod(rm);
  }

  /**
   * 增加分组编辑
   * @param en 分组编辑实体
   * @param icon 图标
   */
  public AddRM_PG(en: PageBasePanelGroup, icon: string | null = 'icon-user') {
    const rm = new RefMethod();
    rm.Title = en.PageTitle;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.PanelGroup; //修改属性.
    rm.ClassMethod = '/src/WF/Comm/PanelGroup.vue?EnName=' + en.ClassID + '&RefPKVal=@PKVal&PKVal=@PKVal&RefMainEnName=' + this.EnClassID;
    this.AddRefMethod(rm);
  }

  /**
   * 增加GPE分组编辑
   * @param en 分组编辑实体
   * @param icon 图标
   * @param suffix 实体主键后缀
   */
  public AddRM_GPE(en: PageBaseGroupEdit, icon: string | null = 'icon-user', suffix = '', title = '', paras = '') {
    const rm = new RefMethod();
    if (title == '') rm.Title = en.PageTitle;
    else rm.Title = title;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.GroupPageEdit; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/UIEntity/GroupPageEdit.vue?EnName=' + en.classID + '&Icon=' + icon + paras;
    this.AddRefMethod(rm);
  }

  public AddRM_DataV(en: DataVBase, icon: string | null = 'icon-pie-chart', suffix = '', paras = '') {
    const rm = new RefMethod();
    rm.Title = en.PageTitle;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.DataVBase; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/views/data_visualization/index.vue?EnName=' + en.ClassID + '&Icon=' + icon + paras;
    this.AddRefMethod(rm);
  }

  /**
   * 增加分组编辑
   * @param en 分组编辑实体
   * @param icon 图标
   * @param suffix 实体主键后缀
   */
  public AddRM_GPEByOptions(option: { en: PageBaseGroupEdit; icon?: string | null; suffix?: string; paramsStr?: string }) {
    const { en, icon = 'icon-user', suffix = '', paramsStr } = option;
    const rm = new RefMethod();
    rm.Title = en.PageTitle;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.GroupPageEdit; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/UIEntity/GroupPageEdit.vue?EnName=' + en.classID + '&Icon=' + icon + paramsStr;
    this.AddRefMethod(rm);
  }

  /**
   * 打开或者处理制定字段是workid的流程.
   * @param title 标题
   * @param flowNo 流程编号
   * @param workIDField workid字段,在当前实体中要存储的workID字段.
   * @param icon icon
   */
  public AddRM_FlowMyView(title: string, flowNo: string, workIDField: string | null = 'OID', icon: string | null = 'icon-people') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    // rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabIframeOpen; //修改属性.
    // rm.Target = suffix;
    //, 这里，怎么把除实体中attrs的 > 100个字符以外的字段，都过滤掉，补充到后面。
    //rm.ClassMethod = '/#/WF/MyFlow?FK_Flow=' + flowNo + '&EnNam=' + this.EnClassID + '&PKVal=@PKVal';
    rm.ClassMethod = '/#/WF/MyView?FlowNo=' + flowNo;
    const disableKeys = ['OID', 'MyPK', 'No', 'WorkID'];
    const attrKeys = this.attrs
      .filter((attr) => attr.MaxLength <= 150)
      .filter((attr) => {
        return !disableKeys.includes(attr.Key);
      })
      .map((attr) => attr.Key);

    rm.ClassMethod += '&' + attrKeys.map((key) => `${key}=@${key}`).join('&');
    rm.ClassMethod += '&EnName=' + this.EnClassID + '&EnPKVal=@PKVal&WorkID=@' + workIDField; //如何获得主键值?, 把xxx变成OID/MyPK等主键值.
    this.AddRefMethod(rm);
  }
  /**
   * 流程列表
   * @param flowTitle 标题
   * @param flowNo 流程编号
   * @param filterExp 表达式
   * @param replacingExp 替代表达式
   * @param icon icon
   */
  public AddRM_SearchFlow(flowTitle: string, flowNo: string, paras: string, fieldMap: globalThis.Map<string, string>, icon = 'icon-plan') {
    // throw new Error('Method not implemented.');
    const rm = new RefMethod();
    rm.Title = flowTitle;
    rm.Icon = icon;
    rm.Tag = flowNo;
    rm.RefFlowInfo = {
      No: flowNo,
      WorkIDFieldName: '',
      FieldMap: fieldMap,
    };
    rm.RefMethodType = RefMethodType.SearchFlow; //修改属性.
    rm.ClassMethod = '/src/WF/Rpt/SearchFlow.vue?FlowNo=' + flowNo + '&EnName=' + this.EnClassID + '&PKVal=@PKVal' + paras;
    this.AddRefMethod(rm);
  }

  /**
   * 发起一个流程,类似于新建
   * @param title 标题
   * @param flowNo 流程编号
   * @param paras 参数
   * @param replacingExp 替代表达式，比如：流程表单的字段是DianHua,在当前实体字段是Tel,把当前的字段替换成,流程表单识别的字段 格式是: DianHua,Tel;YouJian=Email
   * @param icon icon
   */
  public AddRM_StartFlow(title: string, flowNo: string, paras: string, fieldMap: globalThis.Map<string, string>, icon: string | null = 'icon-plan') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.StartFlow; //修改属性.
    rm.ClassMethod = '/#/WF/MyFlow?FlowNo=' + flowNo;
    rm.RefFlowInfo = {
      No: flowNo,
      WorkIDFieldName: '',
      FieldMap: fieldMap,
    };
    const disableKeys = ['OID', 'MyPK', 'No', 'WorkID'];
    const attrKeys = this.attrs
      .filter((attr) => attr.MaxLength <= 150)
      .filter((attr) => {
        return !disableKeys.includes(attr.Key);
      })
      .map((attr) => attr.Key);

    rm.ClassMethod += '&' + attrKeys.map((key) => `${key}=@${key}`).join('&');
    rm.ClassMethod += '&EnName=' + this.EnClassID + '&EnPKVal=@PKVal' + paras;
    this.AddRefMethod(rm);
  }
  /**
   * 发起/查看宿主流程.
   * @param title 标题
   * @param icon 图标, icon-plan
   * @param flowNo 流程编号
   * @param paras 参数
   * @param replacingExp 替代表达式
   * @param icon icon.
   */
  public AddRM_StartHostFlow(title: string, icon: string | null = 'icon-plan', flowNo: string, paras: string, fieldMap: globalThis.Map<string, string>) {
    //1.检查是否有约定的字段,约定必须有一个字段是WorkIDOfXXX, xxx就是流程编号.
    const fieldID = 'WorkIDOf' + flowNo;
    if (!this.attrs.find((attr) => attr.Key === fieldID)) {
      this.AddTBInt(fieldID, null, `${title}WorkID`, true, true, false);
      this.SetHelperAlert(fieldID, `当发起${title}的时候给该字段赋值 , 默认为0 , 该字段是隐藏字段.`);
    }
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.StartHostFlow; //修改属性.
    rm.ClassMethod = '/#/WF/MyFlow?FlowNo=' + flowNo;
    rm.RefFlowInfo = {
      No: flowNo,
      WorkIDFieldName: fieldID,
      FieldMap: fieldMap,
    };
    const disableKeys = ['OID', 'MyPK', 'No', 'WorkID'];
    const attrKeys = this.attrs
      .filter((attr) => attr.MaxLength <= 150)
      .filter((attr) => {
        return !disableKeys.includes(attr.Key);
      })
      .map((attr) => attr.Key);
    rm.ClassMethod += '&' + attrKeys.map((key) => `${key}=@${key}`).join('&');
    rm.ClassMethod += '&EnName=' + this.EnClassID + '&EnPKVal=@PKVal' + paras;
    this.AddRefMethod(rm);
  }

  public AddRM_Commpent_BBS(title: string, icon: string | null = 'icon-people') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    // rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    // rm.Target = suffix;
    rm.ClassMethod = '/src/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue?EnName=' + this.PhysicsTable + '&FrmID=' + this.PhysicsTable + '&PKVal=@PKVal';
    this.AddRefMethod(rm);
  }

  public AddRM_Commpent_Track(title: string, icon: string | null = 'icon-film') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    // rm.ClassMethod = '/src/CCFast/CCBill/Components/FrmBBS/FrmTrack.vue?EnName=' + this.EnClassID + '&PKVal=@PKVal';
    rm.ClassMethod = '/src/CCFast/CCBill/OptComponents/DictLog.vue?PTable=' + this.PhysicsTable + '&EnName=@EnName&WorkID=@PKVal&PKVal=@PKVal';

    this.AddRefMethod(rm);
  }

  /**
   * 增加页面处理
   * @param en 实体
   * @param icon 图标
   * @param suffix
   */
  public AddRM_GPN(en: PageBaseGroupNew, icon: string | null = 'icon-user', suffix = '') {
    const rm = new RefMethod();
    rm.Title = en.PageTitle;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.GroupPageNew; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/UIEntity/GroupPageNew.vue?EnName=' + en.classID + '&RefPKVal=@PKVal&PKVal=@PKVal&RefMainEnName=' + this.EnClassID;
    this.AddRefMethod(rm);
  }

  public AddRM_GL(en: PageBaseGenerList, title = '', icon: string | null = 'icon-user', paras = '') {
    const rm = new RefMethod();
    //  console.log(en);
    rm.Title = title || en.PageTitle;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    //rm.Target = suffix;
    rm.ClassMethod = '/src/WF/views/GenerList.vue?EnName=' + en.ClassID + '&PKVal=@PKVal&RefMainEnName=' + this.EnClassID + paras;
    this.AddRefMethod(rm);
  }

  //
  public AddRM_TreeEns(en: PageBaseTreeEns, icon: string | null = 'icon-user', suffix = '') {
    const rm = new RefMethod();
    //  console.log(en);
    rm.Title = en.PageTitle;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/TreeEns.vue?EnName=' + en.ClassID + '&PKVal=@PKVal&RefMainEnName=' + this.EnClassID;
    this.AddRefMethod(rm);
  }

  public AddRM_Search(en: Entity, icon: string | null = 'icon-user', suffix = '', linkName = '') {
    const rm = new RefMethod();
    if (linkName == '') rm.Title = en.EnMap.EnDesc;
    else rm.Title = linkName;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/Search.vue?EnName=' + en.classID + '&PKVal=@PKVal&RefMainEnName=' + this.EnClassID;
    this.AddRefMethod(rm);
  }
  public AddRM_Group(en: Entity, icon: string | null = 'icon-user', suffix = '', linkName = '') {
    const rm = new RefMethod();
    if (linkName == '') rm.Title = en.EnMap.EnDesc;
    else rm.Title = linkName;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/Group.vue?EnName=' + en.classID + '&PKVal=@PKVal&RefMainEnName=' + this.EnClassID;
    this.AddRefMethod(rm);
  }
  public AddRM_Ens(en: Entity, icon: string | null = 'icon-user', suffix = '') {
    const rm = new RefMethod();
    rm.Title = en.EnMap.EnDesc;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    rm.Target = suffix;
    rm.ClassMethod = '/src/WF/Comm/Ens.vue?EnName=' + en.classID + '&PKVal=@PKVal&RefMainEnName=' + this.EnClassID;
    this.AddRefMethod(rm);
  }
  public AddRM_Tabs(en: TabsBase, title = '', icon: string | null = 'icon-social-linkedin') {
    const rm = new RefMethod();
    if (title == '') rm.Title = en.PageTitle;
    else rm.Title = title;
    rm.Icon = icon;
    rm.Tag = en;
    rm.RefMethodType = RefMethodType.TabOpen; //修改属性.
    rm.ClassMethod = '/src/components/Tabs/index.vue?EnName=' + en.ClassID;
    this.AddRefMethod(rm);
  }

  // 添加map动态处理方法
  public AddMapLoader(mapLoader: Function) {
    this.loaders.push(mapLoader);
  }

  // 添加查询列（输入）
  public AddSearchField(key: string, placeholder = '') {
    this.searchFields.Add(this.GetAttrByKey(key), placeholder);
  }

  public AddHidden(refKey: string, symbol: string, val: string) {
    const aos = new SearchNormal(refKey, refKey, refKey, symbol, val, 0, true);
    this.searchNormals.AddSearchAttr(aos);
  }

  public AddSearchAttr(key: string, width = 200) {
    const attr = this.GetAttrByKey(key);
    if (attr.IsEnum || attr.IsBoolean || attr.UIContralType == UIContralType.DDL) {
      this.searchFKEnums.Add(attr, true, '', width);
      return;
    }
    if (attr.IsNum) {
      const _search = `@${attr.Desc}=${attr.Key}`;
      if (!this.SearchFieldsOfNum.includes(_search)) {
        this.SearchFieldsOfNum += _search;
      }
      this.searchNumAttrs.Add(attr);
      return;
    }
    if (attr.MyDataType == DataType.AppString) {
      this.searchFields.Add(attr);
      return;
    }
    throw new Error('不支持的查询字段类型');
  }

  /**
   * 增加从表:批量保存
   * @param title 标题.
   * @param ensDtl 从表实体.
   * @param refKey  关联主键.
   * @param butsTableTop table上面的自定义按钮. 事件写入\DataUser\OverrideFiles\FrmDtlBtnClick.ts
   * @param butsItem  行上的自定义按钮. 事件写入\DataUser\OverrideFiles\FrmDtlBtnRowClick.ts
   * @param icon icon.
   * @param dtlConfig 查询条件 支持字符串：&SubFlowType=0&OrderBy=Idx， 以及对象
   * @param _pos
   * @param isSummary
   * @param height
   * @param isMove 允许排序
   */
  public AddRM_DtlBatch(
    title: string,
    ensDtl: Entities,
    refKey: string,
    butsTableTop: string | null = '',
    butsItem: string | null = '',
    icon: string | null = 'icon-user',
    dtlConfig: string | DtlRelationConfig = '',
    _pos: SubTablePosition = SubTablePosition.Left,
    isSummary = 0,
    height = 400,
    isMove: boolean | null = false,
  ) {
    // handle dtlConfig
    if (typeof dtlConfig == 'object' && Object.keys(dtlConfig).length > 0) {
      let str = '';
      const keys = Object.keys(dtlConfig);
      for (const key of keys) {
        const val = dtlConfig[key];
        if (typeof val == 'boolean') {
          if (val) {
            str += `&${key}=1`;
          }
          continue;
        }
        str += `&${key}=${dtlConfig[key]}`;
      }
      dtlConfig = str;
    }
    // for tab mode
    if (_pos == SubTablePosition.Tab) {
      this.AddTabComponent(
        title,
        `/src/WF/Comm/Dtl/DtlBatch.vue?EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&ButsTableTop=${butsTableTop}&ButsItem=${butsItem}${dtlConfig}&RefMainEnName=${
          this.EnClassID
        }&icon=${icon}&IsMove=${isMove ? '1' : '0'}&IsSummary=${isSummary}`,
        height,
        true,
      );
      return;
    }
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.Dtl;
    rm.SubTablePosition = _pos;
    rm.RefDtlClsID = ensDtl.GetNewEntity.classID;
    rm.RefDtlRefPK = refKey;

    rm.ClassMethod = `/src/WF/Comm/Dtl/DtlBatch.vue?EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&ButsTableTop=${butsTableTop}&ButsItem=${butsItem}&RefMainEnName=${
      this.EnClassID
    }&IsMove=${isMove ? '1' : '0'}&IsSummary=${isSummary}${dtlConfig}`;
    this.AddRefMethod(rm);
  }

  private currRMGroupName = '基本信息'; //方法分组.
  private currRMGroupIcon = 'icon-drop'; //方法分组.
  private currAttrName = '基本信息'; //字段分组.
  public AddGroupAttr(groupName: string) {
    this.currAttrName = groupName;
    this.attrs.currGroupName = this.currAttrName;
  }
  public AddTabComponent(name: string, compSrc: string, height = 400, hideTitle = false) {
    const g = this.attrs.groups.find((ag) => ag.name === name);
    if (g) return;
    this.attrs.groups.push({
      key: name,
      name,
      type: 'component',
      compSrc,
      height,
      hideTitle,
    });
  }

  public AddGroupMethod(groupName: string, groupIcon = 'icon-folder') {
    this.currRMGroupName = groupName;
    this.currRMGroupIcon = groupIcon;
  }
  public AddRM_Dtl3DSort1Sort2(
    title: string,
    ensDtl: Entities,
    refKey: string,
    sort1: string,
    sort2: string,
    sort12RefKey: string,
    sort3: string,
    attrKeyNum: string,
    sort1Color: string,
    sort2Color: string,
    sort3Color: string,
    icon: string | null = 'icon-user',
    //isMove: boolean | null = false,
    filterExp: string | null = '',
    _pos: SubTablePosition | null = SubTablePosition.Left,
  ) {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.Dtl;
    const dtlEn = ensDtl.GetNewEntity;
    if (_pos == null) _pos = SubTablePosition.Left;
    rm.SubTablePosition = _pos;
    rm.RefDtlClsID = dtlEn.classID;
    rm.RefDtlRefPK = refKey;
    let urlStart = '/src/WF/Comm/Dtl/Dtl3DSort1Sort2.vue';
    if (IsMobile()) {
      urlStart = '/src/CCMobile/Comm/Dtl3DSort1Sort2.vue';
    }
    let url = `${urlStart}?Sort1=${sort1}&Sort2=${sort2}&Sort3=${sort3}&Sort12RefKey=${sort12RefKey}&Sort1Color=${sort1Color}&Sort2Color=${sort2Color}&Sort3Color=${sort3Color}&AttrKeyNum=${attrKeyNum}&EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&RefMainEnName=${this.EnClassID}&DtlPK=${dtlEn.PK}${filterExp}`;
    if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) url += '&OrgNo=' + WebUser.OrgNo;
    // for tab mode
    if (_pos == SubTablePosition.Tab) {
      this.AddTabComponent(title, url, 0);
      return;
    }
    rm.ClassMethod = url;
    //alert(rm.ClassMethod);
    this.AddRefMethod(rm);
  }

  public AddRM_Dtl2DFixRow(
    title: string,
    ensDtl: Entities,
    refKey: string,
    sort1: string,
    sort2: string,
    sort12RefKey: string,
    icon: string | null = 'icon-user',
    filterExp: string | null = '',
    _pos: SubTablePosition | null = SubTablePosition.Left,
    sort2IsMerge = false,
    isReloadSort = true, //是否根据大类小类的值动态加载
    isOrderBySort1 = true,
    butsTableTop: string | null = '',
  ) {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.Dtl;
    const dtlEn = ensDtl.GetNewEntity;
    if (_pos == null) _pos = SubTablePosition.Left;
    rm.SubTablePosition = _pos;
    rm.RefDtlClsID = dtlEn.classID;
    rm.RefDtlRefPK = refKey;
    let urlStart = '/src/WF/Comm/Dtl/Dtl2DFixRow.vue';
    if (IsMobile()) {
      urlStart = '/src/CCMobile/Comm/Dtl2DFixRow.vue';
    }
    let url = `${urlStart}?ButsTableTop=${butsTableTop}&Sort1=${sort1}&Sort2=${sort2}&Sort12RefKey=${sort12RefKey}&EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&RefMainEnName=${this.EnClassID}&DtlPK=${
      dtlEn.PK
    }${filterExp}&Sort2IsMerge=${sort2IsMerge ? 1 : 0}&IsReloadSort=${isReloadSort ? 1 : 0}&IsOrderBySort1=${isOrderBySort1 ? 1 : 0}`;
    if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) url += '&OrgNo=' + WebUser.OrgNo;
    // for tab mode
    if (_pos == SubTablePosition.Tab) {
      this.AddTabComponent(title, url, 0);
      return;
    }
    rm.ClassMethod = url;
    //alert(rm.ClassMethod);
    this.AddRefMethod(rm);
  }

  public AddRM_DtlSearch(
    title: string,
    ensDtl: Entities,
    refKey: string,
    butsTableTop: string | null = '',
    butsItem: string | null = '',
    showAttrs: string | null = '',
    icon: string | null = 'icon-user',
    isMove: boolean | null = false,
    dtlConfig: string | DtlRelationConfig = '',
    _pos: SubTablePosition = SubTablePosition.Left,
    height = 0, // 0 = auto fit
  ) {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.Dtl;
    const dtlEn = ensDtl.GetNewEntity;
    rm.SubTablePosition = _pos;
    rm.RefDtlClsID = dtlEn.classID;
    rm.RefDtlRefPK = refKey;
    let urlStart = '/src/WF/Comm/Dtl/DtlSearch.vue';
    if (IsMobile()) {
      urlStart = '/src/CCMobile/Comm/DtlSearch.vue';
    }
    if (typeof dtlConfig == 'object' && Object.keys(dtlConfig).length > 0) {
      let str = '';
      const keys = Object.keys(dtlConfig);
      console.log('keys:', keys);
      for (const key of keys) {
        const val = dtlConfig[key];
        if (typeof val === 'boolean') {
          dtlConfig[key] = val ? '1' : '0';
        }
        str += `&${key}=${dtlConfig[key]}`;
      }
      dtlConfig = str;
      console.log('dtlConfig', dtlConfig);
    }
    let url = `${urlStart}?EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&RefMainEnName=${this.EnClassID}&ButsTableTop=${butsTableTop || ''}&ButsItem=${
      butsItem || ''
    }&ShowAttrs=${showAttrs}&DtlPK=${dtlEn.PK}&IsMove=${isMove ? '1' : '0'}${dtlConfig}`;
    //alert(url);
    // console.log({ url });
    if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) url += '&OrgNo=' + WebUser.OrgNo;
    // for tab mode
    if (_pos == SubTablePosition.Tab) {
      this.AddTabComponent(title, url, height);
      return;
    }
    rm.ClassMethod = url;
    //alert(rm.ClassMethod);
    this.AddRefMethod(rm);
  }

  public AddRM_Tree(
    title: string,
    ensDtl: Entities,
    refKey: string,
    butsTableTop: string | null = '',
    butsItem: string | null = '',
    showAttrs: string | null = '',
    icon: string | null = 'icon-user',
    isMove: boolean | null = false,
    filterExp: string | null = '',
  ) {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.Dtl;
    rm.ClassMethod = `/src/WF/Comm/Tree.vue?EnName=${ensDtl.GetNewEntity.classID}&RefPK=${refKey}&RefMainEnName=${this.EnClassID}&ButsTableTop=${butsTableTop || ''}&ButsItem=${
      butsItem || ''
    }&ShowAttrs=${showAttrs}&IsMove=${isMove ? '1' : '0'}${filterExp}`;
    //alert(rm.ClassMethod);
    this.AddRefMethod(rm);
  }

  /**
   * 从tab打开Iframe
   * @param title 标题
   * @param url http(s) 连接
   * @param icon 图标
   */
  public AddRM_OpenIframeByTab(title: string, url: string, icon: string | null = 'icon-link') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = url;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.TabIframeOpen;
    this.AddRefMethod(rm);
  }
  /**
   * 右侧frmme窗口打开，大部分用此模式.
   * @param title 标题
   * @param url 链接
   * @param icon 标签
   */
  public AddRM_UrlRightFrameOpen(title: string, url: string, icon: string | null = 'icon-link') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = url;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.RightFrameOpen;
    this.AddRefMethod(rm);
  }
  /**
   * 打印rtf文件
   * @param title 标题
   * @param rtfFilePath 文件路径位于 DataUser\CyclostyleFile\ 下的模板文件.
   * @param fileType 文件格式: doc/pdf 两个类型的文件.
   * @param icon : 默认打印机模式.
   */
  public AddRM_PrintRTF(title: string, rtfFilePath: string, fileType: string | null = 'doc', icon: string | null = 'icon-printer') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = 'PrintRTF-' + rtfFilePath;
    rm.RefMethodType = RefMethodType.Func;
    rm.Tag = rtfFilePath; //打印RTF文件.
    if (fileType == null) fileType = 'doc';
    rm.Target = fileType;
    rm.Warning = '';
    rm.Icon = icon;
    this.AddRefMethod(rm);
  }

  public AddRM_UrlTabOpen(title: string, url: string, icon: string | null = 'icon-link') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = url;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.TabOpen;
    this.AddRefMethod(rm);
  }

  public AddRM_HelpDocs(title: string, url: string, doc: string, icon: string | null = 'icon-support') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = url;
    rm.Icon = icon;
    rm.params = {
      doc,
    };
    rm.RefMethodType = RefMethodType.TabIframeOpen;
    this.AddRefMethod(rm);
  }

  /**
   * 增加功能
   * @param title 标题
   * @param funcName 功能名称
   * @param wanring 警告信息
   * @param icon 标签
   */
  public AddRM_Func(title: string, funcName: string, wanring: string, icon: string | null = 'icon-user') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = funcName;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = wanring;
    this.AddRefMethod(rm);
  }

  /**
   * 全屏打开,打开流程设计器模式.
   * @param title 标题
   * @param url url
   * @param groupName 分组名称
   * @param icon
   */
  public AddRM_UrlLinkeWinOpen(title: string, url: string, icon: string | null = 'icon-user') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = url;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.LinkeWinOpen;
    this.AddRefMethod(rm);
  }

  /**
   * 模态窗口打开，不关闭不能操作其他的.
   * @param title 标题
   * @param url url
   * @param groupName 分组名
   * @param icon icon.
   */
  public AddRM_UrlLinkModel(title: string, url: string, icon: string | null = 'icon-user') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.ClassMethod = url;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.LinkModel;
    this.AddRefMethod(rm);
  }
  /**
   * 列表模式
   * @param title 标题,比如:绑定角色
   * @param ensOfMyPK 关系实体,比如：NodeStations
   * @param ensOfNoName 字典实体，比如:Stations
   * @param keyRef 关联键, 比如：FK_Node
   * @param keyDict 字典键, 比如:FK_Station
   * @param groupName 分组名字，tab页名字
   * @param icon 图标.
   */
  public AddRM_One2Many_List(title: string, ensOfMyPK: EntitiesMyPK, ensOfNoName: EntitiesNoName, keyRef: string, keyDict: string, icon: string | null = 'icon-user') {
    const rm = new RefMethod();
    rm.Title = title;
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.One2Many;

    let url = '/src/WF/Comm/One2Many/List.vue?EnsOfMyPK=' + ensOfMyPK.GetNewEntity.classID; // NodeStations
    url += '&EnsOfDict=' + ensOfNoName.GetNewEntity.classID; // Stations
    url += '&KeyRefPK=' + keyRef; //FK_Node
    url += '&KeyDict=' + keyDict; //FK_Station
    rm.ClassMethod = url;
    this.AddRefMethod(rm);
  }

  /**
   * 分组展示
   * @param title 标题,比如:绑定角色
   * @param ensOfMyPK 关系实体,比如：NodeStations
   * @param ensOfNoName 字典实体，比如:Stations
   * @param keyRef 关联键, 比如：FK_Node
   * @param keyDict 字典键, 比如:FK_Station
   * @param ensOfGroup
   * @param keyGroupDict 分组的字典：比如, StationTypes()
   * @param icon
   */
  public AddRM_One2Many_GroupList(
    title: string,
    ensOfMyPK: EntitiesMyPK,
    ensOfNoName: EntitiesNoName,
    keyRef: string,
    keyDict: string,
    ensOfGroup: EntitiesNoName,
    keyGroupDict: string,
    icon: string | null = 'icon-user',
  ) {
    const rm = new RefMethod();
    rm.Title = title;

    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.One2Many;
    let url = '/src/WF/Comm/One2Many/GroupList.vue?EnsOfMyPK=' + ensOfMyPK.GetNewEntity.classID;
    url += '&EnsOfDict=' + ensOfNoName.GetNewEntity.classID;
    url += '&KeyRefPK=' + keyRef;
    url += '&KeyDict=' + keyDict;
    url += '&EnsOfGroup=' + ensOfGroup.GetNewEntity.classID;
    url += '&KeyGroupDict=' + keyGroupDict;
    // url += "&PKVal=101"; //
    rm.ClassMethod = url; //链接.
    this.AddRefMethod(rm);
  }

  /**
   * 树展示
   * @param title 标题,比如:绑定部门
   * @param ensOfMyPK 关系实体,比如：NodeDepts
   * @param ensOfTreeDict 字典实体，比如:Depts
   * @param keyRef 关联键, 比如：FK_Node
   * @param keyDict 字典键, 比如:FK_Dept
   * @param rootNo 根节点编号
   * @param isLazily 是否懒加载.
   * @param groupName 分组名称
   * @param icon 图标
   */
  public AddRM_One2Many_Tree(
    title: string,
    ensOfMyPK: EntitiesMyPK,
    ensOfTreeDict: EntitiesTree,
    keyRef: string,
    keyDict: string,
    rootNo: string,
    isLazily: boolean | null = false,
    icon: string | null = 'icon-user',
  ) {
    const rm = new RefMethod();
    rm.Title = title;

    let url = '/src/WF/Comm/One2Many/Tree.vue?EnsOfMyPK=' + ensOfMyPK.GetNewEntity.classID; //TS.WF.NodeDepts
    url += '&EnsOfDict=' + ensOfTreeDict.GetNewEntity.classID; // TS.Port.Depts
    url += '&KeyRefPK=' + keyRef; //FK_Node
    url += '&KeyDict=' + keyDict; //FK_Dept
    url += '&RootNo=' + rootNo;

    //是否懒加载，并且是树结构的.
    if (isLazily && rootNo != '') url += '&IsLazily=1';
    else url += '&IsLazily=0';

    // url += "&PKVal=101"; //

    rm.ClassMethod = url; //链接.
    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.One2Many;
    this.AddRefMethod(rm);
  }
  //附件类型 0=无，1=单附件，2=多附件.
  public HisBPEntityAthType = 0;
  /**
   * 增加单附件
   * @param fileDesc 文件描述
   * @param _ext 扩展名
   * @param savePath 保存路径
   * @deprecated 此方法已弃用，请使用 AddAthSingle/AthMulti 方法代替
   */
  public AddMyFile(fileDesc = '', _ext = '*.*', savePath = '') {
    if (fileDesc == null) fileDesc = '附件或图片';
    this.AddTBString('MyFileName', null, fileDesc, false, false, 0, 100, 200);
    this.AddTBString('MyFilePath', null, fileDesc, false, false, 0, 80, 200);
    this.AddTBString('MyFileExt', null, fileDesc, false, false, 0, 5, 200);
    this.AddTBString('WebPath', null, fileDesc, true, true, 0, 100, 200);
    this.AddTBInt('MyFileH', 0, fileDesc, false, false);
    this.AddTBInt('MyFileW', 0, fileDesc, false, false);
    this.AddTBFloat('MyFileSize', 0, 'MyFileSize', false, false);
    //设置为单附件.
    this.HisBPEntityAthType = 1;
    this.FJSavePath = savePath; //如果为空，
  }

  /**
   * 树展示
   * @param title 标题,比如:绑定部门
   * @param ensOfMyPK 关系实体,比如：NodeDepts
   * @param ensOfTreeDict 字典实体，比如:Depts
   * @param keyRef 关联键, 比如：FK_Node
   * @param keyDict 字典键, 比如:FK_Dept
   * @param rootNo 根节点编号
   * @param isLazily 是否懒加载
   * @param subDicts 显示的信息，
   * @param subDictRefKey 关联字段
   * @param subDictFields 显示的字段
   * @param groupName 分组名称
   * @param icon 图标
   *
   */
  public AddRM_One2Many_TreeEns(
    title: string,
    ensOfMyPK: EntitiesMyPK,
    ensOfTreeDict: EntitiesTree,
    keyRef: string,
    keyDict: string,
    rootNo: string,
    isLazily: boolean | null = false,
    subDicts: EntitiesNoName,
    subDictRefKey: string,
    subDictFields: string | null = 'No=编号,Name=名称,Tel=电话',
    icon: string | null = 'icon-user',
  ) {
    const rm = new RefMethod();
    rm.Title = title;

    let url = '/src/WF/Comm/One2Many/TreeEns.vue?EnsOfMyPK=' + ensOfMyPK.GetNewEntity.classID; //TS.WF.NodeDepts
    url += '&EnsOfDict=' + ensOfTreeDict.GetNewEntity.classID; // TS.Port.Depts
    url += '&KeyRefPK=' + keyRef; //FK_Node
    url += '&KeyDict=' + keyDict; //FK_Dept
    url += '&RootNo=' + rootNo; // 比如： 0 如果="" ,标识非树结构.

    //是否懒加载,并且是树结构的.
    if (isLazily && rootNo != '') url += '&IsLazily=1';
    else url += '&IsLazily=0';

    url += '&SubDicts=' + subDicts.GetNewEntity.classID; //比如 TS.Port.Emps
    url += '&SubDictRefKey=' + subDictRefKey; //关联的字段 EmpAttr.FK_Dept.
    url += '&SubDictKeys=' + subDictFields; //要显示的字段.
    // url += "&PKVal=101"; //要显示的字段.

    rm.ClassMethod = url; //链接.

    rm.Icon = icon;
    rm.RefMethodType = RefMethodType.One2Many;
    this.AddRefMethod(rm);
  }

  /**
   * 弹窗选择解析.
   * @param keyOfEn 依附的字段
   * @param ensOfGroup 分组列表
   * @param ensOfList 数据列表
   * @param isMultipleChoice 是否多选?
   * @param popWidth 宽度
   * @param popHeight 高度
   * @param lab 选择标签
   * @param icon 按钮的icon.
   */
  public SetPopGroupList(
    keyOfEn: string,
    srcOfGroup: string,
    srcOfList: string,
    isMultipleChoice = true,
    popWidth = `500`,
    popHeight = `400`,
    lab = '请选择',
    icon = 'icon-options',
    isShowSearch = '0',
  ) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopGroupList';
    popMapExt.Tag1 = srcOfGroup;
    popMapExt.Tag2 = srcOfList;

    //单选还是多选.
    if (isMultipleChoice) popMapExt.AtPara.SetVal('IsMultipleChoice', '1');
    else popMapExt.AtPara.SetVal('IsMultipleChoice', '0');

    popMapExt.W = popWidth;
    popMapExt.H = popHeight;

    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.AtPara.SetVal('IsShowSearch', isShowSearch);

    //获得attr, 获得它的Desc属性. 赋值 Desc. @Wanglu
    // const attr=this.attrs.filter();

    this.enMapExts.push(popMapExt);
    const hidenAttrName = this.attrs.find((attr) => attr.Key == keyOfEn)?.Desc || lab;
    this.AddTBString(keyOfEn + 'T', null, hidenAttrName, false, true, 0, 300, 100, false);
  }

  /**
   * 弹窗选择解析.
   * @param keyOfEn 依附的字段
   * @param srcOfList 数据列表
   * @param isMultipleChoice 是否多选?
   * @param popWidth 宽度
   * @param popHeight 高度
   * @param lab 选择标签
   * @param icon 按钮的icon.
   */
  public SetPopList(keyOfEn: string, srcOfList: string, isMultipleChoice = true, popWidth = `500`, popHeight = `400`, lab = '请选择', icon = 'icon-options') {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopList';
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.Tag2 = srcOfList;
    //单选还是多选.
    if (isMultipleChoice) popMapExt.AtPara.SetVal('IsMultipleChoice', '1');
    else popMapExt.AtPara.SetVal('IsMultipleChoice', '0');

    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.AtPara.SetVal('IsShowSearch', '1'); //默认都可以查询.
    popMapExt.W = popWidth;
    popMapExt.H = popHeight;

    this.enMapExts.push(popMapExt);

    this.AddTBString(keyOfEn + 'T', null, keyOfEn, false, false, 0, 300, 100, false);
  }

  /**
   * 增加连接控件
   * @param keyOfEn 字段
   * @param lab 标签
   * @param url 连接
   * @param isLine 整行？
   * @param openType 打开方式
   * @param helpUrl 帮助Url
   * @param icon 图标
   */
  public AddLink(keyOfEn: string, lab: string, url: string, isLine = false, openType = GPNReturnType.OpenUrlByNewWindow, helpUrl = 'https://ccflow.org', icon = 'icon-link') {
    const attr = new Attr();
    attr.Key = keyOfEn;
    attr.HelperUrl = helpUrl;
    attr.Field = keyOfEn;
    attr.DefaultVal = '';
    attr.MyDataType = DataType.AppString;
    attr.Desc = lab;
    attr.UIVisible = true;
    attr.UIIsReadonly = true;
    attr.MaxLength = 10;
    attr.MinLength = 0;
    attr.MyFieldType = FieldType.Normal;
    attr.UIIsLine = isLine || false;
    attr.UIContralType = UIContralType.HyperLink;
    attr.LinkOpenType = openType; //打开方式.
    attr.LinkUrl = url; // 连接
    attr.UITag = icon;
    this.attrs.Add(attr);
  }

  //
  /**
   * 依附字段出现：
   * @param keyOfEn
   * @param lab
   * @param url
   * @param openModel 打开模式
   * @param width, 75,
   *
   */
  public SetFieldLink(keyOfEn: string, url: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.FieldLink;
    popMapExt.ExtType = ExtModel.FieldLink;
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.Tag1 = url;
  }
  /**
   * 字段链接:链接到GL_SearchLinkField
   * @param keyOfEn 字段
   * @param dbsrc 链接表达式,可以写一个sql,获得数据源,url获取数据源.表达式里可以有参数字段名.
   * @param title 标题
   * @param popWidth 宽度
   * @param popHeight 高度
   */
  public SetFieldLinkGenerList(keyOfEn: string, dbsrc: string, title: string, popWidth = `500`, popHeight = `400`) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.FieldLinkGenerList;
    popMapExt.ExtType = ExtModel.FieldLinkGenerList;
    popMapExt.Tag = title;
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.Tag1 = dbsrc;
    popMapExt.W = popWidth;
    popMapExt.H = popHeight;
    this.enMapExts.push(popMapExt);
  }
  /**
   * 弹窗选择解析.
   * @param keyOfEn 依附的字段
   * @param isMultipleChoice 是否多选?
   * @param popWidth 宽度
   * @param popHeight 高度
   * @param lab 选择标签
   * @param icon 按钮的icon.
   * @param srcOfList 数据源
   * @param isShowSearch
   * @param searchKeys
   */
  public SetPopTable(
    keyOfEn: string,
    srcOfList: string | Function,
    isMultipleChoice = true,
    popWidth = `500`,
    popHeight = `400`,
    lab = '请选择',
    icon = 'icon-options',
    isShowSearch = '0',
    searchKeys = '',
  ) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopTable';
    popMapExt.AttrOfOper = keyOfEn;
    if (typeof srcOfList === 'function') {
      popMapExt.Doc = srcOfList;
      popMapExt.Tag2 = '';
    } else {
      popMapExt.Tag2 = srcOfList;
    }
    popMapExt.Tag3 = searchKeys;
    //单选还是多选.
    if (isMultipleChoice) popMapExt.AtPara.SetVal('IsMultipleChoice', '1');
    else popMapExt.AtPara.SetVal('IsMultipleChoice', '0');

    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.AtPara.SetVal('IsShowSearch', isShowSearch);
    popMapExt.W = popWidth;
    popMapExt.H = popHeight;

    this.enMapExts.push(popMapExt);

    this.AddTBString(keyOfEn + 'T', null, keyOfEn, false, true, 0, 300, 100, false);
  }

  /**
   * 弹窗打开从表编辑
   * @param keyOfEn 依附的字段
   * @param dtlEnName 从表实体名称
   * @param popWidth 宽度
   * @param popHeight 高度
   * @param lab 选择标签
   * @param icon 按钮的icon.
   * @param refPK 关联key.
   * @param refPKVal 关联val.
   * @param nameKey 名称key.
   * @param onConfirmType 保存并全选. ReturnAll, ReturnChecked
   */
  public SetPopDtlBatch(
    keyOfEn: string,
    dtlEnName: string,
    popWidth = `1000`,
    popHeight = `600`,
    lab = '',
    icon = '',
    refPK = '',
    refPKVal = '',
    nameKey = 'Name',
    returnType = 'ReturnAll',
  ) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopDtlBatch';
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.Tag2 = dtlEnName; //从表实体名称
    popMapExt.Tag3 = refPK; //从表的主键
    popMapExt.Tag4 = refPKVal; //从表的主键值
    popMapExt.Tag5 = nameKey; //主表实体名称
    popMapExt.Tag6 = returnType; //返回类型
    //单选还是多选.
    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.W = popWidth;
    popMapExt.H = popHeight;
    this.enMapExts.push(popMapExt);

    this.AddTBString(keyOfEn + 'T', null, keyOfEn, false, true, 0, 300, 100, false);
  }

  /**
   * 弹窗选择解析.
   * @param keyOfEn 依附的字段
   * @param srcOfTree 数据列表
   * @param rootNo 根目录编号?
   * @param isMultipleChoice 是否多选?
   * @param popWidth 宽度
   * @param popHeight 高度
   * @param lab 选择标签
   * @param icon 按钮的icon.
   * @param enableSearch 允许搜索
   * @param isLazily 懒加载
   */
  public SetPopTree(
    keyOfEn: string,
    srcOfTree: string,
    rootNo: string,
    isMultipleChoice = true,
    popWidth = `500`,
    popHeight = `400`,
    lab = '请选择',
    icon = 'icon-options',
    enableSearch = false,
    isLazily = false,
  ) {
    this.AddTBString(keyOfEn + 'T', null, keyOfEn, false, true, 0, 300, 100, false);

    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopTree';
    popMapExt.Tag2 = srcOfTree;
    popMapExt.Tag5 = rootNo; // 根目录编号

    //单选还是多选.
    if (isMultipleChoice) popMapExt.AtPara.SetVal('IsMultipleChoice', '1');
    else popMapExt.AtPara.SetVal('IsMultipleChoice', '0');

    //设置参数.
    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.AtPara.SetVal('RootNo', rootNo);
    popMapExt.AtPara.SetVal('IsShowSearch', enableSearch ? '1' : '0');
    popMapExt.AtPara.SetVal('IsLazily', isLazily ? '1' : '0');

    popMapExt.W = popWidth;
    popMapExt.H = popHeight;
    this.enMapExts.push(popMapExt);
  }
  /**
   * 弹窗选择解析.
   * @param keyOfEn 依附的字段
   * @param srcOfTree 树结构列表: SELECT No,Name,ParentNo FROM Port_Dept WHERE ParentNo='@Key'
   * @param rootNo 根目录编号? @WebUser.DeptNo
   * @param srcOfList 数据列表 SELECT No,Name Port_Emp WHERE FK_Dept='@Key'
   * @param srcOfSearch 搜索选择的数据源可以为空, SELECT No,Name FROM Port_Emp WHERE No LIKE '%@Key%' or Name LIKE '%@Key%' OR PinYin LIKE '%@Key%'
   * @param isMultipleChoice 是否多选?
   * @param popWidth 宽度
   * @param popHeight 高度
   * @param lab 选择标签.
   * @param icon 按钮的icon.
   * @param enableSearch 允许搜索
   * @param enableTreeLevelUp 允许更改树节点
   * @param isLazily 懒加载
   */
  public SetPopTreeEns(
    keyOfEn: string,
    srcOfTree: string,
    rootNo: string,
    srcOfList: string,
    srcOfSearch = '', // 搜索数据源
    isMultipleChoice = true,
    popWidth = `500`,
    popHeight = `400`,
    lab = '请选择',
    icon = 'icon-options',
    enableTreeLevelUp = '0',
    enableSearch = false,
    isLazily = false,
  ) {
    function validateTreeDataSource(srcOfTree: string) {
      const validPrefixes = ['DBSrc.', 'Port_', 'App_', 'Flow_', 'Frm_', 'DBSrc_', 'DemoStudent_', 'Ens://', 'En://'];
      return srcOfTree.includes('@Key') || validPrefixes.some((prefix) => srcOfTree.startsWith(prefix));
    }
    if (!validateTreeDataSource(srcOfTree)) {
      alert(`错误: SetPopTreeEns数据源 ${srcOfTree} 必须包含@Key变量或以指定前缀开头.`);
      return;
    }
    const popMapExt = new EnMapExt();
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopTreeEns';
    popMapExt.AtPara = new AtPara();
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.Tag1 = srcOfTree;
    popMapExt.Tag3 = srcOfList;
    popMapExt.Tag4 = srcOfSearch; // 搜索数据源
    popMapExt.Tag5 = rootNo;
    popMapExt.Tag6 = enableTreeLevelUp;
    //设置参数.
    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.AtPara.SetVal('IsShowSearch', enableSearch ? '1' : '0');
    popMapExt.AtPara.SetVal('IsLazily', isLazily ? '1' : '0');

    //单选还是多选.
    if (isMultipleChoice) popMapExt.AtPara.SetVal('IsMultipleChoice', '1');
    else popMapExt.AtPara.SetVal('IsMultipleChoice', '0');

    popMapExt.W = popWidth;
    popMapExt.H = popHeight;
    this.enMapExts.push(popMapExt);
    this.AddTBString(keyOfEn + 'T', null, keyOfEn, false, true, 0, 200, 100, false);
  }
}
import { Attrs } from '/@/bp/en/Map/Attrs';
import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { Attr, DateConfig, DateTimeConfig } from '/@/bp/en/Map/Attr';
import { RefMethod, RefMethods, RefMethodType } from './RefMethod';
import { DTSearchWay, SearchNormal, SearchNormals } from './SearchNormal';
import { PageBaseGroupEdit } from '../../UIEntity/PageBaseGroupEdit';
import { SearchFKEnums } from './SearchFKEnum';
import { Glo } from '/@/WF/TSClass/Glo';
import { EnMapExt, EnMapExts, ExtModel } from './EnMapExt';
import { PageBasePanelGroup } from '../../UIEntity/PageBasePanelGroup';
import { GPNReturnType, PageBaseGroupNew } from '../../UIEntity/PageBaseGroupNew';
import { AtPara } from '../../da/AtPara';
import type { EntitiesMyPK } from '../EntityMyPK';
import type { EntitiesTree } from '../EntityTree';
import type { EntitiesNoName, EntityNoName } from '../EntityNoName';
import type { Entities } from '../Entities';
import { PageBaseTreeEns } from '../../UIEntity/PageBaseTreeEns';
import { PageBaseGenerList } from '../../UIEntity/PageBaseGenerList';
import { Entity } from '../Entity';
import { CCBPMRunModel, SystemConfig } from '../../difference/SystemConfig';
import WebUser from '../../web/WebUser';
import { DtlRelationConfig, SubTablePosition } from '../Config';
import { getAllRequestParams } from '/@/utils/request/decode';
import { SearchFields } from './SearchFields';
import { DataVBase } from '../../UIEntity/DataVBase';
import { SearchNumAttrs } from './SearchNumAttr';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { TabsBase } from '../../UIEntity/TabsBase';
import { ExtendedRules } from './AttrRule';
import { Alert } from 'ant-design-vue';
