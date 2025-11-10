<template>
  <div class="stats-container">
    <template v-if="loading"> loading... </template>
    <main v-else class="max-w-8xl mx-auto py-4 sm:px-6">
      <Row :gutter="[{ xs: 6, sm: 12, md: 18, lg: 24 }, 24]">
        <template v-if="processedData.length > 0">
          <Col :xs="24" :md="12" :lg="6" v-for="item in processedData" :key="item.FK_Flow" @click="handleCard(item)">
            <Card :hoverable="true" class="overflow-hidden transition-shadow hover:shadow-lg bg-cont">
              <div class="todo-content">
                <i :class="item.Icon || 'icon-drop'"></i>
                <span class="node-name">{{ item.NodeName }}</span>
                <span class="item-count">
                  <Badge
                    :count="item.Num"
                    :number-style="{
                      backgroundColor: '#fff',
                      color: '#000',
                    }"
                  />
                </span>
              </div>
            </Card>
          </Col>
        </template>
        <template v-else>
          <Col :span="24">
            <Card class="text-center p-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Icon type="book" size="large" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-1">{{ '暂无待办事项' }}</h3>
            </Card>
          </Col>
        </template>
      </Row>
    </main>
  </div>
</template>

<script lang="ts" setup>
  import { Card, Row, Col, Badge, message } from 'ant-design-vue';
  import { ref, onMounted, watchEffect } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { Flow } from '/@/WF/TSClass/Flow';
  import { useGo } from '/@/hooks/web/usePage';

  interface RawDataItem {
    FK_Flow: string;
    FK_Node: number;
    NodeName: string;
    [key: string]: any;
  }
  // 定义处理后数据类型
  interface ProcessedDataItem {
    Icon: string;
    FK_Flow: string;
    FK_Node: number;
    NodeName: string;
    Num: number;
  }

  const loading = ref(false);
  const go = useGo();
  const data: any = ref<RawDataItem[]>([]);
  const processedData = ref<ProcessedDataItem[]>([]);
  const iconCache = new Map<string, string>(); // 缓存图标URL

  // 获取流程图标并缓存
  const getFlowIcon = async (flowNo: string): Promise<string> => {
    if (iconCache.has(flowNo)) {
      return iconCache.get(flowNo)!;
    }
    try {
      const flow = new Flow(flowNo);
      await flow.Retrieve();
      const flowData = Object.fromEntries(flow.Row);
      const icon = flowData.Icon || 'icon-drop'; // 默认图标
      iconCache.set(flowNo, icon);
      return icon;
    } catch (e: any) {
      console.trace(e.toString());
      return 'icon-drop';
    }
  };

  // 处理数据并解析Promise
  const processData = async () => {
    if (!data.value || data.value.length === 0) {
      processedData.value = [];
      return;
    }

    const tempMap = new Map<string, Omit<ProcessedDataItem, 'Icon'> & { IconPromise: Promise<string> }>();

    // 第一步：收集所有需要处理的流程
    data.value.forEach((item) => {
      const key = `${item.FK_Flow}-${item.FK_Node}`;
      if (tempMap.has(key)) {
        tempMap.get(key)!.Num++;
      } else {
        tempMap.set(key, {
          FK_Flow: item.FK_Flow,
          FK_Node: item.FK_Node,
          NodeName: item.NodeName,
          Num: 1,
          IconPromise: getFlowIcon(item.FK_Flow),
        });
      }
    });

    // 第二步：等待所有Promise完成
    const entries = Array.from(tempMap.entries());
    const resolvedData: ProcessedDataItem[] = [];

    for (const [_, item] of entries) {
      resolvedData.push({
        ...item,
        Icon: await item.IconPromise, // 解析Promise
      });
    }

    processedData.value = resolvedData;
    console.log(' processedData.value', processedData.value);
  };

  // 监听数据变化
  watchEffect(async () => {
    if (data.value.length > 0) {
      await processData();
    }
  });

  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF');
      const response = await handler.DoMethodReturnJson('Todolist_Init');
      data.value = response;
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const handleCard = (card) => {
    const url = `/WF/GL/Todolist?FlowNo=${card.FK_Flow}`;
    go(url);
  };

  onMounted(() => {
    InitPage();
  });
</script>

<style scoped lang="less">
  .stats-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .bg-cont {
      background-color: #abd5ff;
      color: #fff;
    }
    .todo-content {
      display: flex;
      align-items: center;
      .node-name {
        margin-left: 5px;
      }
      .item-count {
        margin-left: auto;
        display: flex;
        align-items: center;
      }
    }
  }
  :deep(.ant-card .ant-card-body) {
    padding: 8px;
  }
</style>
