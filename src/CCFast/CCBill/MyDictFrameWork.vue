<template>
  <div style="height: 100%; background-color: white; overflow: hidden">
    <base-component ref="baseComponent">
      <ThemeWrapper>
        <Spin :spinning="loading">
          <div v-if="errorObj.hasError" class="ant-tag-red">
            {{ errorObj.tips }}
          </div>
          <div v-else>
            <Layout>
              <LayoutSider style="background-color: white" v-if="menu.length > 0 && menu[0]?.methods?.length > 0">
                <Menu mode="inline" id="menu" @click="handleMenuClick" v-model:selectedKeys="selectedKeys" :open-keys="menuOpenKeys">
                  <SubMenu v-for="group in menu" :key="group.No">
                    <template #icon><i :class="group.Icon || 'icon-folder'"></i></template>
                    <template #title>{{ group.Name }}</template>
                    <MenuItem v-for="method in group.methods" :key="method.No"><i style="margin-right: 8px" :class="method.Icon || 'icon-drop'"></i>{{ method.Name }} </MenuItem>
                  </SubMenu>
                </Menu>
              </LayoutSider>
              <Layout style="background-color: white; height: calc(100vh - 60px); overflow-y: auto; overflow-x: hidden">
                <template v-if="menu.length == 0 || menu[0]?.methods?.length == 0">
                  <MyDict
                    v-if="entityType === 2"
                    :params="props.params"
                    @trigger-close="$emit('trigger-close')"
                    style="padding: 0"
                    :methodModal="'基本信息'"
                    @trigger-update="triggerMyDictUpdate"
                    :isFramework="true"
                    :isFixedbar="true"
                  />
                  <MyBill
                    v-if="entityType === 1"
                    :params="params"
                    @trigger-close="$emit('trigger-close')"
                    style="padding: 0"
                    :methodModal="'基本信息'"
                    @trigger-update="triggerMyDictUpdate"
                    :isFramework="true"
                    :isFixedbar="true"
                  />
                  <MyEntityNoName
                    v-if="entityType === 3 || entityType === 5"
                    :params="params"
                    @trigger-close="$emit('trigger-close')"
                    style="padding: 0"
                    :methodModal="'基本信息'"
                    @trigger-update="triggerMyDictUpdate"
                    :isFramework="true"
                    :isFixedbar="true"
                  />
                  <MyAskFrm
                    v-if="entityType === 4"
                    :params="params"
                    @trigger-close="$emit('trigger-close')"
                    style="padding: 0"
                    :methodModal="'基本信息'"
                    @trigger-update="triggerMyDictUpdate"
                    :isFramework="true"
                    :isFixedbar="true"
                  />
                </template>
                <Tabs v-else v-model:activeKey="activeKey" hide-add type="editable-card" @edit="handleTabEdit">
                  <TabPane key="enInfo" :tab="'基本信息'" :closable="false">
                    <div style="height: calc(100vh - 110px); touch-action: pan-y; overflow-y: auto">
                      <MyDict
                        v-if="entityType === 2"
                        :params="props.params"
                        @trigger-close="$emit('trigger-close')"
                        style="padding: 0"
                        :methodModal="'基本信息'"
                        @trigger-update="triggerMyDictUpdate"
                        :isFramework="true"
                      />
                      <MyBill
                        v-if="entityType === 1"
                        :params="params"
                        @trigger-close="$emit('trigger-close')"
                        style="padding: 0"
                        :methodModal="'基本信息'"
                        @trigger-update="triggerMyDictUpdate"
                        :isFramework="true"
                        :menu="menu"
                      />
                      <MyEntityNoName
                        v-if="entityType === 3 || entityType === 5"
                        :params="params"
                        @trigger-close="$emit('trigger-close')"
                        style="padding: 0"
                        :methodModal="'基本信息'"
                        @trigger-update="triggerMyDictUpdate"
                        :isFramework="true"
                        :menu="menu"
                      />
                      <MyAskFrm
                        v-if="entityType === 4"
                        :params="params"
                        @trigger-close="$emit('trigger-close')"
                        style="padding: 0"
                        :methodModal="'基本信息'"
                        @trigger-update="triggerMyDictUpdate"
                        :isFramework="true"
                        :isFixedbar="true"
                      />
                    </div>
                  </TabPane>
                  <TabPane v-for="tab in openTabs" :key="tab.key" :tab="tab.tab" :closable="true">
                    <FrmBBS v-if="tab.methodModal == 'FrmBBS'" :params="{ ...props.params, workID: props.params?.WorkID || props.params?.No }" />
                    <DBVer v-else-if="tab.methodModal == 'DataVer'" :params="{ ...props.params, workID: props.params?.WorkID }" />
                    <iframe
                      class="flow-etc-frame"
                      v-else-if="tab.methodModal === 'FlowEtc'"
                      :src="`/index.html#/WF/GenerList?EnName=GL_FlowEtcList&WorkID=${props.params?.WorkID || route.query?.OID || props.params?.No}&FlowNo=${tab.methodID}&FrmID=${
                        props.params?.FrmID || route.query?.FrmID
                      }&MethodNo=${tab.key}`"
                    ></iframe>
                    <iframe
                      class="flow-etc-frame"
                      v-else-if="tab.methodModal === 'FlowBaseData'"
                      :src="`/index.html#/WF/GenerList?EnName=GL_FlowEtcList&WorkID=${props.params?.WorkID || route.query?.OID || props.params?.No}&FlowNo=${tab.methodID}&FrmID=${
                        props.params?.FrmID || route.query?.FrmID
                      }&MethodNo=${tab.key}`"
                    ></iframe>
                    <DictLog v-else-if="tab.methodModal === 'DictLog'" :params="{ ...props.params, workID: props.params?.WorkID }" />

                    <iframe
                      class="flow-etc-frame"
                      v-else-if="tab.methodModal === 'Func'"
                      :src="`/index.html#/WF/GenerList?EnName=GL_FuncLog&IsHavePara=${tab.Attrs.length === 0 ? 0 : 1}&OID=${
                        props.params?.WorkID || props.params.RefNo || route.query?.OID
                      }&MethodID=${tab.methodID}&FrmID=${props.params?.FrmID || route.query?.FrmID}&MethodName=${tab.Name}&MethodNo=${tab.key}`"
                    ></iframe>

                    <RefMethodFunc
                      v-else-if="tab.methodModal === 'Func222'"
                      :row="Object.fromEntries(tab.EntityRef.Row)"
                      :title="tab.Name"
                      :method-name="tab.No"
                      :attrs="(tab.Attrs as any)"
                      :entity-ref="tab.EntityRef"
                      @exec="execMethod"
                    />
                    <MyDict
                      v-else-if="tab.methodModal === 'PrintRTF' && !reloading && entityType != 5"
                      :params="props.params"
                      :printType="tab.methodModal"
                      :isReadonly="isReadonly"
                      style="padding: 0"
                      @trigger-close="$emit('trigger-close')"
                    />
                    <MyEntityNoName
                      v-else-if="tab.methodModal === 'PrintRTF' && !reloading && (entityType === 3 || entityType === 4 || entityType === 5)"
                      :params="params"
                      :printType="tab.methodModal"
                      :isReadonly="isReadonly"
                      style="padding: 0"
                      @trigger-close="$emit('trigger-close')"
                    />
                    <iframe
                      class="flow-etc-frame"
                      v-else-if="tab.methodModal === 'DictRefBill'"
                      :src="`/index.html#/WF/GenerList?EnName=GL_DictRefBill&OID=${props.params?.WorkID || route.query?.OID}&MethodID=${tab.No}&FrmID=${
                        props.params?.FrmID || route.query?.FrmID
                      }&MethodName=${tab.Name}&MethodNo=${tab.key}`"
                    ></iframe>
                    <iframe
                      class="flow-etc-frame"
                      v-else-if="tab.methodModal === 'DBList'"
                      :src="`/index.html#/WF/GenerList?EnName=GL_DBList&OID=${props.params?.WorkID || route.query?.OID || props.params?.No || route.query?.No}&MethodID=${
                        tab.No
                      }&FrmID=${props.params?.FrmID || route.query?.FrmID}&MethodNo=${tab.key}`"
                    ></iframe>
                    <iframe
                      class="flow-etc-frame"
                      v-else-if="tab.methodModal === 'SingleDictGenerWorkFlows'"
                      :src="`/index.html#/WF/GenerList?EnName=GL_DictSingleDictGenerWorkFlow&OID=${props.params?.WorkID || route.query?.OID}&MethodID=${tab.No}&FrmID=${
                        props.params?.FrmID || route.query?.FrmID
                      }&MethodNo=${tab.key}`"
                    ></iframe>
                    <Link v-else-if="tab.methodModal === 'Link' && !reloading" :url="tab.url" />
                    <GenerCode v-else-if="tab.methodModal === 'QRCode'" :params="{ ...props.params, workID: props.params?.WorkID }" />
                    <div v-else>{{ tab.methodModal }}方法未实现</div>
                  </TabPane>
                </Tabs>
              </Layout>
            </Layout>
          </div>
        </Spin>
      </ThemeWrapper>
      <Modal
        v-model:open="modalVisible"
        :title="'选择打印模板'"
        width="500px"
        :bodyStyle="{
          '--padding': '0px 12px !important',
        }"
        :footer="null"
      >
        <div v-for="printTemp in temps">
          <Button type="link" @click="PrintRTF(printTemp.MyPK)">{{ printTemp.Name }}</Button>
        </div>
      </Modal>
    </base-component>
  </div>
</template>
<script lang="ts" setup>
  import { Spin, message, Layout, LayoutSider, Menu, SubMenu, MenuItem, Tabs, TabPane, Modal, Button } from 'ant-design-vue';
  import { reactive, ref, shallowRef, unref } from 'vue';
  import MyDict from './MyDict.vue';
  import MyBill from './MyBill.vue';
  import MyEntityNoName from './MyEntityNoName.vue';
  import DBVer from '/@/CCFast/CCBill/OptComponents/DBVer.vue';
  import { GroupMethods } from './Method/GroupMethod';
  import { Methods } from './Method/Method';
  import FrmBBS from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue';
  import Link from '/@/CCFast/CCBill/Components/FrmDict/Link.vue';
  import DictLog from '/@/CCFast/CCBill/OptComponents/DictLog.vue';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { EntityNoName } from '/@/bp/en/EntityNoName';
  import RefMethodFunc from '/@/WF/Comm/RefMethodFunc.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import GenerCode from '/@/WF/WorkOpt/QRCode/GenerCode.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useRoute } from 'vue-router';
  import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
  import { DealExp } from '/@/utils/gener/StringUtils';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { windowOpen } from '/@/utils/windowOpen';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import MyAskFrm from '/@/CCFast/CCBill/AskFrm/MyAskFrm.vue';
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  // import GenerList from '/@/WF/Comm/views/GenerList.vue';
  interface Tab {
    key: string;
    tab: string;
    methodModal: string;
    methodID: string;
    No: string;
    Name: string;
    PWorkID: string;
    PFrmID: string;
    BillFrmID: string;
    Attrs: Recordable[];
    url: string;
    EntityRef: EntityNoName;
  }
  defineEmits(['trigger-close']);
  const loading = ref(false);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({
        WorkID: '',
        FrmID: '',
      }),
    },
  });
  console.log({ props });
  const route = useRoute();
  //当出现打印按钮时表单内容只读
  const isReadonly = ref<boolean>(true);
  const reloading = ref(false);
  const openTabs = ref<Tab[]>([]);
  const activeKey = ref();
  const selectedKeys = ref([]);
  const enMethods = ref<MethodAttr[]>([]);
  const menu = ref<GroupMethodAttr[] & any>([]);

  const modalVisible = ref(false);
  const temps = ref<Record<string, any>[]>([]);
  const triggerMyDictUpdate = () => {
    reloading.value = true;
    setTimeout(() => {
      reloading.value = false;
    }, 50);
  };
  const entityType = ref(0);
  const menuOpenKeys = ref<string[]>([]);
  const params = ref(props.params);
  const entity = ref();

  const InitPage = async () => {
    try {
      const frmDict = new FrmDict();
      frmDict.setPKVal(props.params?.FrmID || route.query?.FrmID);
      await frmDict.RetrieveFromDBSources();
      entityType.value = frmDict.EntityType;
      loading.value = true;
      const groups = new GroupMethods();
      await groups.Retrieve('FrmID', props.params?.FrmID || route.query?.FrmID);
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('IsMyBillToolBar', 0);
      handler.AddPara('FrmID', props.params?.FrmID || route.query?.FrmID);
      const methods = await handler.DoMethodReturnString('MyBill_Methods');
      //const methods = new Methods();
      //await methods.Retrieve('FrmID', props.params?.FrmID || route.query?.FrmID);
      enMethods.value = methods.filter((item) => item.MethodModel != 'FlowEtc' || (item.MethodModel === 'FlowEtc' && parseInt(item.IsMyBillToolBar) === 0));
      groups.forEach((item) => {
        const group = item;
        const children = enMethods.value.filter((i) => i.GroupID == item.No);
        if (Array.isArray(children) && children.length > 0) group.methods = children;
        for (let i = 0; i < menu.value; i++) {
          if (group.No == menu.value[i].No) return;
        }
        if (Array.isArray(group.methods) && group.methods.length > 0) menu.value.push(group);
      });
      if (menu.value.length > 0) {
        menuOpenKeys.value = [menu.value[0].No];
      }
      //获取表单的信息
      const en = new BSEntity(props.params?.FrmID);
      if (entityType.value == 3 || entityType.value == 4 || entityType.value == 5) en.setPK(params.value.RefNo);
      else en.setPK(props.params?.WorkID);
      await en.RetrieveFromDBSources();
      entity.value = en.getData();

      if (entityType.value == 3 || entityType.value == 4 || entityType.value == 5) {
        params.value.PKVal = params.value.RefNo;
      }
      console.log('参数：', props.params);
      // menu.value[0].No
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      message.error(`获取方法数据失败：错误信息：${e}`);
      console.trace(`获取方法数据失败：错误信息：${e}`);
      loading.value = false;
    } finally {
      loading.value = false;
    }
  };
  let currentActiveTab: Nullable<Recordable> = null;
  const execMethod = async (No: string, row: Recordable) => {
    try {
      const execType = currentActiveTab?.MethodDocTypeOfFunc;
      if (execType == '0') {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('PKVal', No);
        handler.AddPara('FrmID', props.params?.FrmID);
        handler.AddPara('WorkID', props.params?.WorkID);
        const keys = Object.keys(row);
        for (const key of keys) {
          handler.AddPara(key, row[key]);
        }
        const data = await handler.DoMethodReturnString('DoMethodPara_ExeSQL_V3');
        message.success(data);
      } else if (execType == '1') {
        // const jsFunction = () => {
        //   const keys = Object.keys(row);
        //   const key
        //   eval(currentActiveTab?.Docs);
        // }
        // jsFunction();
        message.error('暂未实现');
      } else if (execType == '2') {
        message.error('暂未实现');
      } else {
        message.error('未知方法类型');
      }
    } catch (e: any) {
      message.error(e);
    }
  };

  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const handleMenuClick = async (e) => {
    const aTab = enMethods.value.filter((item) => item['No'] == e.key)[0];
    const isOpen = openTabs.value.findIndex((item) => item.key == aTab['No']);
    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', aTab['No'], 'Idx');
    console.log({ attrs });
    attrs.forEach((attr) => {
      attr.Key = attr.KeyOfEn;
      attr.Desc = attr.Name;
    });
    // console.log(aTab[MethodAttr.MethodModel]);
    if (aTab['MethodModel'] === 'PrintRTF') {
      try {
        message.info('打印中,请稍候...');
        const basePath = VITE_GLOB_API_URL;

        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', props.params?.FrmID);
        handler.AddPara('Method', aTab['No']);
        if (entityType.value != 5) handler.AddPara('WorkID', props.params?.WorkID);
        else handler.AddPara('No', props.params.No);
        const res = await handler.DoMethodReturnJson<{ FileName: string; FileUrl: string }>('MyDict_PrintRTF');
        if (Array.isArray(res)) {
          //弹窗打开模板，选择模板打印
          modalVisible.value = true;
          temps.value = res;
          return;
        }
        window.open(basePath + '/' + res.FileUrl);
        // "/DataUser/Bill/2023/100/1026161138-9145-4284-9304-21111512131410132139/2023_100_1026161138-9145-4284-9304-21111512131410132139_657.doc"
      } catch (e: any) {
        message.error('打印失败, ex: ' + e.toString());
      }
      return;
    }
    if (isOpen == -1) {
      const currTab = {
        key: aTab['No'],
        tab: aTab['Name'],
        methodModal: aTab['MethodModel'],
        methodID: aTab['MethodID'],
        No: aTab['No'],
        Name: aTab['Name'],
        url: aTab['Docs'],
        Attrs: attrs,
        EntityRef: unref(aTab) as EntityNoName,
        PFrmID: props.params!.FrmID || route.query?.FrmID,
        PWorkID: props.params!.WorkID || parseInt(route.query?.OID),
        BillFrmID: aTab['Tag1'],
        RefNo: props.params.RefNo,
      };
      if (aTab['MethodModel'] === 'Link') {
        const userStore = useUserStore();
        const { WorkID, FrmID } = props.params!;
        currTab.url += `${currTab.url.includes('?') ? '&' : '?'}WorkID=${WorkID}&FrmID=${FrmID}&Token=${userStore.token}`;
        currTab.url = DealExp(currTab.url, entity.value);
        const isHavesuffixVue = currTab.url.endsWith('.vue');
        // 模态框打开
        if (aTab.RefMethodType === 0) {
          if (isHavesuffixVue == true) baseComponent.value?.openModalByUrl(aTab['Name'], currTab.url);
          else baseComponent.value?.openIframe({ title: aTab['Name'], width: '70%', src: currTab.url, openType: 0 });
          return;
        }
        // 新窗口打开 //转到新页面
        if (aTab.RefMethodType === 1 || aTab.RefMethodType === 4) {
          windowOpen(currTab.url);
          return;
        }
      }
      openTabs.value.push(currTab);
      console.log(openTabs.value);
    }
    currentActiveTab = aTab;
    activeKey.value = aTab['No'];
  };
  const PrintRTF = async (temPK) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('FK_Bill', temPK);
    handler.AddPara('SourceType', entityType.value === 5 ? 'EntityNoName' : 'Bill');
    handler.AddPara('WorkID', props.params?.WorkID);
    handler.AddPara('FID', 0);
    handler.AddPara('FrmID', props.params?.FrmID);
    const data = await handler.DoMethodReturnString('PrintDoc_Init');
    if (data.indexOf('file@') == 0 || data.indexOf('url@') == 0) {
      modalVisible.value = false;
      let result = data.replace('file@', '');
      result = result.replace('url@', '');
      const basePath = VITE_GLOB_API_URL;
      if (result.indexOf('rtf@') != -1 || result.indexOf('pdf@') != -1) {
        //直接执行打印
        result = result.replace('rtf@', '').replace('pdf@', '');
        result = basePath + '/' + result;
        window.open(result);
      } else {
        message.info('其他类型还未解析');
      }
    }
  };
  const handleTabEdit = (key, action) => {
    if (action === 'remove') {
      const index = openTabs.value.findIndex((item) => item.key === key);
      openTabs.value.splice(index, 1);
    }
    if (openTabs.value.length == 0) {
      activeKey.value = 'enInfo';
      selectedKeys.value = [];
    }
    const length = openTabs.value.length;
    if (length > 0) activeKey.value = openTabs.value[length - 1].key;
  };
  InitPage();
</script>
<style lang="less" scoped>
  .back {
    background-color: white;
    height: 100%;
    .white {
      background-color: white;
    }
  }

  .flow-etc-frame {
    width: 100%;
    height: var(--viewport-height);
    border: none;
  }
  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0 0 10px 0;
  }
  :deep(.ant-menu-inline .ant-menu-item) {
    height: 100%;
    line-height: 35px;
    white-space: normal;
  }
</style>
