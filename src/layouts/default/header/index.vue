<template>
  <Layout.Header
    :class="getHeaderClass"
    :style="{
      height: '48px',
      padding: '0',
    }"
  >
    <!-- left start -->
    <div :class="`${prefixCls}-left`">
      <!-- logo -->
      <AppLogo v-if="getShowHeaderLogo || getIsMobile" :class="`${prefixCls}-logo`" :theme="getHeaderTheme" :style="getLogoWidth" />
      <LayoutTrigger v-if="(getShowContent && getShowHeaderTrigger && !getSplit && !getIsMixSidebar) || getIsMobile" :theme="getHeaderTheme" :sider="false" />
      <!-- <LayoutBreadcrumb v-if="getShowContent && getShowBread" :theme="getHeaderTheme" /> -->
    </div>
    <!-- left end -->

    <!-- menu start -->
    <div :class="`${prefixCls}-menu`" v-if="getShowTopMenu && !getIsMobile">
      <LayoutMenu :isHorizontal="true" :theme="getHeaderTheme" :splitType="getSplitType" :menuMode="getMenuMode" />
    </div>
    <!-- menu-end -->

    <!-- action  -->
    <div :class="`${prefixCls}-action`" style="width: 100%">
      <div class="top-layout-lowcode">
        <div class="left">
          <FlowActions
            :prefix-cls-name="prefixCls"
            v-if="!CommonConfig.IsHN"
            class="spread-out"
            :menu-list="menuListLeft"
            :direction="'left'"
            :unreadItems="unreadItems"
            :filter-list="filterList"
          />
        </div>
        <div class="right">
          <!-- 超级管理员或者二级管理员显示 右侧头部按钮-->
          <template v-if="isAdmin || (isAdmin && userInfo?.No != 'admin')">
            <FlowActions
              :prefix-cls-name="prefixCls"
              class="spread-out"
              :menu-list="menuListRight"
              :menu-more="menuListMore"
              :direction="'right'"
              :unreadItems="unreadItems"
              :filter-list="filterList"
            />
            <!-- <MultilingualDropDown :class="`${prefixCls}-action__item`" /> -->
          </template>
          <!-- <MessageList :class="`${prefixCls}-action__item`" /> -->
          <AppSearch :class="`${prefixCls}-action__item `" v-if="getShowSearch" />
          <ErrorAction v-if="getUseErrorHandle" :class="`${prefixCls}-action__item error-action`" />
          <FullScreen v-if="getShowFullScreen" :class="`${prefixCls}-action__item fullscreen-item`" />
          <UserDropDown :theme="getHeaderTheme" :loginType="props.loginType" :pop-menu-list="getPopMenuList()" />
          <SettingDrawer v-if="getShowSetting" :class="`${prefixCls}-action__item`" />
        </div>
      </div>
    </div>
  </Layout.Header>
</template>
<script lang="ts" setup>
  import { unref, computed, ref, onMounted, onUnmounted } from 'vue';

  import { Layout } from 'ant-design-vue';
  import { AppLogo } from '/@/components/Application';
  import LayoutMenu from '../menu/index.vue';
  import LayoutTrigger from '../trigger/index.vue';

  import { AppSearch } from '/@/components/Application';

  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  import { MenuModeEnum, MenuSplitTyeEnum } from '/@/enums/menuEnum';
  import { SettingButtonPositionEnum } from '/@/enums/appEnum';
  import { UserDropDown, FullScreen, ErrorAction } from './components';
  import { useAppInject } from '/@/hooks/web/useAppInject';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import FlowActions from '/@/layouts/default/header/components/shortcut/FlowActions.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { propTypes } from '/@/utils/propTypes';
  // import MultilingualDropDown from '/@/layouts/default/header/components/shortcut/MultilingualDropDown.vue';

  //低代码左侧,右侧头部按钮数据
  import menuListLeft from '/@/DataUser/config/ToolbarUser';
  import menuListRight from '/@/DataUser/config/ToolbarAdmin';
  import menuListMore from '/@/DataUser/config/ToolbarMore';

  //人员下拉菜单
  import menuUser from '/@/DataUser/config/PopMenuUser';
  import menuAdmin2 from '/@/DataUser/config/PopMenuAdmin2';
  import menuAdmin from '/@/DataUser/config/PopMenuAdmin';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import Events from '/@/utils/Events';
  import { MySetting } from '/@/WF/Comm/Setting/MySetting';
  import WebUser from '/@/bp/web/WebUser';

  // props
  const props = defineProps({
    fixed: propTypes.bool,
    loginType: propTypes.string,
  });

  defineOptions({ name: 'LayoutHeader' });

  const { prefixCls } = useDesign('layout-header');
  const { getShowTopMenu, getShowHeaderTrigger, getSplit, getIsMixMode, getMenuWidth, getIsMixSidebar } = useMenuSetting();
  const { getUseErrorHandle, getShowSettingButton, getSettingButtonPosition } = useRootSetting();

  const { getHeaderTheme, getShowFullScreen, getShowContent, getShowHeaderLogo, getShowHeader, getShowSearch } = useHeaderSetting();

  // const { getShowLocalePicker } = useLocale();
  const SettingDrawer = createAsyncComponent(() => import('/@/layouts/default/setting/index.vue'), {
    loading: true,
  });

  const { getIsMobile } = useAppInject();

  const getHeaderClass = computed(() => {
    const theme = unref(getHeaderTheme);
    return [
      prefixCls,
      {
        [`${prefixCls}--fixed`]: props.fixed,
        [`${prefixCls}--mobile`]: unref(getIsMobile),
        [`${prefixCls}--${theme}`]: theme,
      },
    ];
  });

  const getShowSetting = computed(() => {
    if (!unref(getShowSettingButton)) {
      return false;
    }
    const settingButtonPosition = unref(getSettingButtonPosition);

    if (settingButtonPosition === SettingButtonPositionEnum.AUTO) {
      return unref(getShowHeader);
    }
    return settingButtonPosition === SettingButtonPositionEnum.HEADER;
  });

  const getLogoWidth = computed(() => {
    if (!unref(getIsMixMode) || unref(getIsMobile)) {
      return {};
    }
    const width = unref(getMenuWidth) < 180 ? 180 : unref(getMenuWidth);
    return { width: `${width}px` };
  });

  const getSplitType = computed(() => {
    return unref(getSplit) ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE;
  });

  const getMenuMode = computed(() => {
    return unref(getSplit) ? MenuModeEnum.HORIZONTAL : null;
  });

  const user = useUserStore();
  const userInfo = user.userInfo as unknown as Record<string, any>;
  const isAdmin = computed(() => {
    return userInfo?.IsAdmin === 1;
  });

  /**
   * 获取下拉菜单数据源
   */
  //start
  const getPopMenuList = () => {
    if (isAdmin.value && userInfo?.No != 'admin') return menuAdmin2;
    else if (isAdmin.value) return menuAdmin;
    else return menuUser;
  };
  //end

  type Notification = {
    Todolist_Draft: number;
    CCList_Read: number;
    MyStart_Runing: number;
    MyStart_Complete: number;
    CCList_UnRead: number;
    Todolist_Msg: number;
    Todolist_UnRead: number;
    Todolist_Read: number;
    Todolist_EmpWorks: number;
    AskFrm_Running: number;
  };
  const unreadItems = ref<Notification>({
    Todolist_Draft: 0,
    CCList_Read: 0,
    MyStart_Runing: 0,
    MyStart_Complete: 0,
    CCList_UnRead: 0,
    Todolist_Msg: 0,
    Todolist_UnRead: 0,
    Todolist_Read: 0,
    Todolist_EmpWorks: 0,
    AskFrm_Running: 0,
  });

  const filterList = ref<string[]>([]);

  const loadCustomList = async () => {
    const en = new MySetting(WebUser.No);
    await en.RetrieveFromDBSources();
    filterList.value = en.GetParaString('EnName').split(',').filter(Boolean);
  };

  const loadUnreadItems = async () => {
    const handlerNum = new HttpHandler('BP.CCBill.WF_CCBill_Portal');
    unreadItems.value = await handlerNum.DoMethodReturnJson<Notification>('Default_TodoNums');
  };

  onMounted(() => {
    Promise.all([loadUnreadItems(), loadCustomList()]);
    Events.on('update-notifications', async () => {
      await loadUnreadItems();
    });
  });
  onUnmounted(() => {
    Events.off('update-notifications');
  });
</script>
<style lang="less">
  @import './index.less';
  .top-layout-lowcode {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    span {
      line-height: 48px;
    }

    .left {
      display: flex;
      align-items: center;
      width: 550px;
    }
    .right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 900px;
    }
    //右侧自适应
    .right .actions {
      width: auto;
    }
    .left .actions > span,
    .right .actions > span {
      margin: 0 8px;
      flex-shrink: 0;
    }

    .left .actions > span > i,
    .right .actions > span > i {
      font-size: 14px;
      line-height: 48px;
    }

    .left .actions > span > span,
    .right .actions > span > span {
      font-size: 14px !important;
    }
    @media (max-width: 1500px) {
      .right > span > span {
        display: none;
      }
    }
    @media (max-width: 1100px) {
      .left .actions > span > span,
      .right .actions > span > span {
        display: none;
      }
    }
  }
</style>
