import { Group } from './Group';
import { Entity } from '/@/bp/en/Entity';
import { Groups } from '/@/bp/UIEntity/Group';
import { Component } from 'vue';
import { PageModelEdit } from './EnumLab';
import { Page, Pages } from './Page';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { getRequestParams } from '/@/utils/request/decode';
import { DataType } from '../en/DataType';
import { Help, Helps } from './Help';

interface GPEBtton {
  pageNo: string;
  list: string[];
}

export abstract class PageBaseGroupEdit {
  get RefPKVal() {
    return this.params['RefPKVal'];
  }
  public SubPages: Pages; //属性，页面.
  public Groups: Groups; //页面的分组.
  public Helps: Helps; //帮助视频页面.
  public classID = ''; //当前的类名.
  public entity: Entity | null = null; //要维护的实体.
  public KeyOfEn = ''; //要维护的字段（一般都是枚举类型）.
  public PageTitle = ''; //标题
  public Icon = 'icon-note'; //图标.
  private _groupNo = ''; //当前的分组编号
  public Btns: GPEBtton[] = []; //其他按钮. 多个用逗号分开, 例如:帮助,关闭
  public params: Recordable = {};

  public setParams(params: Record<string, any>) {
    this.params = params;
  }

  abstract Init();

  // 传来的实体ID
  get EnClassID() {
    return this.params['EnClassID'];
  }

  // 传来的 EnClassID 主键.
  get PKVal() {
    return this.params.PKVal;
  }

  //获得外部url参数
  public GetRequestVal(key: string) {
    const str = this.params[key];
    if (!str) getRequestParams(key);
    return str;
  }

  protected constructor(clsId: string) {
    if (clsId) this.classID = clsId;
    this.SubPages = new Pages();
    this.Groups = new Groups();
    this.Helps = new Helps();
  }

  //增加视频链接帮助.
  public AddHelp(pageNo: string, name: string, url: string, time: number) {
    const en = new Help();
    en.No = pageNo;
    en.Name = name;
    en.Url = url;
    en.MM = time;
    this.Helps.Add(en);
  }

  public AddGroup(no: string, name: string) {
    this._groupNo = no; //设置当前的分组编号.
    const en = new Group();
    en.No = no;
    en.Name = name;
    this.Groups.Add(en);
  }

  public SelfComponent(no: string, name: string, component: Component, params: Recordable, docs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.Component = component;
    en.ComponentParams = params;
    en.HelpDocs = docs;
    this.SubPages.Add(en);
  }

  public Blank(no: any, name: string, docs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = docs;
    en.HisPageModelEdit = PageModelEdit.Blank; //空白的,仅仅是帮助.
    this.SubPages.Add(en);
  }

  /**
   * 案例：抢办模式-协作模式下待办删除规则
   * @param no 页面编号
   * @param name 名称
   * @param saveToField 存储的字段.
   * @param docs 描述
   * @param enumName 配置的字段
   * @param enumCfgVals 配置的字段
   */
  public SingleEnumRadioButon(no: string, name: string, saveToField: string, docs: string, enumName: string, enumCfgVals: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = docs;
    en.HisPageModelEdit = PageModelEdit.SingleEnumRadioButton; // 单个的枚举修改.
    en.Tag0 = saveToField;
    en.Tag1 = enumCfgVals;
    en.Tag2 = enumName;

    this.SubPages.Add(en);
  }

  /**
   * 案例：抢办模式-协作模式下待办删除规则
   * @param no 页面编号
   * @param name 名称
   * @param saveToField 存储的字段.
   * @param docs 描述
   * @param sysEnums 枚举值
   */
  public SingleEnumDDL(no: string, name: string, saveToField: string, docs: string, sysEnums: SysEnums) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = docs;
    en.HisPageModelEdit = PageModelEdit.SingleDDLEnum; // 单个的枚举修改.
    en.Tag0 = saveToField;
    en.Tag1 = sysEnums;
    this.SubPages.Add(en);
  }

  /**
   * 案例：抢办模式-协作模式下待办删除规则
   * @param no 页面编号
   * @param name 名称
   * @param saveToField 存储的字段.
   * @param docs 描述
   * @param sysEnums 枚举值
   */
  public SingleDDLSQL(no: any, name: string, saveToField: string, helpDocs: string, sql: string, isMultiSelect = false) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SingleDDLSQL; // 单个的枚举修改.
    en.Tag0 = saveToField; //要保存的字段.
    en.Tag1 = sql;
    en.IsMultiSelect = isMultiSelect;
    this.SubPages.Add(en);
  }

  /**
   * 单个下拉框.
   * @param no 编号
   * @param name 名称
   * @param saveToField 存储字段
   * @param desc 帮助
   * @param ens 实体集合
   * @param isMultiSelect 是否多选？
   */
  public SingleDDLEntities(no: any, name: string, saveToField: string, desc: string, ens: EntitiesNoName, isMultiSelect = false) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = desc;
    en.HisPageModelEdit = PageModelEdit.SingleDDLEntities; // 单个的枚举修改.
    en.Tag0 = saveToField;
    en.Tag1 = ens;
    en.IsMultiSelect = isMultiSelect; //单选，多选？
    this.SubPages.Add(en);
  }

  /**
   * 两个文本框
   * @param no 编号
   * @param name 名称
   * @param saveToField1 字段1
   * @param placeholder1 描述1
   * @param saveToField2 字段2
   * @param placeholder2 描述2
   * @param helpDocs 帮助文件
   */
  public TextBox2(no: any, name: string, saveToField1: string, placeholder1: string, saveToField2: string, placeholder2: string, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.TextBox2; //单行文本框.
    en.Tag0 = saveToField1;
    en.Tag1 = placeholder1;

    en.Tag2 = saveToField2;
    en.Tag3 = placeholder2;

    this.SubPages.Add(en);
  }

  /**
   *
   * @param no 编号
   * @param name 页面名称
   * @param saveToField 要存储的字段，如果实体没有这个字段就，存储到参数字段里.
   * @param helpDocs 描述
   * @param placeholder 文本框底部的文字提示
   * @param dataType 数据类型:DataType.AppString 使用此参数.
   */
  public SingleTB(no: any, name: string, saveToField: string, helpDocs: string, placeholder: string, dataType?: number) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SingleTB; //单行文本框.
    en.Tag0 = saveToField;
    en.Tag1 = placeholder;
    if (!dataType) dataType = DataType.AppString;
    en.Tag2 = dataType;
    this.SubPages.Add(en);
  }

  public SingleTBPara(no: any, name: string, saveToField: string, helpDocs: string, placeholder: string, dataType?: number) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SingleTBPara; //单行文本框.
    en.Tag0 = saveToField;
    en.Tag1 = placeholder;
    if (!dataType) dataType = DataType.AppString;
    en.Tag2 = dataType;
    this.SubPages.Add(en);
  }

  public SingleCheckBox(no: any, name: string, attrName: string, attrKey: string, heloDoc: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = heloDoc;
    en.HisPageModelEdit = PageModelEdit.SingleCheckbox; //单行文本框.
    en.Tag1 = attrName;
    en.Tag0 = attrKey;
    this.SubPages.Add(en);
  }

  public SingleTextArea(no: any, name: string, saveToField: string, placeholder: string, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SingleTextArea;
    en.Tag0 = saveToField;
    en.Tag1 = placeholder;
    this.SubPages.Add(en);
  }

  public SingleRichTxt(no: any, name: string, saveToField: string, placeholder: string, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SingleRichTxt;
    en.Tag0 = saveToField;
    en.Tag1 = placeholder;
    this.SubPages.Add(en);
  }

  /**
   * 设置数据源.
   * @param no 编号
   * @param name 名称
   * @param keyOfEn 对应字段
   * @param docs 说明
   * @param placeholder 底部字段说明
   */
  public DBSrcSQL(no: any, name: string, saveToFieldDBSrc: string, saveToFieldSQLText: string, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = '请输入SQL语句,支持ccbpm表达式以及环境变量.';
    en.HisPageModelEdit = PageModelEdit.DBSrcSQL;
    en.Tag0 = saveToFieldDBSrc;
    en.Tag1 = saveToFieldSQLText;
    en.Tag2 = '不能为空';
    en.HelpDocs = helpDocs;
    this.SubPages.Add(en);
  }
  /**
   * DBSrcWebApiGet
   * @param no 编号
   * @param name 名称
   * @param saveTo_dbSrc  数据源编号
   * @param saveTo_url  连接地址
   * @param saveTo_postMode 提交方式
   * @param saveTo_HeadDoc 头部的内容
   * @param saveTo_BodyDoc 主题内容.
   */
  public DBSrcWebApiGet(
    no: any,
    name: string,
    saveTo_dbSrc: string,
    saveTo_url: string,
    saveTo_postMode: string,
    saveTo_HeadDoc: string,
    saveTo_BodyDoc: string,
    helpDocs: string,
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = '请输入URL,支持ccbpm表达式以及环境变量.';
    en.HisPageModelEdit = PageModelEdit.DBSrcWebApiGet;
    en.Tag0 = saveTo_url;
    en.Tag1 = saveTo_dbSrc;
    en.Tag2 = saveTo_postMode;
    en.Tag3 = saveTo_HeadDoc;
    en.Tag4 = saveTo_BodyDoc;
    en.HelpDocs = helpDocs;
    this.SubPages.Add(en);
  }
  public DBSrcWebApiPost(
    no: any,
    name: string,
    saveTo_dbSrc: string,
    saveTo_url: string,
    saveTo_postMode: string,
    saveTo_HeadDoc: string,
    saveTo_BodyDoc: string,
    helpDocs: string,
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = '请输入URL,支持ccbpm表达式以及环境变量.';
    en.HisPageModelEdit = PageModelEdit.DBSrcWebApiPost;
    en.Tag0 = saveTo_url;
    en.Tag1 = saveTo_dbSrc;
    en.Tag2 = saveTo_postMode;
    en.Tag3 = saveTo_HeadDoc;
    en.Tag4 = saveTo_BodyDoc;
    en.HelpDocs = helpDocs;
    this.SubPages.Add(en);
  }

  /**
   * 单行SQL模式.
   * @param no 编号
   * @param name 名称
   * @param keyOfEn 对应字段
   * @param docs 说明
   * @param placeholder 底部字段说明
   */
  public SingleTBSQL(no: any, name: string, saveToField: string, helpDocs: string, placeholder = '请阅读设置说明.') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SingleTBSQL;
    en.Tag0 = saveToField;
    en.Tag1 = placeholder;
    this.SubPages.Add(en);
  }

  /**
   * 增加一个实体属性编辑的页面
   * @param no 编号
   * @param name 名称
   * @param _entityOfSub 实体类
   * @param desc 描述
   * @param pkValFormat 实体主键格式,可以为空. 用于指定的实体于当前PGE的实体不是一个表并且不一个主键.
   *  比如: @PKVal_Pop ,标识该实体的主键是一个表达式. 解析后为: ABC_Pop
   */
  public AddEntity(no: any, name: string, _entityOfSub: Entity, helpDocs: string | null = '无描述', pkValFormat?: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HisPageModelEdit = PageModelEdit.Entity;
    en.HisEntity = _entityOfSub;
    en.HelpDocs = helpDocs;
    en.Tag0 = pkValFormat; //主键格式.
    this.SubPages.Add(en);
  }

  /**
   * 选择字段.
   * @param no 编号
   * @param name 名称
   * @param helpDocs 帮助信息
   * @param IsMultiSelect 是否多选？
   * @param srcOfList 列表数据源.
   * @param saveIDsToFiled 保存到IDs到字段.
   * @param saveNamesToFiled 保存到Names到字段(可为空).
   */
  public SelectItemsByList(no: any, name: string, helpDocs: string, IsMultiSelect = false, srcOfList: string, saveIDsToFiled: string, saveNamesToFiled = '') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SelectItemsByList;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.Tag1 = srcOfList;
    en.Tag0 = saveIDsToFiled;
    en.Tag6 = saveNamesToFiled;
    this.SubPages.Add(en);
  }

  /**
   * 实体选择创建.
   * @param no 编号
   * @param name 名称
   * @param helpDocs 帮助信息
   * @param IsMultiSelect 是否多选？
   * @param srcOfGroup 分组数据源.
   * @param srcOfList 列表数据源.
   * @param saveIDsToFiled 保存到IDs到字段.
   * @param saveNamesToFiled 保存到Names到字段(可为空).
   */
  public SelectItemsByGroupList(
    no: any,
    name: string,
    helpDocs: string,
    IsMultiSelect = false,
    srcOfGroup: string,
    srcOfList: string,
    saveIDsToFiled: string,
    saveNamesToFiled = '',
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SelectItemsByGroupList;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.Tag0 = saveIDsToFiled;
    en.Tag1 = srcOfGroup;
    en.Tag2 = srcOfList;
    en.Tag6 = saveNamesToFiled;

    this.SubPages.Add(en);
  }

  /**
   * 实体选择创建.
   * @param no 编号
   * @param name 名称
   * @param helpDocs 帮助信息
   * @param IsMultiSelect 是否多选？
   * @param srcOfGroup 分组数据源.
   * @param srcOfList 列表数据源.
   * @param saveIDsToFiled 保存到IDs到字段.
   * @param saveNamesToFiled 保存到Names到字段(可为空).
   */
  public SelectItemsByTree(
    no: string,
    name: string,
    helpDocs: string,
    IsMultiSelect = false,
    srcOfTree: string,
    rootNo: string,
    saveIDsToFiled: string,
    saveNamesToFiled = '',
    isLazily = false,
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SelectItemsByTree;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.IsLazily = isLazily;
    en.Tag5 = srcOfTree;
    en.Tag1 = rootNo;
    en.Tag4 = saveIDsToFiled;
    en.Tag0 = saveNamesToFiled;
    en.Tag6 = saveNamesToFiled;
    this.SubPages.Add(en);
  }

  /**
   * 实体选择创建.
   * @param no 编号
   * @param name 名称
   * @param helpDocs 帮助信息
   * @param IsMultiSelect 是否多选？
   * @param srcOfGroup 分组数据源.
   * @param srcOfList 列表数据源.
   * @param saveIDsToFiled 保存到IDs到字段.
   * @param saveNamesToFiled 保存到Names到字段(可为空).
   */
  public SelectItemsByTreeEns(
    no: string,
    name: string,
    helpDocs: string,
    IsMultiSelect = false,
    srcOfTree: string,
    rootNo: string,
    srcOfEns: string,
    colCNnames: string,
    saveIDsToFiled: string,
    saveNamesToFiled = '',
    isLazily = false,
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelEdit = PageModelEdit.SelectItemsByTreeEns;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.IsLazily = isLazily;
    en.Tag5 = srcOfTree;
    en.Tag1 = rootNo;
    en.Tag2 = srcOfEns; //实体数据源
    en.Tag3 = colCNnames; //对应管理
    en.Tag0 = saveIDsToFiled;
    en.Tag6 = saveNamesToFiled; //估计这个没有解析?
    this.SubPages.Add(en);
  }

  /**
   * 保存的之后的方法
   * 1. this.entity 的KeyOfen的值已经变化.
   * 2. 保存后做特殊的处理.
   * @param pageID 页面ID
   * @param pageVal 页面值
   */
  public abstract AfterSave(pageID: string, pageVal: any): any;

  /**
   * 按钮事件
   * @param pageID 页面IDa
   * @param pageVal 页面控件值. 如果多选，值就用逗号分开,比如: 001,002,003
   * @param btnName 按钮名字.
   */
  public abstract BtnClick(pageID: string, pageVal: any, btnName: string): any;

  public readonly HelpUn = `
  #### 帮助未编写
  - 请在QQ群里提问.
  - 请在doc.ccbpm.cn在线文档查找.
  - 请跟踪代码.
  `;
}
