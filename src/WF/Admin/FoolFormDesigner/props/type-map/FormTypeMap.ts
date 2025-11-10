import defineFormComponents, { FormItem } from '../form/FormComponents';
import { DBEnums } from '../database/DatabaseFormItem';
import { createAthTable, createGroupField, createIframe, createSlavaTable } from '../type-utils/CreateContainerFunctions';
import {
  createAthField,
  createBasicAmountField,
  createBasicBooleanField,
  createBasicDateField,
  createBasicDatetimeField,
  createBasicIntegerField,
  createBasicNumberField,
  createBasicTextField,
  createBasicTextFieldBig,
  createButton,
  createExecJob,
  createGovDoc,
  createHandWriting,
  createHTML,
  createImgAth,
  createLink,
  createLocate,
  createMap,
  createScore,
  createSignCheck,
  createUniversalImg,
} from '../type-utils/CreateFieldFunctions';

const actualComponents = defineFormComponents.map((item) => item.children).flat();

// 分组类型枚举
const GroupType = new Map<String, Partial<FormItem>>([
  ['', { category: 'container', key: 'groupfield' }],
  ['Dir', { category: 'container', key: 'dir' }],
  ['Ath', { category: 'appendix', key: 'table' }],
  ['Frame', { category: 'universal', key: 'iframe' }],
  ['Dtl', { category: 'slave', key: 'table' }],
]);

const CreateGroupFunctions = new Map<string, Function>([
  ['container-groupfield', createGroupField],
  ['appendix-table', createAthTable],
  ['universal-iframe', createIframe],
  ['slave-table', createSlavaTable],
]);

const CreateFieldFunctions = new Map<string, Function>([
  ['input-text', createBasicTextField],
  ['input-textBig', createBasicTextFieldBig],

  ['input-integer', createBasicIntegerField],
  ['input-number', createBasicNumberField],
  ['input-amount', createBasicAmountField],
  ['input-date', createBasicDateField],
  ['input-datetime', createBasicDatetimeField],
  ['input-checkbox', createBasicBooleanField],

  // 附件类型
  ['appendix-field', createAthField],
  ['appendix-image', createImgAth],
  ['appendix-office', createGovDoc],
  ['appendix-write', createHandWriting],

  // 通用组件类型
  ['universal-button', createButton],
  ['universal-link', createLink],
  ['universal-rate', createScore],
  ['universal-map', createMap],
  ['universal-locate', createLocate],
  ['universal-progress', createExecJob],
  ['universal-html', createHTML],
  ['universal-img', createUniversalImg],
  ['universal-signCheck', createSignCheck],
]);

const FieldType = new Map<number, any>([
  // 等于0的时候执行方法判断各种类型
  [DBEnums.TB, { key: 'text', category: 'input' }],
  [DBEnums.DDL, { key: 'enums', category: 'input' }],
  [DBEnums.CheckBok, { key: 'enums', category: 'input' }],
  [DBEnums.RadioBtn, { key: 'enums', category: 'input' }],

  [DBEnums.AthShow, { key: 'field', category: 'appendix' }],
  [DBEnums.HandWriting, { key: 'write', category: 'appendix' }],
  [DBEnums.Lab, { key: 'write', category: 'appendix' }],
  [DBEnums.FrmImgAth, { key: 'image', category: 'appendix' }],
  [DBEnums.GovDocFile, { key: 'office', category: 'appendix' }],

  // [DBEnums.MapPin, { key: 'map', category: 'universal' }],
  // [DBEnums.FrmImg, { key: 'img', category: 'universal' }],
  // [DBEnums.HyperLink, { key: 'link', category: 'universal' }],
  // [DBEnums.IDCard, { key: 'idCard', category: 'universal' }],
  // [DBEnums.Fixed, { key: 'locate', category: 'universal' }],
  [DBEnums.BigText, { key: 'html', category: 'universal' }],
  // [DBEnums.Score, { key: 'rate', category: 'universal' }],
  // [DBEnums.JobSchedule, { key: 'progress', category: 'universal' }],
  // [DBEnums.Btn, { key: 'button', category: 'universal' }],
  // [DBEnums.SignCheck, { key: 'signCheck', category: 'universal' }],
]);

const customizeTypes = {
  ext: { key: 'ext', category: 'customize' },
  field: { key: 'field', category: 'customize' },
  group: { key: 'group', category: 'customize' },
};

// 定义从表编辑页面
interface EditPageInfo {
  title: string;
  url: string;
}

// 需要补全MyPK
const EditPageMap = new Map<number, EditPageInfo>([
  [0, { title: '字段String属性', url: '../../Comm/En.htm?EnName=TS.FrmUI.MapAttrString&PKVal=' }],
  [111, { title: '打印组件', url: '../../Comm/En.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrPrint&PKVal=' }],
  [110, { title: '公文组件', url: '../../Comm/En.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrGovDocFile&PKVal=' }],
  [101, { title: '评分控件', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.ExtScore&PKVal=' }],
  [
    50,
    {
      title: '流程进度图',
      url: '../../Comm/EnOnly.htm?EnName=TS.WF.Template.ExtJobSchedule&PKVal=',
    },
  ],
  [18, { title: '按钮属性', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.FrmBtn&PKVal=' }],
  [
    170,
    {
      title: '收文字号属性',
      url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrDocWordReceive&PKVal=',
    },
  ],
  [
    17,
    {
      title: '发文字号属性',
      url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrDocWord&PKVal=',
    },
  ],
  [16, { title: '系统定位属性', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrFixed&PKVal=' }],
  [15, { title: '评论组件', url: '../../Comm/En.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrFlowBBS&PKVal=' }],
  [14, { title: '签批组件', url: '../../Comm/En.htm?EnName=TS.FrmUI.SelfCommonent.SignCheck&PKVal=' }],
  [13, { title: '证件字段属性', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.MapAttrCard&PKVal=' }],
  [12, { title: '图片附件', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.FrmImgAth&PKVal=' }],
  [11, { title: '装饰类图片属性', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.FrmImg&PKVal=' }],
  [9, { title: '字段String超连接', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.ExtLink&PKVal=' }],
  [8, { title: '手写签名版', url: '../../Comm/En.htm?EnName=TS.FrmUI.MapAttrString&PKVal=' }],
  [6, { title: '附件组件', url: '../../Comm/En.htm?EnName=TS.FrmUI.FrmAttachmentExt&PKVal=' }],
  [4, { title: '地图', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.ExtMap&PKVal=' }],
  [111, { title: '颜色组件', url: '../../Comm/EnOnly.htm?EnName=TS.FrmUI.SelfCommonent.LabColor&PKVal=' }],
]);

// 输入类型
const InputType = new Map<Number, String>([
  [1, 'text'],
  [2, 'integer'],
  [8, 'amount'],
  [3, 'number'],
  [6, 'date'],
  [7, 'datetime'],
  [4, 'checkbox'],
]);

const IdCardType = new Map([
  ['IDCardAddress', 'IdUpload'],
  ['IDCardNo', 'IdNumber'],
  ['IDCardName', 'IdName'],
]);

const NumberType = ['integer', 'amount', 'number'];

export { GroupType, FieldType, customizeTypes, IdCardType, InputType, NumberType, actualComponents, CreateGroupFunctions, CreateFieldFunctions, EditPageMap };
