<template>
  <div class="metrics-container">
    <template v-if="loading"> loading... </template>
    <div v-else class="metrics-grid">
      <!-- 流程实例本年 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">{{ '流程实例' }}</div>
          <div class="metric-period">{{ '本年' }}</div>
        </div>
        <div class="metric-value"
          >10,233<span class="metric-unit">{{ '条' }}</span></div
        >
        <div class="metric-footer">
          <div class="metric-detail">{{ '总数 18,452条' }}</div>
          <div class="metric-changes">
            <span class="metric-change success">{{ '同比' }}<i class="arrow-up"></i> 5.2%</span>
            <span class="metric-change success">{{ '环比' }}<i class="arrow-up"></i> 2.1%</span>
          </div>
        </div>
      </div>

      <!-- 流程实例本月 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">{{ '流程实例' }}</div>
          <div class="metric-period">{{ '本月' }}</div>
        </div>
        <div class="metric-value"
          >1,856<span class="metric-unit">{{ '条' }}</span></div
        >
        <div class="metric-footer">
          <div class="metric-detail">{{ '总数 10,233条' }}</div>
          <div class="metric-changes">
            <span class="metric-change success">{{ '同比' }}<i class="arrow-up"></i> 4.8%</span>
            <span class="metric-change success">{{ '环比' }}<i class="arrow-up"></i> 1.2%</span>
          </div>
        </div>
      </div>

      <!-- 按期完成数本年 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">{{ '按期完成数' }}</div>
          <div class="metric-period">{{ '本年' }}</div>
        </div>
        <div class="metric-value"
          >8,594<span class="metric-unit">{{ '条' }}</span></div
        >
        <div class="metric-footer">
          <div class="metric-detail">{{ '总数 10,233条' }}</div>
          <div class="metric-changes">
            <span class="metric-change success">{{ '同比' }}<i class="arrow-up"></i> 7.2%</span>
            <span class="metric-change success">{{ '环比' }}<i class="arrow-up"></i> 3.5%</span>
          </div>
        </div>
      </div>

      <!-- 按期完成数本月 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">{{ '按期完成数' }}</div>
          <div class="metric-period">{{ '本月' }}</div>
        </div>
        <div class="metric-value"
          >1,523<span class="metric-unit">{{ '条' }}</span></div
        >
        <div class="metric-footer">
          <div class="metric-detail">{{ '总数 1,856条' }}</div>
          <div class="metric-changes">
            <span class="metric-change success">{{ '同比' }}<i class="arrow-up"></i> 6.1%</span>
            <span class="metric-change success">{{ '环比' }}<i class="arrow-up"></i> 2.4%</span>
          </div>
        </div>
      </div>

      <!-- 退回数本年 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">{{ '退回数' }}</div>
          <div class="metric-period">{{ '本年' }}</div>
        </div>
        <div class="metric-value"
          >1,023<span class="metric-unit">{{ '条' }}</span></div
        >
        <div class="metric-footer">
          <div class="metric-detail">{{ '退回率' }}<span class="rate-value warning">10%</span></div>
          <div class="metric-progress">
            <div class="progress-bar">
              <div class="progress-fill warning" style="width: 10%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 退回数本月 -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-title">{{ '退回数' }}</div>
          <div class="metric-period">{{ '本月' }}</div>
        </div>
        <div class="metric-value"
          >186<span class="metric-unit">{{ '条' }}</span></div
        >
        <div class="metric-footer">
          <div class="metric-detail">{{ '退回率' }}<span class="rate-value warning">10%</span></div>
          <div class="metric-progress">
            <div class="progress-bar">
              <div class="progress-fill warning" style="width: 10%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { ref, onMounted, reactive, computed } from 'vue';
  import { getAppEnvConfig } from '/@/utils/env';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useUserStore } from '/@/store/modules/user';
  import { User } from '/@/bp/web/WebUser';
  import headerImg from '/@/assets/images/header.jpg';
  import WebUser from '/@/bp/web/WebUser';

  // 定义响应式变量
  let data: any = reactive([]);
  const loading = ref(false);
  const userStore = useUserStore();

  const getUserInfo = computed(() => {
    const { avatar, Name = '', No } = (userStore.getUserInfo as User) || {};
    return { avatar: avatar || headerImg, Name, No };
  });

  const InitPage = async () => {
    if (WebUser.No == 'admin') {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_Home');
        const response = await handler.DoMethodReturnString('Self_MovementFlow_More');
        // 更新响应式变量
        data = response;

        // 这里实际应用中，应该从response解析数据并更新instanceData, onTimeData, returnData
        console.log('加载数据成功:', data);
      } catch (e: any) {
        message.error(e.toString());
        console.error('加载数据失败:', e);
      } finally {
        loading.value = false;
      }
    } else {
      try {
        loading.value = true;
        const handler = new HttpHandler('BP.CCFast.DataV_OneFlow');
        const response = await handler.DoMethodReturnString('Self_MovementFlow_My');
        // 更新响应式变量
        data = response;

        // 这里实际应用中，应该从response解析数据
      } catch (e: any) {
        message.error(e.toString());
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
  };

  //获取代理路径
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL;

  //用户头像图片
  getUserInfo.value.avatar = basicPath + '/DataUser/UserIcon/' + getUserInfo.value.No + '.png';

  //页面数据
  onMounted(async () => {
    await InitPage();
  });
</script>

<style lang="scss" scoped>
  @import url(./less/flowcard.less);
</style>
