/// <summary>
/// 相关功能类型
/// </summary>
import { Entity } from '/@/bp/en/Entity';
import { SubTablePosition } from '../Config';
import { Map } from './Map';

export enum RefMethodType {
  /// 功能， 执行结束后弹出模态窗口显示执行结果，如果返回的是 url@xxxxx ,就是在右侧打开这个链接.
  //  参数. 如果是无参方法，直接弹出确认框执行，如果是有参方法，根据参数生成对应的输入框和执行按钮，根据ClassMethod提示的方法进行执行
  // Map 里面的属性根据类型解析成不同的输入组件
  Func,
  /// 模态窗口打开
  LinkModel,
  /// 新窗口打开
  LinkeWinOpen,
  /// 右侧窗口打开,实际上就是右侧的页面展示
  RightFrameOpen,
  /// Tab页签打开
  TabOpen,
  /// Tab页签加载iframe
  TabIframeOpen,
  /// 从表
  Dtl,
  /// 多对多.
  One2Many,
  ///字段多对多.
  OneAttr2Many,
  ///修改属性
  GroupPageEdit,
  //新建
  GroupPageNew,
  //页面分组
  PanelGroup,
  /// 卡片链接.
  En,
  // 仅仅卡片链接.
  EnOnly,
  // En工具栏显示.
  FuncToolbar,
  DataVBase,
  // 流程综合查询
  SearchFlow,
  // 发起流程
  StartFlow,
  // 发起宿主流程
  StartHostFlow,
  BtnOfToolbar,
}

export type SubTableInfo = {
  ClassMethod: string;
  Title: string;
};

/// <summary>
/// 相关功能 的摘要说明。
/// </summary>
export class RefMethod {
  /// 高度
  public Height = 600;
  /// 宽度
  public Width = 800;
  public Target = '_B123';
  /// 功能
  public RefMethodType: RefMethodType = RefMethodType.Func;
  // 异步加载方法
  public loader: Nullable<Function> = null;
  /// 相关字段
  public RefAttrKey: string | null = null;
  /// 连接标签
  public RefAttrLinkLabel: string | null = null;
  /// 分组名称
  public GroupName: string | null = '基本信息';
  public GroupIcon: string | null = 'icon-drop';

  // 如果额外指定了从表位置 （左侧/EnOnly底部/EnOnly标签页）
  public SubTablePosition: SubTablePosition = SubTablePosition.Left;

  /// 是否显示在Ens中?
  public IsForEns = false;
  // 执行集合类方法
  public ExecByEns = false;
  public IsShowForEnsCondition: string | null = null;
  public Tag: any = null; //相关的Dtl, OneVsM.
  // 关联从表id
  public RefDtlClsID = '';
  public RefDtlRefPK = '';

  public params: Recordable = {};
  /// 相关功能
  constructor() {}

  public HisMap = new Map();

  /// 索引位置，用它区分实体.
  public Index = 0;
  /// 是否显示
  public Visable = true;
  /// 是否可以批处理
  public IsCanBatch = false;
  /// 标题
  public Title: string | null = null;
  /// 操作前提示信息
  public Warning: string | null = '您确定要执行吗？';
  // 方法
  public ClassMethod: number | string | symbol | undefined = '';
  /// 图标
  public Icon: string | null = 'icon-drop';
  /// 提示信息
  public ToolTip: string | null = null;
  /// PKVal
  public PKVal: any = 'PKVal';
  /// <summary>
  /// 他的实体
  /// </summary>
  public HisEn: Entity | null = null;
  /// <summary>
  /// 实体PK
  /// </summary>
  public PK1s = ''.split('.');
  // 方法关联流程编号
  public RefFlowInfo = {
    No: '',
    WorkIDFieldName: '',
    FieldMap: new globalThis.Map(),
  };
}

/// <summary>
/// 方法集合
/// </summary>
export class RefMethods extends Array<RefMethod> {}
