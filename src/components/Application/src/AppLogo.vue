<!--
 * @Author: Vben
 * @Description: logo component
-->
<template>
  <div class="anticon" :class="getAppLogoClass" @click="goHome">
    <template v-if="VITE_GLOB_OSModel === '2' && VITE_GLOB_SaaSModel === '0'">
      <img :src="logo" @error="defaultIcon" style="width: 125px; object-fit: contain; margin-left: 12px" :class="getTitleClass" v-show="showTitle" />
    </template>
    <template v-else>
      <img :src="logo" style="object-fit: contain; margin-left: 3px" @error="defaultIcon" />
      <div class="ml-2 truncate md:opacity-100" :class="getTitleClass" v-show="showTitle"> {{ title }}</div>
    </template>
    <!-- <div class="ml-2 truncate md:opacity-100" :class="getTitleClass" v-show="showTitle"> {{ title }}</div> -->
    <!-- <img src="../../../assets/images/cclogtitle.png" style="width: 125px; object-fit: contain; margin-left: 12px" /> -->
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { setAuthCache } from '/@/utils/auth';
  import { APP_MENU_CACHE_KEY } from '/@/enums/cacheEnum';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useRoute } from 'vue-router';
  import WebUser from '/@/bp/web/WebUser';

  const props = defineProps({
    /**
     * The theme of the current parent component
     */
    theme: { type: String, validator: (v: string) => ['light', 'dark'].includes(v) },
    /**
     * Whether to show title
     */
    showTitle: { type: Boolean, default: true },
    /**
     * The title is also displayed when the menu is collapsed
     */
    alwaysShowTitle: { type: Boolean },
    /**
     * Logo-Img
     */
    orgNo: {
      type: String,
      default: '',
    },
  });
  const { VITE_GLOB_API_URL, VITE_GLOB_OSModel, VITE_GLOB_SaaSModel } = getAppEnvConfig();
  const { prefixCls } = useDesign('app-logo');
  const { getCollapsedShowTitle } = useMenuSetting();
  const { title } = useGlobSetting();

  const getAppLogoClass = computed(() => [prefixCls, props.theme, { 'collapsed-show-title': unref(getCollapsedShowTitle) }]);

  const getTitleClass = computed(() => [
    `${prefixCls}__title`,
    {
      'xs:opacity-0': !props.alwaysShowTitle,
    },
  ]);

  const logo = ref();
  const { VITE_PUBLIC_PATH } = getAppEnvConfig();
  console.log('VITE_PUBLIC_PATH', VITE_PUBLIC_PATH);
  function InitPage() {
    const getSystemNo = localStorage.getItem('SystemNo');
    if (VITE_GLOB_OSModel === '2' && VITE_GLOB_SaaSModel === '0') {
      const route = useRoute();
      if (!route.path.includes('/SaasAdminLogin')) {
        const OrgNo = route.query.OrgNo || props.orgNo || WebUser.OrgNo;
        //获取代理路径
        const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
        //Logo图片存放地址
        if (getSystemNo) {
          logo.value = VITE_PUBLIC_PATH + `resource/CCFast/AppNo/${OrgNo}.png`;
        } else {
          logo.value = basicPath + `/DataUser/OrgData/${OrgNo}Icon.png`;
        }
      }
    } else {
      const getSystemNo = localStorage.getItem('SystemNo');
      if (getSystemNo) {
        logo.value = VITE_PUBLIC_PATH + `resource/CCFast/AppNo/${getSystemNo}.png`;
      } else {
        logo.value = VITE_PUBLIC_PATH + 'resource/CompanyImgLogo/hsware.png';
      }
    }
  }

  function defaultIcon(e) {
    const img = e.srcElement;
    img.src = VITE_PUBLIC_PATH + 'resource/CompanyImgLogo/hsware.png';
    img.onerror = null;
  }

  function goHome() {
    setAuthCache(APP_MENU_CACHE_KEY, []);
    setTimeout(() => {
      window.location.reload();
    });
  }
  InitPage();
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    padding-left: 7px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.light {
      border-bottom: 1px solid @border-color-base;
    }

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light &__title {
      color: @primary-color;
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      font-size: 16px;
      font-weight: 700;
      transition: all 0.5s;
      line-height: normal;
    }
  }
</style>
