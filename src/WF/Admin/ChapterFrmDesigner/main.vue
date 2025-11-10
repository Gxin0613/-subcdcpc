<template>
  <n-spin :show="loading">
    <template #description>{{ loadingDesc }}</template>
    <div class="page" v-if="hasQuery">
      <section class="main">
        <!-- <components-bar /> -->
        <ChapterLog />
        <ChapterDesignBody />
        <attr-side-bar />
      </section>
    </div>
    <div class="fs-error" v-else>{{ '缺少表单必要参数，请检查' }}</div>
    <Drawer
      v-model:open="designerStore.professionSettingVisible"
      @close="changeDrawerVisible"
      :body-style="{
        padding: 0,
      }"
      width="70%"
      :title="designerStore.professionSettingTitle"
    >
      <template v-if="designerStore.professionSettingVisible">
        <GroupPageNew v-if="designerStore.professionSettingType === 'GPN'" :params="enParams" />
        <En v-else :params="enParams" />
      </template>
    </Drawer>
  </n-spin>
</template>

<script lang="ts" setup>
  import { useDesignerStore } from '/@/store/modules/form';
  import AttrSideBar from '/@form/components/design/AttrSideBar.vue';
  import ChapterLog from './components/ChapterLog.vue';
  import ChapterDesignBody from '/@/WF/Admin/ChapterFrmDesigner/components/ChapterDesignBody.vue';
  import { NSpin, useDialog, useMessage } from 'naive-ui';
  import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
  import Designer from '/@form/dto/Designer';
  import { syncFieldProps, syncGroupProps } from '../FoolFormDesigner/props/type-utils/FormTypeUtils';
  import Event from '/@/utils/Events';
  import useValidator from '/@form/hooks/useValidator';
  import { useRoute } from 'vue-router';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { MapAttr, GroupField } from '/@form/props/database/FormInfo';
  import En from '/@/WF/Comm/En.vue';
  import { Drawer } from 'ant-design-vue';
  import GroupPageNew from '../../Comm/UIEntity/GroupPageNew.vue';

  let isEntityEvent = false;
  let updateDtl = true;
  const hasQuery = ref(true);

  // 获取正确的url
  let formReady = false;
  const validator = useValidator();
  const changeDrawerVisible = async () => {
    if (isEntityEvent && updateDtl) {
      isEntityEvent = false;
      updateDtl = true;
      return;
    }
    if (formReady) {
      // 如果这条数据还在
      if (await designerStore.selectedWidgetDto?.RetrieveFromDBSources()) {
        // 如果是容器组件
        if (validator.isContainer(designerStore.selectedWidget?.category || '', designerStore.selectedWidget?.key || '')) {
          designerStore.selectedWidget = syncGroupProps(designerStore.selectedWidget!, designerStore.selectedWidgetDto?.getData() as GroupField, []);
          Event.emit('updateGroupField', designerStore.selectedWidget?.id);
          // 更新大文本
        } else if (designerStore.selectedWidget?.key === 'html') {
          Event.emit('updateHtml', designerStore.selectedWidget?.id);
          // 更新枚举值
        } else {
          designerStore.selectedWidget = syncFieldProps(designerStore.selectedWidget, designerStore.selectedWidgetDto?.getData() as MapAttr);
          Event.emit('updateEnums', designerStore.selectedWidget?.id);
        }
        // 数据消失，删除节点
      } else {
        Event.emit('deleteNode', designerStore.selectedWidget?.id);
      }
    }
  };

  const enParams = ref({});

  const designerStore = useDesignerStore();
  const editable = ref<boolean>(true);
  const customizePicList = import.meta.glob('./Img/**.*', { eager: true });
  const supportsUITypes = Object.keys(customizePicList).map((key) => key.replace('./Img/', '').replace('.png', ''));
  provide('editable', editable);
  provide('customizePicList', supportsUITypes);
  const message = useMessage();
  const loading = computed(() => designerStore.globalLoading);
  const loadingDesc = computed(() => designerStore.loadingDesc);
  const designInstance = new Designer();

  const route = useRoute();
  // const checkLogin = async () => {
  //   try {
  //     const token = route.query.Token + '';
  //     designerStore.userInfo = await webUserInit(token);
  //   } catch (e: any) {
  //     console.error(e);
  //     message.error(e);
  //   }
  // };

  const dialog = useDialog();
  const deleteConfirm = () => {
    dialog.destroyAll();
    if (!designerStore.selectedWidget) return;
    const title = designerStore.selectedWidget?.title;
    const dialogInstance = dialog.warning({
      title: '警告',
      content: `确定要删除组件 [ ${title} ] 吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        Event.emit('deleteNode', designerStore.selectedWidget?.id);
        dialogInstance.destroy();
      },
    });
  };

  // const initForm = async () => {
  //   const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
  //   const formId = route.query.FrmID || route.query.FrmID;
  //   handler.AddPara('FrmID', formId as string);
  //   await handler.DoMethodReturnString('Designer_CheckFrm');
  //   // window.location.reload();
  // };

  const initDesigner = async () => {
    try {
      if (Object.keys(route.query).length === 0) {
        message.error('缺少参数，请正确输入');
        hasQuery.value = false;
        return;
      }
      // await checkLogin();
      designerStore.globalLoading = true;
      await designInstance.Init();
    } catch (e: any) {
      message.error(e);
    } finally {
      designerStore.globalLoading = false;
      formReady = true;
    }
  };

  // const providedTheme: {
  //   [propsName: string]: any;
  // } = {};
  // const themeStore = useDesignerTheme();
  // 加载主题并全局提供
  // const loadTheme = async () => {
  //   try {
  //     const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_StyletDfine');
  //     const themeInfo = await handler.DoMethodReturnJson<Array<any>>('Default_GenerGloVars');
  //
  //     for (const theme of themeInfo) {
  //       const propObject: {
  //         [propsName: string]: any;
  //       } = {};
  //       theme.Val.split('@')
  //         .filter((item: string) => !!item)
  //         .forEach((style: string) => {
  //           const [key, val] = style.split('=');
  //           propObject[key] = val;
  //         });
  //       providedTheme[theme.No] = propObject;
  //     }
  //     themeStore.defineTheme = providedTheme;
  //   } catch (error) {
  //     message.error('解析主题失败，请检查');
  //   }
  // };

  watch(
    () => route.query,
    () => {
      window.location.reload();
    },
  );

  watch([() => designerStore.professionSettingUrl, () => designerStore.professionSettingVisible], ([url, visible]) => {
    if (url && visible) {
      enParams.value = getAllRequestParams(url);
    }
  });

  onMounted(() => {
    Event.on('reloadForm', async (updatedtl = true) => {
      isEntityEvent = true;
      updateDtl = updatedtl;
      await initDesigner();
    });
    Event.on('showErr', (msg) => {
      message.error(msg + '');
    });
    document.addEventListener('keydown', (evt) => {
      if (evt.code === 'Delete' && !!designerStore.selectedWidget) {
        deleteConfirm();
      }
    });
  });

  onUnmounted(() => {
    Event.off('reloadForm');
    Event.off('showErr');
    Event.off('deleteNode');
    document.removeEventListener('keydown', () => void 0);
  });

  // loadTheme();
  initDesigner();
</script>

<style lang="less" scoped>
  .fs-error {
    padding: 20px 30px;
    font-size: 20px;
    color: red;
  }

  .page {
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .main {
      flex: 1;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
    }
  }

  .iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
