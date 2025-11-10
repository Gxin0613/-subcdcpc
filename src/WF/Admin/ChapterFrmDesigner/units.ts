import { FormGroup, FormItem } from '../FoolFormDesigner/props/form/FormComponents';
// 判断是否是基础表单组件
export const isFormItem = (widget: FormItem | FormGroup | null): widget is FormItem => {
  return (widget as FormItem)?.dto?.GroupID !== undefined;
};
export const getSettingUrl = (CtrlType: string, widget: FormGroup | FormItem, FrmID: any) => {
  if (CtrlType === 'rich') return `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrString&PKVal=${widget.id}&s=${Math.random()}`;
  else if (CtrlType === '' || CtrlType === null || CtrlType === 'Attr' || CtrlType === 'Dir' || CtrlType === 'ChapterFrmLinkFrm' || CtrlType === 'ChapterFrmSelfUrl')
    return `../../Comm/En.htm?EnName=TS.FrmUI.GroupField&PKVal=${widget?.id}`;
  else if (CtrlType === 'Dtl' && !isFormItem(widget))
    return `/@/WF/Comm/En.vue?EnName=TS.Frm.MapDtlExt&FrmID=${widget.dto?.FrmID}&No=${widget.dto?.CtrlID}&PKVal=${widget.dto?.CtrlID}`;
  else if (CtrlType === 'Ath' && !isFormItem(widget)) return `../../Comm/En.htm?EnName=TS.FrmUI.FrmAttachmentExt&FrmID=${FrmID}&PKVal=${widget.dto?.CtrlID}`;
  // else {
  //   alert(`CtrlType [ ${CtrlType} ]未解析，无法获得SettingUrl`);
  //   console.error(`CtrlType [ ${CtrlType} ]未解析，无法获得SettingUrl`);
  //   return '';
  // }
};
export const basicSelectOptions = [
  {
    label: '文字',
    value: 'text',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-fuwenbenkuang',
  },
  {
    label: '大块文字',
    value: 'textBig',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-fuwenbenkuang',
  },
  {
    label: '整数',
    value: 'integer',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-zhengshu',
  },
  {
    label: '数值',
    value: 'number',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-ziduanleixing-zhengshu',
  },
  {
    label: '金额',
    value: 'amount',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-yifabupiaoju-renminbi-xi',
  },
  {
    label: '日期',
    value: 'date',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-riqiqishu',
  },
  {
    label: '日期时间',
    value: 'datetime',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-shijian1',
  },
  // {
  //   label: '日期范围',
  //   value: 'daterange',
  //   category: 'input',
  //   inputSpan: 1,
  //   labelSpan: 1,
  //   visible: true,
  //   showInPanel: false,
  //   icon: '',
  // },
  // {
  //   label: '时间范围',
  //   value: 'datetimerange',
  //   category: 'input',
  //   inputSpan: 1,
  //   labelSpan: 1,
  //   visible: true,
  //   showInPanel: false,
  //   icon: '',
  // },
  {
    label: '开关',
    value: 'checkbox',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-fuxuankuang',
  },
  {
    label: '单选',
    value: 'enumsRadio',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    manualInputId: true,
    visible: true,
    icon: 'iconfont icon-danxuan',
  },
  {
    label: '多选',
    value: 'enumsCheckbox',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    manualInputId: true,
    visible: true,
    icon: 'iconfont icon-xialakuangbiaodan',
  },
  {
    label: '枚举下拉框',
    value: 'enumsDropdown',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    manualInputId: true,
    visible: true,
    icon: 'iconfont icon-xialakuang',
  },
  {
    label: '外键下拉框',
    value: 'foreignKeyDropdown',
    category: 'input',
    inputSpan: 1,
    labelSpan: 1,
    manualInputId: true,
    visible: true,
    icon: 'iconfont icon-xialakuang1',
  },
];

export const customizeSelectOptions = [
  {
    label: '自定义控件',
    value: 'field',
    category: 'customize',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-pingfen',
  },
  {
    label: '扩展类控件',
    value: 'ext',
    category: 'customize',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-chaolianjie',
  },
  {
    label: '分组类控件',
    value: 'group',
    category: 'customize',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-kuangjia1',
  },
  {
    label: '同期字段',
    value: 'TQ',
    category: 'customize',
    inputSpan: 1,
    labelSpan: 1,
    visible: true,
    icon: 'iconfont icon-kuangjia1',
  },
];
