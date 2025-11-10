<template>
  <div class="p-4">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <Collapse v-model:activeKey="activeKey">
          <CollapsePanel v-for="group in panelGroups" :key="group.No" :header="group.Name">
            <Row :gutter="[16, 12]">
              <Col :span="8" v-for="node in group.children" :key="node.No">
                <Card class="custom-card" @click="toNode(group.No, node.No)">
                  <NodeIndexOutlined />
                  <span style="margin-left: 6px"> {{ node.Name }}</span>
                </Card>
              </Col>
              <Col :span="8">
                <Card @click="addNewNode(group.No)" class="add-card" v-if="En?.IsShowAddClick">
                  <PlusCircleOutlined />
                  <span style="margin-left: 6px">{{ '新增节点' }}</span>
                </Card>
              </Col>
            </Row>
          </CollapsePanel>
        </Collapse>
      </div>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { NodeIndexOutlined, PlusCircleOutlined } from '@ant-design/icons-vue';
  import { Collapse, CollapsePanel, Row, Col, Card, Spin } from 'ant-design-vue';
  import { useRoute } from 'vue-router';
  import { reactive, ref } from 'vue';
  import { useDataConvert } from '/@/hooks/ens/useDataConvert';
  import { ClassFactoryOfPanelGroup } from '/@/WF/Comm/UIEntity/ClassFactoryOfPanelGroup';
  import { PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';

  type Result = Array<Record<string, any>>;
  const route = useRoute();
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const panelGroups = ref<Array<Record<string, any>>>([]);
  const loading = ref(false);
  const activeKey = ref<Array<string>>([]);

  // 添加新节点
  const addNewNode = (No: string) => {
    En.value?.AddClick(No);
  };

  const toNode = (GroupNo, No: string) => {
    En.value?.IconClick(GroupNo, No);
  };

  const En = ref<PageBasePanelGroup>();

  //加载页面.
  async function InitPage() {
    try {
      console.log(props);
      loading.value = true;
      const EnName = props?.params?.EnName || route.query?.EnName;
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少必要参数 [ EnName ]';
        return;
      }

      //获得页面实体.  PG_FlowSort2Flow
      const entity = ClassFactoryOfPanelGroup.GetEn(EnName as string);
      await entity.Init(); //调用方法初始化数据.
      const convertor = useDataConvert();
      En.value = entity;
      panelGroups.value = convertor(entity.GroupsEns as Result, entity.DtlEns as Result, entity.RefKey as string);
      console.log(panelGroups.value);
      activeKey.value = panelGroups.value.map((fg) => fg.No);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return;
    } finally {
      loading.value = false;
    }
  }

  InitPage();
</script>

<style scoped lang="less">
  .custom-card {
    border: 1px solid #aaaaaa;
    border-radius: 12px;

    &:hover {
      border: 1px solid #1890ff;
      background-color: #1890ff;
      color: #ffffff;
      cursor: pointer;
    }
  }

  .add-card {
    border: 1px dotted #aaaaaa;
    border-radius: 12px;
    color: #999999;

    &:hover {
      border: 1px solid #1890ff;
      background-color: #1890ff;
      color: #ffffff;
      cursor: pointer;
    }
  }
</style>
