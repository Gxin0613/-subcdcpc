<template>
  <div style="height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!--工具栏-->
        <div class="header toolBar" :style="{ minHeight: '64px' }">
          <ToolBar :pageType="pageType" @ChangeLoading="ChangeLoading" @Save="Save" />
        </div>
        <div class="content wrapper tree-body">
          <div class="en-sidebar" v-if="sidebarVisible">
            <Menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline">
              <SubMenu v-for="formTree in formTrees" :key="formTree.No">
                <template #title>
                  <span> <i v-if="!!formTree.Icon" :class="formTree.Icon"></i> &nbsp; {{ formTree.Name }} </span>
                </template>
                <MenuItem v-for="menu in formTree['child']" :key="menu.No" @click="menuClick(menu)"
                  ><i class="rm-icon" :class="!!menu.Icon ? menu.Icon : 'icon-drop'"></i>{{ menu.Name }}
                </MenuItem>
              </SubMenu>
            </Menu>
          </div>
          <div class="en-content" :style="{ width: sidebarVisible ? 'calc(100% - 200px)' : '100%' }">
            <Frm v-if="sidebarVisible === false" :frmID="openedTabs[0].No" :ref="'Ref_' + openedTabs[0].No" />
            <Tabs v-else @edit="tabEdit" v-model:activeKey="activeTabKey" type="editable-card" :hide-add="true" @change="changeTab">
              <TabPane v-for="(tab, idx) in openedTabs" :closable="idx === 0 ? false : true" :key="tab.No" :tab="tab.Name" @click="activeTabKey = tab.No">
                <FrmVsto
                  v-if="tab.FrmType == FrmType.VSTOForExcel.toString() || tab.FrmType == FrmType.VSTOForWord.toString()"
                  :mapDataRef="tab"
                  :params="query"
                  :frmSln="tab.FrmSln"
                />
                <Frm v-else :frmID="tab.No" :ref="'Ref_' + tab.No" />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
      <!--居中弹窗-->
      <Modal
        v-model:open="modal.modalVisible"
        centered
        :closable="modal.closable"
        :title="modal.modalTitle"
        :width="modal.modalWidth"
        :body-style="modal.modalHeight"
        :footer="null"
      >
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
      </Modal>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { Spin, Menu, MenuItem, SubMenu, message, Tabs, TabPane, Modal } from 'ant-design-vue';
  import { getCurrentInstance, inject, nextTick, reactive, Ref, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import ToolBar from '/@/WF/ToolBar.vue';
  import Frm from '/@/WF/CCForm/Frm.vue';
  import { useRoute } from 'vue-router';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import FrmVsto from '/@/WF/FrmVsto.vue';
  import { FrmType } from '/@/WF/Admin/EnumLab';

  interface FlowFormTree {
    No: string;
    Name: string;
    Icon: string;
    ParentNo: string;
  }
  //获取传的参数
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

  // sidebar相关
  const selectedKeys = ref<string[]>([]);
  const openKeys = ref<string[]>([]);

  const activeComp = ref<Record<string, any>>({});
  const openedTabs = ref<Array<Record<string, any>>>([]);
  const activeTabKey = ref('');
  const tabEdit = (targetKey: string | MouseEvent, action: string) => {
    if (action === 'remove') {
      closeTab(targetKey);
    }
  };

  const changeTab = (e) => {
    selectedKeys.value = [e];
  };

  // 关闭tab页面
  const closeTab = async (key: any) => {
    activeComp.value = {};
    await nextTick();
    Save(0, null);
    const idx = openedTabs.value.findIndex((tab) => tab.No === key);
    // 如果关闭的第一个
    if (idx === 0 && openedTabs.value[idx + 1]) {
      openedTabs.value.splice(0, 1);
      activeComp.value = openedTabs.value[0];
      activeTabKey.value = activeComp.value.No;
      return;
    }
    if (openedTabs.value[idx - 1]) {
      activeComp.value = openedTabs.value[idx - 1];
      openedTabs.value.splice(idx, 1);
      activeTabKey.value = activeComp.value.No;
      return;
    }
    openedTabs.value = [formTrees.value[0]['child'][0]];
    selectedKeys.value = [formTrees.value[0]['child'][0]];
    activeTabKey.value = selectedKeys.value[0]['No'];
  };
  /**
   * 点击菜单
   * @param menu
   */
  const menuClick = async (menu: any) => {
    activeComp.value = {};
    await nextTick();
    activeComp.value = menu;
    if (openedTabs.value.find((tab) => tab.No === menu.No)) {
      activeTabKey.value = menu.No;
      return;
    }
    openedTabs.value.push(menu);
    activeTabKey.value = menu.No;
  };
  /**
   * 初始化表单
   * @constructor
   */
  const InitPage = async () => {
    try {
      loading.value = true;

      //获得数据源.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
      handler.AddJson(query);
      handler.AddPara('IsReadonly', isReadonly);
      const data = await handler.DoMethodReturnString('FlowFormTree2021_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        //发送时发生错误
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      const trees = result['FormTree'];
      const forms = result['Forms'];
      if (forms.length == 1) {
        sidebarVisible.value = false;
        openedTabs.value.push(forms[0]);
      }
      trees.forEach((tree) => (tree['child'] = forms.filter((item) => tree.No === item.ParentNo)));
      formTrees.value = trees;
      //显示退回,小纸条信息
      if (isReadonly === false) ShowWorkReturnTip(result);
      openKeys.value = formTrees.value.map((item) => item.No);
      if (forms.length > 1) {
        selectedKeys.value = [formTrees.value[0]['child'][0].No];
        activeTabKey.value = selectedKeys.value[0];
        openedTabs.value.push(formTrees.value[0]['child'][0]);
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
      message.error(data.tips);
    }
    if (state != null) loading.value = state;
  }
  InitPage();

  //保存值
  const ctx = getCurrentInstance();
  const Save = async (type, callback) => {
    try {
      loading.value = true;
      let msg = '';
      for (const item of openedTabs.value) {
        const refname = 'Ref_' + item.No;
        if (Array.isArray(ctx.refs[refname])) {
          const result = await ctx.refs[refname][0].Save();
          if (result == false) msg += item.Name + '保存失败';
        } else {
          const result = await ctx.refs[refname].Save();
          if (result == false) msg += item.Name + '保存失败';
        }
      }

      if (msg != '') {
        message.error(msg);
        if (typeof callback == 'function') callback(false);
      } else {
        if (type == 0) message.success('保存成功');
        if (typeof callback == 'function') callback(true);
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      if (typeof callback == 'function') callback(false);
    } finally {
      loading.value = false;
    }
  };
</script>
<style lang="less" scoped>
  .toolBar {
    background-color: white;
    position: fixed;
    width: 100%;
    //height: 50px;
    z-index: 1000;
  }
  .wrapper {
    margin: 0 auto;
    padding: 60px 24px 24px;
    height: 100%;
  }
  .tree-body {
    //background-color: white;
    width: 100%;
    height: calc(100vh);
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
      width: 240px;
      height: 100%;
      border-right: 1px solid #eeeeee;
      overflow-y: auto;
      background-color: white;
    }

    .en-content {
      width: calc(100% - 240px);
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
      height: calc(100vh);
    }

    .ant-modal-body {
      flex: 1;
    }
  }
</style>
