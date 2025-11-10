<template>
  <BaseComponent ref="baseComp" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <Spin :spinning="loading">
      <a-layout>
        <!-- 头部 -->
        <!--        <a-layout-header>-->
        <template v-if="KeyVal == 'concise'">
          <div class="header">
            <div class="navleft">
              <div class="logo">
                <img src="/resource/img/logo.png" height="40" width="40" />
              </div>
              <div v-for="item in systemData" :key="item.No" @click="onNavClick(item.No, item.Name, item.Title)" :class="activeNo == item.No ? 'active navHome' : 'navHome'">
                {{ item.Name }}
                <!-- <template v-if="item.Title">
                  <a-popover placement="bottom">
                    <template #content>
                      {{ item.Title }}
                    </template>
                    {{ item.Name }}
                  </a-popover>
                </template>
                <template v-else>
                  {{ item.Name }}
                </template> -->
              </div>
            </div>
            <div :style="{ width: `${60 * initQty.length}+ 154px` }" class="right">
              <ul class="menu">
                <li v-for="item in initQty" :key="item.No" @click="onMenuItemClick(item.No)">
                  <ABadge :count="item.Num" show-zero :offset="[0, -6]"> {{ item.Name }} </ABadge>
                </li>
                <li key="4">
                  <UserDropDown :theme="getHeaderTheme" :loginType="props.loginType" :systemType="pageData.SystemType" :sendData="ontitleClick" />
                </li>
                <li key="5" v-show="WebUser.Name == 'admin'">
                  <div @click="toggle" v-if="showDiv1">
                    <span class="text-white" style="font-size: 12px" @click="onDesginClick()">{{ '设计' }}</span>
                  </div>
                  <div @click="toggle" v-if="showDiv2">
                    <span class="text-white" style="font-size: 12px" @click="onNavClick(route.query.PageID)">{{ '预览' }}</span>
                  </div>
                </li>
              </ul>
              <SettingDrawer :class="`${prefixCls}-action__item`" />
            </div>
          </div>
        </template>
        <template v-if="KeyVal == 'blue'">
          <div class="header">
            <div class="navleft">
              <div class="logo">
                <img src="/resource/img/logo.png" height="40" width="40" />
              </div>
              <div v-for="item in systemData" :key="item.No" @click="onNavClick(item.No, item.Name, item.Title)" :class="activeNo == item.No ? 'active navHome' : 'navHome'">
                {{ item.Name }}
                <!-- <template v-if="item.Title">
                  <a-popover placement="bottom">
                    <template #content>
                      {{ item.Title }}
                    </template>
                    {{ item.Name }}
                  </a-popover>
                </template>
                <template v-else>
                  {{ item.Name }}
                </template> -->
              </div>
            </div>
            <!--          <a-layout-sider v-model="collapsed" :trigger="null" collapsible>-->
            <div class="right" :style="{ width: `${60 * initQty.length}+ 154px` }">
              <ul class="menu">
                <li v-for="item in initQty" :key="item.No" @click="onMenuItemClick(item.No)">
                  <ABadge :count="item.Num" show-zero :offset="[0, -6]"> {{ item.Name }} </ABadge>
                </li>
                <li key="4">
                  <div>
                    <UserDropDown :theme="getHeaderTheme" :loginType="props.loginType" :systemType="pageData.SystemType" :sendData="ontitleClick" />
                  </div>
                </li>
                <li key="6" v-show="WebUser.Name == 'admin'">
                  <div @click="toggle" v-if="showDiv1">
                    <span class="text-white" style="font-size: 12px" @click="onDesginClick()">{{ '设计' }}</span>
                  </div>
                  <div @click="toggle" v-if="showDiv2">
                    <span class="text-white" style="font-size: 12px" @click="onNavClick(route.query.PageID)">{{ '预览' }}</span>
                  </div>
                </li>
              </ul>
              <SettingDrawer :class="`${prefixCls}-action__item`" />
            </div>
            <!--          </a-layout-sider>-->
          </div>
          <div ref="myRef" class="blueManz">
            <div class="innerBg">
              <p>{{ activeName }}</p>
              <p class="text">{{ menuTitle }}</p>
            </div>
          </div>
        </template>
        <template v-if="KeyVal == 'tradition'">
          <div class="headerths">
            <div class="navleft">
              <div class="logo">
                <img src="/resource/img/logo.png" height="40" width="40" />
              </div>
            </div>
            <div :style="{ width: `${60 * initQty.length}+ 154px` }" class="right">
              <ul class="menu">
                <li v-for="item in initQty" :key="item.No" @click="onMenuItemClick(item.No)">
                  <ABadge :count="item.Num" show-zero :offset="[0, -6]"> {{ item.Name }} </ABadge>
                </li>
                <li key="4">
                  <div>
                    <UserDropDown :theme="getHeaderTheme" :loginType="props.loginType" :systemType="pageData.SystemType" :sendData="ontitleClick" />
                  </div>
                </li>
                <li key="6" v-show="WebUser.Name == 'admin'">
                  <div @click="toggle" v-if="showDiv1">
                    <span class="text-white" style="font-size: 12px" @click="onDesginClick()">{{ '设计' }}</span>
                  </div>
                  <div @click="toggle" v-if="showDiv2">
                    <span class="text-white" style="font-size: 12px" @click="onNavClick(route.query.PageID)">{{ '预览' }}</span>
                  </div>
                </li>
              </ul>
              <SettingDrawer :class="`${prefixCls}-action__item`" />
            </div>
          </div>
          <!-- <Menu v-model:selectedKeys="current" mode="horizontal" class="menulist">
            <MenuItem class="navHome" v-for="item in systemData" :key="item.No" @click="onNavClick(item.No)">{{ item.Name }}</MenuItem>
          </Menu> -->
          <div class="headers">
            <div v-for="item in systemData" :key="item.No" @click="onNavClick(item.No, item.Name, item.Title)" :class="activeNo == item.No ? 'active navHome' : 'navHome'">
              {{ item.Name }}
              <!-- <template v-if="item.Title">
                  <a-popover placement="bottom">
                    <template #content>
                      {{ item.Title }}
                    </template>
                    {{ item.Name }}
                  </a-popover>
                </template>
                <template v-else>
                  {{ item.Name }}
                </template> -->
            </div>
          </div>
        </template>
        <template v-if="KeyVal == 'Minimalism'">
          <div class="headersd" style="width: 90%; margin-left: 10%">
            <div class="nav">
              <div v-for="item in systemData" :key="item.No" @click="onNavClick(item.No, item.Name, item.Title)" :class="activeNo == item.No ? 'active navHome' : 'navHome'">
                {{ item.Name }}
              </div>
            </div>
            <div :style="{ width: WebUser.Name == 'admin' ? '5%' : 9 * initQty.length + '%' }" class="right">
              <Menu v-model:selectedKeys="currentThs" mode="horizontal">
                <MenuItem key="6" v-show="WebUser.Name == 'admin'">
                  <div @click="toggle" v-if="showDiv1">
                    <span class="text-white" style="font-size: 12px" @click="onDesginClick()">{{ '设计' }}</span>
                  </div>
                  <div @click="toggle" v-if="showDiv2">
                    <span class="text-white" style="font-size: 12px" @click="onNavClick(route.query.PageID)">{{ '预览' }}</span>
                  </div>
                </MenuItem>
              </Menu>
              <SettingDrawer :class="`${prefixCls}-action__item`" />
            </div>
          </div>
          <div class="Avatorleft">
            <div class="logo">
              <img src="/resource/img/logo.png" height="60" width="60" />
            </div>
            <div class="userDiv">
              <!-- <a-avatar size="large" style="margin-bottom: 20px" :src="getUserInfo.avatar" /> -->
              <UserDropDown :theme="getHeaderTheme" :loginType="props.loginType" :systemType="pageData.SystemType" :sendData="ontitleClick" />
              <!-- <p>姓名：{{ WebUser.Name }}</p> -->
              <p>部门：{{ WebUser.DeptName }}</p>
            </div>
          </div>
        </template>
        <!--        </a-layout-header>-->
        <!-- 头部 end -->
        <!-- 内容 -->
        <a-layout :class="KeyVal == 'Minimalism' ? 'layout' : ''">
          <LayoutContent>
            <div class="component-wrapper">
              <router-view v-slot="{ Component }">
                <Transition name="fade">
                  <component :is="Component" :key="route.fullPath" />
                </Transition>
              </router-view>
            </div>
          </LayoutContent>
        </a-layout>
        <!-- 尾部 -->
        <a-layout-footer class="footer">
          {{ pageData.Docs }}
        </a-layout-footer>
        <!-- 尾部 end -->
      </a-layout>
    </Spin>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import {
    Badge as ABadge,
    MenuItemGroup,
    LayoutSider as ALayoutSider,
    Spin,
    Menu,
    MenuItem,
    SubMenu,
    Avatar as AAvatar,
    LayoutContent,
    Popover as APopover,
  } from 'ant-design-vue';
  import { onMounted, ref, nextTick, shallowRef, computed } from 'vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { UserDropDown } from '/@/layouts/default/header/components';
  import { propTypes } from '/@/utils/propTypes';
  import { useDesign } from '/@/hooks/web/useDesign';
  import SettingDrawer from '/@/layouts/default/setting/index.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import headerImg from '/@/assets/images/header.jpg';
  import { MySystem } from '../GPM/MySystem';
  // 处理基础组件
  const { getHeaderTheme } = useHeaderSetting();
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const { prefixCls } = useDesign('layout-header');
  const collapse = ref<boolean>(false);
  const props = defineProps({
    fixed: propTypes.bool,
    loginType: propTypes.string,
    params: {
      type: Object,
      default: () => ({}),
    },
    edit: {
      type: [Boolean, String],
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
  });

  const disabledFrmGuide = ref(true);
  const current = ref<string[]>(['1']);
  const currentThs = ref<string[]>(['1']);
  const KeyVal = ref(localStorage.getItem('KeyVal') || 'concise');
  const myRef = ref();
  const activeNo = ref('');
  const activeName = ref('');
  const menuTitle = ref('');

  //数组-集合
  const loading = ref(false);
  const route = useRoute();
  const router = useRouter();
  const systemData = ref<Recordable[]>([]);
  const initQty = ref({});
  const pageData = ref({});
  const InitPage = async () => {
    try {
      const showDiv1 = ref(true);
      const showDiv2 = ref(false);

      const currSystem = new MySystem(route.query.PageID);
      currSystem.Retrieve();
      const name = currSystem.Name;
      const title = currSystem.Title;
      // if (currSystem.Todolist_EmpWorks == 1) {
      //   alert('待办需要显示.');
      // }

      //导航栏
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      systemData.value = await handler.DoMethodReturnJson('SystemPortal_GenerPages');
      activeNo.value = route.query.PageID;
      systemData.value.map((item) => {
        if (item.No == route.query.PageID) {
          activeName.value = item.Name;
          menuTitle.value = item.Title;
        }
      });
      console.log('导航栏门户', systemData);

      //门户初始化数据
      const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      handler1.AddPara('pageId', route.query.PageID);
      // nextTick(async () => {
      initQty.value = await handler1.DoMethodReturnJson('SystemPortal_getTodolist');
      // });

      const handler2 = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      handler2.AddPara('pageId', route.query.PageID);
      pageData.value = await handler2.DoMethodReturnJson('SystemPortal_getPages');
      console.log('指定页面数据', pageData);
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  //菜单切换
  const ontitleClick = (val) => {
    localStorage.setItem('KeyVal', val);
    KeyVal.value = val;
    // if (KeyVal.value == 'blue') {
    //   nextTick(() => {
    //     activeName.value = systemData.value[0].Name;
    //     menuTitle.value = systemData.value[0].Title;
    //   });
    // }
  };
  const onNavClick = async (val, name, title) => {
    const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    handler1.AddPara('pageId', val);
    initQty.value = await handler1.DoMethodReturnJson('SystemPortal_getTodolist');
    activeNo.value = val;
    if (name) {
      activeName.value = name;
    }
    if (title) {
      menuTitle.value = title;
    }
    const url = '/portal/rptContent?PageID=' + val + '&edit=0';
    router.replace(url);
  };
  // InitPage();
  const onMenuItemClick = async (val) => {
    const url = '/#/portal/GL/Pt' + val.substring(val.lastIndexOf('_') + 1) + '?EnName=' + val + '&PageID=' + route.query.PageID;
    window.open(url, '_blank');
  };

  const onDesginClick = async () => {
    const url = '/portal/rptWhite?PageID=' + route.query.PageID + '&edit=1';
    router.replace(url);
  };

  const showDiv1 = ref(true);
  const showDiv2 = ref(false);

  const toggle = () => {
    showDiv1.value = !showDiv1.value;
    showDiv2.value = !showDiv2.value;
  };

  const userStore = useUserStore();
  const getUserInfo = computed(() => {
    const { avatar, Name = '', No } = (userStore.getUserInfo as User) || {};
    return { avatar: avatar || headerImg, Name, No };
  });
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL;
  //用户头像图片
  getUserInfo.value.avatar = basicPath + '/DataUser/UserIcon/' + getUserInfo.value.No + '.png';
  // 页面数据
  onMounted(async () => {
    // 没有FrmID则禁止表单向导
    const hasFrmID = props.params.hasOwnProperty('FrmID');
    disabledFrmGuide.value = !hasFrmID;
    await InitPage();
  });
</script>

<style lang="less" scoped>
  .menuItem {
    background-color: #0960bd;
  }

  .subMenuItem {
    color: #fff;
  }

  .select-guide {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: column;
    height: 100px;
    width: 100%;

    :deep(.ant-btn) {
      width: 100%;
    }
  }

  .add-btn {
    width: 80px;
    height: 80px;
    color: #ccc;
    text-align: center;
    line-height: 80px;
    cursor: pointer;
    font-size: 40px;
    position: absolute;
    bottom: 40px;
    right: 30px;
    background-color: white;
    border-radius: 50%;
    border: 2px solid #ccc;

    &:hover {
      border-color: #459dff;
      color: #459dff;
    }
  }

  .right {
    display: flex;
    justify-content: center;
    align-items: center;

    ul {
      width: 100% !important;

      li {
        min-width: 60px;
        cursor: pointer;
      }
    }
  }

  .header {
    width: 100vw;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    background: var(--system-bg-color);
    color: #fff;

    .navHome {
      min-width: 120px;
      line-height: 60px;
      font-size: 14px;
      text-align: center;
    }

    .active {
      background-color: var(--system-active-bg-color);
      color: #fff;
    }
  }

  .headers {
    width: 100vw;
    height: 30px;
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--system-active-bg-color);
    color: #fff;

    .navHome {
      min-width: 120px;
      line-height: 40px;
      font-size: 14px;
      text-align: center;
    }

    .active {
      background-color: var(--system-bg-color);
      color: #fff;
    }
  }

  .headersd {
    width: 100vw;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    background: var(--system-active-bg-color);
    color: #fff;

    .navHome {
      min-width: 120px;
      line-height: 60px;
      font-size: 14px;
      text-align: center;
    }

    .nav {
      display: flex;
    }

    .active {
      background-color: var(--system-bg-color);
      color: #fff;
    }
  }

  .blueManz {
    width: 100%;
    margin: 0 auto;
    color: #fff;
    line-height: 10vh;
    //background: url('/@/assets/images/search-bg.png') no-repeat ;
    background: url('/@/assets/images/bg.png') no-repeat;
    background-color: var(--system-bg-color);
    background-blend-mode: luminosity;
    background-size: 100% 100%;
    height: 150px;
    .innerBg {
      width: 100%;
      height: 100%;
      p {
        width: 80%;
        margin: 0 auto;
        height: 30px;
        font-size: 18px;
        padding-left: 20px;
      }
      .text {
        font-size: 14px;
      }
    }
  }

  .headerths {
    width: 100vw;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: var(--system-hover-bg-color);
    color: #fff;
  }

  .navleft {
    width: 40vw;
    display: flex;
    align-items: center;
    .logo {
      margin-right: 10px;
      width: 120px;
      text-align: center;
    }
  }

  .menulist {
    width: 100vw;
    background: var(--system-active-bg-color) !important;
    color: #fff;
  }

  :where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light {
    background: transparent;
    color: #fff;
  }

  :where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light:hover {
    background: transparent;
    color: #fff;
  }

  :where(.css-dev-only-do-not-override-1hsjdkk).ant-badge {
    color: #fff;
  }

  :where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: #ffffff !important;
  }

  .Mcontent {
    width: 100vw;
    min-height: 88vh;
  }

  .Avatorleft {
    width: 10vw;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 9;
    background: rgba(255, 255, 255, 0.4);

    .logo {
      width: 100%;
      background: var(--system-hover-bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .userDiv {
      width: 100%;
      height: 40%;
      text-align: center;
      color: #353535;
    }
  }

  .footer {
    width: 100vw;
    height: 24px;
    display: flex;
    align-items: center;
    padding: 0px;
    font-size: 12px;
    justify-content: center;
    background: var(--system-active-bg-color);
    color: #fff;
    position: fixed;
    /* 使用固定定位 */
    left: 0;
    bottom: 0;
  }

  .vben-header-user-dropdown--light .vben-header-user-dropdown__name {
    color: #fff;
  }

  .list-group {
    width: 100%;
    height: 100%;
    min-height: 500px;
    position: relative;
    box-sizing: border-box;
    background-color: #eeeeee;
    font: 14px 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    .list-group-item {
      min-height: 20px;
      margin: 10px;
      height: 360px;
      cursor: move;
      background-color: white;

      .prop_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0px 12px 0 12px;
        height: 30px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;

        .icon {
          white-space: nowrap;
          text-overflow: ellipsis;

          .icon_fire {
            margin-right: 8px;
            font-family: 'simple-line-icons';
            // speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
          }
        }

        .demo-dropdown-wrap :deep(.ant-dropdown-button) {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }

      .item_body {
        padding: 6px;
        height: 330px;
        overflow-y: auto;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        .fa {
          display: inline-block;
          font: normal normal normal 14px/1 FontAwesome;
          font-size: inherit;
          text-rendering: auto;
          -webkit-font-smoothing: antialiased;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
        }

        i {
          cursor: pointer;
        }
      }
    }

    .flip-list-move {
      transition: transform 0.5s;
    }

    .no-move {
      transition: transform 0s;
    }

    .ghost {
      opacity: 0.5;
      background: #c8ebfb;
    }
  }

  .ant-layout {
    height: auto;
    padding-bottom: 50px;
    min-height: var(--viewport-height);

    .ant-layout-content {
      margin: 0px auto;
      width: 90%;
      padding: 8px 6px;
      min-height: 280px;
    }
  }

  .layout {
    // background: url('/@/assets/images/bg.jpg') no-repeat;
    // background-size: 100% 100%;
    background-color: #eee;
    .ant-layout-content {
      width: 88%;
      padding: 8px 6px;
      position: relative;
      left: 66px;

      .list-group {
        background-color: transparent !important;

        .ant-row {
          width: 100% !important;
        }
      }
    }
  }

  .vben-header-user-dropdown--light {
    &--hover {
      background: var(--system-active-bg-color) !important;
    }
  }

  :where(.css-dev-only-do-not-override-1hsjdkk).ant-badge {
    font-size: 12px;
  }

  .ant-menu-submenu-selected {
    color: #fff;
    background-color: var(--system-bg-color);
  }

  .menu {
    display: flex;
    align-items: center;

    li {
      text-align: center;
    }
  }
</style>
