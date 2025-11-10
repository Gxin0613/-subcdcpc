<template>
  <Spin :spinning="loading">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else>
      <NavBar :title="title" :fixed="true">
        <template #left>
          <Icon name="bars" size="18" @click="onClickLeft" />
        </template>
        <template #right>
          <span style="color: blue" size="18" @click="onClickRight">{{ '关闭' }}</span>
        </template>
      </NavBar>
      <MyEntityNoName
        v-if="activeKey === 'enInfo' && entityType === 5"
        :params="props.params"
        @trigger-close="$emit('trigger-close')"
        :methodModal="'基本信息'"
        @trigger-update="triggerMyEntityNoNameUpdate"
        :isFramework="true"
      />
      <MyBill
        v-if="activeKey === 'enInfo' && entityType === 1"
        :params="props.params"
        @trigger-close="$emit('trigger-close')"
        :methodModal="'基本信息'"
        @trigger-update="triggerMyEntityNoNameUpdate"
        :isFramework="true"
      />
      <div v-if="activeKey != 'enInfo' && curMenu != null" :style="curMenu.methodModal === 'FrmBBS' || curMenu.methodModal === 'DictLog' ? { marginTop: '46px' } : ''">
        <FrmBBS v-if="curMenu.methodModal === 'FrmBBS'" :params="{ ...props.params, workID: props.params?.WorkID }" style="margin-top: 46px" />
        <DBVer v-else-if="curMenu.methodModal === 'DataVer'" :params="{ ...props.params, WorkID: props.params?.WorkID, FrmID: props.params?.FrmID }" style="margin-top: 46px" />

        <iframe
          class="flow-etc-frame"
          v-else-if="curMenu.methodModal === 'FlowEtc'"
          :src="`/#/CCMobile/GenerList?EnName=GL_FlowEtcList&WorkID=${props.params?.WorkID}&FlowNo=${curMenu.methodID}&FrmID=${props.params?.FrmID}&MethodNo=${curMenu.key}&isShowBar=false&IsSinglePages=0`"
        ></iframe>
        <iframe
          class="flow-etc-frame"
          v-else-if="curMenu.methodModal === 'FlowBaseData'"
          :src="`/#/CCMobile/GenerList?EnName=GL_FlowEtcList&WorkID=${props.params?.WorkID}&FlowNo=${curMenu.methodID}&FrmID=${props.params?.FrmID}&MethodNo=${curMenu.key}&isShowBar=false&IsSinglePages=0`"
        ></iframe>
        <DictLog v-else-if="curMenu.methodModal === 'DictLog'" :params="{ ...props.params, workID: props.params?.WorkID }" />

        <iframe
          class="flow-etc-frame"
          v-else-if="curMenu.methodModal === 'Func'"
          :src="`/#/CCMobile/GenerList?EnName=GL_FuncLog&IsHavePara=${curMenu.Attrs.length === 0 ? 0 : 1}&OID=${props.params?.WorkID}&MethodID=${curMenu.methodID}&FrmID=${
            props.params?.FrmID
          }&MethodName=${curMenu.Name}&MethodNo=${curMenu.key}&isShowBar=false`"
        ></iframe>

        <RefMethodFunc
          v-else-if="curMenu.methodModal === 'Func222'"
          :row="Object.fromEntries(curMenu.EntityRef.Row)"
          :title="curMenu.Name"
          :method-name="curMenu.No"
          :attrs="(curMenu.Attrs as any)"
          :entity-ref="curMenu.EntityRef"
          @exec="execMethod"
        />
        <MyEntityNoName
          v-else-if="curMenu.methodModal === 'PrintRTF' && !reloading && entityType === 5"
          :params="props.params"
          :printType="curMenu.methodModal"
          :isReadonly="isReadonly"
          style="padding: 0"
          @trigger-close="$emit('trigger-close')"
        />
        <MyBill
          v-else-if="curMenu.methodModal === 'PrintRTF' && !reloading && entityType === 1"
          :params="props.params"
          :printType="curMenu.methodModal"
          :isReadonly="isReadonly"
          style="padding: 0"
          @trigger-close="$emit('trigger-close')"
        />
        <iframe
          class="flow-etc-frame"
          v-else-if="curMenu.methodModal === 'DictRefBill'"
          :src="`/#/CCMobile/GenerList?EnName=GL_DictRefBill&OID=${props.params?.WorkID}&MethodID=${curMenu.No}&FrmID=${props.params?.FrmID}&MethodName=${curMenu.Name}&MethodNo=${curMenu.key}&title=${props.params?.title}&isShowBar=false&IsSinglePages=0`"
        ></iframe>
        <iframe
          class="flow-etc-frame"
          v-else-if="curMenu.methodModal === 'DBList'"
          :src="`/#/CCMobile/GenerList?EnName=GL_DBList&OID=${props.params?.WorkID}&MethodID=${curMenu.No}&FrmID=${props.params?.FrmID}&MethodNo=${curMenu.key}&isShowBar=false&IsSinglePages=0`"
        ></iframe>
        <iframe
          class="flow-etc-frame"
          v-else-if="curMenu.methodModal === 'SingleDictGenerWorkFlows'"
          :src="`/#/CCMobile/GenerList?EnName=GL_DictSingleDictGenerWorkFlow&OID=${props.params?.WorkID}&MethodID=${curMenu.No}&FrmID=${props.params?.FrmID}&MethodNo=${curMenu.key}`"
        ></iframe>
        <Link v-else-if="curMenu.methodModal === 'Link' && !reloading" :url="curMenu.url" />
        <div v-else>{{ curMenu.methodModal }}方法未实现</div>
      </div>
    </div>
    <Popup v-model:show="pop.visible" position="left" style="min-width: 200px; max-width: 50%; height: calc(var(--viewport-height))" @close="activeKey === 'enInfo'">
      <LayoutSider style="background-color: white" v-if="menu.length > 0">
        <Menu mode="inline" id="menu" @click="handleMenuClick" v-model:selectedKeys="selectedKeys" :open-keys="menuOpenKeys">
          <SubMenu v-for="group in menu" :key="group.No">
            <template #icon><i :class="group.Icon || 'icon-folder'"></i></template>
            <template #title>{{ group.Name }}</template>
            <MenuItem v-for="method in group.methods" :key="method.No"><i style="margin-right: 8px" :class="method.Icon || 'icon-drop'"></i>{{ method.Name }} </MenuItem>
          </SubMenu>
        </Menu>
      </LayoutSider>
    </Popup>
  </Spin>
</template>
<script lang="ts" setup>
  import { NavBar, Icon, Popup } from 'vant';
  import { Spin, message, LayoutSider, Menu, SubMenu, MenuItem } from 'ant-design-vue';
  import { reactive, ref, unref } from 'vue';
  import MyEntityNoName from './MyEntityNoName.vue';
  import MyBill from './MyBill.vue';
  import { GroupMethods, GroupMethod } from '/@/CCFast/CCBill/Method/GroupMethod';
  import { MethodAttr, Methods } from '/@/CCFast/CCBill/Method/Method';
  import FrmBBS from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue';
  import Link from '/@/CCFast/CCBill/Components/FrmDict/Link.vue';
  import DictLog from '/@/CCFast/CCBill/OptComponents/DictLog.vue';
  import DBVer from '/@/CCFast/CCBill/OptComponents/DBVer.vue';
  import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { EntityNoName } from '/@/bp/en/EntityNoName';
  import RefMethodFunc from '/@/WF/Comm/RefMethodFunc.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
  interface MenuInfo {
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
      defaul: () => ({
        WorkID: '',
        FrmID: '',
      }),
    },
  });
  //当出现打印按钮时表单内容只读
  const isReadonly = ref<boolean>(true);
  const reloading = ref(false);
  const curMenu = ref<MenuInfo>(null);
  const activeKey = ref('enInfo');
  const selectedKeys = ref([]);
  const enMethods = ref<MethodAttr[]>([]);
  const menu = ref<any>([]);
  //点击关闭按钮操作
  const onClickRight = () => {
    history.back();
  };
  //点击左侧操作
  const onClickLeft = () => {
    pop.visible = true;
  };
  const pop = reactive({
    visible: false,
  });
  const triggerMyEntityNoNameUpdate = () => {
    reloading.value = true;
    setTimeout(() => {
      reloading.value = false;
    }, 50);
  };
  const menuOpenKeys = ref<string[]>([]);
  const title = ref(props.params.title);
  const entityType = ref(0);
  const InitPage = async () => {
    try {
      console.log('参数：', props.params);
      loading.value = true;
      const frmDict = new FrmDict();
      frmDict.setPKVal(props.params?.FrmID);
      await frmDict.RetrieveFromDBSources();
      entityType.value = frmDict.EntityType;

      const groups = new GroupMethods();
      await groups.Retrieve('FrmID', props.params?.FrmID);
      const methods = new Methods();
      await methods.Retrieve('FrmID', props.params?.FrmID);
      methods.push({
        No: 'MyEntityNoName',
        FrmID: 'MyEntityNoName',
        Name: '基础信息',
        MethodModel: 'MyEntityNoName',
        GroupID: props.params?.FrmID,
      });
      enMethods.value = methods;
      const group = new GroupMethod();
      group.No = props.params?.FrmID;
      group.Name = '基础信息';
      group.FrmID = props.params?.FrmID;
      groups.unshift(group);
      groups.forEach((item) => {
        const group = item;
        const children = methods.filter((i) => i.GroupID == item.No);
        if (Array.isArray(children) && children.length > 0) group.methods = children;
        for (let i = 0; i < menu.value; i++) {
          if (group.No == menu.value[i].No) return;
        }
        menu.value.push(group);
      });

      if (menu.value.length > 0) {
        menuOpenKeys.value = [menu.value[0].No];
      }
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

  const handleMenuClick = async (e) => {
    pop.visible = false;
    const method = enMethods.value.filter((item) => item[MethodAttr.No] == e.key)[0];
    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', method[MethodAttr.No], 'Idx');
    console.log({ attrs });
    attrs.forEach((attr) => {
      attr.Key = attr.KeyOfEn;
      attr.Desc = attr.Name;
    });
    // console.log(aTab[MethodAttr.MethodModel]);
    if (method[MethodAttr.MethodModel] === 'PrintRTF') {
      try {
        message.info('打印中,请稍候...');
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', props.params?.FrmID);
        handler.AddPara('Method', method[MethodAttr.No]);
        handler.AddPara('WorkID', props.params?.WorkID);
        const res = await handler.DoMethodReturnJson<{ FileName: string; FileUrl: string }>('MyEntityNoName_PrintRTF');
        window.open(import.meta.env.VITE_GLOB_API_URL + '/' + res.FileUrl);
      } catch (e: any) {
        message.error('打印失败, ex: ' + e.toString());
      }
      return;
    }
    curMenu.value = {
      key: method[MethodAttr.No],
      tab: method[MethodAttr.Name],
      methodModal: method[MethodAttr.MethodModel],
      methodID: method[MethodAttr.MethodID],
      No: method[MethodAttr.No],
      Name: method[MethodAttr.Name],
      url: method[MethodAttr.Docs],
      Attrs: attrs,
      EntityRef: unref(method) as EntityNoName,
      PFrmID: props.params!.FrmID,
      PWorkID: props.params!.WorkID,
      BillFrmID: method[MethodAttr.Tag1],
    };
    if (method[MethodAttr.MethodModel] === 'Link') {
      const userStore = useUserStore();
      const { WorkID, FrmID } = props.params!;
      curMenu.value.url += `${curMenu.value.url.includes('?') ? '&' : '?'}WorkID=${WorkID}&FrmID=${FrmID}&Token=${userStore.token}`;
    }
    if (method[MethodAttr.MethodModel] === 'MyEntityNoName') activeKey.value = 'enInfo';
    else activeKey.value = method[MethodAttr.No];
    console.log(curMenu.value);
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
    height: calc(var(--viewport-height) - 10px);
    border: none;
  }
  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0 0 10px 0;
  }
</style>
