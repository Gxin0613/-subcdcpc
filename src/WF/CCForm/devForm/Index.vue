<template>
  <Spin :spinning="loading" :tip="'载入表单中，请稍候...'">
    <div class="dev-form-container">
      <iframe v-if="oldDevFormUrl" :src="oldDevFormUrl" class="form-main" ref="devFormRef"></iframe>
      <!-- <ParseHTML v-if="ready" :data-model="dataModel" /> -->
    </div>
  </Spin>
</template>

<script setup lang="ts">
  import { onUnmounted, ref, shallowRef } from 'vue';
  import { Spin, message } from 'ant-design-vue';
  // import HttpHandler from '/@/utils/gener/HttpHandler';
  import { onMounted } from 'vue';
  import { bindVModel, createModel, replaceNormalWigets } from './devFormUtils';
  // import { AtPara } from '/@/bp/da/AtPara';
  import { getAppEnvConfig } from '/@/utils/env';
  import WebUser from '/@/bp/web/WebUser';
  import Events from '/@/utils/Events';
  // import ParseHTML from './ParseHTML';
  type FrmData = {
    Sys_MapData: Recordable[];
    Sys_MapAttr: Recordable[];
    MainTable: Recordable[];
  };
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    fieldReadonly: {
      type: Boolean,
      default: false,
    },
    frmReadonly: {
      type: Boolean,
      default: false,
    },
    frmData: {
      type: Object as PropType<FrmData>,
      default: () => ({}),
    },
    frmID: {
      type: String,
      default: '',
    },
    pageNo: {
      type: String,
      default: 'MyViewGener',
    },
  });
  const loading = ref(false);
  // const ready = ref(false);

  const oldDevFormUrl = ref('');

  const devFormRef = shallowRef<HTMLIFrameElement>();

  // 数据模型
  const dataModel = ref<Recordable>({});

  // 混合
  const hydration = (htmlSegment: string, model: Recordable) => {
    const keys = Object.keys(model);
    for (const key of keys) {
      htmlSegment = bindVModel(htmlSegment, key);
    }
    return htmlSegment;
  };

  // 创建html模板
  const createTpl = (htmlSegment: string) => {
    // 替换为vue组件
    htmlSegment = replaceNormalWigets(htmlSegment);
    // const model = createModel(props.frmData.Sys_MapAttr);
    const model = createModel(props.frmData.Sys_MapAttr.filter((attr) => attr.UIVisible != 0));
    console.log({ model });
    dataModel.value = model;
    const dp = new DOMParser();
    const devFormDOM = dp.parseFromString(htmlSegment, 'text/html');

    console.log(devFormDOM.body.children);

    htmlSegment = hydration(htmlSegment, model);
    const templateEl = document.getElementById('form-html-content');
    if (templateEl) templateEl.remove();
    const tpl = document.createElement('template');
    tpl.id = 'form-html-content';
    tpl.innerHTML = htmlSegment;
    tpl.style.display = 'none';
    document.body.appendChild(tpl);
  };

  const handleDevFormEvent = (ev) => {
    const { type, row, evtType } = ev.data;
    if (type === 'dev-form-save') {
      Events.emit('devFormSave', {
        frmID: props.frmID,
        rowData: row,
        type: evtType,
      });
      return;
    }
  };
  const regeditEvt = () => {
    window.addEventListener('message', handleDevFormEvent);
    const dfWindow = devFormRef.value?.contentWindow;
    if (!dfWindow) return;
    Events.on('getDevFormData', ({ type }) => {
      if (type === 'Save') dfWindow.postMessage({ type: 'save-dev-form' }, '*');
      if (type === 'send') dfWindow.postMessage({ type: 'send-dev-form' }, '*');
    });
  };

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  // 初始化
  const initDevForm = async () => {
    // http://localhost:56146/WF/MyFlowGener.htm?WorkID=1396173429&NodeID=1301&FK_Node=1301&FID=0&UserNo=admin&Token=7327335c-89ea-4579-971c-e4de5896e523&FK_Flow=013
    // const frmData = unref(props.frmData);
    // const formId = frmData?.Sys_MapData?.[0]?.No;
    // if (!formId) {
    //   message.error('出现异常，未能获取到表单id');
    //   return;
    // }
    // const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_DevelopDesigner');
    // handler.AddPara('FK_MapData', formId);
    // const devFormBody = await handler.DoMethodReturnString('Designer_Init');
    // const paraField = new AtPara(frmData.Sys_MapData?.[0]?.AtPara);
    // const htmlSegment = handleFormVersion(devFormBody, formId, paraField.GetValStrByKey('MainFrmID'));
    // createTpl(htmlSegment);
    // ready.value = true;
    const token = WebUser.Token;
    let prefix = VITE_GLOB_API_URL;
    if (!prefix.endsWith('/')) {
      prefix += '/';
    }
    oldDevFormUrl.value = `${prefix}WF/${props.pageNo}.htm?Token=${token}&hideToolbar=1&embedded=1&${new URLSearchParams(props.params).toString()}`;
    setTimeout(() => {
      regeditEvt();
    }, 16);
  };

  onUnmounted(() => {
    Events.off('getDevFormData');
    window.removeEventListener('message', handleDevFormEvent);
  });

  onMounted(async () => {
    try {
      loading.value = true;
      await initDevForm();
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loading.value = false;
    }
  });
</script>

<style lang="less" scoped>
  .dev-form-container {
    width: 100%;
    height: calc(100vh - 100px);
    background-color: white;
    overflow-y: hidden;
    box-sizing: border-box;
    .form-main {
      border: none;
      width: 100%;
      height: 100%;
    }
  }
</style>
