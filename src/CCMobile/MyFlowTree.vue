<template>
  <Spin :spinning="loading">
    <NavBar v-if="mobileNavbarVisible()" :title="title" :fixed="true" left-arrow @click-left="onClickLeft">
      <template v-if="sidebarVisible" #right>
        <Icon name="wap-nav" size="18" @click="ShowMenu" />
      </template>
    </NavBar>
    <!--表单内容-->
    <Frm v-if="!!selectedKey" :frmID="selectedKey" ref="basicData" />
    <ToolBar
      :pageType="pageType"
      :params="query"
      @ChangeLoading="ChangeLoading"
      @SaveData="Save"
      @VerifyFormData="VerifyFormData"
      @GetMainData="GetMainData"
      @UpdateData="UpdateData"
    />
    <!--居中弹窗-->
    <Dialog v-model:open="modal.modalVisible" centered :closable="modal.closable" :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight">
      <div class="h-100">
        <!--退回小纸条显示-->
        <div style="padding: 10px; overflow-y: auto; height: 100%">
          <template v-for="(item, index) in dataInfo" :key="index">
            <div v-if="item.title === '退回信息'" style="line-height: 24px; color: red; font-weight: bold">{{ item.title }}</div>
            <div v-else style="line-height: 24px; font-weight: bold">{{ item.title }}</div>
            <p v-html="item.content" style="line-height: 24px"></p>
          </template>
        </div>
      </div>
    </Dialog>
    <Popup v-model:show="popVisible" position="bottom" style="background-color: #fafafa; height: 100%">
      <NavBar :fixed="true" @click-left="popVisible = false" style="background-color: #fafafa !important">
        <template #left>
          <Icon name="arrow-down" size="18" />
        </template>
      </NavBar>
      <div style="margin-top: 46px; margin-left: 10px; margin-right: 10px">
        <template v-for="formTree in formTrees" :key="formTree.No">
          <div class="van-doc-card">
            <h5 class="van-h5">{{ formTree.Name }}</h5>
            <Grid :column-num="3">
              <GridItem v-for="menu in formTree['child']" :key="menu.No" @click="menuClick(menu)"
                ><i v-if="!!menu.Icon" class="rm-icon" :class="menu.Icon"></i>{{ menu.Name }}
              </GridItem>
            </Grid>
          </div>
        </template>
      </div>
    </Popup>
  </Spin>
</template>
<script lang="ts" setup>
  import { NavBar, Icon, Popup, Grid, GridItem } from 'vant';
  import { Spin } from 'ant-design-vue';
  import ToolBar from './ToolBar.vue';
  import { useRoute } from 'vue-router';
  import { type Ref, inject, nextTick, reactive, ref, shallowRef } from 'vue';
  import { Node } from '/@/WF/TSClass/Node';
  import { showFailToast, Dialog } from 'vant';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import Frm from '/@/CCMobile/CCForm/Frm.vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { mobileNavbarVisible } from '/@/utils/gener/StringUtils';

  interface FlowFormTree {
    No: string;
    Name: string;
    Icon: string;
    ParentNo: string;
  }
  const props = defineProps({
    params: {
      type: Object,
      default: () => null,
    },
  });
  //获取传的参数
  const route = useRoute();
  const flowInfo = inject('flowInfo') as Ref<Recordable>;
  let query = {
    ...route.query,
    ...props.params,
  };
  if (flowInfo?.value) {
    query = {
      ...query,
      ...flowInfo.value,
    };
  }
  const isReadonly = query.IsReadonly == '1';
  //标记是处理器还是查看器工具栏
  const pageType = (query.PageType as string) || 'MyView';
  const title = ref(''); //标题名称
  //页面加载
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
  });
  const dataInfo = ref<Record<string, any>[]>([]);

  const sidebarVisible = ref(true);
  const formTrees = ref<FlowFormTree[]>([]);
  const selectedKey = ref('');
  const curKey = ref('');
  /**
   * 初始化表单
   * @constructor
   */
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取当前节点的属性信息
      const node = new Node();
      await node.Init();
      node.NodeID = parseInt(query.FK_Node as string);
      await node.RetrieveFromDBSources();
      title.value = node.Name;
      //获得数据源.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      handler.AddPara('IsReadonly', isReadonly);
      const data = await handler.DoMethodReturnString('FlowFormTree2021_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        //发送时发生错误
        showFailToast(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      const trees = result['FormTree'];
      const forms = result['Forms'];
      if (forms.length == 1) {
        sidebarVisible.value = false;
      }
      trees.forEach((tree) => (tree['child'] = forms.filter((item) => tree.No === item.ParentNo)));
      formTrees.value = trees;
      //显示退回,小纸条信息
      if (isReadonly === false) ShowWorkReturnTip(result);
      if (formTrees.value.length > 0) {
        selectedKey.value = formTrees.value[0]['child'][0].No;
        curKey.value = selectedKey.value;
        console.log(selectedKey.value);
      }
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };
  const ShowWorkReturnTip = (flowData) => {
    const gwf = flowData?.WF_GenerWorkFlow[0];
    const scrip = GetPara(gwf.AtPara, 'ScripMsg') || '';
    const scripNodeID = GetPara(gwf.AtPara, 'ScripNodeID');
    const alertMsg = flowData?.AlertMsg || [];
    alertMsg.forEach((item) => {
      dataInfo.value.push({
        title: item.Title,
        content: item.Msg,
      });
    });
    if (scrip != '' && scripNodeID !== route.query.FK_Node) {
      dataInfo.value.push({
        title: '小纸条',
        content: scrip,
      });
    }

    if (dataInfo.value.length > 0) {
      modal.modalVisible = true;
      modal.modalTitle = '消息';
      modal.modalWidth = 420;
      modal.modalHeight = {
        height: window.innerHeight * 0.7 + 'px',
      };
    }
  };

  /**
   * 子组件修改父组件的值
   * @param state
   * @param data
   * @constructor
   */
  function ChangeLoading(state, data) {
    if (data != null) {
      showFailToast(data.tips);
    }
    if (state != null) loading.value = state;
  }
  InitPage();

  const popVisible = ref(false);
  const ShowMenu = () => {
    //选择其他表单的时候先保存当前表单的信息
    Save(0, null);
    popVisible.value = true;
  };

  const menuClick = async (menu: any) => {
    selectedKey.value = '';
    await nextTick();
    selectedKey.value = menu.No;
    popVisible.value = false;
  };

  const basicData = shallowRef<InstanceType<typeof Frm>>();
  const Save = async (type, callback) => {
    try {
      loading.value = true;
      const result = await basicData.value?.Save(type);
      if (typeof callback == 'function') callback(result);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      if (typeof callback == 'function') callback(false);
    } finally {
      loading.value = false;
    }
  };
  /**
   * 表单校验
   * @constructor
   */
  const VerifyFormData = async (callback) => {
    const rowData = await basicData.value?.VerifyFormData();
    callback(rowData);
  };

  //获取主表字段
  const GetMainData = (callBack) => {
    callBack(basicData.value?.mainData, selectedKey.value);
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return basicData.value?.handleUpdate(val);
  };
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
</script>
<style lang="less" scoped>
  .toolBar {
    background-color: white;
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 60px 24px 24px;
    height: 100%;
  }
  .tree-body {
    background-color: white;
    width: 100%;

    display: flex;
    align-items: stretch;
    justify-content: space-between;
    box-sizing: border-box;
    position: relative;
    overflow-y: scroll;

    :deep(.ant-tabs-nav-wrap) {
      background-color: #ffffff;
    }

    :deep(.ant-menu-title-content) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .rm-icon {
      margin-right: 8px;
    }

    .en-sidebar {
      width: 200px;
      height: 100%;
      border-right: 1px solid #eeeeee;
      overflow-y: auto;
    }

    .en-content {
      width: calc(100% - 200px);
      height: 100%;
      background-color: #f2f5f7;
      overflow-y: scroll;
      overflow-x: hidden;

      :deep(.ant-tabs-nav) {
        margin-bottom: 0 !important;
      }

      :deep(.ant-tabs-nav > div) {
        display: flex;
        align-items: center;
      }

      :deep(.ant-tabs-tab-active) {
        border-bottom-color: unset;
      }

      :deep(.ant-tabs-nav > div > span) {
        height: 12px !important;
      }

      .component-tabs {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid #eeeeee;
        display: flex;
        align-items: center;
        overflow: auto hidden;

        .tab {
          flex-shrink: 0;
          width: 130px;
          height: 100%;
          line-height: 50px;
          text-align: center;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all ease 0.4s;
          border-right: 1px solid #eeeeee;

          &:hover {
            color: #ffffff;
            background-color: #0960bd;
          }

          .close-icon {
            margin-left: 6px;

            &:hover {
              color: #ff5555;
            }
          }
        }

        .active {
          color: #ffffff;
          background-color: #0960bd;
        }
      }

      .component-info {
        width: 100%;
        height: calc(100% - 51px);
        overflow: auto;
        box-sizing: border-box;
      }
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
      height: calc(var(--viewport-height));
    }

    .ant-modal-body {
      flex: 1;
    }
  }
  :deep(.van-nav-bar__left .van-icon) {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
  :deep(.van-nav-bar__right .van-icon) {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
</style>
