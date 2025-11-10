<template>
  <div style="height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red"> {{ errorObj.tips }} </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!--工具栏-->

        <div class="header toolBar" :style="{ minHeight: '64px' }">
          <ToolBar :pageType="pageType" :params="query" @ChangeLoading="ChangeLoading" @Save="Save" @GetMainData="GetMainData" @UpdateData="UpdateData" />
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
            <Frm v-if="sidebarVisible === false" :frmID="openedTabs[0].No" :ref="'Ref_' + openedTabs[0].No" :params="query" />
            <Tabs v-else @edit="tabEdit" v-model:activeKey="activeTabKey" type="editable-card" :hide-add="true" @change="changeTab">
              <TabPane v-for="(tab, idx) in openedTabs" :closable="idx === 0 ? false : true" :key="tab.No" :tab="tab.Name" @click="activeTabKey = tab.No">
                <FrmVsto
                  v-if="tab.FrmType == FrmType.VSTOForExcel.toString() || tab.FrmType == FrmType.VSTOForWord.toString()"
                  :ref="'Ref_' + tab.No"
                  :mapDataRef="tab"
                  :params="query"
                  :frmSln="tab.FrmSln"
                  pageFrom="MyFlowTree"
                  @update-from-type="UpdateFormType"
                />
                <Frm v-else :frmID="tab.No" :ref="'Ref_' + tab.No" :key="tab.tabKey" :params="{ FrmID: tab.No, ...query }" />
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
              <div v-else style="line-height: 24px; font-weight: bold">{{ item.title }}</div> <p v-html="item.content" style="line-height: 24px"></p>
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
  import { cloneDeep } from 'lodash-es';
   import { Node } from '/@/WF/TSClass/Node';

  interface FlowFormTree {
    No: string;
    Name: string;
    Icon: string;
    ParentNo: string;
  } //获取传的参数
  const route = useRoute();

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return null;
      },
    },
  });
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
  const isReadonly = query.IsReadonly == '1'; //标记是处理器还是查看器工具栏
  const pageType = (query.PageType as string) || 'MyView'; //页面加载
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  }); //弹窗显示
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
  const formTrees = ref<FlowFormTree[]>([]); // sidebar相关

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

  const changeTab = async (e) => {
    await SaveOneFrm(selectedKeys.value);
    selectedKeys.value = [e];
    const tab = openedTabs.value.find((tab) => tab.No === e);
    if (!!tab) {
      if (!!tab.OldFrmType) tab.FrmType = tab.OldFrmType;
      tab.tabKey = tab.tabKey + 1;
    }
  }; // 关闭tab页面

  const closeTab = async (key: any) => {
    activeComp.value = {};
    await nextTick();
    Save(0, null);
    const idx = openedTabs.value.findIndex((tab) => tab.No === key); // 如果关闭的第一个
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
   * 是不是VSTO表单
   * @param frmID
   * @constructor
   */
  const IsVstoFrm = (frmID: string) => {
    const VSTO_FRM_TYPE = [FrmType.VSTOForExcel, FrmType.VSTOForWord];
    return !!openedTabs.value.find((item) => item.No == frmID && VSTO_FRM_TYPE.includes(parseInt(item.FrmType || '-1')));
    // return openedTabs.value.filter((item) => item.No === frmID && item.FrmType == FrmType.VSTOForExcel.toString()).length > 0;
  };
  /**
   * 点击菜单
   * @param menu
   */
  const menuClick = async (menu: any) => {
    debugger;
    if (IsVstoFrm(activeTabKey.value) == false) await SaveOneFrm(activeTabKey.value);
    activeComp.value = {};
    await nextTick();
    activeComp.value = menu;
    const tab = openedTabs.value.find((tab) => tab.No === menu.No);
    debugger;
    if (!!tab) {
      activeTabKey.value = menu.No;
      tab.tabKey = tab.tabKey + 1;
      if (!!tab.OldFrmType) tab.FrmType = tab.OldFrmType;
      return;
    }
    const item = cloneDeep(menu);
    item['tabKey'] = 0;
    openedTabs.value.push(item);
    activeTabKey.value = menu.No;
  };

  const UpdateFormType = () => {
    const curTab = openedTabs.value.find((item) => item.No === activeTabKey.value);
    if (!!curTab) {
      curTab.OldFrmType = curTab.FrmType;
      curTab.FrmType = FrmType.FoolForm;
    }
  };
  /**
   * 保存单个表单
   * @constructor
   */

  const SaveOneFrm = async (frmNo) => {
    //保存
    const refname = 'Ref_' + frmNo;
    let save: Function | null = null;
    const refs = ctx?.refs?.[refname];
    if (Array.isArray(refs)) {
      save = refs?.[0]?.['Save'];
    } else {
      save = refs?.['Save'];
    }
    if (typeof save == 'function') {
      const result = await save();
      if (result == false) message.error('保存失败');
    } // if (Array.isArray(ctx.refs[refname])) { //  const result = await ctx.refs[refname][0].Save(); //  if (result == false) message.error('保存失败'); // } else { //  const result = await ctx.refs[refname].Save(); //  if (result == false) message.error('保存失败'); // }
  };
  /**
   * 初始化表单
   * @constructor
   */
  const frmNos = ref('');
  const InitPage = async () => {
    try {
      loading.value = true; //获得数据源.
      //判断当前的节点是普通节点且FID!=0需要修改值
      const node = new Node()
      node.NodeID = query.FK_Node || query.NodeID;
      const i = await node.RetrieveFromDBSources();
      if(i === 1 && node.RunModel!=4 && node.RunModel!=5 && query.FID!=0){
        query.WorkID = query.FID;
        query.FID = 0;
      }
       


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
      forms.forEach((item) => (frmNos.value += item.No + ','));
      trees.forEach((tree) => (tree['child'] = forms.filter((item) => tree.No === item.ParentNo)));
      formTrees.value = trees;
      if (forms.length == 1 && formTrees.value.length == 1 && formTrees.value[0]['child'].length == 1) {
        selectedKeys.value = [formTrees.value[0]['child'][0].No];
        activeTabKey.value = selectedKeys.value[0];
        sidebarVisible.value = true;
        const item = cloneDeep(forms[0]);
        item['tabKey'] = 0;
        openedTabs.value.push(item);
      } //显示退回,小纸条信息
      if (isReadonly === false) ShowWorkReturnTip(result);
      openKeys.value = formTrees.value.map((item) => item.No);
      if (forms.length > 1) {
        selectedKeys.value = [formTrees.value[0]['child'][0].No];
        activeTabKey.value = selectedKeys.value[0];
        const item = cloneDeep(formTrees.value[0]['child'][0]);
        item['tabKey'] = 0;
        openedTabs.value.push(item);
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
    const pressMsg = flowData?.PressMsg || [];
    alertMsg.forEach((item) => {
      dataInfo.value.push({
        title: item.Title,
        content: item.Msg,
      });
    });
    //催办消息
    pressMsg.forEach((item) => {
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
  InitPage(); //保存值

  const ctx = getCurrentInstance();
  const Save = async (type, callback) => {
    try {
      if (IsVstoFrm(activeTabKey.value)) {
        if (typeof callback == 'function') {
          callback(true);
        }
        return;
      }
      loading.value = true;
      let msg = '';
      for (const item of openedTabs.value) {
        if (item.FrmType == FrmType.VSTOForExcel.toString()) {
          continue;
        }
        const refname = 'Ref_' + item.No;
        if (Array.isArray(ctx.refs[refname])) {
          const result = await ctx.refs[refname][0].Save(type);
          if (result == false) msg += item.Name + '保存失败';
        } else {
          const result = await ctx.refs[refname].Save(type);
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
  }; //获取主表字段
  const GetMainData = (callBack) => {
    if (IsVstoFrm(activeTabKey.value)) {
      callBack(null, activeTabKey.value, frmNos.value);
      return;
    }

    const refname = 'Ref_' + activeTabKey.value;
    if (Array.isArray(ctx?.refs[refname])) {
      callBack(ctx?.refs[refname][0].GetMainData(), activeTabKey.value, frmNos.value);
    } else {
      callBack(ctx?.refs[refname].GetMainData(), activeTabKey.value, frmNos.value);
    }
  }; //更改主表表单字段
  const UpdateData = (val) => {
    if (IsVstoFrm(activeTabKey.value)) return;
    const refname = 'Ref_' + activeTabKey.value;
    if (Array.isArray(ctx?.refs[refname])) {
      ctx?.refs[refname][0].UpdateData(val);
    } else {
      ctx?.refs[refname].UpdateData(val);
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
    padding: 68px 24px 24px;
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
