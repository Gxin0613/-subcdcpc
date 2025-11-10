import { Group } from './Group';
import { Entity } from '/@/bp/en/Entity';
import { Groups } from '/@/bp/UIEntity/Group';
import type { Component } from 'vue';
import { Page, Pages } from './Page';
import { PageModelNew } from './EnumLab';
import { getRequestParams } from '/@/utils/request/decode';
import { DataTableColumns } from 'naive-ui/es/data-table';
import { RowData } from 'naive-ui/es/data-table/src/interface';
import { getAppEnvConfig } from '/@/utils/env';
import { Entities } from '../en/Entities';
const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();
// 通过表格选择的时候列参数定义
export enum GPNReturnType {
  //提示消息.
  Message,
  //提示错误.
  Error,
  //转到url.
  GoToUrl,
  //关闭.
  Close,

  //关闭并重载.
  CloseAndReload,
  //刷新页面.
  Reload,
  //侧滑的方式打开窗口.
  OpenUrlByDrawer30,
  OpenUrlByDrawer40,
  OpenUrlByDrawer50,
  OpenUrlByDrawer60,
  OpenUrlByDrawer75,
  OpenUrlByDrawer90,
  OpenUrlByDrawer100,
  // 使用带缓存iframe
  OpenIframeByCache,
  //侧滑的方式打开窗口.
  OpenUrlByDrawer,
  // 抽屉打开iframe
  OpenIframeByDrawer,
  OpenIframeByDrawer30,
  OpenIframeByDrawer40,
  OpenIframeByDrawer50,
  OpenIframeByDrawer60,
  OpenIframeByDrawer75,
  OpenIframeByDrawer90,
  OpenIframeByDrawer100,
  // modal打开
  OpenIframeByModal,
  OpenUrlByModal,
  OpenUrlByModalFull,
  //打开新窗口. 打开url的
  OpenUrlByNewWindow,
  OpenUrlByTab,
  ReBind,
  ///执行参数返回值.
  DoWhatParas,
  //不做任何事情.
  DoNothing,
  Update,
  // 替换当前组件
  Replace,
  // 通过modal打开组件
  OpenCompByModal,

  //弹窗打开文本字段
  OpenTextByModal,
}
// 工作模式.
export enum WorkModelGPN {
  SinglePage,
  StepPage,
}

// const iframePages = ['/WF/FlowError', '/WF/MyCC', '/WF/MyCCGener', '/WF/MyFlow', '/WF/MyFlowGener', '/WF/FlowTree', '/WF/MyView', '/WF/MyViewGener'];
// const drawerTypes = [GPNReturnType.OpenUrlByDrawer, GPNReturnType.OpenUrlByDrawer30, GPNReturnType.OpenUrlByDrawer75, GPNReturnType.OpenUrlByDrawer90];
// 返回对象.
export class GPNReturnObj {
  public data: any = '';
  public ReturnType: GPNReturnType = GPNReturnType.Close;
  public title = '';
  public postMsg = {};
  public messageListener: Nullable<Function> = null; // event listener for iframe
  constructor(
    ReturnType: GPNReturnType = GPNReturnType.Close,
    data: any = '',
    title = `${VITE_GLOB_SX_TITLE}BPM`,
    messageListener: Function | null = null,
    postMsg: Recordable = {},
  ) {
    this.data = data;
    this.ReturnType = ReturnType;
    this.title = title;
    this.messageListener = messageListener;
    this.postMsg = postMsg;
  }
}

export abstract class PageBaseGroupNew {
  // 存储组件数据
  protected params: Record<string, any> = {};
  // 分步表单
  protected stepFormParams: Record<string, any> = {};
  // 使用默认样式
  public UseOldStyle = true;

  public AddIcon(icon: string, pageNo = '') {
    if (!pageNo && this.SubPages.length > 0) {
      this.SubPages[this.SubPages.length - 1].Icon = icon;
      return;
    }
    const page = this.SubPages.find((page) => page.No === pageNo);
    if (page) {
      page.Icon = icon;
      return;
    }
    console.error('没有找到PageNo:' + pageNo);
  }

  public ClearCache() {
    this.stepFormParams = {};
  }
  // 抽象类 抽象方法
  // 子类 继承抽象类
  // 子类还是抽象类 ，可以不是想抽象方法
  // 子类是一个具体的类， 必须要实现抽象方法
  // 不能直接new一个抽象类
  protected constructor(clsId: string) {
    if (clsId) this.classID = clsId;
    this.SubPages = new Pages();
    this.Groups = new Groups();
  }

  public abstract Init();

  //获得页面的名称.
  public GetPageName(pageNo) {
    for (const page of this.SubPages) {
      if (page.No === pageNo) return page.Name;
    }
    return pageNo;
  }
  //获得页面的icon.
  public GetPageIcon(pageNo) {
    for (const page of this.SubPages) {
      if (page.No === pageNo) return page.Icon;
    }
    return 'icon-drop';
  }

  /// 根据编号，获得名称.
  public async GetSortName(sortNo: string) {
    const sorts = await this.GenerSorts();
    for (const sort of sorts) {
      if (sort.No === sortNo) return sort.Name;
    }
    return sortNo;
    // const sorts = await this.GenerSorts();
    // console.log('sorts:', sorts);
    // const s = Promise.resolve(sorts.find((sort) => sort.No === sortNo)?.Name);
    // console.log(s);
  }
  //被从表新建调用的时间,就是按照这个标记传来的实体主键的值.
  get RefPKVal() {
    return this.RequestVal('RefPKVal');
  }
  get PKVal() {
    return this.RequestVal('PKVal');
  }
  get RefPK() {
    return this.RequestVal('RefPK');
  }
  //上传的文件流数据.
  protected UploadFile?: any;
  public setUploadFile(params: File) {
    this.UploadFile = params;
  }
  //上传的文件流数据集合.
  protected UploadFilArr?: any;
  public setUploadFileArr(params) {
    this.UploadFilArr = params;
  }
  //上传的文件流数据集合名称.
  protected FolderName?: any;
  public FolderArrName(Name) {
    this.FolderName = Name;
  }
  //如果是从表上的新建,这个就是从表的主表EnName. 比如:在学生简历上点新建，RefMainEnName=TS.Demo.Student
  // 在En.vue上点相关功能执行新建. 这个就是MapEnClassID。
  get RefMainEnName() {
    return this.RequestVal('EnClassID');
  }

  get RefDtlEnName() {
    return this.RequestVal('RefDtlEnName');
  }

  public setParams(params: Record<string, any>) {
    this.params = params;
    //const en = new SFColumn();
  }

  /**
   * 获得外部的参数, 此方法为实现.
   * @param key 参数key
   * @param pageNo
   * @returns
   */
  public RequestVal(key: string, pageNo = '') {
    if (pageNo != null && pageNo.length > 3) {
      //不应该有其他的参数传入进来.
      if (key == 'tb1' || key == 'tb2' || key == 'tb3') {
      } else {
        //  alert('访问PageNo=[' + pageNo + ']参数名[' + key + ']错误:您使用了pageNo获得参数,所以必须传入tb1,tb2,tb3中的任何一个.');
        // return;
      }
    }

    if (pageNo) {
      const targetKey = key + '_' + pageNo;
      const val = this.stepFormParams[targetKey];
      if (!val) {
        return null; //原来 return '' 现在 return null. edity by zp
        // alert('根据页面的编号获取页面错误,不存在页面编号[' + pageNo + ']');
      }
      if (typeof val === 'function') {
        return val();
      }
      return val;
    }
    return this.params[key] || getRequestParams(key);
  }

  public SetRequestVal(key: string, val: any, pageNo = '') {
    if (pageNo) {
      const targetKey = key + '_' + pageNo;
      this.stepFormParams[targetKey] = val;
      return;
    }
    this.params[key] = val;
  }

  public SubPages: Pages; //属性，页面.
  public Groups: Groups; //页面的分组.
  public classID = '';
  public entity: Entity | null = null; //要维护的实体.
  public PageTitle = ''; //标题
  public SortNameLabel = '分类'; //标题
  public _refClassId = ''; //引用的类ID.
  get ForEntityClassID() {
    return this._refClassId;
  }
  set ForEntityClassID(val) {
    this._refClassId = val;
  }
  private _groupNo = ''; //当前的分组编号
  public WorkModel = WorkModelGPN.StepPage; //单页面还是步骤创建.
  public CurrPageNo = ''; //当前的页面，对WorkModelGPN.StepPage 有效.
  public ShowSteps = ''; //显示的步骤，对WorkModelGPN.StepPage 有效.

  // 生成实体类别, 如果返回[]，不显示
  abstract GenerSorts(systemNo?: string): Promise<Array<any>>;
  public AddGroup(no: string, name: string, icon = '', help = '') {
    const en = new Group();
    en.No = no;
    en.Name = name;
    en.Icon = icon;
    en.Help = help;
    this.Groups.Add(en);
    this._groupNo = no; //设置当前的分组编号.
  }

  public SelfComponent(no: string, name: string, component: Component, params: Record<string, any>, loaderFunction?: Function) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.Component = component;
    en.ex_params = params;
    en.Tag6 = loaderFunction;
    this.SubPages.Add(en);
  }

  public AddBlank(no: string, name: string, helpDocs: string, icon = 'icon-drop') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Blank; //空白.
    en.Icon = icon;
    this.SubPages.Add(en);
  }

  public AddHelp(no: string, name: string, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Help; //显示帮助文档.
    this.SubPages.Add(en);
  }

  /**
   * 实体选择创建.
   * @param no 编号
   * @param name 名称
   * @param helpDocs 帮助信息
   * @param IsMultiSelect 是否多选？
   * @param srcOfList 列表数据源.
   * @param enableLabShowNo 是否显示编号，默认不显示. （场景：名称相同时需要显示编号）
   * @param selectedNos 选择的Nos,多个用逗号分开.
   */
  public SelectItemsByList(
    no: string,
    name: string,
    helpDocs: string,
    IsMultiSelect = false,
    srcOfList: string | Function | Entities,
    enableLabShowNo = false,
    enableSearch = true,
    selectedNos = '',
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.SelectItemsByList;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.Tag0 = srcOfList;
    en.labelVisible = enableLabShowNo; //Lab是否显示编号 for：天宇
    en.enableSearch = enableSearch;
    en.Tag3 = selectedNos;
    this.SubPages.Add(en);
  }

  public Table(no: string, name: string, helpDocs: string, IsMultiSelect = false, srcOfList: string | Function) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.SelectItemsByTable;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.Tag0 = srcOfList;
    this.SubPages.Add(en);
  }

  /**
   * 通过option添加表格
   * @param option {no: string; name: string; columns:[], helpDocs: string; IsMultiSelect: boolean; srcOfList: string | Function}
   */
  public AddTableByOptions(option: {
    no: string;
    name: string;
    columns?: string | DataTableColumns<RowData> | Function;
    helpDocs: string;
    IsMultiSelect: boolean;
    srcOfList: string | Function;
  }) {
    const en = new Page();
    const { no, name, helpDocs, IsMultiSelect = false, srcOfList } = option;
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.SelectItemsByTable;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.Tag0 = srcOfList;
    en.ex_params = { columns: option.columns };
    this.SubPages.Add(en);
  }

  /**
   * 增加方法
   * @param no
   * @param name
   * @param funcName
   */
  public AddFunction(no: string, name: string, _funcName: string | Function) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    //  en.HelpDocs = helpDocs;
    en.BindFunction = _funcName;
    en.HisPageModelNew = PageModelNew.Func; //执行功能.
    this.SubPages.Add(en);
  }

  /**
   * 转向url.
   * @param no 编号
   * @param name 名称
   * @param url 转向的url
   */
  public AddGoToUrl(no: string, name: string, url: string | Function, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.BindFunction = url;
    en.HisPageModelNew = PageModelNew.GoToUrl; //执行功能.
    this.SubPages.Add(en);
  }

  public AddGoToIFrm(no: string, name: string, url: string | Function, helpDocs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.BindFunction = url;
    en.HisPageModelNew = PageModelNew.GoToIFrm; //执行功能.
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
   * @param selectedNos 选择的Nos,多个用逗号分开.
   */
  public SelectItemsByGroupList(
    no: string,
    name: string,
    helpDocs: string,
    IsMultiSelect = false,
    srcOfGroup: string | Function | Entities,
    srcOfList: string | Function | Entities,
    enableSearch = true,
    selectedNos = '',
    refEntityFKey = '',
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.SelectItemsByGroupList;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.Tag0 = srcOfGroup;
    en.Tag1 = srcOfList;
    en.enableSearch = enableSearch;
    en.Tag3 = selectedNos;
    en.Tag4 = refEntityFKey;
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
   * @param srcOfList 列表数据源.
   * @param selectedNos 选择的Nos,多个用逗号分开.
   */
  public SelectItemsByTree(
    no: string,
    name: string,
    helpDocs: string,
    IsMultiSelect = false,
    srcOfTree: string | Function,
    rootNo: string,
    enableSearch = true,
    selectedNos = '',
    isLazily = false,
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.SelectItemsByTree;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.IsLazily = isLazily;
    en.Tag0 = srcOfTree;
    en.Tag1 = rootNo;
    en.enableSearch = enableSearch;
    en.Tag3 = selectedNos;
    this.SubPages.Add(en);
  }

  /**
   * 树表结构
   * @param no key
   * @param name name
   * @param helpDocs 帮助文档
   * @param IsMultiSelect 多选
   * @param srcOfTree 树节点搜索
   * @param rootNo 根节点
   * @param srcOfEns 表数据源
   * @param colCNnames 中文列名映射
   * @param isLazily 懒加载
   * @param srcOfSearch 查询数据源
   * @param enableSearch 启用查询
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
    isLazily = false,
    srcOfSearch = '', // 搜索数据源
    enableSearch = false,
  ) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.SelectItemsByTreeEns;
    en.IsMultiSelect = IsMultiSelect; //是否多选?
    en.IsLazily = isLazily;
    en.Tag0 = srcOfTree;
    en.Tag1 = rootNo;
    en.Tag2 = srcOfEns; //实体数据源
    en.Tag3 = colCNnames; //对应管理
    en.Tag4 = srcOfSearch; // 搜索数据源
    en.enableSearch = enableSearch;
    this.SubPages.Add(en);
  }

  public TextSQL(no: string, name: string, helpDocs: string, descName: string, defaultVal: string, placeholder = '') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.TextSQL; //单个文本框.
    en.Tag0 = ''; //前缀.
    en.Tag1 = ''; //名称.
    en.Tag2 = descName;
    en.DefaultVal = defaultVal; //默认值.
    en.Tag3 = placeholder; //文本提示.
    this.SubPages.Add(en);
  }

  public TextUrl(no: string, name: string, helpDocs: string, descName: string, defaultVal: string, placeholder = '') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.TextUrl; //单个文本框.
    en.Tag0 = ''; //前缀.
    en.Tag1 = ''; //名称.
    en.Tag2 = descName;
    en.DefaultVal = defaultVal; //默认值.
    en.Tag3 = placeholder; //文本提示.
    this.SubPages.Add(en);
  }

  public TextArea(no: string, name: string, helpDocs: string, descName: string, defaultVal: string, placeholder = '') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Textarea; //单个文本框.
    en.Tag0 = ''; //前缀.
    en.Tag1 = ''; //名称.
    en.Tag2 = descName;
    en.DefaultVal = defaultVal; //默认值.
    en.Tag3 = placeholder; //文本提示.
    this.SubPages.Add(en);
  }

  public TextBox1_Name(no: string, name: string, helpDocs: string, descName: string, defaultVal: string | Function, placeholder = '') {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Text1Name; //单个文本框.
    en.Tag0 = ''; //前缀.
    en.Tag1 = ''; //名称.
    en.Tag2 = descName;
    en.DefaultVal = defaultVal; //默认值.
    en.Tag3 = placeholder; //文本提示.
    this.SubPages.Add(en);
  }

  /**
   * 2个文本框
   * @param no 编码
   * @param name 名称
   * @param helpDocs 描述，大块文本文本
   * @param pix 前缀，如果有前缀，就需要自动为编号生成拼音，比如: Frm_QingJia, 依据Name字段.
   * @param descNo 编号描述,比如:表单ID.
   * @param descName 名称描述,比如:表单名称.
   * @param defaultVal 默认值
   */
  public TextBox2_NameNo(no: string, name: string, helpDocs: string, pix: string, descNo: string, descName: string, defaultVal: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Text2NoName; //单行文本框.
    en.Tag0 = pix; //前缀.
    en.Tag1 = descNo; //编号.
    en.Tag2 = descName; //名称.
    en.DefaultVal = defaultVal; //默认值.
    this.SubPages.Add(en);
  }

  public TextBox2_NameNote(no: string, name: string, helpDocs: string, descName: string, descNote: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Text2NameNote; //单行文本框.
    en.Tag2 = descName; //名称.
    en.Tag3 = descNote; //备注.
    this.SubPages.Add(en);
  }

  /**
   * 3个文本框
   * @param no 编码
   * @param name 名称
   * @param helpDocs 描述，大块文本文本
   * @param pix 前缀，如果有前缀，就需要自动为编号生成拼音，比如: Frm_QingJia, 依据Name字段.
   * @param descNo 编号描述,比如:表单ID.
   * @param descName 名称描述,比如:表单名称.
   * @param descNote 备注描述,比如:存储表.
   */
  public TextBox3_NameNoNote(no: string, name: string, helpDocs: string, pix: string | null, descNo: string, descName: string, descNote: string, defaultVal: string | Function) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.HelpDocs = helpDocs;
    en.HisPageModelNew = PageModelNew.Text3NoNameNote; //单行文本框.
    en.Tag0 = pix; //前缀.
    en.Tag1 = descNo; //编号.
    en.Tag2 = descName; //名称.
    en.Tag3 = descNote; //备注.
    en.DefaultVal = defaultVal; //默认值.
    this.SubPages.Add(en);
  }

  //上传文件.
  public FileUpload(no: string, name: string, fileDesc: string, docs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.Tag0 = fileDesc;
    en.HelpDocs = docs;
    en.HisPageModelNew = PageModelNew.FileUpload; //文件上传模式.
    // en.Tag0=pix; //前缀.
    // en.Tag1=descNo; //编号.
    // en.Tag2=descName; //名称.
    this.SubPages.Add(en);
  }

  //上传文件.
  public FolderUpload(no: string, name: string, fileDesc: string, docs: string) {
    const en = new Page();
    en.No = no;
    en.Name = name;
    en.GroupNo = this._groupNo; //设置当前的分组.
    en.Tag0 = fileDesc;
    en.HelpDocs = docs;
    en.HisPageModelNew = PageModelNew.FolderUpload; //文件上传模式.
    // en.Tag0=pix; //前缀.
    // en.Tag1=descNo; //编号.
    // en.Tag2=descName; //名称.
    this.SubPages.Add(en);
  }

  abstract Save_TextBox_X(_pageNo?: string, _sortNo?: string, _tb1?: string, _tb2?: string, _tb3?: string);

  // 帮助：没有编写
  public readonly HelpUn = `
   #### 帮助
   - 帮助文件未编写完成，敬请期待.
 `;

  // 帮助: 功能未实现
  public readonly HelpTodo = `
   #### 帮助
   - 该功能已经规划在设计中，尚未完成，敬请期待.
 `;

  // 帮助: 无帮助文档
  public readonly HelpNo = `
   #### 帮助
   - 无
 `;
}
