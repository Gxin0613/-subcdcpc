import { reactive, Ref, ref, toRaw } from 'vue';
import { Page } from '/@/bp/UIEntity/Page';
import { PageModelNew } from '/@/bp/UIEntity/EnumLab';
import { StepTypes } from './typing';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { cloneDeep } from 'lodash-es';
import { SFDBSrcs } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { message } from 'ant-design-vue';
import { GetParamsUrl } from '/@/utils/gener/StringUtils';
import type { UploadFile } from 'ant-design-vue/es/upload/interface';
import { Entities } from '/@/bp/en/Entities';

async function loadTextSQLData(targetPage: Page, gpnInst: PageBaseGroupNew, textSQLState: { dbsrc: string; dbOptions: Recordable[]; sql: string }) {
  const dbSrcs = new SFDBSrcs();
  await dbSrcs.RetrieveAll();
  if (dbSrcs.length === 0) {
    textSQLState.dbOptions = [{ No: 'local', Name: '本机数据源' }];
    textSQLState.dbsrc = 'local';
  } else {
    textSQLState.dbOptions = dbSrcs.slice();
    textSQLState.dbsrc = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.Tag0 || dbSrcs[0]?.No || 'local';
  }
  textSQLState.sql = gpnInst.RequestVal('tb2', targetPage.No) || targetPage.DefaultVal || '';
}

function loadText1NameData(targetPage: Page, gpnInst: PageBaseGroupNew, tb1State: { name: string }) {
  tb1State.name = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.DefaultVal || '';
}

function loadText2NoNameData(targetPage: Page, gpnInst: PageBaseGroupNew, tb2State: { prefix: string; name: string; no: string }) {
  tb2State.prefix = targetPage.Tag0 || '';
  tb2State.name = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.DefaultVal || '';
  tb2State.no = gpnInst.RequestVal('tb2', targetPage.No) || tb2State.prefix || '';
}

function loadText2NameNoteData(targetPage: Page, gpnInst: PageBaseGroupNew, tb2NNState: { name: string; note: string }) {
  tb2NNState.name = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.Tag2 || '';
  tb2NNState.note = gpnInst.RequestVal('tb2', targetPage.No) || targetPage.Tag3 || '';
}

function loadText3NoNameNoteData(targetPage: Page, gpnInst: PageBaseGroupNew, tb3State: { prefix: string; name: string; no: string; pTable: string }) {
  tb3State.prefix = targetPage.Tag0 || '';
  tb3State.name = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.DefaultVal || '';
  tb3State.no = gpnInst.RequestVal('tb2', targetPage.No) || tb3State.prefix || '';
  tb3State.pTable = gpnInst.RequestVal('tb3', targetPage.No) || '';
}

function loadNameAndDDLData(targetPage: Page, gpnInst: PageBaseGroupNew, nameDDLState: { flowName: string; selectedValue: string; selectedLabel: string }) {
  nameDDLState.flowName = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.Tag1 || '';
  nameDDLState.selectedValue = gpnInst.RequestVal('tb2', targetPage.No) || '';
  nameDDLState.selectedLabel = '';
}

function loadSelectionData(targetPage: Page, gpnInst: PageBaseGroupNew, cacheSelectedRef: Ref<string>) {
  cacheSelectedRef.value = gpnInst.RequestVal('tb1', targetPage.No) || targetPage.Tag3 || '';
}

async function saveTextSQLData(
  currentPage: Page,
  activeType: string,
  textSQLState: { dbsrc: string; sql: string },
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  if (!textSQLState.sql) {
    message.error('请输入SQL语句');
    return Promise.reject(new Error('SQL statement is empty'));
  }
  saveTempDataFunc(currentPage.No, textSQLState.dbsrc, textSQLState.sql, '');
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, textSQLState.dbsrc, textSQLState.sql, '');
}

async function saveText1NameData(
  currentPage: Page,
  activeType: string,
  tb1State: { name: string },
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  const label = currentPage.Tag2 || '内容';

  const isRequired = !currentPage.Tag4;
  if (isRequired && !tb1State.name) {
    message.error(`请输入${label}`);
    return Promise.reject(new Error(`${label} is empty`));
  }
  saveTempDataFunc(currentPage.No, tb1State.name, '', '');
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, tb1State.name, '', '');
}

async function saveText2NoNameData(
  currentPage: Page,
  activeType: string,
  tb2State: { name: string; no: string },
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  const nameLabel = currentPage.Tag2 || '名称';
  const noLabel = currentPage.Tag1 || '编号';
  const isRequired = !currentPage.Tag4;
  if (isRequired && (!tb2State.name || !tb2State.no)) {
    message.error(`请输入${nameLabel}和${noLabel}`);
    return Promise.reject(new Error(`${nameLabel} or ${noLabel} is empty`));
  }
  saveTempDataFunc(currentPage.No, tb2State.name, tb2State.no, '');
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, tb2State.name, tb2State.no, '');
}

async function saveText2NameNoteData(
  currentPage: Page,
  activeType: string,
  tb2NNState: { name: string; note: string },
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  const nameLabel = currentPage.Tag2 || '名称';
  const noteLabel = currentPage.Tag3 || '备注';
  const isRequired = !currentPage.Tag4;
  if (isRequired && (!tb2NNState.name || !tb2NNState.note)) {
    message.error(`请输入${nameLabel}和${noteLabel}`);
    return Promise.reject(new Error(`${nameLabel} or ${noteLabel} is empty`));
  }
  saveTempDataFunc(currentPage.No, tb2NNState.name, tb2NNState.note, '');
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, tb2NNState.name, tb2NNState.note, '');
}

async function saveText3NoNameNoteData(
  currentPage: Page,
  activeType: string,
  tb3State: { name: string; no: string; pTable: string },
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  const nameLabel = currentPage.Tag2 || '名称';
  const noLabel = currentPage.Tag1 || '编号';
  const pTableLabel = currentPage.Tag3 || '物理表';
  const isRequired = !currentPage.Tag4;
  if (isRequired && (!tb3State.name || !tb3State.no || !tb3State.pTable)) {
    message.error(`请输入${nameLabel}、${noLabel}和${pTableLabel}`);
    return Promise.reject(new Error(`${nameLabel}, ${noLabel} or ${pTableLabel} is empty`));
  }
  saveTempDataFunc(currentPage.No, tb3State.name, tb3State.no, tb3State.pTable);
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, tb3State.name, tb3State.no, tb3State.pTable);
}

async function saveNameAndDDLData(
  currentPage: Page,
  activeType: string,
  nameDDLState: { flowName: string; selectedValue: string; selectedLabel: string },
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  const nameLabel = currentPage.Tag1 || '名称';
  const ddlLabel = currentPage.Tag2 || '选项';
  const isRequired = !currentPage.Tag4;
  if (isRequired && (!nameDDLState.flowName || !nameDDLState.selectedValue)) {
    message.error(`请输入${nameLabel}并选择${ddlLabel}`);
    return Promise.reject(new Error(`${nameLabel} or ${ddlLabel} is empty/not selected`));
  }
  saveTempDataFunc(currentPage.No, nameDDLState.flowName, nameDDLState.selectedValue, nameDDLState.selectedLabel);
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, nameDDLState.flowName, nameDDLState.selectedValue, nameDDLState.selectedLabel);
}

async function saveSelectionData(
  currentPage: Page,
  activeType: string,
  selectionComponentRef: Ref<any>,
  pageObj: PageBaseGroupNew,
  saveTempDataFunc: Function,
): Promise<GPNReturnObj | string | void> {
  if (!selectionComponentRef || !selectionComponentRef.value) {
    const errorMsg = `选择组件(${PageModelNew[currentPage.HisPageModelNew!]})引用无效`;
    console.error(errorMsg);
    message.error(errorMsg);
    return Promise.reject(new Error('Selection component ref is invalid'));
  }
  const checkedList = selectionComponentRef.value.checkedList;
  const checkedNames = selectionComponentRef.value.checkedNames;

  if (!Array.isArray(checkedList)) {
    const errorMsg = `选择组件(${PageModelNew[currentPage.HisPageModelNew!]})未提供有效的 checkedList`;
    console.error(errorMsg, selectionComponentRef.value);
    message.error(errorMsg);
    return Promise.reject(new Error('Invalid checkedList from selection component'));
  }
  const isRequired = !currentPage.Tag4;
  if (isRequired && checkedList.length === 0) {
    return Promise.reject(new Error('请至少选择一项'));
  }
  const tb1Val = checkedList.join(',');
  const tb2Val = Array.isArray(checkedNames) ? checkedNames.join(',') : '';
  saveTempDataFunc(currentPage.No, tb1Val, tb2Val, '');
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, tb1Val, tb2Val, '');
}

async function saveFileUploadData(currentPage: Page, activeType: string, fileList: Ref<UploadFile[]>, pageObj: PageBaseGroupNew): Promise<GPNReturnObj | string | void> {
  const isRequired = !currentPage.Tag4;
  if (isRequired && fileList.value.length === 0) {
    message.error('请上传模板文件.');
    return Promise.reject(new Error('No file uploaded'));
  }

  if (!isRequired && fileList.value.length === 0) {
    return Promise.resolve();
  }

  const file = fileList.value[0]?.originFileObj;
  if (!file) {
    message.error('获取上传文件失败.');
    return Promise.reject(new Error('Failed to get file'));
  }
  pageObj.setUploadFile(file as File);
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, '', '', '');
}

async function saveFolderUploadData(
  currentPage: Page,
  activeType: string,
  fileList: Ref<UploadFile[]>,
  folderName: Ref<string>,
  pageObj: PageBaseGroupNew,
): Promise<GPNReturnObj | string | void> {
  const isRequired = !currentPage.Tag4;
  if (isRequired && fileList.value.length === 0) {
    message.error('请上传文件夹.');
    return Promise.reject(new Error('No folder uploaded'));
  }
  if (isRequired && !folderName.value) {
    message.error('请填写文件夹名称.');
    return Promise.reject(new Error('Folder name is empty'));
  }

  if (!isRequired && fileList.value.length === 0) {
    return Promise.resolve();
  }

  if (fileList.value.length > 0 && !folderName.value && isRequired) {
    message.error('请填写文件夹名称.');
    return Promise.reject(new Error('Folder name is empty'));
  }

  pageObj.FolderArrName(folderName.value);
  const filesToUpload = fileList.value.map((f) => f.originFileObj).filter((f) => f instanceof File) as File[];
  if (isRequired && filesToUpload.length === 0 && fileList.value.length > 0) {
    message.error('未能提取有效文件进行上传');
    return Promise.reject(new Error('No valid files to upload'));
  }

  if (filesToUpload.length === 0 && isRequired) {
    return Promise.reject(new Error('No valid files to upload'));
  }

  pageObj.setUploadFileArr(filesToUpload);
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, folderName.value, '', '');
}

async function saveBlankData(currentPage: Page, activeType: string, pageObj: PageBaseGroupNew, saveTempDataFunc: Function): Promise<GPNReturnObj | string | void> {
  saveTempDataFunc(currentPage.No, '', '', '');
  return await pageObj.Save_TextBox_X(currentPage.No, activeType, '', '', '');
}

export function useStepFormModel(
  gpnInst: Ref<PageBaseGroupNew | undefined>,
  allStepPages: Ref<Array<Page>>,
  handleCallBackUrl: Function,
  emit: Function,
  params: Recordable,
  selectionRefs: {
    treeEns: Ref<any>;
    tree: Ref<any>;
    list: Ref<any>;
    groupList: Ref<any>;
    tableRef: Ref<any>;
  },
  fileUploadState: {
    fileList: Ref<UploadFile[]>;
    FolderName: Ref<string>;
  },
  customCompRef: Ref<any>,
) {
  const currentPage = ref<Page>();
  const currentStep = ref(0);
  const steps = ref<Array<StepTypes>>([]);
  const cacheSelectedData = ref<string>('');

  const tb1Value = reactive({ name: '' });
  const tb2Value = reactive({ prefix: '', name: '', no: '' });
  const tb2NameNote = reactive({ name: '', note: '' });
  const nameAndDDLValue = reactive({ flowName: '', selectedValue: '', selectedLabel: '' });
  const tb3Value = reactive({ prefix: '', name: '', no: '', pTable: '' });
  const textSQLVal = reactive<{ dbsrc: string; dbOptions: Recordable[]; sql: string }>({ dbsrc: '', dbOptions: [], sql: '' });

  const resetFormStates = () => {
    Object.assign(tb1Value, { name: '' });
    Object.assign(tb2Value, { prefix: '', name: '', no: '' });
    Object.assign(tb2NameNote, { name: '', note: '' });
    Object.assign(nameAndDDLValue, { flowName: '', selectedValue: '', selectedLabel: '' });
    Object.assign(tb3Value, { prefix: '', name: '', no: '', pTable: '' });
    Object.assign(textSQLVal, { dbsrc: '', dbOptions: [], sql: '' });
    cacheSelectedData.value = '';
    fileUploadState.fileList.value = [];
    fileUploadState.FolderName.value = '';
  };

  const _create = (page?: Page): Array<StepTypes> => {
    if (!page) {
      return [];
    }
    const finishPage = new Page();
    finishPage.HisPageModelNew = PageModelNew.Finish;
    finishPage.No = page.No + '.Finish';
    finishPage.Name = '完成';
    finishPage.GroupNo = page.GroupNo;

    const childPages = allStepPages.value.filter((item) => item.No.startsWith(page.No + '.'));

    if (childPages.length === 0) {
      return [
        { title: page.Name, page: page },
        { title: finishPage.Name, page: finishPage },
      ];
    }

    childPages.sort((a, b) => {
      const partsA = a.No.split('.').map(Number);
      const partsB = b.No.split('.').map(Number);
      const len = Math.max(partsA.length, partsB.length);
      for (let i = 1; i < len; i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;

        if (isNaN(numA) || isNaN(numB)) {
          const strA = String(partsA[i] || '');
          const strB = String(partsB[i] || '');
          if (strA !== strB) return strA.localeCompare(strB);
          continue;
        }
        if (numA !== numB) {
          return numA - numB;
        }
      }

      return partsA.length - partsB.length;
    });

    const result: Array<StepTypes> = [{ title: page.Name, page: page }];
    result.push(...childPages.map((step) => ({ title: step.Name, page: step })));
    result.push({ title: finishPage.Name, page: finishPage });

    return result;
  };

  const createStepForm = (page?: Page) => {
    steps.value = _create(page);
    currentStep.value = 0;
  };

  const loadPageData = async () => {
    resetFormStates();

    try {
      if (!gpnInst.value) {
        message.error('加载失败：实例丢失');
        return;
      }
      if (!steps.value || steps.value.length === 0 || currentStep.value >= steps.value.length) {
        console.error('无效的步骤状态:', { currentStep: currentStep.value, steps: steps.value });
        return;
      }
      const currentStepConfig = steps.value[currentStep.value];
      if (!currentStepConfig || !currentStepConfig.page) {
        console.error('当前步骤配置无效:', currentStepConfig);
        return;
      }

      const targetPage = cloneDeep(currentStepConfig.page) as Page;

      if (targetPage.HisPageModelNew === PageModelNew.Finish) {
        currentPage.value = targetPage as Page;
        return;
      }

      const textBasedPageModels = new Set([
        PageModelNew.TextUrl,
        PageModelNew.Textarea,
        PageModelNew.Text1Name,
        PageModelNew.Text2NoName,
        PageModelNew.Text2NameNote,
        PageModelNew.Text3NoNameNote,
      ]);
      const targetPrefixes = ['Port_', 'Flow_', 'Frm_', 'DBSrc_', 'DemoStudent_', 'App_', 'DBSrc.'];
      const dynamicFields = ['Tag0', 'Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5', 'Tag6', 'DefaultVal'];
      for await (const field of dynamicFields) {
        if (targetPage[field] instanceof Entities) {
          const ens = targetPage[field] as Entities;
          await ens.RetrieveAll();
          targetPage[field] = ens.toJSONString();
        }
        if (typeof targetPage[field] === 'function') {
          const func = targetPage[field].bind(gpnInst.value);
          targetPage[field] = await func();
        }
        const value = targetPage[field];
        if (!textBasedPageModels.has(targetPage.HisPageModelNew!) && typeof value === 'string') {
          if (targetPrefixes.some((prefix) => value.startsWith(prefix))) {
            const currentParams = toRaw(params);
            const paras = '@' + GetParamsUrl(currentParams).replaceAll('&', '@').replaceAll('.', '[。]');
            targetPage[field] = value + paras;
          }
        }
      }

      const currentMode = targetPage.HisPageModelNew!;
      switch (currentMode) {
        case PageModelNew.TextSQL:
          await loadTextSQLData(targetPage, gpnInst.value, textSQLVal);
          break;
        case PageModelNew.Text1Name:
        case PageModelNew.Textarea:
          loadText1NameData(targetPage, gpnInst.value, tb1Value);
          break;
        case PageModelNew.Text2NoName:
          loadText2NoNameData(targetPage, gpnInst.value, tb2Value);
          break;
        case PageModelNew.Text2NameNote:
          loadText2NameNoteData(targetPage, gpnInst.value, tb2NameNote);
          break;
        case PageModelNew.Text3NoNameNote:
          loadText3NoNameNoteData(targetPage, gpnInst.value, tb3Value);
          break;
        case PageModelNew.NameAndDDL:
          loadNameAndDDLData(targetPage, gpnInst.value, nameAndDDLValue);
          break;
        case PageModelNew.SelectItemsByTreeEns:
        case PageModelNew.SelectItemsByTree:
        case PageModelNew.SelectItemsByList:
        case PageModelNew.SelectItemsByGroupList:
        case PageModelNew.SelectItemsByTable:
          loadSelectionData(targetPage, gpnInst.value, cacheSelectedData);
          break;
        case PageModelNew.FileUpload:
        case PageModelNew.FolderUpload:
        case PageModelNew.Blank:
        case PageModelNew.SelfComponent:
        case PageModelNew.GoToUrl:
        case PageModelNew.Func:
          break;
        default:
      }

      currentPage.value = targetPage as Page;
    } catch (e: any) {
      console.error('loadPageData Error:', e);
      message.error(`加载步骤数据时出错: ${e.message || e.toString()}`);
    }
  };

  const afterFormCreate = async () => {
    if (!currentPage.value) {
      return;
    }
    if (!gpnInst.value) {
      console.error('gpnInst is undefined during afterFormCreate.');
      return;
    }
    const rawObj = toRaw<Page>(currentPage.value);
    emit('update-title', rawObj.Name);

    const currentMode = rawObj.HisPageModelNew;

    if (currentMode === PageModelNew.SelfComponent) {
      return;
    }
    if (currentMode === PageModelNew.GoToUrl) {
      if (!rawObj.BindFunction) {
        console.error('GoToUrl: BindFunction is empty.');
        message.error('跳转链接配置错误');
        return;
      }
      await handleCallBackUrl(new GPNReturnObj(GPNReturnType.GoToUrl, rawObj.BindFunction));
      return;
    }
    if (currentMode === PageModelNew.Func) {
      const funcName = rawObj.BindFunction;
      let func: Nullable<Function> = null;
      if (typeof funcName === 'string' && gpnInst.value && typeof gpnInst.value[funcName] === 'function') {
        func = gpnInst.value[funcName].bind(gpnInst.value) as Function;
      } else if (typeof funcName === 'function') {
        func = funcName.bind(gpnInst.value);
      }

      if (!func) {
        const errorMsg = `没有找到对应方法 ${typeof funcName === 'string' ? funcName : '提供的函数'}，请检查配置`;
        console.error(errorMsg);
        message.error(errorMsg);
        return;
      }
      try {
        const callback = await func();
        await handleCallBackUrl(callback);
      } catch (funcError: any) {
        const errorMsg = `执行方法 ${typeof funcName === 'string' ? funcName : '提供的函数'} 出错: ${funcError.message || funcError.toString()}`;
        console.error(errorMsg, funcError);
        message.error(errorMsg);
      }
      return;
    }
  };

  const saveCurrentStep = async (activeType: string): Promise<GPNReturnObj | string | void> => {
    if (!currentPage.value || !gpnInst.value) {
      message.error('无法保存：页面或实例丢失');
      return Promise.reject(new Error('Current page or gpnInst is missing'));
    }

    const currentMode = currentPage.value.HisPageModelNew;
    const page = currentPage.value;

    try {
      const boundSaveTempData = (pNo: string, tb1: string, tb2: string, tb3: string) => {
        if (!gpnInst.value) return;
        gpnInst.value.SetRequestVal('sortNo', activeType, pNo);
        saveTempData(pNo, tb1, tb2, tb3);
      };

      switch (currentMode) {
        case PageModelNew.FileUpload:
          return await saveFileUploadData(page, activeType, fileUploadState.fileList, gpnInst.value);
        case PageModelNew.FolderUpload:
          return await saveFolderUploadData(page, activeType, fileUploadState.fileList, fileUploadState.FolderName, gpnInst.value);
        case PageModelNew.SelfComponent:
          if (customCompRef && customCompRef.value && typeof customCompRef.value.Save === 'function') {
            return await customCompRef.value.Save();
          }
          return Promise.resolve();
        case PageModelNew.Blank:
          return await saveBlankData(page, activeType, gpnInst.value, boundSaveTempData);
        case PageModelNew.TextSQL:
          return await saveTextSQLData(page, activeType, textSQLVal, gpnInst.value, boundSaveTempData);
        case PageModelNew.Textarea:
        case PageModelNew.Text1Name:
          return await saveText1NameData(page, activeType, tb1Value, gpnInst.value, boundSaveTempData);
        case PageModelNew.Text2NoName:
          return await saveText2NoNameData(page, activeType, tb2Value, gpnInst.value, boundSaveTempData);
        case PageModelNew.Text2NameNote:
          return await saveText2NameNoteData(page, activeType, tb2NameNote, gpnInst.value, boundSaveTempData);
        case PageModelNew.NameAndDDL:
          return await saveNameAndDDLData(page, activeType, nameAndDDLValue, gpnInst.value, boundSaveTempData);
        case PageModelNew.Text3NoNameNote:
          return await saveText3NoNameNoteData(page, activeType, tb3Value, gpnInst.value, boundSaveTempData);

        case PageModelNew.SelectItemsByTreeEns:
          return await saveSelectionData(page, activeType, selectionRefs.treeEns, gpnInst.value, boundSaveTempData);
        case PageModelNew.SelectItemsByTree:
          return await saveSelectionData(page, activeType, selectionRefs.tree, gpnInst.value, boundSaveTempData);
        case PageModelNew.SelectItemsByList:
          return await saveSelectionData(page, activeType, selectionRefs.list, gpnInst.value, boundSaveTempData);
        case PageModelNew.SelectItemsByTable:
          return await saveSelectionData(page, activeType, selectionRefs.tableRef, gpnInst.value, boundSaveTempData);
        case PageModelNew.SelectItemsByGroupList:
          return await saveSelectionData(page, activeType, selectionRefs.groupList, gpnInst.value, boundSaveTempData);
        case PageModelNew.Finish:
          return Promise.resolve();
        case PageModelNew.GoToUrl:
        case PageModelNew.Func:
          return Promise.resolve();
        default:
          message.error(`未知的页面模式无法保存: ${currentMode}`);
          return Promise.reject(new Error(`Unhandled PageModelNew for saving: ${currentMode}`));
      }
    } catch (error: any) {
      console.error(`Error saving step ${page.No}:`, error.message || error);

      throw error;
    }
  };

  const saveTempData = (pageNo: string, tb1: string, tb2: string, tb3: string) => {
    if (!gpnInst.value) {
      console.error('保存中间态数据失败, GPNInstance不存在');
      return;
    }
    gpnInst.value.SetRequestVal('tb1', tb1, pageNo);
    gpnInst.value.SetRequestVal('tb2', tb2, pageNo);
    gpnInst.value.SetRequestVal('tb3', tb3, pageNo);
  };

  return {
    tb1Value,
    tb2Value,
    tb3Value,
    tb2NameNote,
    textSQLVal,
    nameAndDDLValue,
    currentPage,
    currentStep,
    steps,
    cacheSelectedData,
    createStepForm,
    loadPageData,
    afterFormCreate,
    saveCurrentStep,
    resetFormStates,
  };
}
