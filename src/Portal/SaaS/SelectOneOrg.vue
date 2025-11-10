<template>
  <Spin :spinning="loading">
    <div class="page">
      <div class="content">
        <div class="title"
          >{{ '请选择要登录的组织 -' }}<a @click="handleAdminLogin">{{ '超级管理员登录' }}</a></div
        >
        <div class="list">
          <div v-for="item in listData" :key="item['No']"
            ><a @click="handleOrgClick(item['No'])">{{ item['No'] }} _ {{ item['Name'] }}</a></div
          >
        </div>
      </div>
    </div>
  </Spin>
</template>
<script lang="ts" setup>
    import { message, Spin } from 'ant-design-vue';
  import { OrgAttr } from '/@/WF/Admin/Organization/Admin2Group/Org';
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { getAppEnvConfig } from '/@/utils/env';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  const loading = ref(false);
  const router = useRouter();
  const route = useRoute();
  const listData = ref<OrgAttr[]>();
  const userStore = useUserStore();
  const InitPage = async () => {
    try {
      loading.value = true;
      const { VITE_GLOB_OSModel, VITE_GLOB_SaaSModel } = getAppEnvConfig();
      if (VITE_GLOB_OSModel === '2' && VITE_GLOB_SaaSModel === '0') {
        if (route.query['OrgNo']) {
          userStore.resetState();
          router.replace({ path: '/SaasLoginModel', query: { OrgNo: route.query['OrgNo'], OrgName: route.query['OrgName'], UserNo: route.query['UserNo'] } });
        } else {
          message.error('您未传递组织编号跟组织名称');
          return;
        }
      } else {
        const httphandler = new HttpHandler('BP.Cloud.HttpHandler.Portal_SaaS');
        const data: any = await httphandler.DoMethodReturnString('SelectOneOrg_Init');
        if (data.indexOf('err@') == 0) {
          alert(data);
          return;
        }
        console.log('组织数据：', data);
        listData.value = data.filter((item) => item[OrgAttr.No] != '100');
      }
    } catch (e) {
      message.error(`获取组织失败,错误信息: ${e}`);
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
    message.success('获取组织成功');
  };
  const handleAdminLogin = () => {
    router.push({
      path: '/SaasAdminLogin',
    });
  };

  const handleOrgClick = (No) => {
    const orgName = listData.value?.filter((item) => item['No'] == No)[0]['Name'];
    router.replace({ path: '/SaasLogin', query: { OrgNo: No, OrgName: orgName } });
  };
  InitPage();
</script>
<style lang="less" scoped>
  .page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--viewport-height);
    width: 100vw;
    .content {
      width: 50vw;
      height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      .title {
        font-size: 25px;
        margin: 40px 0;
        font-weight: bold;
      }
      .list {
        font-size: 15px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 50vw;
        border-width: 2px;
        border-color: #7c7373;
        padding: 10px;
        line-height: 30px;
      }
    }
  }
</style>
