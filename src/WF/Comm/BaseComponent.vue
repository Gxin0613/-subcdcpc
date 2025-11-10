<template>
  <div class="base-component-wrapper" ref="baseComponentWrapper">
    <slot v-if="contentVisible"></slot>
    <component
      v-if="replaceCompInfo.visible"
      :is="replaceCompInfo.component"
      :params="replaceCompInfo.params"
      @trigger-close="resetReplaceComp"
      @update-title="(title: string) => (replaceCompInfo.title = title)"
    />
    <iframe v-if="replaceIframeInfo.visible" :src="replaceIframeInfo.src" style="width: 100%; height: 100%; border: none"></iframe>
    <Drawer v-model:open="drawerInfo.visible" :title="drawerInfo.title" :width="drawerInfo.width" @close="resetDrawer" :body-style="bodyStyle">
      <component
        v-if="drawerInfo.visible"
        :is="drawerInfo.component"
        v-bind="drawerInfo.bindAttrs"
        :params="drawerInfo.params"
        :in-drawer="true"
        @trigger-close="resetDrawer"
        @update-title="(title: string) => (drawerInfo.title = title)"
      />
    </Drawer>
    <Drawer
      v-if="iframeInfo.openType === IframeOpenType.drawer"
      v-model:open="iframeInfo.visible"
      :title="iframeInfo.title"
      :width="iframeInfo.width"
      @close="resetIframe"
      :body-style="bodyStyle"
    >
      <iframe v-if="iframeInfo.visible" :src="iframeInfo.src" style="width: 100%; height: 100%; border: none" ref="iframeRef"></iframe>
    </Drawer>
    <Modal
      v-if="iframeInfo.openType === IframeOpenType.modal"
      v-model:open="iframeInfo.visible"
      :title="iframeInfo.title"
      :width="iframeInfo.width"
      :height="iframeInfo.height"
      @close="resetIframe"
      :body-style="bodyStyleModal"
      :footer="null"
    >
      <iframe v-if="iframeInfo.visible" :src="iframeInfo.src" style="width: 100%; height: 100%; border: none"></iframe>
    </Modal>
    <Modal
      v-model:open="modalInfo.visible"
      :width="modalInfo.width"
      :height="modalInfo.height"
      :footer="modalInfo.showFooter"
      :title="modalInfo.title"
      :wrap-class-name="modalInfo.fullScreen ? 'full-modal' : ''"
      :body-style="bodyStyleModal"
      :header-style="{ padding: '0' }"
      @ok="modalInfo.visible = false"
      @cancel="resetModal"
      @close="resetModal"
      destroyOnClose
      centered
    >
      <div v-if="!!modalInfo.info && modalInfo.visible" v-html="modalInfo.info"></div>
      <component v-if="modalInfo.visible" v-bind="modalInfo.params" :is="modalInfo.component" @close="resetModal" :params="modalInfo.params" @trigger-close="resetModal" />
    </Modal>

    <Modal
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
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { Drawer, message, Modal } from 'ant-design-vue';
  import { computed, markRaw, reactive, ref, shallowRef } from 'vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { windowOpen } from '/@/utils/windowOpen';
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import { useThirdPartUrl } from '/@/hooks/url/useThirdPartUrl';
  import { useRoute, useRouter } from 'vue-router';
  import Events from '/@/utils/Events';
  import { useCacheIframe } from '/@/hooks/iframe/useCacheIframe';
  import { usePostMessage } from '/@/hooks/message/usePostMessage';

  const router = useRouter();
  const route = useRoute();

  const emit = defineEmits(['editClosed', 'close-self']);
  const contentVisible = ref(true);

  const baseComponentWrapper = shallowRef();
  interface OpenLayerArgs {
    title: string;
    component: any;
    params: Recordable;
    bindAttrs?: Recordable;
    showFooter: boolean;
    width?: string;
    height?: string;
    fullScreen?: boolean;
    useCache?: boolean;
    info?: string;
    closeFunc?: Function;
  }

  // fix bug for ts5.0+
  const bodyStyle = computed(() => {
    return {
      padding: '0',
      backgroundColor: '#f2f5f7',
    };
  });
  const bodyStyleModal = computed(() => ({
    padding: '0',
    backgroundColor: '#f2f5f7',
    minHeight: '600px',
    height: '600px',
    overflowY: 'auto',
  }));

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
    height: '400px',
    src: '',
    openType: IframeOpenType.drawer,
  });
  const replaceIframeInfo = reactive({
    title: '',
    visible: false,
    width: '70%',
    height: '400px',
    src: '',
    openType: IframeOpenType.drawer,
  });
  // 弹窗信息
  const modalInfo = reactive<Recordable>({
    title: '',
    visible: false,
    component: {},
    params: {},
    showFooter: true,
    width: '800px',
    height: 'auto',
    fullScreen: false,
    info: '',
    closeFunc: undefined,
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

  const { getComponentParamsByUrl } = useComponentLoader();
  // const componentLoader = useCachedComponentLoader();

  const openDrawer = (args: Partial<OpenLayerArgs>) => {
    const { title, width, component, params, bindAttrs } = args;
    drawerInfo.title = title || ' ';
    drawerInfo.params = params || {};
    drawerInfo.width = width || '70%';
    drawerInfo.bindAttrs = bindAttrs || {};
    drawerInfo.component = component || {};
    drawerInfo.visible = true;
  };

  const replaceContent = (args: Partial<OpenLayerArgs>) => {
    const { title, width, component, params } = args;
    replaceCompInfo.title = title || ' ';
    replaceCompInfo.params = params || {};
    replaceCompInfo.width = width || '70%';
    replaceCompInfo.component = component || {};
    replaceCompInfo.visible = true;
  };

  const openDrawerByUrl = (title: string, url: string, width: string, params: Nullable<Recordable> = null) => {
    drawerInfo.component = markRaw(useCachedComponentLoader(url));
    drawerInfo.title = title;
    drawerInfo.width = width || '70%';
    drawerInfo.params = params || getComponentParamsByUrl(url) || {};
    drawerInfo.visible = true;
  };

  const resetDrawer = async () => {
    drawerInfo.visible = false;
    drawerInfo.title = ' ';
    drawerInfo.params = {};
    drawerInfo.width = '70%';
    drawerInfo.component = {};
    if (typeof props.closeDrawerFunc === 'function') await props.closeDrawerFunc();
  };

  const resetReplaceComp = async () => {
    replaceCompInfo.visible = false;
    replaceCompInfo.title = ' ';
    replaceCompInfo.params = {};
    replaceCompInfo.width = '70%';
    replaceCompInfo.component = {};
    if (typeof props.closeDrawerFunc === 'function') await props.closeDrawerFunc();
  };

  const openModal = (args: OpenLayerArgs) => {
    const { title, component, params, showFooter = true, closeFunc, width = '1000px', height = 'auto', fullScreen = false, info = '' } = args;
    modalInfo.title = title || ' ';
    modalInfo.params = params || {};
    modalInfo.component = component || {};
    modalInfo.showFooter = showFooter;
    modalInfo.width = width;
    modalInfo.height = height;
    modalInfo.fullScreen = fullScreen;
    modalInfo.visible = true;
    modalInfo.info = info;
    modalInfo.closeFunc = closeFunc;
  };

  const resetModal = async () => {
    modalInfo.visible = false;
    modalInfo.title = '';
    modalInfo.component = {};
    modalInfo.params = {};
    modalInfo.showFooter = true;
    modalInfo.width = '800px';
    if (typeof props.closeModalFunc === 'function') await props.closeModalFunc();
    if (typeof modalInfo.closeFunc == 'function') {
      await modalInfo.closeFunc();
      modalInfo.closeFunc = undefined;
    }
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

  // iframe
  let callbackFunc: Function | null = null;

  const listener = async (evt: any) => {
    if (callbackFunc) {
      const res = await callbackFunc(evt);
      if (res instanceof GPNReturnObj) {
        handleGPNCallback(res);
      }
    }
  };
  const iframeRef = shallowRef<HTMLIFrameElement>();

  const openIframe = async (args: Recordable) => {
    const { title, width, src, openType = IframeOpenType.drawer, msgListener, postMsg, useCache = false } = args;
    if (useCache) {
      const { loadUrl, setSize, getIframe } = useCacheIframe({ clickWrapperClose: true });
      const iframe = getIframe();
      loadUrl(src);
      const rectInfo = baseComponentWrapper.value?.getBoundingClientRect() || { width: 0, height: 0 };
      setSize(rectInfo);
      setTimeout(() => {
        // 添加对iframe内部事件的处理
        if (msgListener && iframe) {
          iframe.addEventListener('load', () => {
            callbackFunc = msgListener;
            window.removeEventListener('message', listener);
            window.addEventListener('message', listener);
            if (postMsg) {
              iframe?.contentWindow?.postMessage?.(postMsg.data, postMsg.origin);
            }
          });
          if (postMsg) {
            iframe?.contentWindow?.postMessage?.(postMsg.data, postMsg.origin);
          }
        }
      }, 16);
    } else {
      iframeInfo.title = title || ' ';
      iframeInfo.width = width || '70%';
      iframeInfo.src = src;
      iframeInfo.openType = openType;
      iframeInfo.visible = true;
      setTimeout(() => {
        // 添加对iframe内部事件的处理
        if (msgListener && iframeRef.value) {
          iframeRef.value.addEventListener('load', () => {
            callbackFunc = msgListener;
            window.addEventListener('message', listener);
            if (postMsg) {
              iframeRef.value?.contentWindow?.postMessage?.(postMsg.data, postMsg.origin);
            }
          });
        }
      }, 16);
    }
  };

  const resetIframe = async () => {
    iframeInfo.visible = false;
    iframeInfo.src = '';
    iframeInfo.title = '';
    iframeInfo.width = '70%';
    if (typeof props.closeDrawerFunc === 'function') await props.closeDrawerFunc();
    if (callbackFunc) {
      window.removeEventListener('message', listener);
      callbackFunc = null;
    }
  };
  // end

  // 通过url打开弹窗
  const openModalByUrl = (title: string, url: string, params: Nullable<Recordable> = null, width = '1000px', height = '700px') => {
    modalInfo.component = markRaw(useCachedComponentLoader(url));
    modalInfo.title = title;
    modalInfo.width = width;
    modalInfo.height = height;
    modalInfo.params = params || getComponentParamsByUrl(url) || {};
    modalInfo.visible = true;
  };

  const openModalByUrl1 = (title: string, url: string, width = '800px') => {
    modalInfo.component = markRaw(useCachedComponentLoader(url));
    modalInfo.title = title;
    modalInfo.params = getComponentParamsByUrl(url) || {};
    modalInfo.params['isComponent'] = true;
    modalInfo.visible = true;
    modalInfo.width = width;
  };

  // 返回值定义的宽度
  const GPNDefWidth = {
    // iframe宽度
    [GPNReturnType.OpenIframeByDrawer100]: '100%',
    [GPNReturnType.OpenIframeByDrawer90]: '90%',
    [GPNReturnType.OpenIframeByDrawer75]: '75%',
    [GPNReturnType.OpenIframeByDrawer30]: '30%',
    [GPNReturnType.OpenIframeByDrawer40]: '40%',
    [GPNReturnType.OpenIframeByDrawer50]: '50%',
    [GPNReturnType.OpenIframeByDrawer60]: '60%',
    [GPNReturnType.OpenIframeByDrawer]: '60%',
    // 普通组件宽度
    [GPNReturnType.OpenUrlByDrawer90]: '90%',
    [GPNReturnType.OpenUrlByDrawer75]: '75%',
    [GPNReturnType.OpenUrlByDrawer30]: '30%',
    [GPNReturnType.OpenUrlByDrawer40]: '40%',
    [GPNReturnType.OpenUrlByDrawer50]: '50%',
    [GPNReturnType.OpenUrlByDrawer60]: '60%',
    [GPNReturnType.OpenUrlByDrawer]: '60%',
    [GPNReturnType.OpenUrlByDrawer100]: '100%',
    [GPNReturnType.OpenIframeByCache]: '100%',
  };

  const handleGPNCallback = (result: GPNReturnObj, title = '') => {
    const { getValidHashUrl } = useThirdPartUrl();
    if (!title) title = result.title;
    const msgListener = result.messageListener;
    const postMsg = result.postMsg;
    switch (result.ReturnType) {
      case GPNReturnType.Message:
        message.info(result.data);
        break;
      case GPNReturnType.Error:
        message.error(result.data);
        break;
      case GPNReturnType.GoToUrl: //转到url.
        {
          const url = getValidHashUrl(result.data);
          window.location.replace(url);
        }
        break;
      case GPNReturnType.Close: //关闭.
        emit('close-self');
        resetIframe();
        resetDrawer();
        resetModal();
        break;
      case GPNReturnType.CloseAndReload: //关闭并重载
        emit('close-self');
        contentVisible.value = false;
        setTimeout(() => {
          contentVisible.value = true;
          if (typeof props.updateFunc === 'function') props.updateFunc();
        }, 16);
        break;
      case GPNReturnType.Reload: //刷新
        contentVisible.value = false;
        setTimeout(() => {
          contentVisible.value = true;
          if (typeof props.updateFunc === 'function') props.updateFunc();
        }, 16);
        break;
      case GPNReturnType.OpenIframeByCache: //静态iframe
      case GPNReturnType.OpenIframeByDrawer:
      case GPNReturnType.OpenIframeByDrawer90:
      case GPNReturnType.OpenIframeByDrawer40:
      case GPNReturnType.OpenIframeByDrawer50:
      case GPNReturnType.OpenIframeByDrawer60:
      case GPNReturnType.OpenIframeByDrawer75:
      case GPNReturnType.OpenIframeByDrawer30:
      case GPNReturnType.OpenIframeByDrawer100:
        {
          const url = getValidHashUrl(result.data);
          if (url.includes('.vue')) {
            message.error('此链接仅可通过OpenUrlByDrawer 打开，请检查配置');
            return;
          }
          openIframe({
            title: title,
            width: GPNDefWidth[result.ReturnType],
            src: getValidHashUrl(result.data),
            openType: IframeOpenType.drawer,
            msgListener,
            postMsg,
            useCache: result.ReturnType === GPNReturnType.OpenIframeByCache,
          });
        }
        break;
      case GPNReturnType.OpenIframeByModal:
        openIframe({
          title: title,
          width: GPNDefWidth[result.ReturnType],
          src: getValidHashUrl(result.data),
          openType: IframeOpenType.modal,
          msgListener,
          postMsg,
        });
        break;

      case GPNReturnType.OpenUrlByDrawer:
      case GPNReturnType.OpenUrlByDrawer90:
      case GPNReturnType.OpenUrlByDrawer75:
      case GPNReturnType.OpenUrlByDrawer30:
      case GPNReturnType.OpenUrlByDrawer40:
      case GPNReturnType.OpenUrlByDrawer50:
      case GPNReturnType.OpenUrlByDrawer60:
      case GPNReturnType.OpenUrlByDrawer100:
        {
          if (result.data.startsWith('/#/')) {
            iframeInfo.src = getValidHashUrl(result.data);
            iframeInfo.title = title;
            iframeInfo.visible = true;
            return;
          }
          const param = result.data.split('?');
          if (param.length > 1) {
            if (!!result.title) title = result.title;
            const compName = param[0].endsWith('.vue') ? param[0] : param[0] + '.vue';
            openDrawer({
              title: title,
              width: GPNDefWidth[result.ReturnType],
              params: getComponentParamsByUrl(result.data.substring(5)),
              component: markRaw(useCachedComponentLoader(compName)),
            });
          }
        }
        break;
      case GPNReturnType.Replace:
        {
          contentVisible.value = false;
          if (result.data.startsWith('/#/')) {
            replaceIframeInfo.src = getValidHashUrl(result.data);
            replaceIframeInfo.title = title;
            replaceIframeInfo.visible = true;
            return;
          }

          const param = result.data.split('?');
          if (param.length > 1) {
            const compName = param[0].endsWith('.vue') ? param[0] : param[0] + '.vue';
            replaceContent({
              title: title,
              width: GPNDefWidth[result.ReturnType],
              params: getComponentParamsByUrl(result.data.substring(5)),
              component: markRaw(useCachedComponentLoader(compName)),
            });
          }
        }
        break;
      case GPNReturnType.OpenUrlByModal:
        {
          const param = result.data.split('?');
          if (param.length <= 1) {
            return;
          }
          const compName = param[0].endsWith('.vue') ? param[0] : param[0] + '.vue';
          openModal({
            title: title,
            width: GPNDefWidth[result.ReturnType],
            params: getComponentParamsByUrl(result.data.substring(5)),
            component: markRaw(useCachedComponentLoader(compName)),
            showFooter: false,
          });
        }
        break;
      case GPNReturnType.OpenCompByModal:
        openModal({
          title,
          params: result.data.params,
          component: markRaw(useCachedComponentLoader(result.data.compUrl)),
          showFooter: false,
          width: result.data.width,
          height: result.data.height,
          closeFunc: result.data.closeFunc,
        });
        break;
      case GPNReturnType.OpenUrlByModalFull:
        {
          const param = result.data.split('?');
          if (param.length > 1) {
            const compName = param[0].endsWith('.vue') ? param[0] : param[0] + '.vue';
            openModal({
              title: title,
              params: getComponentParamsByUrl(result.data.substring(5)),
              component: markRaw(useCachedComponentLoader(compName)),
              showFooter: false,
              width: '100%',
              height: '100vh',
              fullScreen: true,
            });
          }
        }
        break;
      case GPNReturnType.OpenUrlByNewWindow: //新窗口打开
        windowOpen(result.data);
        break;
      case GPNReturnType.Update:
        if (typeof props.updateFunc === 'function') props.updateFunc();
        break;
      case GPNReturnType.OpenUrlByTab:
        const path = route.fullPath;
        if (path.startsWith('/Middle/') || path.startsWith('/wf/')) {
          Events.emit('middleware_open_tab', {
            path: 'TabWrapper',
            query: {
              url: result.data,
              title: title,
            },
          });
        } else {
          router.push({
            path: '/WF/Comm/TabWrapper',
            query: {
              url: encodeURIComponent(result.data),
              title: title,
            },
          });
        }

        break;
      case GPNReturnType.DoNothing:
        break;
      case GPNReturnType.OpenTextByModal:
        openModal({
          title: title,
          params: {},
          component: null,
          showFooter: false,
          width: '80%',
          height: '80%',
          fullScreen: false,
          info: result.data,
        });
        break;
      default:
        message.warning('类型:' + result.ReturnType + '还未解析');
        break;
    }
  };
  const handleGloCloseEvt = (e) => {
    if (e.data === 'close-outer') {
      iframeInfo.visible = false;
      drawerInfo.visible = false;
      modalInfo.visible = false;
      replaceCompInfo.visible = false;
      if (typeof props.updateFunc === 'function') props.updateFunc();
      else if (typeof props.closeModalFunc === 'function') props.closeModalFunc();
    }
  };
  usePostMessage(handleGloCloseEvt);
  defineExpose({
    openModal,
    openModalByUrl,
    openModalByUrl1,
    openDrawer,
    openIframe,
    openDrawerByUrl,
    previewImg,
    handleGPNCallback,
    resetModal,
    resetIframe,
  });
</script>

<style lang="less" scoped>
  .base-component-wrapper {
    width: 100%;
    height: 100%;
    :deep(.ant-modal-content) {
      padding: 0;
    }
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
      height: calc(100vh);
    }

    .ant-modal-body {
      flex: 1;
    }
  }
</style>
