<template>
  <div class="p-0" v-if="!loading">
    <ThemeWrapper>
      <div class="header">
        <div class="title">
          {{ pageTitle }}
        </div>
        <div class="btns">
          <!-- 按钮主题添加 -->
          <Button v-for="btnInfo in pageBtnGroup" :class="btn_style(btnInfo)" :key="btnInfo" type="primary" @click="pageBtnClick(btnInfo)">
            {{ btnInfo }}
          </Button>
        </div>
      </div>
      <div class="group-wrapper p-4" v-if="visible">
        <CollapseGroup v-if="listModel === ListModel.Icon" :params="params" />
        <ListGroup v-if="listModel === ListModel.Table" :params="params" />
      </div>
      <Drawer v-model:open="drawerInfo.visible" width="70%" :body-style="{ padding: 0 }" :title="drawerInfo.title" @close="reloadPage">
        <Component v-if="drawerInfo.visible" :is="drawerInfo.component" :params="drawerInfo.params" />
      </Drawer>
    </ThemeWrapper>
  </div>
</template>

<script lang="ts" setup>
  import { Button, Drawer, message } from 'ant-design-vue';
  import { markRaw, reactive, ref, computed } from 'vue';
  import { ClassFactoryOfPanelGroup } from '/@/WF/Comm/UIEntity/ClassFactoryOfPanelGroup';
  import CollapseGroup from '/@/WF/Comm/CollapseGroup.vue';
  import ListGroup from '/@/WF/Comm/ListGroup.vue';
  import { useRoute } from 'vue-router';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { ListModel } from '/@/bp/UIEntity/PageBasePanelGroup';
  import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import ThemeWrapper from './ThemeWrapper.vue';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const loading = ref(false);

  const route = useRoute();
  // 减少请求数，此处仅需要标题即可
  const pageTitle = ref<string>();
  const pageBtnGroup = ref<Array<string>>([]);
  const listModel = ref(ListModel.Icon);
  const visible = ref(true);

  let entityRef;

  const { loadComponent, getComponentParamsByUrl } = useComponentLoader();
  const drawerInfo = reactive({
    visible: false,
    component: {},
    params: {},
    title: '',
  });

  const resetDrawer = () => {
    drawerInfo.component = {};
    drawerInfo.params = {};
    drawerInfo.title = '';
    drawerInfo.visible = false;
  };

  const reloadPage = async () => {
    resetDrawer();
    visible.value = false;
    await InitPage();
    visible.value = true;
  };

  // 处理按钮事件
  const pageBtnClick = async (btnName: string) => {
    if (!entityRef) return;
    const result = await entityRef.BtnClick(btnName);
    if (!!result) {
      if (result.data == undefined || result.data == '') return;
      switch (result.ReturnType) {
        case GPNReturnType.Message:
          message.info(result.data);
          break;
        case GPNReturnType.Error:
          message.error(result.data);
          break;
        case GPNReturnType.GoToUrl: //转到url.
          window.location.replace(result.data);
          break;
        case GPNReturnType.Close: //关闭.
          break;
        case GPNReturnType.CloseAndReload: //关闭并重载
        case GPNReturnType.Reload: //刷新
          await InitPage();
          break;
        case GPNReturnType.OpenUrlByDrawer: //重新绑定
        case GPNReturnType.OpenUrlByDrawer75: //抽屉的模式打开.
        case GPNReturnType.OpenUrlByDrawer90: //抽屉的模式打开.
        case GPNReturnType.OpenUrlByDrawer30: //抽屉的模式打开.
          const param = result.data.split('?');
          if (param.length > 1) {
            const compName = param[0].endsWith('.vue') ? param[0] : param[0] + '.vue';
            drawerInfo.component = markRaw(loadComponent(compName));
            drawerInfo.params = getComponentParamsByUrl(result.data.substring(5));
            drawerInfo.title = btnName;
            drawerInfo.visible = true;
          }
          break;
        case GPNReturnType.OpenUrlByNewWindow: //重新绑定
          window.open(result.data);
          break;
        case GPNReturnType.DoNothing: //重新绑定
          break;
        default:
          message.warning('类型:' + result.ReturnType + '还未解析');
          break;
      }
    }
  };

  async function InitPage() {
    try {
      loading.value = true;
      const EnName = props.params?.EnName || route.query?.EnName;
      if (!EnName) {
        message.error('缺少必要参数 [ EnName ]');
        return;
      }
      entityRef = ClassFactoryOfPanelGroup.GetEn(EnName as string);
      entityRef.setParams({ ...props.params });
      await entityRef.Init(); //初始化数据.
      pageTitle.value = entityRef.PageTitle; //标题
      pageBtnGroup.value = entityRef.BtnsTop?.split(',').filter((item) => !!item) || []; //头部按钮.
      listModel.value = entityRef.HisListModel;
    } catch (e) {
      console.trace(e);
    } finally {
      loading.value = false;
    }
  }

  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn.includes('新增') || btn.includes('新建')) {
        return 'btn_style btn_add';
      } else if (btn.includes('删除')) {
        return 'btn_style btn_del';
      } else {
        return 'btn_style';
      }
    };
  });

  InitPage();
</script>

<style scoped lang="less">
  .header {
    width: 100%;
    height: 60px;
    line-height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding-left: 20px;
    padding-right: 20px;
    background-color: white;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border-bottom: 1px solid #eeeeee;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
      flex: 0.5;
    }
    //按钮大小边框统一
    .btn_style {
      height: 30px;
      border-radius: 5px;
      margin: 0 10px;
    }

    .btn_add {
      background-color: var(--system-bg-color);
      border-color: var(--system-bg-color);
      color: #fff !important;
    }

    .btn_del {
      background-color: #f56c6c !important;
      border-color: #f56c6c !important;
      color: #fff !important;
    }

    .btn {
      flex: 0.5;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }

  .group-wrapper {
    background-color: white;
  }
</style>
