<template v-if="KeyVal == 1">
  <div class="header">
    <div class="navleft">
      <div class="logo">
        <img src="/resource/img/logo.png" height="40" width="40" />
      </div>
      <div class="navHome" style="width: 120px" v-for="item in systemData" :key="item.No" @click="onNavClick(item.No)">{{ item.Name }}</div>
    </div>
    <!--          <a-layout-sider v-model="collapsed" :trigger="null" collapsible> :style="{'width':(KeyVal == 1?'26%':'auto')}"-->
    <div :style="{ width: initQty.length > 0 ? 8 * initQty.length + '%' : 'auto' }" class="right">
      <Menu v-model:selectedKeys="current" mode="horizontal">
        <MenuItem v-for="item in initQty" :key="item.No" @click="onMenuItemClick(item.No)">
          <ABadge :count="item.Num" show-zero :offset="[0, -6]"> {{ item.Name }} </ABadge>
        </MenuItem>
        <SubMenu key="3">
          <template #title
            ><span class="text-white">{{ '切换风格' }}</span></template
          >
          <menuItemGroup>
            <menuItem key="setting:1" style="background-color: #0960bd; color: #fff" @click="ontitleClick(1)">{{ '简洁' }}</menuItem>
            <menuItem key="setting:2" style="background-color: #0960bd; color: #fff" @click="ontitleClick(2)">{{ '蓝色' }}</menuItem>
            <menuItem key="setting:3" style="background-color: #0960bd; color: #fff" @click="ontitleClick(3)">{{ '传统' }}</menuItem>
            <menuItem key="setting:4" style="background-color: #0960bd; color: #fff" @click="ontitleClick(4)">{{ '极简' }}</menuItem>
          </menuItemGroup>
        </SubMenu>
        <MenuItem key="4">
          <div style="width: 95px">
            <UserDropDown :theme="getHeaderTheme" :loginType="props.loginType" :systemType="pageData.SystemType" />
          </div>
        </MenuItem>
        <MenuItem key="6">
          <div style="width: 80px" @click="toggle" v-if="showDiv1">
            <span class="text-white" @click="onDesginClick()">{{ '设计门户' }}</span>
          </div>
          <div style="width: 80px" @click="toggle" v-if="showDiv2">
            <span class="text-white" @click="onNavClick(route.query.PageID)">{{ '预览门户' }}</span>
          </div>
        </MenuItem>
      </Menu>
      <SettingDrawer :class="`${prefixCls}-action__item`" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Badge as ABadge, MenuItemGroup, Menu, MenuItem, SubMenu } from 'ant-design-vue';
  import { onMounted, ref, nextTick, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { UserDropDown } from '/@/layouts/default/header/components';
  import { propTypes } from '/@/utils/propTypes';
  import { useDesign } from '/@/hooks/web/useDesign';
  import SettingDrawer from '/@/layouts/default/setting/index.vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import headerImg from '/@/assets/images/header.jpg';
  // 处理基础组件
  const { getHeaderTheme } = useHeaderSetting();
  const { prefixCls } = useDesign('layout-header');
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
  const KeyVal = ref(1);
  const myRef = ref();

  //数组-集合
  const loading = ref(false);
  const route = useRoute();
  const router = useRouter();
  const systemData = ref({});
  const initQty = ref({});
  const pageData = ref({});
  const InitPage = async () => {
    try {
      const showDiv1 = ref(true);
      const showDiv2 = ref(false);

      //导航栏
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      systemData.value = await handler.DoMethodReturnJson('SystemPortal_GenerPages');
      console.log('导航栏门户', systemData);

      //门户初始化数据
      const handler1 = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      handler1.AddPara('pageId', route.query.PageID);
      // nextTick(async () => {
      initQty.value = await handler1.DoMethodReturnJson('SystemPortal_getTodolist');
      // });

      console.log('气泡显示', initQty.value);

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
    KeyVal.value = val;
    if (KeyVal.value == '2') {
      nextTick(() => {
        myRef.value.style = '';
        myRef.value.style.background = 'url("/resource/img/bg.png") no-repeat';
        myRef.value.style.backgroundSize = '100%';
        myRef.value.style.paddingTop = '20vh';
      });
    }
  };
  const onNavClick = async (val) => {
    console.log('val', val);
    const url = '/portal/rptContent?PageID=' + val + '&edit=0';
    router.replace(url);
  };
  // InitPage();
  const onMenuItemClick = async (val) => {
    const url = '/portal/GL/Pt' + val.substring(val.lastIndexOf('_') + 1) + '?EnName=' + val + '&PageID=' + route.query.PageID;
    router.replace(url);
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
