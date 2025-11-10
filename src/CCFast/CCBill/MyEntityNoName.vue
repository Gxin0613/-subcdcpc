<template>
  <BaseComponent ref="baseComp">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: #f2f5f7">
        <div :style="isFixedbar ? toolbarStyle : ''" style="margin-bottom: 12px">
          <MyDictToolbar
            v-if="buttonList.length > 0 && ready"
            :button-list="buttonList"
            :params="{ ...params1, RefPKVal: params.No }"
            :key="loadkey"
            :EntityState="entitySate"
            @open-single-page="openSinglePage"
          />
        </div>
        <div class="content wrapper" :style="isFixedbar ? { paddingTop: '0px' } : ''">
          <FrmFool v-if="formData && mapData.FrmType == 0" ref="formRef" :frm-data="formData" :is-readonly="isReadonly" :params="{ ...params1, RefPKVal: params.No }" />
          <ChartFrm v-if="formData && mapData.FrmType == 10" :frmData="formData" ref="ChartFrmRef" :is-readonly="isReadonly" :params="{ ...params1, RefPKVal: params.No }" />
        </div>
        <!--        <Card class="input-card" :style="isFixedbar ? { paddingTop: '35px' } : ''">
        </Card>-->
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
      </div>
    </Spin>
  </BaseComponent>
</template>
<script setup lang="ts">
  import { MyDictToolbar } from '/@/components/SearchComponent';
  import { computed, createVNode, reactive, ref, shallowRef, toRaw } from 'vue';
  import { Card, message, Spin, Modal, Button } from 'ant-design-vue';
  import { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import { FrmDictBtn } from './FrmDictBtn';
  import { userCCBillSelfLoader } from '/@/DataUser/OverrideFiles/CCBill_MyDict';
  import { getAppEnvConfig } from '/@/utils/env';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import ChartFrm from '/@/WF/CCForm/ChartFrm.vue';
  import { MySetting } from '/@/WF/Comm/Setting/MySetting';
  import WebUser from '/@/bp/web/WebUser';

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
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
    isFixedbar: {
      type: Boolean,
      default: true,
    },
    menu: {
      type: Array,
      default: () => [],
    },
  });
  console.log('mydict props', props);
  const isFixedbar = ref(props.params?.isFixedbar || props?.isFixedbar || true);
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

  const toolbarStyle = computed(() => {
    // const Menu = props.menu;
    // const setWidth = Array.isArray(Menu) && Menu.length > 0 ? '58%' : '70%';
    return { width: '100%', backgroundColor: '#fff' };
  });
  const entitySate = ref(0);
  const formRef = shallowRef<InstanceType<typeof FrmFool>>();
  const ChartFrmRef = shallowRef<InstanceType<typeof ChartFrm>>();
  const loadkey = ref(1);
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
    PrintTemplate = 'PrintTemplate',
    ExpZip = 'ExpZip',
    SaveNew = 'SaveNew',
    WaiGua = 'WaiGua',
  }
  const pageData = reactive<Recordable>({});
  const isReadonly = ref(false);
  const dataPrint = ref();
  const InitPageParam = () => {
    pageData.FlowNo = getParams('FlowNo');
    pageData.NodeID = getParams('NodeID') || 0;
    pageData.FID = !!getParams('FID') ? getParams('FID') : 0;
    if (!!getParams('No') && getParams('No') != 'undefined') pageData.No = getParams('No');
    else pageData.No = getParams('No') || 0;
    // pageData.No = No;
    pageData.No = pageData.No;
    pageData.RefPKVal = pageData.No;
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
    originalProps['No'] = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
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
        if (entityWG.value != null) {
          const valid = await entityWG.value?.SaveBefore(rowData);
          if (!valid) {
            return;
          }
        }
        if (mapData.FrmType === 10) {
          await ChartFrmRef.value.Save();
          const handler = new HttpHandler('BP.CCBill.WF_CCBill');
          handler.AddJson(originalProps);
          const msg = await handler.DoMethodReturnString('MyEntityNoName_SaveIt');
          message.success(msg);
          return;
        }

        const valid = await beforeSave(rowData, getParams('FrmID'), getParams('No'));
        if (!valid) {
          return;
        }
        if (rowData == null) return false;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        const keys = Object.keys(rowData);
        handler.AddJson(originalProps);
        for (const key of keys) {
          handler.AddPara(key, encodeURIComponent(rowData[key]));
        }
        try {
          const msg = await handler.DoMethodReturnString('MyEntityNoName_SaveIt');
          message.success(msg);
          //emit('trigger-update');
        } catch (e) {
          message.error(e);
          console.error(e);
        }
        if (entityWG.value != null) {
          entityWG.value?.SaveAfter(rowData);
        }
        setTimeout(() => {
          buttonList.value = [];
          InitToolbar();
        }, 100);
        return;
      }
      if (type === EventType.SaveNew) {
        let rowData = null;
        if (mapData.FrmType === 10) await ChartFrmRef.value.Save();
        else rowData = await formRef.value?.VerifyFormData(false);
        const valid = await beforeSave(rowData, getParams('FrmID'), getParams('No'));
        if (!valid) {
          return;
        }
        if (rowData == null && mapData.FrmType != 10) return false;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddJson(originalProps);
        if (rowData != null) {
          const keys = Object.keys(rowData);
          for (const key of keys) {
            handler.AddPara(key, encodeURIComponent(rowData[key]));
          }
        }
        try {
          const msg = await handler.DoMethodReturnString('MyEntityNoName_SaveIt');
          message.success(msg);
          emit('trigger-update');
        } catch (e) {
          console.error(e);
        }
        formData.value = undefined;
        buttonList.value = [];
        await InitDict();
        await createNew();
        return;
      }
      //归档.
      if (type === EventType.FilingDone) {
        //归档前执行保存
        let rowData = null;
        if (mapData.FrmType === 10) await ChartFrmRef.value.Save();
        else rowData = await formRef.value?.VerifyFormData(false);

        if (rowData == null && mapData.FrmType != 10) return false;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddJson(originalProps);
        if (rowData != null) {
          const keys = Object.keys(rowData);
          for (const key of keys) {
            handler.AddPara(key, encodeURIComponent(rowData[key]));
          }
        }
        try {
          await handler.DoMethodReturnString('MyEntityNoName_SaveIt');
          handler.Clear();
          handler.AddPara('FrmID', getParams('FrmID'));
          handler.AddPara('No', getParams('No'));
          const msg = await handler.DoMethodReturnString('MyEntityNoName_FilingDone');
          message.success(msg);
          setTimeout(async () => {
            buttonList.value = [];
            formData.value = undefined;
            isReadonly.value = true;
            params1.value.IsReadonly = 1;
            originalProps.IsReadonly = 1;
            await InitDict();
            loadkey.value++;
          }, 100);
        } catch (e) {
          alert(e);
          console.log(e);
          return;
        }
        return;
      }
      //撤销归档.
      if (type === EventType.FilingUn) {
        setTimeout(async () => {
          const handler = new HttpHandler('BP.CCBill.WF_CCBill');
          handler.AddPara('FrmID', getParams('FrmID'));
          handler.AddPara('No', getParams('No'));
          const msg = await handler.DoMethodReturnString('MyEntityNoName_FilingDoneUn');
          message.success(msg);
          //emit('trigger-close');
          setTimeout(async () => {
            buttonList.value = [];
            formData.value = undefined;
            const mySetting = new MySetting(WebUser.No);
            await mySetting.RetrieveFromDBSources();
            if (mySetting.FrmStyle == '5') {
              isReadonly.value = true;
              params1.value.IsReadonly = 1;
              originalProps.IsReadonly = 1;
            } else {
              isReadonly.value = false;
              params1.value.IsReadonly = 0;
              originalProps.IsReadonly = 0;
            }
            await InitDict();
            loadkey.value++;
          }, 100);
          //  emit('trigger-update');
        }, 10);
        return;
      }
      if (type === EventType.Delete) {
        // Modal.confirm({
        //   content: `您确定要删除吗`,
        //   icon: createVNode(ExclamationCircleOutlined),
        //   okText: '确定',
        //   onOk() {
        setTimeout(async () => {
          try {
            const handler = new HttpHandler('BP.CCBill.WF_CCBill');
            handler.AddPara('FrmID', getParams('FrmID'));
            handler.AddPara('No', getParams('No'));
            const msg = await handler.DoMethodReturnString('MyEntityNoName_Delete');
            message.success(msg);
            emit('trigger-close');
          } catch (e) {
            message.error(e as string);
          }
        }, 10);
        //emit('trigger-close');
        return;
        // },
        // cancelText: '取消',
        // onCancel() {
        //   Modal.destroyAll();
        // },
        // });
      }
      if (type == EventType.PrintPDF || type == EventType.PrintHtml || type == EventType.PrintZip) {
        PrintType.value = type.startsWith('Print') ? type.replace('Print', '') : type.replace('Exp', '');
        const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handlers.AddPara('FrmID', getParams('FrmID'));
        handlers.AddPara('SourceType', 'EntityNoName');
        if (!!getParams('No') && getParams('No') != 'undefined') handlers.AddPara('No', getParams('No'));
        else handlers.AddPara('No', getParams('No'));
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
          dataPrint.value = JSON.parse(dataPackup.replace('info@', ''));
          dataPrint.value.forEach((item) => {
            // item.Name = item.Name.replace(basePath + '/', '');
            if (PrintType.value == 'Html') {
              PrintType.value = 'htm';
            }
            if (PrintType.value == item.No && item.No == 'htm') {
              IsHtmlPage.value = true;
              URL.value = basePath + '/' + item.Name;
              modalShow('Packup', '打印');
              return;
            } else if (PrintType.value.toLowerCase() == item.No && item.No == 'pdf') {
              IsPdfPage.value = true;
              URL.value = basePath + '/' + item.Name;
              window.open(basePath + '/' + item.Name);
              modalShow('Packup', '打印');
              return;
            } else if (PrintType.value.toLowerCase() == item.No && item.No == 'zip') {
              IsZipPage.value = true;
              URL.value = item.Name;
              window.location.href = item.Name;
              modalShow('Packup', '打印');
              return;
            }
          });
        }
        return;
      }
      if (type == EventType.PrintTemplate) {
        const url = GloComm.UrlGenerList('GL_Printer', '&WorkID=' + getParams('No') + '&FrmID=' + getParams('FrmID'));
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
        return;
      }
      if (type == EventType.PrintRTF || type == EventType.PrintCCWord) {
        try {
          const handlerDoc = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
          handlerDoc.AddPara('FrmID', getParams('FrmID'));
          handlerDoc.AddPara('SourceType', 'EntityNoName');
          handlerDoc.AddPara('No', getParams('No'));
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
        } catch (err: any) {
          message.error(err);
        }
        return;
      }
      if (entityWG.value != null && type === 'WaiGua') {
        const rowData = await formRef.value?.VerifyFormData(true);
        const result = entityWG.value?.BtnClick('EntityToolbar', btnName, '', rowData);
        if (!!result && result?.hasOwnProperty?.('ReturnType')) baseComp.value?.handleGPNCallback(result);
        return;
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
  const params1 = ref(props.params);
  delete params1.value.PKVal;
  const ready = ref(false);
  const InitToolbar = async () => {
    try {
      //  debugger;
      ready.value = false;
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('FrmID', originalProps.FrmID || getParams('FrmID'));
      handler.AddPara('IsReadonly', getParams('IsReadonly'));
      const no = getParams('RefNo');
      handler.AddPara('No', no);
      handler.AddPara('RefNo', no);
      handler.AddPara('IsMobile', 0);
      // 0=空白,1=草稿,2=编辑中,3=归档.
      const data = await handler.DoMethodReturnJson('MyDict_ToolBarInit');
      let dictState = data.EntityState;
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
            // NewExists.value = true;
            NewExists.value = false;
            continue;
          } else if (authKey == 'Save') {
            SaveExists.value = true;
          }
          btnList.push({ BtnID: authKey, BtnLab: frmBtn[authKey + 'Lab'] });
        }
      }
      // if (NewExists.value && SaveExists.value) {
      //   btnList.push({ BtnID: 'SaveNew', BtnLab: '保存并新建' });
      // }
      if (entityWG.value != null) {
        const btns = entityWG.value?.EntityToolbarBtns;
        if (!!btns) {
          btns.split(',').forEach((item) => {
            btnList.push({
              BtnID: 'WaiGua',
              BtnLab: item,
            });
          });
        }
      }

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
      if (parseInt(dictState || 0) != 0) {
        handler.AddPara('IsMyBillToolBar', 1);
        const methods = (await handler.DoMethodReturnJson('MyBill_Methods')) || [];
        methods.forEach((method) => {
          buttonList.value.push({
            type: 'primary',
            key: method.No,
            name: method.Name,
            shape: 'default',
            isDanger: false,
            isGhost: true,
            style: buttonStyle,
            onClick: async () => {
              try {
                const frmID = getParams('FrmID');
                const handler = new HttpHandler('BP.CCBill.WF_CCBill');
                handler.AddPara('WorkID', getParams('RefNo'));
                handler.AddPara('RefNo', getParams('RefNo')); //有可能是实体编号.
                handler.AddPara('FrmID', frmID);
                handler.AddPara('MethodNo', method.No); //方法ID.
                let data = (await handler.DoMethodReturnString('MyDict_DoFlowEtc_StartFlow')) as string;
                if (data.includes('err@') == true) {
                  message.error(data);
                  return;
                }

                data = '/#/WF' + data;
                data = data.replace('../', '/');
                data = data.replace('.htm', '');
                baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, data));
              } catch (e) {
                message.error(e as string);
              }
            },
          });
        });
      }
      ready.value = true;
    } catch (e) {
      message.error(e);
    } finally {
      ready.value = true;
    }
  };
  const formData = ref<Recordable>();
  const GetFormData = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    delete originalProps.EnsName;
    delete originalProps.RefPKVal;
    delete originalProps.Title;
    delete originalProps.Name;
    delete originalProps.title;
    delete originalProps.No;
    delete pageData.No;
    delete pageData.RefPKVal;
    originalProps.No = originalProps.RefNo;
    handler.AddJson(pageData);
    handler.AddJson(originalProps);
    handler.AddPara('FrmID', originalProps.EnsName || originalProps.FrmID || getParams('FrmID'));
    handler.AddPara('PageType', 'Vue3');
    const data = await handler.DoMethodReturnJson('FrmGener_Init_ForEntityNoName');
    formData.value = data;
    entitySate.value = data['MainTable'][0].EntityState;
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
  let mapData = new MapData();

  const openSinglePage = () => {
    const url = `/src/WF/Comm/PanelGroup.vue?EnName=PG_Group2Method&RefPKVal=No&PKVal=${originalProps.FrmID || getParams('FrmID')}&RefMainEnName=TS.CCBill.FrmEntityNoName`;
    baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '单记录设计'));
  };

  const InitDict = async () => {
    try {
      loading.value = true;
      // 初始化页面参数
      InitPageParam();
      mapData.No = pageData.FrmID;
      mapData.FrmType = mapData.FrmType === 8 ? 0 : mapData.FrmType;
      await mapData.Retrieve();
      // 初始化工具栏
      // await setPrintBtn(type.value);
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + pageData.FrmID);
      if (!!entityWG.value) {
        entityWG.value.mapData = mapData;
        entityWG.value.params = props.params;
      }
      await GetFormData();
      await InitToolbar();
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
  .p-2 {
    padding-top: 0;
  }
  .frm-cont {
    padding-top: 35px;
  }
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
  .wrapper {
    margin: 0 auto;
    padding-left: 24px;
    padding-right: 24px;
    height: auto;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    border-radius: 5px;
  }
</style>
