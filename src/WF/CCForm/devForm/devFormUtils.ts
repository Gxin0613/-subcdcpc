// 处理表单版本
export const handleFormVersion = (content: string, formId: string, mainFormId: string) => {
  if (formId != mainFormId) {
    return content.replace(new RegExp(formId, 'gm'), formId);
  }
  return content;
};

// 处理表格
export const handleTable = (rootNodeEl: HTMLElement) => {
  if (!rootNodeEl) return;
  const tableElemList = rootNodeEl.querySelectorAll('table');
  tableElemList.forEach((tableEl) => {
    const attrWidth = tableEl.getAttribute('width') || 0;
    tableEl.style.width = attrWidth + 'px';
  });
};

// 创建vue响应式对象
export const createModel = (mapAttrs: Recordable[]) => {
  const frmReactiveObj = {};
  for (const attr of mapAttrs) {
    if (!attr.KeyOfEn) {
      console.warn(`Attr - ${attr.Name} 缺少 KeyOfEn 属性`);
      continue;
    }
    frmReactiveObj[attr.KeyOfEn] = attr.DefVal;
  }
  return frmReactiveObj;
};

const replaceInputElements = (segment: string, type: string, replaceTag: string) => {
  const sg = segment;
  // while (sg.includes(`type="${type}"`)) {
  //   let pIdx = 0,
  //     sIdx = 0;
  //   const typeAttrIdx = sg.indexOf('type="text"');
  //   for (let i = typeAttrIdx; i > 0; i--) {
  //     if (sg[i] == '<') {
  //       pIdx = i;
  //       break;
  //     }
  //   }
  //   for (let i = typeAttrIdx; i < sg.length; i++) {
  //     if (sg[i] == '>') {
  //       sIdx = i;
  //       break;
  //     }
  //   }
  //   const textInput = sg.substring(pIdx, sIdx + 1);
  //   const prevStr = sg.substring(0, pIdx);
  //   const lastStr = sg.substring(sIdx + 1);
  //   sg = prevStr + textInput.replace('<input', replaceTag) + lastStr;
  //   console.log(sg.includes(`type="${type}"`));
  // }
  return sg;
};

const ignoreTags = ['p', 'br'];

export const analyDomStruct = (domEl: HTMLElement) => {
  const vueTemplate = ``;
  if (domEl.children.length == 0) {
    return vueTemplate;
  }
  for (let i = 0; i < domEl.children.length; i++) {
    const el = domEl.children[1];
    if (ignoreTags.includes(el.tagName)) {
      continue;
    }
  }
};

export const replaceNormalWigets = (segment: string) => {
  let sg = segment;

  sg = sg.replace('<center', '<center id="dev-form-center"');

  sg = replaceInputElements(sg, 'text', '<ant-input');
  // 替换所有input为ant-input
  // sg = sg.replace(new RegExp('<input', 'gm'), '<ant-input');
  // sg = sg.replace(new RegExp('</input>', 'gm'), '</ant-input>');

  // 替换所有select
  sg = sg.replace(new RegExp('<select', 'gm'), '<ant-select style="width:100%"');
  sg = sg.replace(new RegExp('</select>', 'gm'), '</ant-select>');

  // 替换所有select-option
  sg = sg.replace(new RegExp('<option', 'gm'), '<ant-select-option');
  sg = sg.replace(new RegExp('</option>', 'gm'), '</ant-select-option>');

  // // 替换所有radio
  // sg = sg.replace(new RegExp('<option', 'gm'), '<ant-select-option');
  // sg = sg.replace(new RegExp('</option>', 'gm'), '</ant-select-option>');

  // // 替换所有checkbox
  // sg = sg.replace(new RegExp('<option', 'gm'), '<ant-select-option');
  // sg = sg.replace(new RegExp('</option>', 'gm'), '</ant-select-option>');

  return sg;
};

export const bindVModel = (segment: string, modelName: string) => {
  let sg = segment;

  const prefixList = ['CB', 'TB', 'DDL'];
  for (const pf of prefixList) {
    const targetStr = `id="${pf}_${modelName}`;
    sg = sg.replace(targetStr, `v-model:value="modelVal.${modelName}" ${targetStr}`).replace(`value=""`, '');
  }
  return sg;
};

// 替换input
// const replaceInput = (refVal: Ref<string | number>, input: HTMLInputElement) => {
//   const vInput = h(AntInput, {
//     modelValue: refVal,
//   });
//   input.replaceWith(vInput);
// };

// 激活普通字段
// export const setupNormalFields = (frmReactiveObj: UnwrapNestedRefs<Recordable>, mapAttrs: Recordable[]) => {
//   // 处理隐藏字段
//   const hiddenAttrs = mapAttrs.filter((attr) => attr.UIVisible == 0);
//   for (const hAttr of hiddenAttrs) {
//     document.getElementById();
//   }
// };
