<template>
  <Spin :spinning="loadingList">
    <div v-if="ready == false" class="list-picker">
      <div class="header">
        <Checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange" :disabled="!isMultiSelect">{{ '全选' }}</Checkbox>
      </div>
      <br />
      <CheckboxGroup v-model:value="checkedList">
        <Checkbox v-for="item in plainOptions" :key="item.No" :value="item.No" @change="singleCheckboxChange">{{ item.Name }}</Checkbox>
      </CheckboxGroup>
      <div style="bottom: 25px; right: 45px; position: absolute">
        <Button type="primary" @click="StartFlow">{{ '发起流程' }}</Button>
      </div>
    </div>
    <component v-if="ready" :is="loadComponent(compSrcUrl)" :params="getAllRequestParams(compSrcUrl)" />
  </Spin>
</template>

<script lang="ts" setup>
  import { Checkbox, CheckboxGroup, message, Spin, Button } from 'ant-design-vue';
  import { onMounted, ref } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import { getAllRequestParams } from '/@/utils/request/decode';

  const props = defineProps({
    params: {
      type: Object,
      default: () => null,
    },
  });

  interface CheckedItem {
    No: string;
    Name: string;
  }

  // 选中的节点
  const checkedList = ref<string[]>([]);
  const plainOptions = ref<CheckedItem[]>([]);
  const checkAll = ref(false);
  const indeterminate = ref(true);
  const onCheckAllChange = (e: any) => {
    checkedList.value = e.target.checked ? plainOptions.value.map((item: CheckedItem) => item.No) : [];
    indeterminate.value = false;
  };
  const singleCheckboxChange = (e: any) => {
    if (!isMultiSelect.value) {
      checkedList.value = [];
      setTimeout(() => {
        checkedList.value = [e.target.value];
      });
    }
    return true;
  };
  const StartFlow = async () => {
    if (checkedList.value.length === 0) {
      message.error('请至少选择一个使用的表单');
      return;
    }
    const nodeID = parseInt(props.params.FK_Flow) + '01';
    if (checkedList.value.length === 1) {
      compSrcUrl.value = `/src/WF/MyFlow.vue?IsCheckGuide=1&Frms=${checkedList.value[0]}&FK_Node=${nodeID}&${GetParamsUrl(props.params)}`;
    } else {
      const gwf = new GenerWorkFlowExt(props.params.WorkID);
      await gwf.RetrieveFromDBSources();
      gwf.SetPara('Frms', checkedList.value.join(','));
      await gwf.Update();
      compSrcUrl.value = `/src/WF/MyFlowTree.vue?FK_Node=${nodeID}&${GetParamsUrl(props.params)}`;
    }
    ready.value = true;
  };

  const loadingList = ref(false);
  const isMultiSelect = ref(false);
  const ready = ref(false);
  const compSrcUrl = ref('');
  const { loadComponent } = useComponentLoader();

  onMounted(async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('StartGuideFrms_Init');
      plainOptions.value = data['Frms'];
      const flow = data['WF_Flow'][0];
      const startGuidePara = flow.StartGuidePara1;
      if (!!startGuidePara && startGuidePara === '1') isMultiSelect.value = true;
    } catch (e: any) {
      message.error(e.toString());
      console.error(e);
    } finally {
      loadingList.value = false;
    }
  });
</script>

<style lang="less" scoped>
  .list-picker {
    height: 100%;
    border-left: 1px solid #e8e8e8;
    padding-left: 6px;
    margin: 30px;
    background-color: white;
    height: calc(100vh - 150px);
    padding-top: 20px;

    .header {
      padding-bottom: 12px;
      padding-left: 12px;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.ant-checkbox-group) {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-left: 24px;

      & > .ant-checkbox-wrapper {
        width: calc(33% - 8px);
        white-space: pre-wrap;
      }
    }

    :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) {
      margin-left: 0;
    }
  }
</style>
