<template>
  <div class="p-0">
    <RptWhite v-if="clsName || PageID" :edit="false" :isDisabledEdit="!PageID && !clsName" v-bind="$props" :class-name="clsName" @update-title="updateTitle" />
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import RptWhite from '/@/CCFast/components/RptWhite.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { router } from '/@/router';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import { Org } from '/@/WF/Admin/Organization/AdminGroup/Org';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const route = useRoute();
  const clsName = ref(props.params.EnName || props.params.EnsName || (route.query.EnName as string));
  const PageID = ref('');

  const loadDashboard = async () => {
    if (!clsName.value) {
      // 集团版本
      if (WebUser.CCBPMRunModel == 1) {
        const org = new Org(WebUser.OrgNo);
        await org.Retrieve();
        if (org.DataVSetting == 1) {
          PageID.value = CommonConfig.GroupRptWhitePrefix + WebUser.OrgNo;
          // eslint-disable-next-line vue/no-mutating-props
          props.params['PageID'] = PageID.value;
          return;
        }
      }
      // Saas
      // if (WebUser.CCBPMRunModel == 2 && CommonConfig.EnableCustomRptWhite) {
      //   PageID.value = CommonConfig.SaasRptWhitePrefix + WebUser.OrgNo;
      //   if (!!PageID.value) {
      //     // eslint-disable-next-line vue/no-mutating-props
      //     props.params['PageID'] = PageID.value;
      //     return;
      //   }
      // }
      if (WebUser.IsAdmin) {
        clsName.value = 'DataV_HomeAdmin';
        return;
      }
      clsName.value = 'DataV_HomeEmp';
    }
  };
  const updateTitle = (title: string) => {
    document.title = title;
    const tabStore = useMultipleTabStore();
    const currentTab = tabStore.getTabList.find((item) => item.fullPath === router.currentRoute.value.fullPath);
    //在你需要修改的地方类似下面这样
    if (currentTab?.meta?.title) {
      currentTab.meta.title = title;
      document.title = title;
    }
  };
  onMounted(async () => {
    await loadDashboard();
  });
</script>
