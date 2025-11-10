<template>
  <Dropdown placement="bottomLeft" :overlayClassName="`${prefixCls}-dropdown-overlay`">
    <span :class="[prefixCls, `${prefixCls}--${theme}`]" class="flex">
      <img :class="`${prefixCls}__header`" :src="getUserInfo.avatar" :onerror="defaultIcon" />
      <span :class="`${prefixCls}__info hidden md:block`" :style="usernameOverflow">
        <span :class="`${prefixCls}__name truncate`" :style="{ color: Color }">
          {{ getUserInfo.Name }}
          <!-- <template v-if="MKey == 'Minimalism'" class="truncate">{{ getUserInfo.Name }}</template>
            <template v-else>{{ getUserInfo.Name }}</template> -->
        </span>
      </span>
    </span>

    <template #overlay>
      <Menu @click="(info) => handleMenuClick(info)">
        <template v-if="VITE_GLOB_SaaSModel === '0' && WebUser.CCBPMRunModel === CCBPMRunModel.SAAS">
          <MenuItem key="mySetting" :text="'我的设置'" icon="ion:settings-outline" />
          <!-- <MenuItem key="logout" :text="'退出系统'" icon="ion:power-outline" /> -->
        </template>
        <template v-else>
          <!-- 集团版按钮 -->
          <MenuItem v-for="item in menuList?.GroupMenuList?.filter((item) => item.Enable == 1)" :key="item.No" :text="item.Name" :icon="item.Icon" />
          <!-- 通用按钮 -->
          <MenuItem v-for="item in menuList?.menuList?.filter((item) => item.Enable == 1)" :key="item.No" :text="item.Name" :icon="item.Icon" />
          <!--门户系统 start-->
          <MenuItem v-if="systemType === 0" key="toPortal" :text="'切换门户模式'" icon="tabler:directions" />
          <MenuItem v-if="systemType === 1" key="toStandard" :text="'切换到低代码'" icon="tabler:directions" />
          <SubMenu v-if="systemType === 1" key="StyleSetting" :title="'风格设置'">
            <template #icon><i class="icon-support"></i></template>
            <MenuItem key="concise" :text="'简洁'" icon="ion:color-palette-outline" />
            <MenuItem key="blue" :text="'清新'" icon="ion:color-palette-outline" />
            <MenuItem key="tradition" :text="'传统'" icon="ion:color-palette-outline" />
            <MenuItem key="Minimalism" :text="'极简'" icon="ion:color-palette-outline" />
          </SubMenu>
          <!-- end -->
          <MenuDivider v-if="getShowDoc" />
          <SubMenu key="Multilingual" :title="'多语言'">
            <template #icon><i class="icon-globe"></i></template>
            <MenuItem key="zh_CN" :text="'中文'" icon="ion:globe" />
            <MenuItem key="EN" text="English" icon="icon-park-outline:english" />
          </SubMenu>
          <MenuItem v-if="WebUser.IsAdmin" key="SystemSetting" :text="'系统设置'" icon="ion:settings-outline" />

          <!-- <MenuItem key="doc" :text="'文档'" icon="ion:document-text-outline" v-if="getShowDoc" /> -->
        </template>
        <MenuItem key="logout" :text="'退出系统'" icon="ion:power-outline" />
      </Menu>
    </template>
  </Dropdown>
  <LockAction @register="register" />
</template>
<script lang="ts" setup>
  // components
  import { Dropdown, Menu, message, SubMenu } from 'ant-design-vue';
  import { computed, ref } from 'vue';
  import { DOC_URL } from '/@/settings/siteSetting';
  import { useUserStore } from '/@/store/modules/user';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';

  import headerImg from '/@/assets/images/header.jpg';
  import { propTypes } from '/@/utils/propTypes';
  import { openWindow } from '/@/utils';

  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useRouter } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import WebUser, { User } from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  //多语言
  import { getAuthCache, setAuthCache } from '/@/utils/auth';
  import { WEB_USER_INFO_KEY } from '/@/enums/cacheEnum';
  import { MySetting } from '/@/WF/Comm/Setting/MySetting';
  import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { PageEnum } from '/@/enums/pageEnum';
  import { LocaleType } from '/#/config';
  import { useLocale } from '/@/locales/useLocale';
  const MenuItem = createAsyncComponent(() => import('./DropMenuItem.vue'));
  const MenuDivider = Menu.Divider;
  const LockAction = createAsyncComponent(() => import('../lock/LockModal.vue'));
  defineOptions({ name: 'UserDropdown' });

  const props = defineProps({
    theme: propTypes.oneOf(['dark', 'light']),
    loginType: {
      type: String,
      default: '',
    },
    systemType: {
      type: Number,
      default: 0,
    },
    sendData: {
      type: Function,
      default: null,
    },
    popMenuList: {
      type: Object as PropType<PopMenu>,
      default: () => {},
    },
  });
  interface MenuItem {
    No: string;
    Name: string;
    Icon: string;
    Enable: number;
  }

  interface PopMenu {
    menuList?: MenuItem[];
    GroupMenuList?: MenuItem[]; // 可选属性
  }
  const menuList = ref<PopMenu>(props.popMenuList);

  //const emit = defaultEmit(["sendData"]);
  //let MKey = ref("concise");
  const { prefixCls } = useDesign('header-user-dropdown');
  const { t } = useI18n();
  const { getShowDoc } = useHeaderSetting();
  const userStore = useUserStore();
  const router = useRouter();
  const go = useGo();
  //获取代理路径
  const { VITE_GLOB_API_URL, VITE_GLOB_OSModel, VITE_GLOB_SaaSModel } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL;
  const getUserInfo = computed(() => {
    const { avatar, Name = '', No } = (userStore.getUserInfo as User) || {};
    if (avatar) return { avatar: avatar || headerImg, Name, No };
    // 如果 avatar 不存在，使用默认路径生成 avatar
    return {
      avatar: basicPath + '/DataUser/UserIcon/' + No + '.png?t=' + Math.random(),
      Name,
      No,
    };
  });
  //用户头像图片
  getUserInfo.value.avatar = basicPath + '/DataUser/UserIcon/' + getUserInfo.value.No + '.png?t=' + Math.random();
  //没有用户头像图片时获取默认图片
  const defaultIcon = (e) => {
    let img = e.srcElement;
    img.src = basicPath + '/DataUser/UserIcon/Default.png';
    img.onerror = null;
  };
  const [register, { openModal }] = useModal();

  function handleLock() {
    openModal(true);
  }

  //  login out
  function handleLoginOut() {
    userStore.confirmLoginOut();
  }

  function handlerToMiddle() {
    router.push({
      path: '/Middle/GenerList',
      query: {
        EnName: 'GL_Todolist',
      },
    });
  }

  async function handlerToPortal() {
    // message.info('开发中...');
    // return;
    //获取pageID
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    const getPages: any = await handler.DoMethodReturnJson('SystemPortal_GenerPages');
    // console.log('getPages', getPages);
    let pageID = 0;
    if (getPages.length > 0) {
      pageID = getPages[0].No;
    }
    const url = '/portal/rptContent?PageID=' + pageID + '&edit=0';
    router.push(url);
  }

  function handlerToStandard() {
    router.push({
      path: PageEnum.BASE_HOME,
    });
  }

  function handlerToMobile() {
    // userStore.setSkipRouteCheck(true);
    router.push({
      path: '/CCMobilePortal/Home',
      query: {
        skipPlatformCheck: '1',
      },
    });
  }
  // open doc
  function openDoc() {
    openWindow(DOC_URL);
  }
  // 设置风格
  const onSettingStyle = (key: any) => {
    //MKey.value = key;
    if (props.sendData) {
      props.sendData(key);
    }
  };
  // setTimeout(() => {
  //   MKey.value = localStorage.getItem('KeyVal') || 'concise';
  // }, 2000);
  //多语言
  //获取语言key值
  const onClick = async (key: any) => {
    const { changeLocale } = useLocale();
    const user = getAuthCache<User>(WEB_USER_INFO_KEY);
    user.SysLang = key;
    setAuthCache(WEB_USER_INFO_KEY, user);
    WebUser.userInfo = user;
    if (key === 'EN') key = 'en';
    await changeLocale(key as LocaleType);
    location.reload();
  };

  async function handleMenuClick(e: MenuInfo) {
    switch (e.key) {
      case 'logout':
        handleLoginOut();
        break;
      case 'doc':
        openDoc();
        break;
      case 'lock':
        handleLock();
        break;
      case 'toMiddle':
        handlerToMiddle();
        break;
      case 'toPortal':
        handlerToPortal();
        break;
      case 'toStandard':
        handlerToStandard();
        break;
      case 'toMobile':
        handlerToMobile();
        break;
      case 'mySetting':
        const mySetting = new MySetting(WebUser.No);
        const num = await mySetting.RetrieveFromDBSources();
        if (num == 0) {
          mySetting.SetValByKey('Name', WebUser.Name);
          mySetting.SetValByKey('FK_Dept', WebUser.DeptNo);
          mySetting.SetValByKey('OrgNo', WebUser.OrgNo);
          await mySetting.Insert();
        }
        go('/WF/Comm/En?EnName=TS.User.MySetting&PKVal=' + mySetting.No);
        break;
      case 'SystemSetting':
        go('/WF/Comm/En?EnName=TS.Sys.SystemSetting&PKVal=' + WebUser.No);
        break;
      case 'changeDept':
        go('/WF/GL/SelectDeptLogin');
        break;
      case 'changeOrgAdmin':
        go('/GroupHome');
        break;
      case 'zh_CN':
      case 'EN':
        onClick(e.key);
        break;
      case 'Minimalism':
      case 'blue':
      case 'tradition':
      case 'concise':
        onSettingStyle(e.key);
        break;
    }
  }
  const usernameOverflow = computed(() => {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '110px',
    };
  });
  //let Color = ref("#333");
  let Color = computed(() => {
    const storedBgColor = localStorage.getItem('KeyVal') || 'concise';
    let col;
    if (props.systemType === 1 && storedBgColor !== 'Minimalism') {
      // 如果存在，则更新LESS变量
      col = '#fff';
    } else if (props.systemType === 1 && storedBgColor == 'Minimalism') {
      col = '#333';
    }
    return col;
  });
</script>
<style lang="less">
  //@type: v-bind(MKey);
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    height: @header-height;
    padding: 0 0 0 10px;
    padding-right: 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;
    align-items: center;

    img {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }

    &__header {
      border-radius: 50%;
    }

    &__name {
      font-size: 14px;
    }

    &--dark {
      &:hover {
        background-color: @header-dark-bg-hover-color;
      }
    }

    &--light {
      // &:hover {
      //   background-color: @header-light-bg-hover-color;
      // }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }

    &-dropdown-overlay {
      .ant-dropdown-menu-item {
        min-width: 160px;
      }
    }
  }

  .vben-header-user-dropdown {
    justify-content: center;
  }
</style>
