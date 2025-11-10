<template>
  <base-component ref="baseComponent" :closeModalFunc="loadPage" :update-func="InitPage">
    <ThemeWrapper>
      <div class="en-wrapper">
        <Spin :spinning="loading">
          <div v-if="errorObj.hasError" class="ant-tag-red">
            {{ errorObj.tips }}
          </div>
          <div v-else class="en-body" :style="enBodyHeight" ref="enBodyElem">
            <!-- <Transition name="slide-fade"> -->
            <div class="en-sidebar" :style="sideMenuStyle" v-if="sidebarVisible">
              <Menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline">
                <SubMenu v-for="group in enMethodGroup" :key="group.No">
                  <template #title>
                    <span> <i :class="group.Icon"></i> &nbsp; {{ group.Name }} </span>
                  </template>
                  <MenuItem v-for="menu in group.children" :key="menu.ClassMethod" @click="menuClick(menu)"><i class="rm-icon" :class="menu.Icon"></i>{{ menu.Title }} </MenuItem>
                </SubMenu>
              </Menu>
            </div>
            <!-- </Transition> -->
            <div class="collapse_btn" v-if="sidebarVisible" @click="sideMenuVisible = !sideMenuVisible" :style="floatBtnStyle">
              <left-outlined class="icon" :style="arrowStyle" />
            </div>
            <div class="en-content" :style="enContentStyle">
              <div v-if="!sidebarVisible && entityObj" class="p-0" :style="contentStyle" :ref="setEnContent">
                <!--实体属性-->
                <EnOnly
                  :EnName="entityObj.classID"
                  :PKVal="innerPKVal"
                  :params="props.params"
                  :entity-ref="entityObj"
                  :encfg-ref="enCfgObj"
                  :sub-tables="subTables"
                  :key="loadKey"
                  ref="enRef"
                  @delete-entity="isDeleted = true"
                  @update-pk="updatePKVal"
                  @handle-gpn-callback="(args) => baseComponent?.handleGPNCallback(args)"
                />
              </div>
              <Tabs v-else @edit="(e, action) => tabEdit(e, action)" v-model:activeKey="activeTabKey" type="editable-card" :hide-add="true" @change="changeTab">
                <TabPane v-if="entityObj && basicInfoVisible" key="basic-info" :closable="false">
                  <template #tab>
                    <span>
                      <home-outlined />
                      {{ entityObj?._enMap?.EnDesc }}
                    </span>
                  </template>
                  <div class="p-0" :style="contentStyle" :ref="setEnContent">
                    <!--实体属性-->
                    <EnOnly
                      :EnName="entityObj.classID"
                      :PKVal="innerPKVal"
                      :params="props.params"
                      :entity-ref="entityObj"
                      :en-cfg-ref="enCfgObj"
                      :sub-tables="subTables"
                      :no-save-button="noSaveButton"
                      :key="loadKey"
                      ref="enTabRef"
                      @delete-entity="isDeleted = true"
                      @update-pk="updatePKVal"
                      @handle-gpn-callback="(args) => baseComponent?.handleGPNCallback(args)"
                    />
                  </div>
                </TabPane>
                <TabPane v-for="tab in openedTabs" :closable="true" :key="tab.ClassMethod" :tab="tab.Title" @click="activeTabKey = tab.ClassMethod">
                  <div :style="contentStyle" :ref="setEnContent">
                    <!--分组编辑-->
                    <GroupPageEdit
                      v-if="tab.RefMethodType === RefMethodType.GroupPageEdit"
                      :EnName="tab.Tag?.classID"
                      :params="tab.params"
                      :PKVal="innerPKVal"
                      :suffix="tab.Target"
                    />
                    <!--分步页面-->
                    <GroupPageNew v-else-if="tab.RefMethodType === RefMethodType.GroupPageNew" :params="tab.params" />

                    <!--分组编辑-->
                    <PanelGroup v-else-if="tab.RefMethodType === RefMethodType.PanelGroup" :params="tab.params" :suffix="tab.Target" />
                    <!--分组编辑-->
                    <En v-else-if="tab.RefMethodType === RefMethodType.En" :params="tab.params" :suffix="tab.Target" />
                    <!--分组编辑-->
                    <EnOnly
                      v-else-if="tab.RefMethodType === RefMethodType.EnOnly"
                      :params="tab.params"
                      :entity-ref="entityObj"
                      :encfg-ref="enCfgObj"
                      :suffix="tab.Target"
                      :key="loadKey"
                      :no-save-button="noSaveButton"
                      @update-pk="updatePKVal"
                      @handle-gpn-callback="(args) => baseComponent?.handleGPNCallback(args)"
                    />
                    <!-- 执行方法-->
                    <RefMethodFunc
                      v-else-if="tab.RefMethodType === RefMethodType.Func"
                      :row="Object.fromEntries(entityObj!.Row)"
                      :title="tab.Title"
                      :method-name="tab.ClassMethod"
                      :rm-en-map="tab.HisMap"
                      :entity-ref="entityObj"
                      :ref-method="(tab as RefMethod)"
                      :exec-func="execConfirmMethod"
                      @exec="execConfirmMethod"
                    />
                    <iframe v-else-if="tab.RefMethodType === RefMethodType.TabIframeOpen" :src="tab.iframeUrl" class="tab-iframe"></iframe>
                    <!-- 根据URL拿到组件-->
                    <div v-else-if="isTabOpen(tab.RefMethodType)">
                      <component
                        v-if="isTabOpen(tab.RefMethodType) && activeTabKey === tab.ClassMethod"
                        :is="loadComponent(tab.ClassMethod)"
                        :params="tab.params"
                        :custom-params="tab.customParams"
                        :parent-context="{ type: 'En' }"
                      />
                    </div>
                    <!-- <div v-else> 【 未知打开方式，请检查 】</div> -->
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </Spin>
        <!--    模态弹窗-->
        <Modal v-model:open="confirmModal.visible" :title="confirmModal.title" centered>
          <template #footer>
            <div class="modal-footer-style">
              <Button @click="resetModal">取消</Button>
              <Button type="primary" @click="execConfirmMethod(confirmModal.confirmMethod, {})" :loading="methodLoading">确定</Button>
            </div>
          </template>
          <div class="p-4" v-html="confirmModal.content"> </div>
        </Modal>
      </div>
    </ThemeWrapper>
  </base-component>
</template>
<script lang="ts" setup>
  import { Menu, MenuItem, message, Modal, Spin, SubMenu, TabPane, Tabs, Button } from 'ant-design-vue';
  import { HomeOutlined, LeftOutlined } from '@ant-design/icons-vue';
  import { computed, nextTick, reactive, ref, unref, shallowRef, provide, onMounted } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import { RefMethod, RefMethodType, SubTableInfo } from '/@/bp/en/Map/RefMethod';
  import GroupPageEdit from '/@/WF/Comm/UIEntity/GroupPageEdit.vue';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import PanelGroup from '/@/WF/Comm/PanelGroup.vue';
  import BaseComponent from './BaseComponent.vue';
  import EnOnly from '/@/WF/Comm/EnOnly.vue';
  import { Entity } from '/@/bp/en/Entity';
  import RefMethodFunc from '/@/WF/Comm/RefMethodFunc.vue';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { windowOpen } from '/@/utils/windowOpen';
  import { cloneDeep } from 'lodash-es';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import ThemeWrapper from './ThemeWrapper.vue';
  import { SubTablePosition } from '/@/bp/en/Config';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useRoute } from 'vue-router';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';
  import { EN_SIDEBAR_WIDTH } from '/@/components/Entities/src/constants';
  import { BaseEntityExt } from '/@/bp/UIEntity/BaseEntityExt';
  import WebUser from '/@/bp/web/WebUser';
  import Dev2Interface from '../TSClass/Dev2Interface';
  import { GloComm } from './GloComm';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  interface EnMenu {
    No: string;
    Name: string;
    Icon: string;
    children: Array<RefMethod>;
  }

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // eslint-disable-next-line vue/prop-name-casing
    EnName: {
      type: String,
      default: '',
    },
    // eslint-disable-next-line vue/prop-name-casing
    PKVal: {
      type: String,
      default: '',
    },
    // 默认展开
    defaultExpand: {
      type: Boolean,
      default: false,
    },
    noSaveButton: {
      type: Boolean,
      default: false,
    },
  });

  const { loadComponent } = useComponentLoader();

  const emit = defineEmits(['editClosed', 'update-system-logo']);
  const isDeleted = ref(false);
  const enBodyTop = ref(0);
  const enBodyElem = shallowRef<HTMLElement>();
  const enBodyHeight = computed(() => {
    // 在抽屉等容器环境中，使用相对高度而不是视口高度
    if (enBodyTop.value > 0) {
      return {
        height: `calc(100vh - ${enBodyTop.value}px)`,
      };
    }
    // 默认使用100%高度，让容器自适应父级高度
    return {
      height: '100%',
      minHeight: '400px',
    };
  });

  const basicInfoVisible = ref(true);
  const innerPKVal = ref();
  const EnName = ref();

  const isFramework = (entityObj: Entity) => {
    const ext = entityObj.GetRefExt() as BaseEntityExt;
    return !!ext?.EnOption?.isFramework || entityObj._enMap.attrs.filter((attr) => attr.UIVisible).length === 0;
  };
  // # style start
  const sidebarVisible = ref(false);
  const sideMenuVisible = ref(CommonConfig.IsDefaultShowEnMethod);
  const sideMenuStyle = computed(() => {
    return {
      width: sideMenuVisible.value ? EN_SIDEBAR_WIDTH : '0',
    };
  });
  const enContentStyle = computed(() => {
    return {
      width: !sidebarVisible.value || !sideMenuVisible.value ? '100%' : `calc(100% - ${EN_SIDEBAR_WIDTH})`,
      // left: !sideMenuVisible.value ? '0' : '200px',
    };
  });
  const floatBtnStyle = computed(() => {
    return {
      left: sideMenuVisible.value ? EN_SIDEBAR_WIDTH : '0px',
    };
  });
  const arrowStyle = computed(() => {
    return {
      fontSize: '18px',
      transition: 'all ease 0.3s',
      transform: `rotate(${sideMenuVisible.value ? 0 : 180}deg)`,
    };
  });
  // # style end
  const getSidebarStatus = () => {
    //如果主键是Null 就不显示.
    if (!innerPKVal.value) return false;

    // 获得显示的相关方法
    const targetRms = rms.value.filter((rm) => {
      return rm.RefMethodType !== RefMethodType.FuncToolbar;
    });

    //如果没有相关功能.
    if (targetRms.length == 0) return false;

    //如果超过两个相关功能.
    if (targetRms.length >= 1) return true;
    // 求出可显示的字段数量.
    const visibleAttrs =
      entityObj.value?._enMap?.attrs?.filter((attr) => {
        return !!attr.UIVisible;
      }) || [];

    // === 1
    //如果字段数量 =0， 并且 可显示的相关功能 =1 ，就不显示.
    if (visibleAttrs.length <= 0) return false;

    //显示相关功能。
    return true;
  };
  const updatePKVal = async (val) => {
    entityObj.value = undefined;
    await nextTick();
    innerPKVal.value = val;
    await InitPage();
    sidebarVisible.value = getSidebarStatus();
  };

  // sidebar相关
  const selectedKeys = ref<string[]>([]);
  const openKeys = ref<string[]>(['menu0']);

  // 通过tab打开的链接方式
  const isTabOpen = (type: number) => {
    return [RefMethodType.Dtl, RefMethodType.SearchFlow, RefMethodType.TabOpen, RefMethodType.DataVBase, RefMethodType.One2Many].includes(type);
  };
  const loadKey = ref(0);
  const isLoad = ref(false);
  //打开表单的附件

  // 向内部组件提供能力
  const handleGPNCallback = (data: GPNReturnObj, title: string) => {
    baseComponent.value?.handleGPNCallback(data, title);
  };
  provide('handleGPNCallback', handleGPNCallback);
  // 菜单属性
  const activeComp = ref<Record<string, any>>({});
  const openedTabs = ref<Array<Record<string, any>>>([]);
  const activeTabKey = ref('basic-info');
  const tabEdit = (targetKey: any, action: string) => {
    if (action === 'remove') {
      closeTab(targetKey);
    }
  };

  const changeTab = (e) => {
    selectedKeys.value = [e];
  };

  const handleTabsEvents = async (menu: any) => {
    activeComp.value = {};
    await nextTick();
    activeComp.value = menu;
    if (openedTabs.value.find((tab) => tab.ClassMethod === menu.ClassMethod)) {
      activeTabKey.value = menu.ClassMethod;
      return;
    }
    const getParams = () => {
      const urlParams = isTabOpen(menu.RefMethodType) ? getAllRequestParams(getSubPagesUrl(validUrl)) : getAllRequestParams(validUrl);
      return {
        ...urlParams,
        ...menu.params,
        //Title: menu.Title,
        Icon: menu.Icon,
      };
    };
    let validUrl = GloWF.DealExp(menu.ClassMethod, unref(entityObj)!);
    if (validUrl.includes('@')) validUrl = GloWF.DealExp(validUrl, Object.fromEntries(entityObj.value!.Row));
    console.log({ validUrl });
    menu.params = getParams();
    menu.iframeUrl = validUrl;
    menu.ClassMethod = validUrl;

    openedTabs.value.push(menu);
    activeTabKey.value = menu.ClassMethod;
  };
  // 关闭tab页面
  const closeTab = async (key: any) => {
    activeComp.value = {};
    await nextTick();
    const idx = openedTabs.value.findIndex((tab) => tab.ClassMethod === key);
    if (idx === -1) return;
    // 如果关闭的第一个
    if (idx === 0 && openedTabs.value[idx + 1]) {
      openedTabs.value.splice(0, 1);
      activeComp.value = openedTabs.value[0];
      activeTabKey.value = activeComp.value.ClassMethod;
      return;
    }
    if (openedTabs.value[idx - 1]) {
      activeComp.value = openedTabs.value[idx - 1];
      openedTabs.value.splice(idx, 1);
      activeTabKey.value = activeComp.value.ClassMethod;
      return;
    }
    openedTabs.value = [];
    activeTabKey.value = 'basic-info';
  };

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

  const getSubPagesUrl = (url: string) => {
    const hasQuerySymbol = url.includes('?');
    //判断 url中的RefPK
    const params = getAllRequestParams(url);
    const refPK = params['RefPK'] || '';
    let pkval = innerPKVal.value;
    if (!!refPK) {
      if (params?.hasOwnProperty(refPK) && params[refPK] != 'RefPK') {
        pkval = params[refPK];
      }
    }
    return url + `${hasQuerySymbol ? '&' : '?'}EnClassID=${EnName.value}&PKVal=${pkval}`;
  };

  const methodLoading = ref(false);

  // 点击确定执行的方法
  const execConfirmMethod = async (methodName: string, args: any, customTitle = '') => {
    try {
      methodLoading.value = true;
      // 如果不是合法url，终止执行
      if (!methodName || methodName.includes('/')) {
        return;
      }
      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      if (methodName.startsWith('PrintRTF')) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTSExt');
        handler.AddPara('FileName', methodName.replace('PrintRTF-', ''));
        handler.AddPara('PKVal', entityObj.value?.PKVal);
        handler.AddPara('EnName', entityObj.value?.classID);
        handler.AddPara('FileType', 'doc');
        const fileUrl = await handler.DoMethodReturnString('Print_RTF');
        const opener = window.open(VITE_GLOB_API_URL + fileUrl);
        if (opener == null) {
          message.warn('浏览器打开弹窗失败，请允许');
        }
        return;
      }
      // @ts-ignore
      const calledMethod = entityObj.value?.[methodName]?.bind(entityObj.value);
      if (!calledMethod) {
        return;
      }
      let res = await calledMethod(...Object.values(args));
      // 如果没有返回值则不处理
      if (!res) return;

      if (typeof res !== 'undefined' && typeof res != 'string' && res.hasOwnProperty('ReturnType')) {
        baseComponent.value?.handleGPNCallback(res, res.title);
        return;
      }

      if (typeof res === 'object' && res.hasOwnProperty('RefMethodType')) {
        menuClick(res);
        return;
      }

      if (typeof res === 'object') {
        res = 'tabOpen@' + JSON.stringify(res);
      }
      // 如果方法执行返回url地址
      if (typeof res === 'string' && res.startsWith('url@')) {
        // 这种方式默认打开在新的标签页
        windowOpen(res.replace('url@', ''));
        return;
      }

      // 专有逻辑，处理方法执行返回消息需要单独打开窗口查看的情况
      if (typeof res === 'string' && res.startsWith('tabOpen@')) {
        const actualMsg = res.replace('tabOpen@', '');
        let title = '';
        if (customTitle !== '') {
          title = customTitle;
        } else {
          title = methodName;
        }
        const openTabParams = {
          Title: title,
          ClassMethod: `/src/WF/Comm/UIEntity/ResultMsg.vue`,
          RefMethodType: RefMethodType.TabOpen,
          customParams: {
            title,
            msg: actualMsg,
          },
        };
        // 如果当前窗口存在，需要关闭后重新加载
        await closeTab(openTabParams.ClassMethod);
        setTimeout(async () => {
          await handleTabsEvents(openTabParams);
        }, 200);
        return;
      }
      // end
      message.success(res);
      const _entity = unref(entityObj);
      if (!_entity) return;
      const title = _entity.EnMap.rms.find((rm) => rm.ClassMethod == methodName)?.Title || 'title';
      const pTable = _entity.EnMap.PhysicsTable;
      const pk = _entity.PK;
      const msg = `执行了方法: [${title}], 参数: [${JSON.stringify(args)}], 执行结果: [${res}]`;
      await Dev2InterfaceCCBill.WriteTrack(pTable, _entity.Row.GetValByKey(pk), msg);
      resetModal();
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    } finally {
      resetModal();
      methodLoading.value = false;
    }
  };
  // 全屏弹窗 end

  /**左侧菜单点击事件 */

  // 动态的加载组件
  // 就需要文件的绝对地址
  // path: /src/**/*.vue结尾
  const menuClick = async (menu: any) => {
    // 实体流程相关配置(宿主流程，需要workID)
    if (menu.RefMethodType === RefMethodType.StartHostFlow) {
      if (!entityObj.value) {
        message.error('发起宿主流程失败，实体不存在');
        return;
      }
      const { No, WorkIDFieldName, FieldMap } = menu.RefFlowInfo;
      if (entityObj.value[WorkIDFieldName] == 0) {
        const workID = await Dev2Interface.Node_CreateBlank(No); //创建workID.
        await Dev2Interface.Node_SetDraft(workID); //设置为草稿.
        entityObj.value.SetValByKey(WorkIDFieldName, workID); //设置workID,更新到.
        //保存数据到开始节点表单.
        let paras = ``;
        for (const [k, v] of FieldMap) {
          paras += `@${k}=${entityObj.value.GetValByKey(v)}`;
        }
        await Dev2Interface.Node_SaveWork(workID, paras); //保存数据,也可以使用http方式传入.
        await entityObj.value.Update();
      }
      let paras = `&FlowNo=${No}`;
      for (const [k, v] of FieldMap) {
        paras += `&${k}=${entityObj.value.GetValByKey(v)}`;
      }
      const url = GloComm.UrlMyView(entityObj.value[WorkIDFieldName], paras);
      const command = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      baseComponent.value?.handleGPNCallback(command);
      return;
    }
    if (menu.RefMethodType === RefMethodType.StartFlow) {
      if (!entityObj.value) {
        message.error('发起宿主流程失败，实体不存在');
        return;
      }
      const { No, FieldMap } = menu.RefFlowInfo;
      let paras = ``;
      for (const [k, v] of FieldMap) {
        paras += `&${k}=${entityObj.value.GetValByKey(v)}`;
      }
      const url = GloComm.UrlMyFlow(No, paras);
      const command = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
      baseComponent.value?.handleGPNCallback(command);
      return;
    }
    // 新窗口打开
    if (menu.RefMethodType === RefMethodType.LinkeWinOpen) {
      let allowedUrl = menu.ClassMethod.replace('/src/', '/').replace('.vue', '');
      allowedUrl = GloWF.DealExp(allowedUrl, unref(entityObj)!);
      if (!entityObj.value) {
        message.error('实体对象不存在');
        return;
      }
      allowedUrl = GloWF.DealExp(allowedUrl, Object.fromEntries(entityObj.value.Row));
      windowOpen(allowedUrl);
      return;
    }

    // 模态框打开
    if (menu.RefMethodType === RefMethodType.LinkModel) {
      baseComponent.value?.openModalByUrl(menu.title, menu.ClassMethod);
      return;
    }

    if (menu.RefMethodType === RefMethodType.Func) {
      const attrs = menu.HisMap.attrs;
      if (Array.isArray(attrs) && attrs.length > 0) {
        await handleTabsEvents(menu);
        return;
      }
      if (!menu.Warning) {
        await execConfirmMethod(menu.ClassMethod, {}, menu.Title);
        return;
      }
      confirmModal.confirmMethod = menu.ClassMethod;
      confirmModal.visible = true;
      confirmModal.content = menu.Warning;
      confirmModal.title = menu.Title;
      return;
    }

    // 右侧抽屉打开
    if (menu.RefMethodType === RefMethodType.RightFrameOpen) {
      try {
        if (!menu.ClassMethod.includes('/')) {
          // @ts-ignore
          const calledMethod = entityObj.value[menu.ClassMethod].bind(entityObj.value);
          if (!calledMethod) {
            return;
          }
          const res = await calledMethod(...Object.values({}));
          // 处理可能是GPN的情况
          if (typeof res !== 'undefined' && typeof res != 'string' && res.hasOwnProperty('ReturnType')) {
            baseComponent.value?.handleGPNCallback(res, res.title);
            return;
          }
          if (!res.includes('/')) {
            message.error('错误的组件url链接');
            return;
          }
          menu.ClassMethod = res;
        }
        const url = getSubPagesUrl(menu.ClassMethod);
        baseComponent.value?.openDrawerByUrl(menu.title, url, '70%', entityObj.value);
      } catch (e: any) {
        console.trace(e);
        message.error(e.toString());
      }
      return;
    }
    // 余下的包括 Dtl/TabOpen,直接从新标签页打开
    await handleTabsEvents(menu);
  };

  /**
 负责人: .
 */
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const enMethodGroup = ref<Array<EnMenu>>([]);
  // 分组操作
  const groupByGroupName = (rms: Array<RefMethod>) => {
    // 过滤掉一对多关系
    // rms = rms.filter((rm) => ![RefMethodType.One2Many, RefMethodType.OneAttr2Many, RefMethodType.FuncToolbar].includes(rm.RefMethodType));
    const groups = Array.from(new Set(rms.map((rm) => rm.GroupName))).map((groupName) => {
      return {
        name: groupName,
        icon: rms.find((rm) => rm.GroupName === groupName)?.GroupIcon || '',
      };
    });
    const callbackGroups: Array<any> = [];
    groups.forEach((item, index) => {
      callbackGroups.push({
        No: 'group' + index,
        Name: item.name,
        Icon: item.icon,
        children: rms.filter((rm) => rm.GroupName === item.name && rm.RefMethodType !== RefMethodType.FuncToolbar),
      });
    });
    return callbackGroups;
  };

  // 实体功能
  const rms = ref<Array<RefMethod>>([]);
  // 实体子表

  const subTables = ref<SubTableInfo[]>([]);

  const entityObj = ref<Entity>();
  const enCfgObj = ref<EnCfg>();
  const route = useRoute();
  const checkParams = () => {
    // 更改优先级，props > 路由参数
    let classID, pk;
    if (props.EnName) {
      classID = props.EnName || props.params?.EnName || route.query?.EnName;
      pk = props.PKVal || props.params?.PKVal || props.params?.SortNo;
    } else {
      classID = props.params?.EnName || route.query?.EnName;
      pk = props.params?.SortNo || props.params?.PKVal || route.query?.PKVal;
    }
    if (classID == undefined || classID == '') {
      throw new Error(`缺少参数 [ EnName ]`);
    }
    EnName.value = classID;
    innerPKVal.value = pk;
  };
  const InitPage = async () => {
    try {
      loading.value = true;
      const entity = await ClassFactory.GetEn(EnName.value!);
      await entity.Init();
      const uac = entity.HisUAC;
      if (!uac.IsView) {
        errorObj.hasError = true;
        errorObj.tips = `非法用户`;
        return;
      }
      if (!innerPKVal.value && !uac.IsInsert) {
        errorObj.hasError = true;
        errorObj.tips = '您对[' + EnName.value + ']没有新增权限';
        return;
      }
      if (innerPKVal.value) {
        entity.setPKVal(innerPKVal.value);
        await entity.Init();
        await entity.RetrieveFromDBSources();
        if (props.params.hasOwnProperty(entity.PK) && innerPKVal.value != props.params[entity.PK]) delete props.params[entity.PK];
      } else {
        const params = props.params || {};
        const args = cloneDeep(params);
        delete args.EnName;
        // const ret: string[] = [];
        const keys = Object.keys(args);
        if (keys.length > 0) {
          keys.forEach((key) => {
            entity.SetValByKey(key, args[key]);
          });
        }
        await entity.Init();
        if (entity.DirectCreate) {
          await entity.Insert();
          innerPKVal.value = entity.PKVal;
        }
        // await entity.Retrieve();
      }
      // 优先处理loaders
      const loaders = entity._enMap.loaders;
      if (loaders.length > 0) {
        const functions = loaders.map((loader: Function) => loader.bind(entity)());
        await Promise.all(functions);
      }
      const config = new EnCfg(EnName.value!);
      await config.Init();
      // config.setPKVal(innerPKVal)
      if (!(await config.RetrieveFromDBSources())) {
        await config.Insert();
      }
      enCfgObj.value = config;
      entityObj.value = entity;

      entityObj.value.SetPageParam(props.params);
      let methods = entity._enMap.rms;
      const systemClsNameSpace = ['TS.WF', 'TS.Sys', 'TS.CCBill', 'TS.User', 'TS.Port', 'TS.CCFast', 'TS.GPM'];
      if (systemClsNameSpace.some((cls) => EnName.value.startsWith(cls)) && WebUser.IsAdmin) {
        if (config.MHideMethodModel != '0') {
          const hideMethods = ',' + config.MHideMethods + ',';
          methods = methods.filter((rm) => !hideMethods.includes(',' + rm.Title + ','));
        }
      } else {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
        handler.AddPara('EnName', EnName.value);
        const data = await handler.DoMethodReturnString('Entity_DBRoleMethods');
        if (!!data) {
          methods = methods.filter((method) => data.includes(',' + method.Title + ','));
        }
      }
      // 普通方法
      rms.value = methods.filter((rm) => rm.SubTablePosition === SubTablePosition.Left);
      // 处理从表位置
      subTables.value = entity._enMap.rms
        .filter((rm) => rm.SubTablePosition === SubTablePosition.Bottom && rm.RefMethodType === RefMethodType.Dtl)
        .map((rm) => {
          return {
            ClassMethod: rm.ClassMethod as string,
            Title: rm.Title as string,
          };
        });
      // end
      enMethodGroup.value = groupByGroupName(rms.value as unknown as Array<RefMethod>);
      // 如果存在系统字段，更新logo
      if (entity.Row.has('Logo')) {
        emit('update-system-logo', entity.Row.get('Logo'));
      }
      // 过滤掉空rms
      if (enMethodGroup.value.length === 0) return;
      if (enMethodGroup.value[0].children.length === 0) return;
      // 处理左侧展开
      if (props.defaultExpand || enMethodGroup.value.length === 1) {
        openKeys.value = enMethodGroup.value.map((mg) => mg.No);
      }
      // setTitle(entity.Name);
      if (isFramework(entityObj.value!)) {
        menuClick(enMethodGroup.value[0].children[0]);
        selectedKeys.value = [enMethodGroup.value[0].children[0].ClassMethod as string];
        openKeys.value = [enMethodGroup.value[0].No];
      }
      await nextTick();
      const domPosition = enBodyElem.value?.getBoundingClientRect();
      if (!domPosition) return;
      const { top = 0 } = domPosition;
      if (top != 0) {
        enBodyTop.value = top;
      }
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      sidebarVisible.value = getSidebarStatus();
      loading.value = false;
    }
  };
  onMounted(() => {
    try {
      checkParams();
      InitPage();
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    }
  });

  // 这里只需要拿到某个元素就可以计算出高度
  const innerContentTop = ref(0);

  const contentStyle = computed(() => {
    return {
      height: `calc(100vh - ${innerContentTop.value}px)`,
      overflow: 'hidden scroll',
      padding: 0,
    };
  });
  // const refElements: Array<HTMLElement> = [];
  const setEnContent = (el: any) => {
    if (!el) return;
    const domPosition = el.getBoundingClientRect();
    const { top = 0 } = domPosition;
    if (top !== 0) {
      innerContentTop.value = top;
    }
    return void 0;
  };
  const enRef = shallowRef<InstanceType<typeof EnOnly>>();
  const enTabRef = shallowRef<InstanceType<typeof EnOnly>>();
  const Save = async () => {
    if (enRef.value != null) {
      await enRef.value?.enOnlySave(false);
      return;
    }
    await enTabRef.value?.enOnlySave(false);
  };
  const loadPage = async () => {
    if (isLoad.value) {
      loadKey.value++;
      await InitPage();
    }
    isLoad.value = false;
  };
  // 提供外部打开的能力
  defineExpose({
    handleTabsEvents,
    Save,
  });
</script>
<style lang="less" scoped>
  .en-body {
    background-color: white;
    width: 100%;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    box-sizing: border-box;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;

    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
    }

    .collapse {
      width: 120px;
      height: 120px;
      position: absolute;
    }

    :deep(.ant-tabs-tab-remove) {
      color: white;
    }
    :deep(.ant-tabs-nav-wrap) {
      background-color: #ffffff;
    }

    :deep(.ant-menu-title-content) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      //菜单内容文本换行
      white-space: normal;
      word-break: break-all;
      line-height: 20px;
    }

    .rm-icon {
      margin-right: 8px;
    }

    .en-sidebar {
      transition: width 0.4s ease;
      overflow-x: hidden;
      height: 100%;
      border-right: 1px solid #eeeeee;
      //侧边栏菜单主题统一
      //选中子元素父元素样式
      :deep(.ant-menu-submenu-selected) {
        color: var(--system-bg-color);
        .ant-menu-submenu-arrow {
          color: var(--system-hover-bg-color);
        }
      }
      //移入子元素父元素显示
      :deep(.ant-menu-submenu-active) {
        color: var(--system-hover-bg-color);
        .ant-menu-submenu-arrow {
          color: var(--system-hover-bg-color);
        }
      }
      //移入父元素显示
      :deep(.ant-menu-light .ant-menu-submenu-title:hover) {
        color: var(--system-hover-bg-color);
        .ant-menu-submenu-arrow {
          color: var(--system-hover-bg-color);
        }
      }
      //移入子元素显示
      :deep(.ant-menu-light .ant-menu-item:hover) {
        background-color: var(--system-hover-bg-color);
        color: #fff;
      }
      //选中子元素显示
      :deep(.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected) {
        background-color: var(--system-active-bg-color);
        color: #fff;
        border-right: none;
      }
      // :deep(.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title) {
      //   padding-left: 20px !important;
      // }
      :deep(.ant-menu-light.ant-menu-inline .ant-menu-item) {
        padding-left: 32px !important;
      }
    }

    .collapse_btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 120px;
      cursor: pointer;
      position: absolute;
      z-index: 10;
      top: 50%;
      transition: all ease-out 0.1s;
      transform: translateY(-50%);
      border-radius: 0 8px 8px 0;
      font-size: 20px;

      &:hover {
        color: var(--system-bg-color);
        background-color: white;
      }
    }

    .en-content {
      flex: 1;
      height: 100%;
      background-color: #f2f5f7;
      overflow-y: auto;
      overflow-x: hidden;
      transition: width ease 0.4s;

      :deep(.ant-tabs-tab) {
        border: none;
        padding: 4px 12px;
        border-radius: 0;
      }

      :deep(.ant-tabs-nav > div) {
        display: flex;
        align-items: center;
      }

      :deep(.ant-tabs-tab-active) {
        border-bottom-color: unset;
        background-color: var(--system-bg-color);
        color: white;

        .ant-tabs-tab-btn {
          color: white;
        }
      }

      :deep(.ant-tabs-nav > div > span) {
        height: 12px !important;
      }
    }
    :deep(.ant-modal) {
      max-width: 100%;
      .ant-modal-content {
        padding: 12px 18px;
      }
    }
  }

  .tab-iframe {
    width: 100%;
    height: 100%;
  }
  .modal-footer-style {
    padding: 10px;
  }
</style>
