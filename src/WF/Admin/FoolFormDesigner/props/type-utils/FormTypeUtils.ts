import { IdCardType, InputType, NumberType } from '../type-map/FormTypeMap';
// 分解额外参数
import { GroupField, MapAttr, MapFrame } from '../database/FormInfo';
import { DBEnums } from '../database/DatabaseFormItem';
import { splitAtString } from '/@/bp/tools/ParamUtils';
import { FormGroup } from '../form/FormComponents';
import { useDesignerStore } from '/@/store/modules/form';

// 将ArPara 参数解析为Map
export function decodeExtraParams(AtPara: string) {
  if (!AtPara) return;
  const params = new Map();
  if (AtPara.startsWith('@')) {
    const tempArr = splitAtString(AtPara);
    tempArr.forEach((temp: string) => {
      const [key, val] = temp.split('=');
      params.set(key, val);
    });
  }
  return params;
}

// 找到一些特殊的组件，比如身份证
export function getCorrectKey(targetKey: string, widgetKey: string): string {
  let key = targetKey;
  if (key === 'idCard') {
    key = IdCardType.get(widgetKey) || '';
  }
  return key;
}

// 同步分组设置
export function syncGroupProps(target: Recordable, source: GroupField, iframes: Array<MapFrame>): FormGroup {
  const formStore = useDesignerStore();
  target.id = source.OID;
  target.title = source.Lab;
  target.dto = source;
  if (source.CtrlType == 'Ath') {
    const athInfo = formStore.athInfoList.find((attachment) => attachment.MyPK === source.CtrlID);
    if (athInfo) {
      target.visible = athInfo.IsVisable == '1';
      target.fileType = athInfo.FileType + '';
    }
  }
  const attributes = decodeExtraParams(source.AtPara);
  if (attributes?.has('UIVisible')) {
    target.visible = attributes?.get('UIVisible') != 0;
  } else if (source.CtrlType == '') {
    target.visible = source.ShowType == 0;
  }
  target.dtoClassName = 'BP.Sys.GroupField';
  if (target.key === 'iframe') {
    const currentIframe = iframes.filter((iframe) => iframe.MyPK === source.CtrlID)[0];
    if (currentIframe) target.url = currentIframe.URL;
  }
  return target as FormGroup;
}

// 处理文本属性
function handleTextBoxAttr(target: any, source: MapAttr, attribute?: Map<any, any>) {
  target.modelVal = source.DefVal;
  target.clearable = attribute?.get('clearable') == 1;
  target.suffix = attribute?.get('suffix');
  // modified at 2022 / 6 / 1
  //  如果没有找到对应类型，默认解析为 text
  target.key = <string>InputType.get(source.MyDataType) || 'text';
  target.placeholder = source.Tip;
  // 如果就是字符串文本，还要判断文本框是否是密码，文本域。。。
  if (target.key === 'text') {
    // target.inputType = source.IsSecret == 1 ? 'password' : source.IsRichText == 1 ? 'textarea' : "text"
    target.inputType = (source.TextModel || 0) + '';
    target.inputIcon = source.ICON;
    target.isSuperText = source.IsSupperText == 1;
  }
  if (NumberType.includes(target.key)) {
    target.inputButton = attribute?.get('inputButton') == 1;
  }
  if (target.key === 'date' || target.key === 'datetime') {
    target.selectedFormat = source.IsSupperText + '';
  }
}

// 同步字段设置
export function syncFieldProps(target: any, source: MapAttr) {
  target.inputSpan = source.ColSpan || target.inputSpan;
  target.labelSpan = source.LabelColSpan || target.labelSpan;
  target.id = source.MyPK;
  target.modelVal = source.DefVal;
  target.title = source.Name;
  target.visible = source.UIVisible === 1;
  target.readonly = source.UIIsEnable === 0;
  target.dto = source;
  // 所有字段都有keyOfEn，相当于字段id
  target.KeyOfEn = source.KeyOfEn;
  target.dtoClassName = 'BP.Sys.MapAttr';
  target.required = source.UIIsInput === 1;
  const attribute = decodeExtraParams(source.AtPara);
  // 如果是普通文本框，判断是属于哪种类型的
  if (source.UIContralType === DBEnums.TB && target.category === 'input') {
    handleTextBoxAttr(target, source, attribute);
  }
  if (source.UIContralType === DBEnums.CheckBok && source.LGType === 0) {
    target.unCheckedTips = attribute?.get('unCheckedTips');
    target.checkedTips = attribute?.get('checkedTips');
  }
  if (target.key === 'link') {
    target.modelVal = source.Tag2;
  }
  if (target.key === 'checkbox' || target.key.startsWith('enum') || target.key.startsWith('foreignKey')) {
    target.key = 'enums';
  }
  if (target.key === 'enums') {
    // 展现形式
    target.uiType = source.UIContralType;
    // 方向
    target.direction = attribute?.get('RBShowModel');
    target.enumKey = source.UIBindKey;
  }
  return target;
}
