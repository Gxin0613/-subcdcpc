import { GroupField, MapAttr } from '../database/FormInfo';

// 字段详情描述
export interface FormItem {
  Idx?: any;
  title: string;
  key: string;
  groupKey?: string;
  id?: string;
  labelSpan?: number; // 标签跨列
  inputSpan?: number; // 输入框跨行
  category?: string; // 类型
  manualInputId?: boolean; // 如果需要手动输入id
  groupId?: number;
  visible?: boolean;
  readonly?: boolean;
  dto?: MapAttr;
  dtoClassName?: string;
  showInPanel?: boolean;
  defaultName?: string;
  defaultId?: string;
  KeyOfEn?: string;
  required?: boolean;
  EnName?: string; // 实体名
  UrlParams?: string; // 参数
  RealType?: string; // 实际类型
  RealCate?: string; // 实际分组
  icon: string;
}

export interface FormGroup {
  fileType: string;
  title: string;
  collapse: boolean;
  id?: string;
  key?: string;
  url?: string;
  children: Array<FormItem>;
  inputSpan?: number;
  labelSpan?: number;
  manualInputId?: boolean; // 如果需要手动输入id
  category?: string;
  visible?: boolean;
  readonly?: boolean;
  OID?: string; // 数组id
  dtoClassName?: string;
  dto?: GroupField;
}

// 组件分组描述
export interface FieldGroup {
  title: string;
  key: string;
  icon: string;
  children: Array<FormItem>;
}

// 容器
export const containerList: Array<string> = [
  'container_groupfield',
  'container_dir',
  // 'Container_checkGroup',
  'appendix_table',
  'universal_iframe',
  'slave_table',
];

export const inputGroup: FieldGroup = {
  title: '基础字段',
  key: 'input',
  icon: 'iconfont icon-ziduan',
  children: [
    {
      title: '文字',
      key: 'text',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-fuwenbenkuang',
    },
    {
      title: '大块文字',
      key: 'textBig',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-fuwenbenkuang',
    },
    {
      title: '整数',
      key: 'integer',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-zhengshu',
    },
    {
      title: '数值',
      key: 'number',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-ziduanleixing-zhengshu',
    },
    {
      title: '金额',
      key: 'amount',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-yifabupiaoju-renminbi-xi',
    },
    {
      title: '日期',
      key: 'date',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-riqiqishu',
    },
    {
      title: '日期时间',
      key: 'datetime',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-shijian1',
    },
    {
      title: '日期范围',
      key: 'daterange',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      showInPanel: false,
      icon: '',
    },
    {
      title: '时间范围',
      key: 'datetimerange',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      showInPanel: false,
      icon: '',
    },
    {
      title: '单选占位',
      key: 'radio',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      showInPanel: false,
      icon: '',
    },
    {
      title: '下拉占位',
      key: 'select',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      showInPanel: false,
      icon: 'iconfont icon-xialakuang',
    },
    {
      title: '开关',
      key: 'checkbox',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-fuxuankuang',
    },
    {
      title: '单选',
      key: 'enumsRadio',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      manualInputId: true,
      visible: true,
      icon: 'iconfont icon-danxuan',
    },
    {
      title: '多选',
      key: 'enumsCheckbox',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      manualInputId: true,
      visible: true,
      icon: 'iconfont icon-xialakuangbiaodan',
    },
    {
      title: '枚举下拉',
      key: 'enumsDropdown',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      manualInputId: true,
      visible: true,
      icon: 'iconfont icon-xialakuang',
    },
    {
      title: '',
      key: 'enums',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      manualInputId: true,
      visible: true,
      showInPanel: false,
      icon: '',
    },
    {
      title: '外键下拉',
      key: 'foreignKeyDropdown',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      manualInputId: true,
      visible: true,
      icon: 'iconfont icon-xialakuang1',
    },
    {
      title: '字段控件',
      key: 'field',
      category: 'customize',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-pingfen',
    },
    {
      title: '组合字段',
      key: 'ext',
      category: 'customize',
      inputSpan: 1,
      labelSpan: 1,
      visible: true,
      icon: 'iconfont icon-chaolianjie',
    },
    {
      title: '字段模板',
      key: 'fieldTemplate',
      category: 'input',
      inputSpan: 1,
      labelSpan: 1,
      manualInputId: true,
      visible: true,
      icon: 'iconfont icon-ziduanliebiao',
    },
  ],
};

const defineFormComponents: Array<FieldGroup> = [
  inputGroup,
  {
    title: '实体单据引用',
    key: 'mapExt',
    icon: 'iconfont icon-fujian',
    children: [
      {
        title: 'Pop弹窗',
        key: 'pop',
        category: 'mapExt',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        defaultName: 'Pop弹窗',
        defaultId: 'Pop',
        icon: 'iconfont icon-attach',
        EnName: 'GPN_CtrlPop',
        UrlParams: '&PageNo=SFTableDict',
        RealType: 'text', // pop窗实际创建的组件是一个文本字段，所以需要配置实际类型为'text'
        RealCate: 'input', // 同上，实际类型为input，具体可看上面输入类组件定义
      },
      {
        title: '文本框补全',
        key: 'autoFull',
        category: 'mapExt',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        defaultName: '文本框自动完成',
        defaultId: 'input',
        icon: 'iconfont icon-attach',
        EnName: 'GPN_CtrlInput',
        UrlParams: '&PageNo=GPN_CtrlInput',
        RealType: 'text', // pop窗实际创建的组件是一个文本字段，所以需要配置实际类型为'text'
        RealCate: 'input', // 同上，实际类型为input，具体可看上面输入类组件定义
      },
      // {
      //   title: '填充(开发中)',
      //   key: 'autoFullBill',
      //   category: 'mapExt',
      //   inputSpan: 4,
      //   labelSpan: 4,
      //   visible: false,
      //   defaultName: '填充(开发中)',
      //   defaultId: 'Bill',
      //   icon: 'iconfont icon-biaogefujian',
      //   EnName: 'GPN_CtrlAutoFullBill',
      //   UrlParams: '&PageNo=GPN_CtrlAutoFullBill',
      //   RealType: 'text', // pop窗实际创建的组件是一个文本字段，所以需要配置实际类型为'text'
      //   RealCate: 'input', // 同上，实际类型为input，具体可看上面输入类组件定义
      // },
      // {
      //   title: '引入实体(开发中)',
      //   key: 'autoFullDict',
      //   category: 'mapExt',
      //   inputSpan: 4,
      //   labelSpan: 4,
      //   visible: false,
      //   defaultName: '引入实体(开发中)',
      //   defaultId: 'Dict',
      //   icon: 'iconfont icon-biaogefujian',
      //   EnName: 'GPN_CtrlAutoFullDict',
      //   UrlParams: '&PageNo=GPN_CtrlAutoFullDict',
      //   RealType: 'text', // pop窗实际创建的组件是一个文本字段，所以需要配置实际类型为'text'
      //   RealCate: 'input', // 同上，实际类型为input，具体可看上面输入类组件定义
      // },
      // {
      //   title: '引入查询',
      //   key: 'autoFull',
      //   category: 'mapExt',
      //   inputSpan: 4,
      //   labelSpan: 4,
      //   visible: true,
      //   defaultName: '引入查询',
      //   defaultId: 'Ath1',
      //   icon: 'iconfont icon-biaogefujian',
      // },
    ],
  },
  {
    title: '分组',
    key: 'container',
    icon: 'iconfont icon-fenzu',
    children: [
      {
        title: '字段分组',
        key: 'groupfield',
        category: 'container',
        visible: true,
        icon: 'iconfont icon-fenzu',
      },
      {
        title: '目录',
        key: 'dir',
        category: 'container',
        visible: true,
        icon: 'iconfont icon-fenzu',
      }, // 此处是分组的概念
      // { title: '审核分组', key: 'checkGroup', category: 'container', visible: true, icon: 'iconfont icon-ziduan1' }, // 此处是分组的概念
    ],
  },
  {
    title: '附件/从表',
    key: 'appendix',
    icon: 'iconfont icon-fujian',
    children: [
      {
        title: '从表(子表)',
        key: 'table',
        category: 'slave',
        inputSpan: 4,
        labelSpan: 4,
        manualInputId: true,
        visible: true,
        defaultName: '从表组件',
        icon: 'iconfont icon-tianjiashujubiao',
      },
      {
        title: '字段附件',
        key: 'field',
        category: 'appendix',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        defaultName: '字段附件',
        defaultId: 'Ath1',
        icon: 'iconfont icon-attach',
      },
      {
        title: '表格附件',
        key: 'table',
        category: 'appendix',
        inputSpan: 4,
        labelSpan: 4,
        visible: true,
        defaultName: '表格附件',
        defaultId: 'Ath1',
        icon: 'iconfont icon-biaogefujian',
      },
      {
        title: '图片',
        key: 'image',
        category: 'appendix',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        defaultName: '图片附件',
        defaultId: 'Img1',
        icon: 'iconfont icon-tupianfujian',
      },
      // {
      //   title: '公文',
      //   key: 'office',
      //   category: 'appendix',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   defaultName: '公文附件',
      //   defaultId: 'Ath1',
      //   icon: 'iconfont icon-tupianfujian',
      // },
      {
        title: '写字板',
        key: 'write',
        category: 'appendix',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        defaultName: '写字板附件',
        defaultId: 'Ath1',
        icon: 'iconfont icon-xiezi',
      },
    ],
  },
  {
    title: '自定义组件（开发中）',
    key: 'customize',
    icon: 'iconfont icon-zujian',
    children: [
      {
        title: '分组类控件',
        key: 'group',
        category: 'customize',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        icon: 'iconfont icon-kuangjia1',
      },
      {
        title: '同期字段',
        key: 'TQ',
        category: 'customize',
        inputSpan: 1,
        labelSpan: 1,
        visible: true,
        icon: 'iconfont icon-kuangjia1',
      },
      // {
      //   title: '身份证上传',
      //   key: 'id_card_upload',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'iconfont icon-shenfenzheng',
      // },
      // {
      //   title: '身份证上传',
      //   key: 'IdUpload',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   showInPanel: false,
      //   icon: '',
      // },
      // {
      //   title: '姓名',
      //   key: 'IdName',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   showInPanel: false,
      //   icon: '',
      // },
      // {
      //   title: '身份证号',
      //   key: 'IdNumber',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   showInPanel: false,
      //   icon: '',
      // },
      // {
      //   title: '图片',
      //   key: 'img',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'icon-picture',
      // },
      // {
      //   title: '按钮',
      //   key: 'button',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'iconfont icon-anniu',
      // },
      // {
      //   title: '超链接',
      //   key: 'link',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'iconfont icon-chaolianjie',
      // },
      // {
      //   title: '评分',
      //   key: 'rate',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'iconfont icon-pingfen',
      // },
      // {
      //   title: '框架',
      //   key: 'iframe',
      //   category: 'universal',
      //   inputSpan: 4,
      //   labelSpan: 4,
      //   visible: true,
      //   manualInputId: true,
      //   defaultName: '框架',
      //   defaultId: 'iFrame1',
      //   icon: 'iconfont icon-kuangjia1',
      // },
      // {
      //   title: '地图',
      //   key: 'map',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'iconfont icon-jiedianleizhukongzhongxin1',
      // },
      // {
      //   title: '定位',
      //   key: 'locate',
      //   category: 'universal',
      //   inputSpan: 1,
      //   labelSpan: 1,
      //   visible: true,
      //   icon: 'iconfont icon-dingwei',
      // },
      {
        title: '大块说明',
        key: 'html',
        category: 'universal',
        inputSpan: 4,
        labelSpan: 4,
        showInPanel: false,
        visible: true,
        icon: 'iconfont icon-html',
      },
      // {
      //   title: '其他组件',
      //   key: 'html',
      //   category: 'universal',
      //   inputSpan: 4,
      //   labelSpan: 4,
      //   visible: true,
      //   icon: 'iconfont icon-html',
      // },
    ],
  },
  // {
  //   title: '流程组件',
  //   key: 'universal',
  //   icon: 'iconfont icon-zujian',
  //   children: [
  //     {
  //       title: '签批组件',
  //       key: 'signCheck',
  //       category: 'universal',
  //       inputSpan: 1,
  //       labelSpan: 3,
  //       visible: true,
  //       icon: 'iconfont icon-ptkj-lianxuqianpimoshi',
  //     },
  //     {
  //       title: '流程进度图',
  //       key: 'progress',
  //       category: 'universal',
  //       inputSpan: 1,
  //       labelSpan: 1,
  //       visible: true,
  //       icon: 'iconfont icon-html',
  //     },
  //     {
  //       title: '审核组件',
  //       key: 'progress',
  //       category: 'universal',
  //       inputSpan: 1,
  //       labelSpan: 1,
  //       visible: true,
  //       icon: 'iconfont icon-html',
  //     },
  //     {
  //       title: '流转自定义',
  //       key: 'progress',
  //       category: 'universal',
  //       inputSpan: 1,
  //       labelSpan: 1,
  //       visible: true,
  //       icon: 'iconfont icon-html',
  //     },
  //   ],
  // },
];

export default defineFormComponents;
