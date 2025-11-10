<template>
  <Spin :spinning="loading">
    <div class="page">
      <div class="content">
        <div class="title">{{ '请选择要登录的组织' }}</div>
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
  import { OrgAttr, Orgs } from '/@/WF/Admin/Organization/Admin2Group/Org';
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  /**
   * @description: 需要当前登录的账户的No，来获得本账户所管理的所有组织
   */
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const route = useRoute();
  const Adminer = props.params.Adminer || route.query.Adminer; //获得管理员的NO

  const loading = ref(false);
  const router = useRouter();
  const listData = ref<OrgAttr[]>();
  const InitPage = async () => {
    try {
      loading.value = true;
      const orgs = new Orgs();
      await orgs.Retrieve('Adminer', Adminer);
      console.log('管理员的所有组织:', orgs);
      listData.value = orgs.filter((item) => item.No !== '100');
    } catch (e) {
      message.error(`获取组织失败,错误信息: ${e}`);
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
    message.success('获取组织成功');
  };

  const handleOrgClick = (No) => {
    alert('待开发');
  };
  InitPage();
</script>
<style lang="less" scoped>
  .page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
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
