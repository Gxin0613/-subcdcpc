<template>
  <div class="gpe-entity-wrapper">
    <div class="top" v-if="activeObject">
      <!-- <Button type="primary" @click="openDrawer(activeObject)">{{'编辑属性'}}</Button> -->
      <component
        v-if="childComponent.visible"
        :is="childComponent.component"
        :EnName="childComponent.EnName"
        :PKVal="childComponent.PKVal"
        :params="childComponent.params"
        :no-save-button="noSaveButton"
        ref="compRef"
      />

      <!-- <Button style="margin-left: 12px" type="default" v-for="btn in methods" :key="btn.ClassMethod" @click="btnClick(btn)">{{ btn.Title }} </Button> -->
    </div>
  </div>

  <!--    右侧抽屉-->
  <drawer
    :bodyStyle="{
      padding: '0',
    }"
    v-model:open="rightDrawer.visible"
    :title="rightDrawer.title"
    width="1000px"
  >
    <component
      v-if="rightDrawer.visible"
      :is="rightDrawer.component"
      :EnName="rightDrawer.EnName"
      :PKVal="rightDrawer.PKVal"
      :params="rightDrawer.params"
      :no-save-button="noSaveButton"
    />
  </drawer>

  <!--  全屏模态弹窗  -->
  <!-- <modal v-model:open="fsModal.visible" :title="fsModal.title" @ok="resetFsModal" width="100%" wrapClassName="full-modal" centered>
    <div class="p-4">
      <component v-if="fsModal.visible" :is="loadComponent(fsModal.url)" :params="getAllRequestParams(getSubPagesUrl(fsModal.url))" />
    </div>
  </modal> -->
  <!--    模态弹窗-->
  <modal v-model:open="confirmModal.visible" :title="confirmModal.title" @ok="execConfirmMethod(confirmModal.confirmMethod, {})" @cancel="resetModal" centered>
    <div class="p-4">
      {{ confirmModal.content }}
    </div>
  </modal>
</template>

<script lang="ts" setup>
  import { Drawer, Modal, message } from 'ant-design-vue';
  import { getCurrentInstance, markRaw, onMounted, reactive, ref, toRaw } from 'vue';
  import { Page } from '/@/bp/UIEntity/Page';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { useRoute } from 'vue-router';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import { windowOpen } from '/@/utils/windowOpen';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';

  const props = defineProps({
    activeObject: {
      type: Object as PropType<Page>,
      default: () => {},
    },
    noSaveButton: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const classID = props.activeObject?.HisEntity?.classID as string;
  const route = useRoute();
  const methods = ref<Array<RefMethod>>([]);

  // 模态框属性,一般都是执行方法前的提示
  const confirmModal = reactive({
    visible: false,
    content: '',
    title: '',
    confirmMethod: '',
  });
  const resetModal = () => {
    confirmModal.confirmMethod = '';
    confirmModal.visible = false;
    confirmModal.content = '';
    confirmModal.title = '';
  };

  // const getSubPagesUrl = (url: string) => {
  //   const hasQuerySymbol = url.includes('?');
  //   return url + `${hasQuerySymbol ? '&' : '?'}EnClassID=${props.activeObject?.HisEntity?.classID}&PKVal=${route.query.PKVal}`;
  // };

  // 点击确定执行的方法
  const execConfirmMethod = async (methodName: string, args: any = {}) => {
    try {
      // 如果不是合法url，终止执行
      if (!methodName || methodName.includes('/')) {
        return;
      }
      // @ts-ignore
      const calledMethod = entity[methodName].bind(entity);
      if (!calledMethod) {
        return;
      }
      const res = await calledMethod(...Object.values(args));
      // 如果方法执行返回url地址
      if (res.startsWith('url@')) {
        // 这种方式默认打开在新的标签页
        windowOpen(res.replace('url@', ''));
        return;
      }
      resetModal();
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    } finally {
      resetModal();
    }
  };

  const rightDrawer = reactive({
    visible: false,
    EnName: '',
    PKVal: '',
    title: '',
    params: {},
    component: {},
  });

  const childComponent = reactive({
    visible: false,
    EnName: '',
    PKVal: '',
    title: '',
    params: {},
    component: {},
  });

  const EntityComponentPath = '/src/WF/Comm/EnOnly.vue';
  const defaultParams = {
    EnName: props.activeObject?.HisEntity?.classID,
    PKVal: route.query.PKVal,
  };

  const openDrawer = (obj: Page, path: string = EntityComponentPath, params: any = defaultParams) => {
    const { loadComponent } = useComponentLoader();
    const childEntity = toRaw(obj.HisEntity);
    rightDrawer.PKVal = childEntity?.PKVal || '';
    rightDrawer.EnName = childEntity?.classID || '';
    rightDrawer.title = obj.Name;
    rightDrawer.params = params;
    rightDrawer.component = markRaw(loadComponent(path));
    rightDrawer.visible = true;
  };

  const loadChildComponent = (obj: Page, path: string = EntityComponentPath, params: any = defaultParams) => {
    const { loadComponent } = useComponentLoader();
    const childEntity = toRaw(obj.HisEntity);
    const pkVal = childEntity?.PKVal || '';
    childComponent.PKVal = params.PKVal || pkVal;
    childComponent.EnName = childEntity?.classID || '';
    childComponent.title = obj.Name;
    childComponent.params = params;
    childComponent.component = markRaw(loadComponent(path));
    childComponent.visible = true;
  };

  const instance = getCurrentInstance();
  const Save = async () => {
    try {
      await instance?.refs['compRef']?.['enOnlySave']?.(false);
    } catch (e: any) {
      throw new Error(e.toString());
    }
  };
  // 全屏弹窗
  // const fsModal = reactive({
  //   visible: false,
  //   title: '',
  //   url: '',
  // });

  // const resetFsModal = () => {
  //   fsModal.visible = false;
  //   fsModal.title = '';
  //   fsModal.url = '';
  // };

  // const handleEvents = (btn: RefMethod) => {
  //   const url = btn?.ClassMethod as string;
  //   const args = getAllRequestParams(getSubPagesUrl(url));
  //   console.log({ args });
  //   openDrawer(props.activeObject, url, getAllRequestParams(getSubPagesUrl(url)));
  // };

  // const btnClick = async (btn: any) => {
  //   // 新窗口打开
  //   if (btn.RefMethodType === RefMethodType.LinkeWinOpen) {
  //     const allowedUrl = btn.ClassMethod.replace('/src/', '/').replace('.vue', '');
  //     windowOpen(allowedUrl, btn.Title);
  //     return;
  //   }

  //   // 模态框打开
  //   if (btn.RefMethodType === RefMethodType.LinkModel) {
  //     fsModal.visible = true;
  //     fsModal.url = btn.ClassMethod;
  //     fsModal.title = btn.Title;
  //     return;
  //   }

  //   if (btn.RefMethodType === RefMethodType.Func) {
  //     const attrs = btn.HisAttrs;
  //     if (Array.isArray(attrs) && attrs.length > 0) {
  //       await handleEvents(btn);
  //       return;
  //     }
  //     confirmModal.confirmMethod = btn.ClassMethod;
  //     confirmModal.visible = true;
  //     confirmModal.content = btn.Warning;
  //     confirmModal.title = btn.Title;
  //     return;
  //   }

  //   // 右侧抽屉打开
  //   if (btn.RefMethodType === RefMethodType.RightFrameOpen) {
  //     try {
  //       if (!btn.ClassMethod.includes('/')) {
  //         message.error('错误的组件url链接');
  //         return;
  //       }
  //       const url = getSubPagesUrl(btn.ClassMethod);
  //       const path = url.split('?')[0];
  //       rightDrawer.visible = true;
  //       rightDrawer.title = btn.Title;

  //       rightDrawer.component = markRaw(
  //         createAsyncComponent(() => import(/* @vite-ignore */ path), {
  //           loading: true,
  //         }),
  //       );

  //       rightDrawer.params = getAllRequestParams(url);
  //     } catch (e: any) {
  //       console.trace(e);
  //       message.error(e.toString());
  //     } finally {
  //     }
  //     return;
  //   }
  //   // 余下的包括 Dtl/TabOpen,直接从新标签页打开
  //   handleEvents(btn);
  // };

  onMounted(async () => {
    try {
      const entity = await ClassFactory.GetEn(classID);
      const pk = route.query.PKVal;
      if (entity) {
        entity.setPKVal(pk);
        await entity.Init();
        methods.value = entity._enMap.rms;
      } else {
        message.error(`没有获取到Entity,ClassID不存在 --- [${classID}]`);
      }
      if (props.activeObject) {
        loadChildComponent(props.activeObject, void 0, props.params);
      }
    } catch (e: any) {
      message.error(e.toString());
    }
  });

  defineExpose({
    openDrawer,
    Save,
  });
</script>

<style lang="less" scoped>
  .quick-op {
    margin-top: 20px;
    font-size: 18px;
    color: #333333;
  }
</style>
