<template>
  <div class="p-2">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <MyDictToolbar v-if="buttonList.length > 0" :button-list="buttonList" :params="params" />
        <Card class="input-card">
          <FrmFool v-if="formData" ref="formRef" :frm-data="formData" :is-readonly="isReadonly" :params="params" />
        </Card>
        <Modal
          v-model:open="modal.modalVisible"
          centered
          :closable="modal.closable"
          :title="modal.modalTitle"
          :width="modal.modalWidth"
          :body-style="modal.modalHeight"
          :footer="null"
          destroy-on-close
          @cancel="modalClose"
        >
          <div v-if="modal.modalType.includes('Packup')" style="width: 100%; height: 100%">
            <div v-if="IsHtmlPage" style="width: 100%; height: 100%">
              <iframe :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
            </div>
            <div v-if="IsPdfPage" style="width: 100%; height: 100%">
              <Card style="width: 100%; height: 100%">
                <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
                <ul>
                  <li>{{ 'pdf在线打印与预览' }}</li>
                  <li>系统把整个表单生成了一个pdf文件.</li>
                  <li
                    >{{ '点击这里' }}<a :href="URL" target="_blank">{{ '进行下载与在线预览' }}</a></li
                  >
                </ul>
                <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
              </Card>
            </div>
            <div v-if="IsZipPage" style="width: 100%; height: 100%">
              <Card style="width: 100%; height: 100%">
                <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
                <ul>
                  <li>{{ 'zip在线打印与预览' }}</li>
                  <li>系统把整个表单生成了一个zip文件,这个文件里包括了,表单的附件，二维码等信息.</li>
                  <li
                    >{{ '点击这里' }}<a :href="URL" target="_blank">{{ '进行打包下载' }}</a></li
                  >
                </ul>
                <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
              </Card>
            </div>
          </div>
          <div v-else-if="modal.modalType === 'PrintDoc'" style="width: 100%; height: 100%">
            <Card style="width: 100%; height: 100%">
              <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
              <ul>
                <li>{{ '单据打印' }}</li>
                <li
                  >{{ '点击这里' }}<a :href="URL" download>{{ '进行单据下载' }}</a></li
                >
              </ul>
              <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
            </Card>
          </div>
        </Modal>
      </template>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { MyDictToolbar } from '/@/components/SearchComponent';
  import { createVNode, reactive, ref, shallowRef, toRaw } from 'vue';
  import { Card, message, Spin, Modal, Button } from 'ant-design-vue';
  import { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import { FrmDictBtn } from './FrmDictBtn';
  import { userCCBillSelfLoader } from '/@/DataUser/OverrideFiles/CCBill_MyDict';
  import { getAppEnvConfig } from '/@/utils/env';
  import { usePackUp } from '/@/CCFast/CCBill/hooks/usePackup';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';

  // import { ToolbarBtn } from './Template/ToolBarBtn';

  const emit = defineEmits(['trigger-close', 'trigger-update']);
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const buttonStyle: Recordable = {
    marginRight: '12px',
  };

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    printType: {
      type: String,
      default: '',
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isFramework: {
      type: Boolean,
      default: false,
    },
  });
  console.log('mydict props', props);
  const { beforeSave, beforeDelete } = userCCBillSelfLoader(props.params);
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
    content: '',
  });
  //打印
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;
  const PrintType = ref();
  const URL = ref();
  const IsHtmlPage = ref(false);
  const IsPdfPage = ref(false);
  const IsZipPage = ref(false);
  //打印单据
  const PrintDocData = ref();

  const originalProps = toRaw(props.params);

  const formRef = shallowRef<InstanceType<typeof FrmFool>>();
  enum EventType {
    New = 'New',
    Save = 'Save',
    Delete = 'Delete',
    FilingDone = 'FilingDone',
    FilingUn = 'FilingUn',
    PrintPDF = 'PrintPDF',
    PrintHtml = 'PrintHtml',
    PrintRTF = 'PrintRTF',
    PrintCCWord = 'PrintCCWord',
    PrintZip = 'PrintZip',
    SaveNew = 'SaveNew',
  }
  const pageData = reactive<Recordable>({});
  const isReadonly = ref(false);
  const dataPrint = ref();
  const InitPageParam = () => {
    pageData.FK_Flow = getParams('FK_Flow');
    pageData.FK_Node = getParams('FK_Node') || 0;
    pageData.FID = !!getParams('FID') ? getParams('FID') : 0;
    if (!!getParams('WorkID') && getParams('WorkID') != 'undefined') pageData.OID = getParams('WorkID');
    else pageData.OID = getParams('OID') || 0;
    // pageData.OID = oid;
    pageData.WorkID = pageData.OID;
    pageData.Paras = getParams('Paras');
    pageData.IsReadonly = getParams('IsReadonly');
    pageData.IsStartFlow = getParams('IsStartFlow');
    pageData.FK_MapData = getParams('FK_MapData');
    pageData.FrmID = getParams('FrmID');
    isReadonly.value = pageData.IsReadonly === '' ? false : pageData.IsReadonly;
  };

  const createNew = async () => {
    formData.value = undefined;
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddJson(originalProps);
    originalProps['WorkID'] = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
    setTimeout(() => {
      InitDict();
    }, 50);
  };

  const handleButtonClick = async (type: EventType, btnName) => {
    try {
      if (type === EventType.New) {
        await createNew();
        return;
      }
      if (type === EventType.Save) {
        const rowData = await formRef.value?.VerifyFormData(false);
        const valid = await beforeSave(rowData, getParams('FrmID'), getParams('WorkID'));
        if (!valid) {
          return;
        }
        if (rowData == null) return false;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        const keys = Object.keys(rowData);
        handler.AddJson(originalProps);
        for (const key of keys) {
          handler.AddPara(key, rowData[key]);
        }
        try {
          const msg = await handler.DoMethodReturnString('MyDict_SaveIt');
          message.success(msg);
          emit('trigger-update');
        } catch (e) {
          console.error(e);
        }
        formData.value = undefined;
        setTimeout(() => {
          InitDict();
        }, 100);
        return;
      }
      if (type === EventType.SaveNew) {
        const rowData = await formRef.value?.VerifyFormData(false);
        const valid = await beforeSave(rowData, getParams('FrmID'), getParams('No'));
        if (!valid) {
          return;
        }
        if (rowData == null) return false;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        const keys = Object.keys(rowData);
        handler.AddJson(originalProps);
        for (const key of keys) {
          handler.AddPara(key, rowData[key]);
        }
        try {
          const msg = await handler.DoMethodReturnString('MyDict_SaveIt');
          message.success(msg);
          emit('trigger-update');
        } catch (e) {
          console.error(e);
        }
        formData.value = undefined;
        await createNew();
        //await InitDict();

        return;
      }
      //归档.
      if (type === EventType.FilingDone) {
        setTimeout(async () => {
          //归档前执行保存
          {
            const rowData = await formRef.value?.VerifyFormData(false);

            if (rowData == null) return false;
            const handler = new HttpHandler('BP.CCBill.WF_CCBill');
            const keys = Object.keys(rowData);
            handler.AddJson(originalProps);
            for (const key of keys) {
              handler.AddPara(key, rowData[key]);
            }

            try {
              const msg = await handler.DoMethodReturnString('MyDict_SaveIt');
              message.success(msg);
            } catch (e) {
              alert(e);
              console.log(e);
              return;
            }
          }
          const handler = new HttpHandler('BP.CCBill.WF_CCBill');
          handler.AddPara('FrmID', getParams('FrmID'));
          handler.AddPara('WorkID', getParams('WorkID'));
          const msg = await handler.DoMethodReturnString('MyDict_FilingDone');
          message.success(msg);
          emit('trigger-close');
        }, 10);
        return;
      }
      //撤销归档.
      if (type === EventType.FilingUn) {
        setTimeout(async () => {
          const handler = new HttpHandler('BP.CCBill.WF_CCBill');
          handler.AddPara('FrmID', getParams('FrmID'));
          handler.AddPara('WorkID', getParams('WorkID'));
          const msg = await handler.DoMethodReturnString('MyDict_FilingDoneUn');
          message.success(msg);
          emit('trigger-close');
          //  emit('trigger-update');
        }, 10);
        return;
      }
      if (type === EventType.Delete) {
        Modal.confirm({
          content: '您确定要删除吗',
          icon: createVNode(ExclamationCircleOutlined),
          okText: '确定',
          onOk() {
            setTimeout(async () => {
              const handler = new HttpHandler('BP.CCBill.WF_CCBill');
              handler.AddPara('FrmID', getParams('FrmID'));
              handler.AddPara('WorkID', getParams('WorkID'));
              const msg = await handler.DoMethodReturnString('MyDict_Delete');
              message.success(msg);
              emit('trigger-close');
            }, 10);
            emit('trigger-close');
            return;
          },
          cancelText: '取消',
          onCancel() {
            Modal.destroyAll();
          },
        });
      }
      if (type == EventType.PrintPDF || type == EventType.PrintHtml || type == EventType.PrintZip) {
        PrintType.value = type.startsWith('Print') ? type.replace('Print', '') : type.replace('Exp', '');
        const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handlers.AddPara('FrmID', getParams('FrmID'));
        handlers.AddPara('SourceType', 'Bill');
        if (!!getParams('WorkID') && getParams('WorkID') != 'undefined') handlers.AddPara('WorkID', getParams('WorkID'));
        else handlers.AddPara('WorkID', getParams('OID'));
        handlers.AddPara('BasePath', basePath);
        const dataPackup: any = await handlers.DoMethodReturnString('Packup_Init');
        PrintType.value = PrintType.value.toLowerCase();
        if (PrintType.value == 'html') {
          PrintType.value = 'htm';
        }
        if (Array.isArray(dataPackup) && dataPackup.length > 0) {
          let url = dataPackup.find((item) => item.No === PrintType.value)?.Name;
          const startIndex = url.indexOf('/DataUser/');
          const relativePath = url.substring(startIndex);
          url = basePath + '/' + relativePath;
          if (!!url) {
            window.open(url);
          } else {
            message.error('未找到zip文件, 原始数据为:' + JSON.stringify(dataPackup));
          }
          return;
        }
        if (dataPackup.indexOf('info@') == 0) {
          usePackUp(modalShow, dataPackup, URL, IsHtmlPage, IsPdfPage, IsZipPage, PrintType, dataPrint, basePath);
        }
        return;
      }
      if (type == EventType.PrintRTF || type == EventType.PrintCCWord) {
        try {
          const handlerDoc = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
          handlerDoc.AddPara('FrmID', getParams('FrmID'));
          handlerDoc.AddPara('SourceType', 'Bill');
          handlerDoc.AddPara('WorkID', getParams('WorkID'));
          const dataPrintDoc: any = await handlerDoc.DoMethodReturnJson('PrintDoc_Init');
          PrintDocData.value = dataPrintDoc;
          //如果是一个url.
          if (PrintDocData.value.indexOf('file@') == 0) {
            PrintDocData.value = PrintDocData.value.replace('file@', '');
            if (PrintDocData.value.indexOf('rtf@') != -1 || PrintDocData.value.indexOf('pdf@') != -1) {
              //直接执行打印
              PrintDocData.value = PrintDocData.value.replace('rtf@', '');
              URL.value = basePath + '/' + PrintDocData.value;
              window.location.href = URL.value;
              modalShow('PrintDoc', '打印单据');
            } else {
              message.info('其他类型还未解析');
            }
            return;
          }
          if (entityWG.value != null) {
            const rowData = await formRef.value?.VerifyFormData(true);
            entityWG.value?.BtnClick('EntityToolbar', btnName, '', rowData);
          }
        } catch (err: any) {
          message.error(err);
        }
      }
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  const buttonList = ref<ToolbarButtonDef[]>([]);
  const route = useRoute();
  const getParams = (name: string) => route.query[name] || originalProps[name] || '';

  const SaveExists = ref<Boolean>(false);
  const NewExists = ref<Boolean>(false);
  const InitToolbar = async () => {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', getParams('FrmID'));
    handler.AddPara('IsReadonly', getParams('IsReadonly'));
    if (!!getParams('WorkID') && getParams('WorkID') != 'undefined') handler.AddPara('WorkID', getParams('WorkID'));
    else handler.AddPara('WorkID', getParams('OID'));
    handler.AddPara('IsMobile', 0);
    const refNo = getParams('RefNo');
    if (refNo) {
      handler.AddPara('No', refNo);
    }
    // 0=空白,1=草稿,2=编辑中,3=归档.
    const data = await handler.DoMethodReturnJson('MyDict_ToolBarInit');
    let dictState = data.BillState;
    if (dictState == '100') dictState = '3';
    if (data.WFState == 3) dictState = '3';

    const frmBtn = new FrmDictBtn(getParams('FrmID'));
    await frmBtn.RetrieveFromDBSources();
    frmBtn.NewEnable = data.NewEnable; //新建.
    frmBtn.SaveEnable = data.SaveEnable; //新建.
    frmBtn.DeleteEnable = data.DeleteEnable; //新建.
    frmBtn.FilingDoneEnable = data.FilingDoneEnable; //新建.
    frmBtn.FilingUnEnable = data.FilingUnEnable; //新建.

    const keys = Object.keys(Object.fromEntries(frmBtn.Row));
    const btnLabs = keys.filter((key) => key.endsWith('Lab'));
    const btnKeys = btnLabs.map((lab) => lab.replace('Lab', ''));
    const btnList: Array<Recordable> = [];
    for (const authKey of btnKeys) {
      if (frmBtn[authKey + 'Enable'] == 1) {
        if (authKey == 'New') {
          NewExists.value = true;
        } else if (authKey == 'Save') {
          SaveExists.value = true;
        }
        btnList.push({ BtnID: authKey, BtnLab: frmBtn[authKey + 'Lab'] });
      }
    }
    // if (NewExists.value && SaveExists.value) {
    //   btnList.push({ BtnID: 'SaveNew', BtnLab: '保存并新建' });
    // }
    if (frmBtn.SaveEnable == 0) {
      isReadonly.value = true;
    }

    buttonList.value = btnList.map((button) => {
      return {
        type: 'primary',
        key: button.BtnID,
        name: button.BtnLab,
        shape: 'default',
        isDanger: button.BtnID.toLowerCase() === 'delete',
        isGhost: true,
        style: buttonStyle,
        onClick: () => {
          handleButtonClick(button.BtnID, button.BtnLab);
        },
      };
    });
  };
  const formData = ref<Recordable>();
  const GetFormData = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    delete originalProps.EnsName;
    delete originalProps.RefPKVal;
    delete originalProps.Title;
    delete originalProps.Name;
    delete originalProps.title;
    handler.AddJson(originalProps);
    handler.AddJson(pageData);
    handler.AddPara('FrmID', originalProps.EnsName || getParams('FrmID'));
    handler.AddPara('PageType', 'Vue3');
    const data = await handler.DoMethodReturnJson('FrmGener_Init');
    formData.value = data;
  };

  //打开弹窗
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
    };
  };
  //关闭弹窗
  const modalClose = async () => {
    modal.modalVisible = false;
    IsHtmlPage.value = false;
    IsPdfPage.value = false;
    IsZipPage.value = false;
  };
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>(null);
  const InitDict = async () => {
    try {
      loading.value = true;
      // 初始化页面参数
      InitPageParam();

      // 初始化工具栏
      // await setPrintBtn(type.value);
      await InitToolbar();
      await GetFormData();
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + pageData.FrmID);
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };

  InitDict();
</script>

<style lang="less" scoped>
  .input-card {
    // margin-top: 10px;
    :deep(.ant-card-body) {
      padding: 8px 24px 24px;
    }
    :deep(.ant-card-head) {
      background-color: #f9f9f9;
    }
  }
  .title {
    font-size: 16px;
  }

  .group-title {
    font-size: 14px;
  }
</style>
