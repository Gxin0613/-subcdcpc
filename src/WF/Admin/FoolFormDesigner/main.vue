<template>
  <n-spin :show="loading">
    <template #description>{{ loadingDesc }}</template>
    <div class="page" v-if="hasQuery">
      <section class="main">
        <components-bar />
        <design-body />
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
  import ComponentsBar from '/@form/components/design/ComponentsBar.vue';
  import DesignBody from '/@form/components/design/DesignBody.vue';
  import { NSpin, useDialog, useMessage } from 'naive-ui';
  import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
  import Designer from '/@form/dto/Designer';
  import { syncFieldProps, syncGroupProps } from './props/type-utils/FormTypeUtils';
  import Event from '/@/utils/Events';
  import useValidator from '/@form/hooks/useValidator';
  import { useRoute } from 'vue-router';
  // import { webUserInit } from '/@form/api/FromApi';
  import { getAllRequestParams } from '/@/utils/request/decode';
  // import HttpHandler from '/@form/dto/HttpHandler';
  import { MapAttr, GroupField } from '/@form/props/database/FormInfo';
  import En from '/@/WF/Comm/En.vue';
  import { Drawer } from 'ant-design-vue';
  import GroupPageNew from '../../Comm/UIEntity/GroupPageNew.vue';
  import { FrmAttachment } from '../FrmLogic/FrmAttachment/FrmAttachment';

  let isEntityEvent = false;
  const hasQuery = ref(true);

  // 获取正确的url
  let formReady = false;
  const validator = useValidator();
  const changeDrawerVisible = async () => {
    if (isEntityEvent) {
      isEntityEvent = false;
      return;
    }
    if (!formReady) {
      return;
    }
    // 不存在删除
    if (!(await designerStore.selectedWidgetDto?.RetrieveFromDBSources())) {
      Event.emit('deleteNode', designerStore.selectedWidget?.id);
      return;
    }
    // 如果是容器组件
    if (validator.isContainer(designerStore.selectedWidget?.category || '', designerStore.selectedWidget?.key || '')) {
      const id = designerStore.selectedWidgetDto?.getData().CtrlID;
      if (designerStore.selectedWidget?.dto?.['CtrlType'] == 'Ath') {
        const athInfo = new FrmAttachment(id);
        await athInfo.Retrieve();
        const sAthInfo = designerStore.athInfoList.find((item) => item.MyPK == id);
        if (sAthInfo) {
          sAthInfo.IsVisable = athInfo.IsVisable;
        }
      }
      designerStore.selectedWidget = syncGroupProps(designerStore.selectedWidget!, designerStore.selectedWidgetDto?.getData() as GroupField, []);
      Event.emit('updateGroupField', designerStore.selectedWidget?.id);
      return;
    }
    // 更新大文本
    if (designerStore.selectedWidget?.key === 'html') {
      Event.emit('updateHtml', designerStore.selectedWidget?.id);
      return;
    }
    // 更新枚举值
    designerStore.selectedWidget = syncFieldProps(designerStore.selectedWidget, designerStore.selectedWidgetDto?.getData() as MapAttr);
    Event.emit('updateEnums', designerStore.selectedWidget?.id);
  };

  const enParams = ref({});
  const designerStore = useDesignerStore();
  const editable = ref<boolean>(true);
  // 仅生成图片清单而不急切加载，降低首屏体积
  const customizePicList = import.meta.glob('./Img/*.png');
  const supportsUITypes = Object.keys(customizePicList).map((key) => key.replace('./Img/', '').replace('.png', ''));
  provide('editable', editable);
  provide('customizePicList', supportsUITypes);
  const message = useMessage();
  const loading = computed(() => designerStore.globalLoading);
  const loadingDesc = computed(() => designerStore.loadingDesc);
  const designInstance = new Designer();

  const route = useRoute();

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
      // 如果分组列表为空，初始化
      // if (designerStore.widgetsList.length === 0) {
      //   // await initForm();
      // }
    } catch (e: any) {
      message.error(e);
    } finally {
      designerStore.globalLoading = false;
      formReady = true;
    }
  };

  watch(
    () => route.query,
    () => {
      window.location.reload();
    },
  );

  watch([() => designerStore.professionSettingUrl, () => designerStore.professionSettingVisible], ([url, visible]) => {
    if (url && visible) {
      enParams.value = getAllRequestParams(url);
      console.log(enParams.value);
    }
  });

  onMounted(() => {
    Event.on('reloadForm', async () => {
      isEntityEvent = true;
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
