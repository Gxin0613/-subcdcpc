<template>
  <BaseComponent ref="baseComp">
    <div class="en-wrapper">
      <div class="en-body">
        <NavBar v-if="!inDrawer" :title="title" :fixed="true" left-arrow @click-left="onClickLeft">
          <template v-if="sidebarVisible" #right>
            <Icon name="wap-nav" size="18" @click="ShowMenu" />
          </template>
        </NavBar>
        <div class="en-content" style="width: 100%; height: calc(var(--viewport-height) - 60px); overflow: hidden">
          <EnOnly
            :EnName="props.EnName"
            :PKVal="PKVal"
            :params="props.params"
            :no-save-button="noSaveButton"
            ref="enRef"
            @handle-gpn-callback="handleGPN"
            :entity-ref="entityObj"
            @delete-entity="isDeleted = true"
            @refresh-system="RefreshSystem"
          />
        </div>
      </div>
      <Popup v-model:show="popVisible" position="bottom" style="background-color: #fafafa">
        <NavBar v-if="!inDrawer" :fixed="true" @click-left="popVisible = false" style="background-color: #fafafa !important">
          <template #left>
            <Icon name="arrow-down" size="18" />
          </template>
        </NavBar>
        <div style="padding-top: 46px; margin-left: 10px; margin-right: 10px">
          <template v-for="(group, index) in enMethodGroup" :key="index">
            <div class="van-doc-card">
              <h5 class="van-h5">{{ group.Name }}</h5>
              <Grid :column-num="3">
                <GridItem v-for="menu in group.children" :key="menu.ClassMethod" @click="menuClick(menu)"> <i class="rm-icon" :class="menu.Icon"></i>{{ menu.Title }} </GridItem>
              </Grid>
            </div>
          </template>
        </div>
      </Popup>
      <Popup v-model:show="activeMethod.visible" position="bottom" style="height: 100%">
        <NavBar v-if="activeMethod.visible" :fixed="true" :title="activeMethod.title" @click-left="activeMethod.visible = false" style="background-color: #fafafa !important">
          <template #left>
            <Icon name="arrow-down" size="18" />
          </template>
        </NavBar>
        <div style="padding-top: 46px">
          <!--分组编辑-->
          <GroupPageEdit v-if="activeMethod.RefMethodType === RefMethodType.GroupPageEdit" :EnName="currRethod.Tag?.classID" :PKVal="PKVal" :suffix="currRethod.Target" />
          <!--分布页面-->
          <GroupPageNew v-else-if="activeMethod.RefMethodType === RefMethodType.GroupPageNew" :params="activeMethod.params" />
          <!--分布页面-->
          <!-- <TreeEns v-else-if="activeMethod.RefMethodType === RefMethodType.TreeEns" :params="activeMethod.params" /> -->
          <!--分组编辑-->
          <PanelGroup v-else-if="activeMethod.RefMethodType === RefMethodType.PanelGroup" :params="activeMethod.params" :suffix="currRethod.Target" />
          <!-- 执行方法-->
          <RefMethodFunc
            v-else-if="activeMethod.RefMethodType === RefMethodType.Func"
            :row="Object.fromEntries(entityObj?.Row)"
            :title="activeMethod.Title"
            :method-name="currRethod.ClassMethod"
            :rm-en-map="currRethod.HisMap"
            @exec="execConfirmMethod"
          />
          <!-- 根据URL拿到组件-->
          <div v-else-if="isTabOpen(activeMethod.RefMethodType)">
            <component
              v-if="isTabOpen(activeMethod.RefMethodType)"
              :is="loadComponent(currRethod.ClassMethod as string)"
              :params="getAllRequestParams(getSubPagesUrl(currRethod.ClassMethod as string))"
            />
          </div>
        </div>
      </Popup>
    </div>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { NavBar, Icon, Popup, Grid, GridItem, showFailToast, showSuccessToast } from 'vant';
  import { computed, reactive, ref, shallowRef, unref } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
  import GroupPageEdit from '/@/WF/Comm/UIEntity/GroupPageEdit.vue';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import PanelGroup from '/@/WF/Comm/PanelGroup.vue';

  import EnOnly from '/@/CCMobile/Comm/EnOnly.vue';
  import { Entity } from '/@/bp/en/Entity';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import RefMethodFunc from '/@/WF/Comm/RefMethodFunc.vue';
  import { getAllRequestParams } from '/@/utils/request/decode';
  import { windowOpen } from '/@/utils/windowOpen';
  import { cloneDeep } from 'lodash-es';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useRouter } from 'vue-router';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';

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
    inDrawer: {
      type: Boolean,
      default: false,
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
    isChildComponent: {
      type: Boolean,
      default: false,
    },
    noSaveButton: {
      type: Boolean,
      default: false,
    },
  });

  //En相关功能显示
  const popVisible = ref(false);
  const ShowMenu = () => {
    popVisible.value = true;
  };
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const handleGPN = (res) => {
    baseComp.value?.handleGPNCallback(res);
  };
  const isDeleted = ref(false); //是否可以删除

  const emit = defineEmits(['editClosed']);
  const basicInfoVisible = ref(true);

  //是否显示相关功能? true=显示.
  const sidebarVisible = computed(() => {
    //如果主键是Null 就不显示.
    if (!PKVal.value) return false;

    // 获得显示的相关方法
    const targetRms = rms.value.filter((rm) => {
      return rm.RefMethodType !== RefMethodType.FuncToolbar;
    });

    //如果没有相关功能.
    if (targetRms.length == 0) return false;

    //如果超过两个相关功能.
    if (targetRms.length >= 2) return true;
    // 求出可显示的字段数量.
    const visibleAttrs =
      entityObj.value?._enMap?.attrs?.filter((attr) => {
        return !!attr.UIVisible;
      }) || [];

    // === 1
    //如果字段数量 =0， 并且 可显示的相关功能 =1 ，就不显示.
    if (visibleAttrs.length <= 1) return false;

    //显示相关功能。
    return true;
  });

  // 通过tab打开的链接方式
  const isTabOpen = (type: number) => {
    return [RefMethodType.Dtl, RefMethodType.TabOpen, RefMethodType.One2Many].includes(type);
  };

  // 菜单属性
  const activeMethod = ref<Record<string, any>>({});
  const currRethod = ref<RefMethod>({});
  // 更新列表数据
  const RefreshSystem = () => {
    emit('editClosed');
  };

  const handleTabsEvents = (menu) => {
    const validUrl = GloWF.DealExp(menu.ClassMethod, unref(entityObj)!);
    activeMethod.value.params = getAllRequestParams(validUrl);
  };
  const getSubPagesUrl = (url: string) => {
    const hasQuerySymbol = url.includes('?');
    return url + `${hasQuerySymbol ? '&' : '?'}EnClassID=${EnName.value}&PKVal=${PKVal.value}`;
  };

  // 点击确定执行的方法
  const execConfirmMethod = async (methodName: string, args: any) => {
    try {
      // 如果不是合法url，终止执行
      if (!methodName || methodName.includes('/')) {
        return;
      }
      // @ts-ignore
      const calledMethod = entityObj.value[methodName].bind(entityObj.value);
      if (!calledMethod) {
        return;
      }
      const res = await calledMethod(...Object.values(args));
      if (typeof res !== 'string') {
        return;
      }
      // 如果方法执行返回url地址
      if (res.startsWith('url@')) {
        // 这种方式默认打开在新的标签页
        windowOpen(res.replace('url@', ''));
        return;
      }
      showSuccessToast(res);
    } catch (e: any) {
      showFailToast(e.toString());
      console.trace(e);
    } finally {
    }
  };

  // 动态的加载组件
  // 就需要文件的绝对地址
  // path: /src/**/*.vue结尾
  const { loadComponent } = useComponentLoader();
  const menuClick = async (menu: any) => {
    activeMethod.value.visible = true;
    activeMethod.value.RefMethodType = menu.RefMethodType;
    activeMethod.value.title = menu.Title;
    currRethod.value = menu;
    // 新窗口打开
    if (menu.RefMethodType === RefMethodType.LinkeWinOpen) {
      const allowedUrl = menu.ClassMethod.replace('/src/', '/').replace('.vue', '');
      activeMethod.value.url = allowedUrl;
      return;
    }

    // 模态框打开
    if (menu.RefMethodType === RefMethodType.LinkModel) {
      return;
    }

    if (menu.RefMethodType === RefMethodType.Func) {
      const attrs = menu.HisMap.attrs;
      if (Array.isArray(attrs) && attrs.length > 0) {
        handleTabsEvents(menu);
        return;
      }
      return;
    }

    // 右侧抽屉打开
    if (menu.RefMethodType === RefMethodType.RightFrameOpen) {
      try {
        if (!menu.ClassMethod.includes('/')) {
          showFailToast('错误的组件url链接');
          return;
        }
        const url = getSubPagesUrl(menu.ClassMethod);
        const path = url.split('?')[0];

        activeMethod.value.component = createAsyncComponent(() => import(/* @vite-ignore */ path), {
          loading: true,
        });
        activeMethod.value.params = getAllRequestParams(url);
      } catch (e: any) {
        console.trace(e);
        showFailToast(e.toString());
      } finally {
      }
      return;
    }
    // 余下的包括 Dtl/TabOpen,直接从新标签页打开
    handleTabsEvents(menu);
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
        children: rms.filter((rm) => rm.GroupName === item.name),
      });
    });
    return callbackGroups;
  };

  const PKVal = ref();
  const EnName = ref();

  const rms = ref<Array<RefMethod>>([]);

  const entityObj = ref<Entity>();
  const router = useRouter();

  const title = ref('');

  const updateTitle = (title: string) => {
    const tabStore = useMultipleTabStore();
    const currentTab = tabStore.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
    //在你需要修改的地方类似下面这样
    if (currentTab?.meta?.title) {
      currentTab.meta.title = title;
    }
  };

  const InitPage = async () => {
    try {
      loading.value = true;
      // 更改优先级，props > 路由参数
      let classID, pk;
      if (props.EnName) {
        classID = props.EnName || props.params?.EnName;
        pk = props.PKVal || props.params?.PKVal || props.params?.SortNo;
      } else {
        classID = props.params?.EnName;
        pk = props.params?.SortNo || props.params?.PKVal;
      }
      PKVal.value = pk;
      EnName.value = classID;
      if (classID == undefined || classID == '') {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ enName ]';
        return;
      }
      const entity = await ClassFactory.GetEn(classID as string);
      await entity.Init();
      const uac = entity.HisUAC;
      if (!uac.IsView) {
        errorObj.hasError = true;
        errorObj.tips = '非法用户';
        return;
      }

      if (!pk && !uac.IsInsert) {
        errorObj.hasError = true;
        errorObj.tips = '您对[' + classID + ']没有新增权限';
        return;
      }

      if (pk) {
        entity.setPKVal(pk);
        await entity.Init();
        await entity.RetrieveFromDBSources();
      } else {
        const params = props.params || {};
        const args = cloneDeep(params);
        delete args.EnName;
        // const ret: string[] = [];
        const keys = Object.keys(args);
        if (keys.length > 0) {
          keys.forEach((key) => {
            // ret.push(key, args[key] as string);
            entity.SetValByKey(key, args[key]);
          });
        }
        await entity.Init();
        // await entity.Retrieve();
      }
      // 优先处理loaders
      const loaders = entity._enMap.loaders;
      if (loaders.length > 0) {
        const functions = loaders.map((loader: Function) => loader.bind(entity)());
        await Promise.all(functions);
      }
      const config = new EnCfg();
      await config.Init();
      config.SetValByKey('No', classID);
      // config.setPKVal(PKVal)
      if (!(await config.RetrieveFromDBSources())) {
        await config.Insert();
      }
      entityObj.value = entity;

      title.value = entity._enMap.EnDesc;
      updateTitle(entity.Name as string);
      rms.value = entity._enMap.rms;
      enMethodGroup.value = groupByGroupName(entity._enMap.rms);
      // 过滤掉空rms
      if (enMethodGroup.value.length === 0) return;
      if (enMethodGroup.value[0].children.length === 0) return;

      // setTitle(entity.Name);
      if (entity._enMap.attrs.filter((attr) => attr.UIVisible).length === 0) {
        basicInfoVisible.value = false;
        //await menuClick(enMethodGroup.value[0].children[0]);
      }
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };

  InitPage();

  const enRef = shallowRef<InstanceType<typeof EnOnly>>();
  const Save = async () => {
    if (enRef.value != null) {
      await enRef.value?.enOnlySave(false);
      return;
    }
  };
  // 提供外部打开的能力
  defineExpose({ Save });
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
</script>
<style lang="less" scoped>
  :deep(.van-icon-arrow-left) {
    font-size: 20px;
  }
  :deep(.van-nav-bar__content) {
    background-color: #2970ff;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  :deep(.van-icon) {
    color: #fff;
  }
  .en-body {
    background-color: white;
    width: 100%;
    //height: 100%;
    //min-height: 400px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    box-sizing: border-box;
    position: relative;
    overflow-y: auto;
    padding-top: 40px;

    .rm-icon {
      margin-right: 8px;
    }

    .en-sidebar {
      width: 200px;
      height: 100%;
      border-right: 1px solid #eeeeee;
      overflow-y: auto;
    }
  }
  .van-doc-card {
    margin-bottom: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-h5 {
    color: #9ca3af;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
</style>
