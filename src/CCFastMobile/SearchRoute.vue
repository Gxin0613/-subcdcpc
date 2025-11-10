<template>
  <div class="base-component-wrapper">
    <component v-if="componentInfo.isComponent === true" :is="componentInfo.component" :params="componentInfo.params" />
    <iframe v-else :src="params.src" style="width: 100%; height: 100%; border: none"></iframe>
    <Popup v-model:show="drawerInfo.visible" position="right" :style="{ width: '100%', height: '100%' }" @close="resetDrawer">
      <component
        v-if="drawerInfo.visible"
        :is="drawerInfo.component"
        v-bind="drawerInfo.bindAttrs"
        :params="drawerInfo.params"
        @trigger-close="resetDrawer"
        @update-title="(title: string) => (drawerInfo.title = title)"
      />
    </Popup>
    <Popup
      v-if="iframeInfo.openType === IframeOpenType.drawer"
      v-model:open="iframeInfo.visible"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :title="iframeInfo.title"
      :width="iframeInfo.width"
      @close="resetIframe"
      :body-style="bodyStyle"
    >
      <iframe v-if="iframeInfo.visible" :src="iframeInfo.src" style="width: 100%; height: 100%; border: none"></iframe>
    </Popup>
    <Popup
      v-if="iframeInfo.openType === IframeOpenType.modal"
      v-model:show="iframeInfo.visible"
      :title="iframeInfo.title"
      :width="iframeInfo.width"
      :params="modalInfo.params"
      @close="resetIframe"
      :body-style="bodyStyleModal"
      :footer="null"
    >
      <iframe v-if="iframeInfo.visible" :src="iframeInfo.src" style="width: 100%; height: 100%; border: none"></iframe>
    </Popup>
    <Popup
      v-model:show="modalInfo.visible"
      :width="modalInfo.width"
      :height="modalInfo.height"
      :footer="modalInfo.showFooter"
      :title="modalInfo.title"
      :wrap-class-name="modalInfo.fullScreen ? 'full-modal' : ''"
      @ok="modalInfo.visible = false"
      @cancel="resetModal"
      @close="resetModal"
      destroyOnClose
      centered
    >
      <component v-if="modalInfo.visible" :is="modalInfo.component" @close="resetModal" :params="modalInfo.params" @trigger-close="resetModal" />
    </Popup>

    <Popup
      v-model:open="previewInfo.visible"
      :width="previewInfo.width"
      :footer="previewInfo.showFooter"
      :title="previewInfo.title"
      @ok="previewInfo.visible = false"
      @cancel="closePreview"
      @close="closePreview"
      destroyOnClose
      centered
    >
      <img v-if="previewInfo.visible" :src="previewInfo.url" :alt="previewInfo.title" :style="previewInfo.style" />
    </Popup>
  </div>
</template>

<script lang="ts" setup>
  import { Popup } from 'vant';
  import { computed, markRaw, reactive } from 'vue';
  import type { CSSProperties } from 'vue';
  import { useRoute } from 'vue-router';
  import MyEntityNoName from '/@/CCFastMobile/MyEntityNoName.vue';
  import MyBill from '/@/CCFastMobile/MyBill.vue';
  import MyDict from '/@/CCFastMobile/MyDict.vue';
  import MyDictFrameWork from '/@/CCFastMobile/MyDictFrameWork.vue';
  import FrmBBS from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue';
  import MyFlowGener from '/@/CCMobile/MyFlowGener.vue';
  const route = useRoute();

  //组件
  const componentInfo = reactive({
    component: {},
    params: {},
    isComponent: false,
  });
  const params = route.query;
  const InitPage = () => {
    if (!!params.component) {
      switch (params.component) {
        case 'MyEntityNoName':
          componentInfo.component = markRaw(MyEntityNoName);
          break;
        case 'MyBill':
          componentInfo.component = markRaw(MyBill);
          break;
        case 'MyDict':
          componentInfo.component = markRaw(MyDict);
          break;
        case 'MyDictFrameWork':
          componentInfo.component = markRaw(MyDictFrameWork);
          break;
        case 'FrmBBS':
          componentInfo.component = markRaw(FrmBBS);
          break;
        case 'MyFlowGener':
          componentInfo.component = markRaw(MyFlowGener);
      }
      componentInfo.params = params;
      delete componentInfo.params['component'];
      componentInfo.isComponent = true;
    }
  };
  InitPage();

  // fix bug for ts5.0+
  const bodyStyle = computed(
    (): CSSProperties & {
      padding: string;
      backgroundColor: string;
    } => ({
      padding: '0',
      backgroundColor: '#f2f5f7',
    }),
  );
  const bodyStyleModal = computed(
    (): CSSProperties & {
      padding: string;
      backgroundColor: string;
      minHeight: string;
      height: string;
    } => ({
      padding: '0',
      backgroundColor: '#f2f5f7',
      minHeight: '600px',
      height: '600px',
    }),
  );

  const props = defineProps({
    closeModalFunc: {
      type: Function,
      default: null,
    },
    closeDrawerFunc: {
      type: Function,
      default: null,
    },
    updateFunc: {
      type: Function,
      default: null,
    },
  });
  // 抽屉信息
  const drawerInfo = reactive({
    title: '',
    visible: false,
    width: '70%',
    component: {},
    bindAttrs: {},
    params: {},
  });
  enum IframeOpenType {
    modal,
    drawer,
  }
  // iframe 抽屉
  const iframeInfo = reactive({
    title: '',
    visible: false,
    width: '70%',
    src: '',
    openType: IframeOpenType.drawer,
  });

  // 弹窗信息
  const modalInfo = reactive({
    title: '',
    visible: false,
    component: {},
    params: {},
    showFooter: true,
    width: '800px',
    height: 'auto',
    fullScreen: false,
  });

  const defaultImgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const previewInfo = reactive({
    url: '',
    title: '',
    showFooter: false,
    visible: false,
    width: '600px',
    style: defaultImgStyle,
  });

  const replaceCompInfo = reactive({
    title: '',
    visible: false,
    width: '70%',
    component: {},
    params: {},
  });

  const resetDrawer = async () => {
    drawerInfo.visible = false;
    drawerInfo.title = ' ';
    drawerInfo.params = {};
    drawerInfo.width = '70%';
    drawerInfo.component = {};
    if (typeof props.closeDrawerFunc === 'function') await props.closeDrawerFunc();
  };

  const resetModal = async () => {
    modalInfo.visible = false;
    modalInfo.title = '';
    modalInfo.component = {};
    modalInfo.params = {};
    modalInfo.showFooter = true;
    modalInfo.width = '800px';
    if (typeof props.closeModalFunc === 'function') await props.closeModalFunc();
  };

  const previewImg = (fileName: string, url: string, modalWidth = '600px', style = defaultImgStyle) => {
    previewInfo.title = fileName || ' ';
    previewInfo.url = url;
    previewInfo.visible = true;
    previewInfo.showFooter = false;
    previewInfo.width = modalWidth;
    previewInfo.style = style;
  };

  const closePreview = () => {
    previewInfo.visible = false;
    previewInfo.title = ' ';
    previewInfo.url = '';
    previewInfo.showFooter = false;
    previewInfo.style = defaultImgStyle;
  };

  const resetIframe = async () => {
    iframeInfo.visible = false;
    iframeInfo.src = '';
    iframeInfo.title = '';
    iframeInfo.width = '70%';
    if (typeof props.closeDrawerFunc === 'function') await props.closeDrawerFunc();
  };

  defineExpose({
    previewImg,
    resetModal,
  });
</script>

<style lang="less" scoped>
  .base-component-wrapper {
    width: 100%;
    height: 100%;
  }

  .full-modal {
    .ant-modal {
      max-width: 100%;
      top: 0;
      padding-bottom: 0;
      margin: 0;
    }
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(var(--viewport-height));
    }
    .ant-modal-body {
      flex: 1;
    }
  }
</style>
