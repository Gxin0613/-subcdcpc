<template>
  <div class="en-page">
    <div class="header">
      <div class="logo">
        <img :src="logo" alt="logo" @error="loadDefault" />
      </div>
      <div class="links">
        <Tooltip :title="action.name" placement="bottom" :mouseEnterDelay="0.5" v-for="action in flowActions" :key="action.url" @click="openTab(action)">
          <div class="item">
            <i :class="action.icon"></i>
            <span>{{ action.name }}</span>
          </div>
        </Tooltip>
      </div>
      <div class="user-area">
        <div class="username" :title="'`欢迎您：${user.Name}`'">您好：{{ user.Name }}</div>
        <div class="exit" @click="closeSystem">{{ '退出登录' }}</div>
      </div>
    </div>
    <En :PKVal="PKVal" :EnName="EnName" :params="params" is-child-component ref="enCompRef" @update-system-logo="updateLogo" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, shallowRef } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import En from './En.vue';
  import { cloneDeep } from 'lodash-es';
  import { useRoute } from 'vue-router';
  import { RefMethodType } from '/@/bp/en/Map/RefMethod';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  const route = useRoute();
  const query = route.query || {};
  const PKVal = ref(route.query.PKVal as string);
  const EnName = ref(route.query.EnName as string);
  const params = ref(cloneDeep(query));
  const enCompRef = shallowRef<InstanceType<typeof En>>();

  const flowActions = ref([
    { name: '发起', icon: 'icon-paper-plane', url: '/src/WF/views/GenerList.vue?EnName=GL_Start' },
    { name: '待办', icon: 'icon-clock', url: '/src/WF/views/GenerList.vue?EnName=GL_Todolist' },
    { name: '在途', icon: 'icon-hourglass', url: '/src/WF/views/GenerList.vue?EnName=GL_Runing' },
    { name: '近期', icon: 'icon-envelope', url: '/src/WF/views/GenerList.vue?EnName=GL_RecentWork' },
    { name: '抄送', icon: 'icon-bag', url: '/src/WF/views/GenerList.vue?EnName=GL_CC' },
    { name: '单据', icon: 'icon-notebook', url: '/src/WF/Comm/En.vue?EnName=TS.CCBill.BillSetting&PKVal=' + WebUser.No },
  ]);
  const logo = ref('');
  const openTab = (item: Recordable) => {
    const { name, url } = item;
    const tab = {
      Title: name,
      ClassMethod: url,
      RefMethodType: RefMethodType.TabOpen,
    };
    enCompRef.value?.handleTabsEvents(tab);
  };

  const { VITE_PUBLIC_PATH } = getAppEnvConfig();

  const user = ref(WebUser);

  const loadDefault = () => {
    logo.value = VITE_PUBLIC_PATH + 'resource/CompanyImgLogo/cc_logo_no_bg.png';
  };

  const updateLogo = (src: string) => {
    logo.value = src;
  };

  const closeSystem = () => {
    if (window.confirm('确定要退出系统吗？')) {
      window.open('about:blank', '_self')?.close();
    }
  };

  // components  En.vue
  // Views EnPage.vue htm  FlowEntity.vue  En.vue
</script>

<style lang="less" scoped>
  .header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 60px;
    width: 100%;
    border-bottom: 2px solid #f2f5f7;
    .logo {
      width: 200px;

      img {
        height: 60px;
        object-fit: contain;
        padding-left: 18px;
      }
    }
    .links {
      width: calc(100% - 300px);

      display: flex;
      align-items: center;
      flex: 1;
      width: 100%;
      height: 100%;

      .item {
        margin-right: 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        align-items: center;

        &:hover {
          color: #459dff;
          border-bottom: 2px solid #459dff;
        }

        i {
          font-size: 18px;
        }

        span {
          font-size: 16px;
          margin-left: 6px;
        }
      }

      //}
    }
    .user-area {
      width: 400px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      box-sizing: border-box;
      padding: 0 12px;
      text-align: center;
      font-weight: 500;

      .cart-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #33c4ff;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        img {
          width: 18px;
          height: 18px;
        }
      }

      .username {
        font-size: 16px;
        width: 120px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .exit {
        font-size: 14px;
        cursor: pointer;
        margin-left: 20px;
        &:hover {
          font-weight: 600;
          color: #459dff;
        }
      }
    }
  }
</style>
