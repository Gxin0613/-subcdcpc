<template>
  <div class="p-1" style="overflow: hidden">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" style="overflow: hidden">
        <Tabs v-model:activeKey="activeKey">
          <!-- :tab="tab.Name" -->
          <TabPane v-for="tab in tabData" :key="tab.No" style="padding: 10px 12px; background-color: white">
            <template #tab>
              <span>
                <i :class="tab.Icon"></i>
                {{ tab.Name }}
              </span>
            </template>
            <Track v-if="tab.No === 'Truck'" :params="tab.params" />
            <TimeBase v-if="tab.No === 'TimeBase'" :params="tab.params" />
            <Table v-if="tab.No === 'Table'" :params="tab.params" />
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'OneWork',
  };
</script>
<script lang="ts" setup>
  import { message, Spin, Tabs, TabPane } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { decodeResponseParams } from '/@/utils/request/decode';
  import Track from '/@/WF/WorkOpt/OneWork/Track.vue';
  import Table from '/@/WF/WorkOpt/OneWork/Table.vue';
  import TimeBase from '/@/WF/WorkOpt/OneWork/TimeBase.vue';
  interface TabItem {
    No: string;
    Name: string;
    params: {};
    Icon: string;
  }
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const tabData = ref<Array<TabItem>>([]);
  const activeKey = ref('');
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('OneWork_GetTabs');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      if (typeof data === 'string' && data.includes('[]')) {
        message.info('没有获取到需要展示的流程运转的信息');
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      result.forEach((item) => {
        const params = decodeResponseParams(item.Url);
        params.NodeName = props.params.NodeName;
        tabData.value.push({
          No: item.No,
          Name: item.Name,
          params: params,
          Icon: item.No === 'Truck' ? 'icon-film' : item.No === 'TimeBase' ? 'icon-layers' : item.No === 'Table' ? 'icon-notebook' : '',
        });
      });
      if (props.params.currTab == null || props.params.currTab == undefined || props.params.currTab == '') activeKey.value = tabData.value[0].No;
      else activeKey.value = props.params.currTab;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-tab) {
    margin-left: 32px;
  }
  :deep(.ant-tabs-nav-wrap) {
    width: 100%;
    position: fixed !important;
    // top: 55px;
    z-index: 999;
    background-color: #fff;
  }
  :deep(.ant-tabs-content-holder) {
    margin-top: 22px;
  }
</style>
