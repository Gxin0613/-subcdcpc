<template>
  <div style="background-color: transparent; height: 100%; margin-left: auto">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" :isShowCloseBtn="false" />
      </div>
      <div v-else class="toolbar-flow">
        <!-- 流程状态显示 -->
        <!-- <Button :style="{ color: tag?.color }" size="small"> {{ tag?.name }}</Button> -->
        <!-- <Button type="primary" style="margin-right: 15px; background-color: #f27140; border-color: #f27140" @click="openSingleDesign">单记录设计</Button> -->
        <Tag :color="tag?.color">{{ tag?.name }}</Tag>
        <!-- 优先级 -->
        <Select
          v-if="pageType === 'MyBill'"
          v-model:value="PRIOptions.value"
          :disabled="billState === 100 || billState === 200"
          style="width: 100%"
          :allow-clear="false"
          @change="(activeNo, _) => shiftPRI(activeNo as string)"
        >
          <SelectOption v-for="item in PRIOptions.options" :key="item.value">
            <i class="glyphicon glyphicon-bookmark" :style="{ color: item.label || '#ffde72' }"></i>
          </SelectOption>
        </Select>
        <!-- 收藏 -->
        <Tooltip v-if="pageType === 'MyBill'" :title="Collect == 1 ? '取消收藏' : '收藏'">
          <div class="collect" @click="isCollect(Collect)">
            <template v-if="Collect == 1"> <StarFilled style="color: gold; font-size: 18px" /></template>
            <template v-else> <StarOutlined style="font-size: 18px" /></template>
          </div>
        </Tooltip>
      </div>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { Spin, Select, SelectOption, Tag, Tooltip, Button } from 'ant-design-vue';
  import { StarFilled, StarOutlined } from '@ant-design/icons-vue';
  import FlowError from '/@/WF/FlowError.vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  import { GenerBill } from '/@/CCFast/CCBill/GenerBill';
  import BSEntity from '/@/utils/gener/BSEntity';
  const props = defineProps({
    params: {
      //表单属性集合
      type: Object,
      default: () => {},
    },
    pageType: {
      trye: String,
      default: '',
    },
    billState: {
      type: Number,
      default: 0,
    },
  });

  const emit = defineEmits(['open-single-page']);
  interface TagExt {
    name: string;
    color: string;
  }
  interface PRIExt {
    label: string;
    value: number;
  }
  //获取传的参数
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const WorkID = props.params.WorkID as string;
  //流程状态显示
  const State = ref<string>();
  const tag = ref<TagExt>();
  //优先级显示
  const PRIOptions = reactive({
    value: 0,
    options: [
      {
        label: '#80a22e',
        value: 0,
      },
      {
        label: '#ffde72',
        value: 1,
      },
      {
        label: '#db382e',
        value: 2,
      },
    ],
  });
  //收藏
  const Collect = ref<number>(0);

  const InitPage = async () => {
    try {
      const gb = new GenerBill();
      gb.WorkID = parseInt(props.params.WorkID);
      const i = await gb.RetrieveFromDBSources();
      //流程状态
      getState(i == 1 ? gb.BillState : props.billState);
      //优先级
      PRIOptions.value = gb.PRI;
      //收藏
      Collect.value = parseInt(GetPara(gb.AtPara, 'F_' + WebUser.No) || '0');
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 状态获取
   * @param WFState
   */
  const getState = (BillState: number) => {
    switch (BillState) {
      case -1:
        State.value = '@作废(不可编辑)=red';
      case 0:
        State.value = '@空白=orange';
        break;
      case 1:
        State.value = '@草稿=orange';
        break;
      case 2:
        State.value = '@編輯=yellow';
        break;
      case 3:
        State.value = '@审核=blue';
        break;
      case 5:
        State.value = '@退回=red';
        break;
      case 7:
        State.value = '@作废(可编辑)=red';
        break;
      case 100:
      case 200:
        State.value = '@归档=green';
        break;
    }
    GetTextTags(State.value);
  };

  /**
   * 获取标签表示的内容
   * @param State
   * @constructor
   */
  const GetTextTags = (State) => {
    if (typeof State == 'string') {
      splitAtString(State).forEach((item) => {
        tag.value = {
          name: item.split('=')[0],
          color: item.split('=')[1],
        };
      });
      return tag.value;
    } else return [];
  };
  /**
   * 切换优先级
   * @param PRI
   * @constructor
   */
  const shiftPRI = async (PRI) => {
    //优先级切换逻辑
    const gb = new GenerBill();
    gb.WorkID = parseInt(props.params.WorkID);
    await gb.RetrieveFromDBSources();
    gb.PRI = PRI;
    await gb.Update();
    const en = new BSEntity(gb.FrmID, props.params.WorkID);
    await en.RetrieveFromDBSources();
    en.setPK(props.params.WorkID);
    en.setPara('PRI', PRI);
    await en.Update();
  };
  /**
   * 是否收藏
   * @param Show
   */
  const isCollect = async (Show) => {
    if (Show == 1) {
      Collect.value = 0;
    } else {
      Collect.value = 1;
    }
    const gb = new GenerBill();
    gb.WorkID = parseInt(props.params.WorkID);
    await gb.RetrieveFromDBSources();
    gb.SetPara('F_' + WebUser.No, Collect.value);
    await gb.Update();
  };

  const openSingleDesign = () => {
    emit('open-single-page');
  };

  InitPage();
</script>
<style scoped lang="less">
  .toolbar-flow {
    height: 100%;
    display: flex;
    background-color: transparent;
    :deep(.ant-tag) {
      padding: 5px;
    }
    .collect {
      display: flex;
      align-items: center;
      margin: 0 10px;
    }
  }
</style>
