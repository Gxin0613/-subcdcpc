/// 菜单 属性
export class MenuModel {
  /// 系统
  public static readonly SelfUrl = 'SelfUrl';
  // 固定类型的路由
  public static readonly FixedUrl = 'FixedUrl';
  /// 系统编号
  public static readonly Func = 'Func';
  /// 图片
  public static readonly StandAloneFlow = 'StandAloneFlow';

  //LinkFlowFunc
  public static readonly LinkFlowFunc = 'LinkFlowFunc';

  public static readonly Dict = 'Dict';
  public static readonly EntityNoName = 'EntityNoName'; //编号名称的实体
  public static readonly DictCopy = 'DictCopy';
  public static readonly Bill = 'Bill';
  public static readonly DictRef = 'DictRef';
  public static readonly BillRef = 'BillRef';
  public static readonly FlowUrl = 'FlowUrl';
  public static readonly Start = 'Start';
  public static readonly StartSpecFlow = 'StartSpecFlow';
  public static readonly Todolist = 'Todolist';
  public static readonly TodolistSpecFlow = 'TodolistSpecFlow';
  public static readonly Runing = 'Runing';
  public static readonly RuningSpecNo = 'RuningSpecNo';
  public static readonly CC = 'CC';
  public static readonly CCSpecFlow = 'CCSpecFlow';
  public static readonly SearchFlow = 'SearchFlow';
  public static readonly SearchSpecFlow = 'SearchSpecFlow';
  public static readonly DictTable = 'DictTable';
  //树结构字典.
  public static readonly DictTableTree = 'DictTableTree';

  public static readonly DictTableSpecNo = 'DictTableSpecNo';
  public static readonly FrmDtlView = 'FrmDtlView';
  public static readonly FlowDtlView = 'FlowDtlView';

  public static readonly RptWhite = 'RptWhite';
  public static readonly FlowRptWhite = 'FlowRptWhite';
  public static readonly BillRptWhite = 'BillRptWhite';
  public static readonly EnRptWhite = 'EnRptWhite';
  public static readonly EntityRptWhite = 'EntityRptWhite';
  
  public static readonly RptBlue = 'RptBlue';
  public static readonly NetDisk = 'NetDisk';
  public static readonly Tabs = 'Tabs';
  public static readonly Rpt3DLowCode = 'Rpt3DLowCode';
  public static readonly Rpt2DLowCode = 'Rpt2DLowCode';

  public static readonly DBList = 'DBList';
  public static readonly Task = 'Task';
  public static readonly Info = 'Info';

  public static readonly Calendar = 'Calendar';
  public static readonly Notepad = 'Notepad';
  public static readonly KnowledgeManagement = 'KnowledgeManagement';
  public static readonly WorkRec = 'WorkRec';
}

const menuCategory = {
  highCode: '高代码',
  lowCode: '低代码',
  oa: 'OA类菜单',
};

export const MenuDef = [
  // 高代码 ****************************************************************************
  {
    type: 'Search',
    name: '查询',
    category: menuCategory.highCode,
    icon: 'icon-drop',
  },
  {
    type: 'Group',
    name: '分组',
    category: menuCategory.highCode,
    icon: 'icon-pie-chart',
  },
  {
    type: 'Tree',
    name: '树实体',
    category: menuCategory.highCode,
    icon: 'icon-playlist',
  },
  {
    type: 'TreeEns',
    name: '左树右表',
    category: menuCategory.highCode,
    icon: 'icon-organization',
  },
  {
    type: 'GL',
    name: '通用列表',
    category: menuCategory.highCode,
    icon: 'icon-list',
  },
  {
    type: 'Tabs',
    name: '标签页',
    category: menuCategory.highCode,
    icon: 'icon-plus',
  },
  {
    type: 'GPN',
    name: '新建',
    category: menuCategory.highCode,
    icon: 'icon-plus',
  },
  {
    type: 'Ens',
    name: '批量编辑',
    category: menuCategory.highCode,
    icon: 'icon-minus',
  },
  {
    type: 'En',
    name: '属性卡片(相关功能)',
    category: menuCategory.highCode,
    icon: 'icon-fire',
  },
  {
    type: 'EnOnly',
    name: '属性卡片(仅主表)',
    category: menuCategory.highCode,
    icon: 'icon-fire',
  },
  {
    type: 'Data_V',
    name: '大屏',
    category: menuCategory.highCode,
    icon: 'icon-chart',
  },
  {
    type: 'Self',
    name: '自定义Url',
    category: menuCategory.highCode,
    icon: 'icon-star',
  },
  // 低代码****************************************************************************
  {
    type: 'SearchEntityNoName',
    name: '实体-编号名称',
    category: menuCategory.lowCode,
    icon: 'icon-drop',
  },
  {
    type: 'SearchEntityTree',
    name: '实体-树',
    category: menuCategory.lowCode,
    icon: 'icon-organization',
  },
  {
    type: 'SearchBill',
    name: '单据',
    category: menuCategory.lowCode,
    icon: 'icon-drop',
  },
  {
    type: 'FrmBill',
    name: '单据',
    category: menuCategory.lowCode,
    icon: 'icon-drop',
  },
  {
    type: 'RptWhite',
    name: '白色大屏',
    category: menuCategory.lowCode,
    icon: 'icon-chart',
  },
  {
    type: 'RptBlue',
    name: '蓝色大屏',
    category: menuCategory.lowCode,
    icon: 'icon-chart',
  },
  {
    type: 'GenerList',
    name: '不分页视图',
    category: menuCategory.lowCode,
    icon: 'icon-eye',
  },
  {
    type: 'DBList',
    name: '分页视图',
    category: menuCategory.lowCode,
    icon: 'icon-eyeglass',
  },
  {
    type: 'TreeEns',
    name: '左树右表视图',
    category: menuCategory.lowCode,
    icon: 'icon-organization',
  },
  // 系统组件OA ****************************************************************************
  {
    type: 'OA',
    name: 'OA组件',
    category: menuCategory.lowCode,
    icon: 'icon-drop',
  },
];
