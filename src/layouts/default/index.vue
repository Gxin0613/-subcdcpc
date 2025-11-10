<template>
  <BaseComponent ref="baseComp">
    <Layout :class="prefixCls" v-bind="lockEvents">
      <LayoutFeatures />
      <LayoutHeader :fixed="true" v-if="getShowFullHeaderRef" />
      <Layout :class="[layoutClass, `${prefixCls}-out`]">
        <LayoutSideBar v-if="getShowSidebar || getIsMobile" />
        <Layout :class="`${prefixCls}-main`">
          <LayoutMultipleHeader :loginType="loginType" :isTitle="IsTitle" />
          <LayoutContent />
          <LayoutFooter />
        </Layout>
      </Layout>
    </Layout>
    <ChangPwd />
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { computed, unref, ref, onMounted, shallowRef, onUnmounted } from 'vue';
  import { Layout } from 'ant-design-vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  import LayoutHeader from './header/index.vue';
  import LayoutContent from './content/index.vue';
  import LayoutSideBar from './sider/index.vue';
  import LayoutMultipleHeader from './header/MultipleHeader.vue';

  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLockPage } from '/@/hooks/web/useLockPage';

  import { useAppInject } from '/@/hooks/web/useAppInject';
  import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';
  import ChangPwd from '/@/components/ChangPwd/src/ChangPwd.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { getRequestParams } from '/@/utils/request/decode';

  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import Events from '/@/utils/Events';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

  const LayoutFeatures = createAsyncComponent(() => import('/@/layouts/default/feature/index.vue'));
  const LayoutFooter = createAsyncComponent(() => import('/@/layouts/default/footer/index.vue'));

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  defineOptions({ name: 'DefaultLayout' });
  const { prefixCls } = useDesign('default-layout');
  const { getIsMobile } = useAppInject();
  const { getShowFullHeaderRef } = useHeaderSetting();
  const { getShowSidebar, getIsMixSidebar, getShowMenu } = useMenuSetting();
  const loginType = ref<string>('');
  // Create a lock screen monitor
  const lockEvents = useLockPage();
  const { getAutoCollapse } = useMultipleTabSetting();
  //是否显示低代码头部Header
  const IsTitle = ref(1);
  const layoutClass = computed(() => {
    let cls: string[] = ['ant-layout'];
    if (unref(getIsMixSidebar) || unref(getShowMenu)) {
      cls.push('ant-layout-has-sider');
    }

    if (!unref(getShowMenu) && unref(getAutoCollapse)) {
      cls.push('ant-layout-auto-collapse-tabs');
    }

    return cls;
  });
  onMounted(async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    const sysInfo = await handler.DoMethodReturnJson('Login_InitInfo');
    if (sysInfo.OSModel == 1) loginType.value = 'Group';
    else if (sysInfo.OSModel == 0) loginType.value = 'Single';
    else if (sysInfo.OSModel == 2) loginType.value = 'SAAS';
    //获取路由参数IsTitle存储到本地的IsTitle应用编号
    if (getRequestParams('IsTitle')) {
      localStorage.setItem('IsTitle', getRequestParams('IsTitle'));
    }
    const istitle = localStorage.getItem('IsTitle');
    if (istitle) {
      IsTitle.value = Number(istitle);
    }

    Events.on('ccfast_base_com_drawer', (url: string | undefined) => {
      baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
    });
  });
  onUnmounted(() => {
    Events.off('ccfast_base_com_drawer');
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-default-layout';

  .@{prefix-cls} {
    display: flex;
    width: 100%;
    min-height: 100%;
    background-color: @content-bg;
    flex-direction: column;

    > .ant-layout {
      min-height: 100%;
    }

    &-main {
      width: 100%;
      margin-left: 1px;
    }
  }
  .@{prefix-cls}-out {
    &.ant-layout-has-sider {
      .@{prefix-cls} {
        &-main {
          margin-left: 1px;
        }
      }
    }
  }
</style>
