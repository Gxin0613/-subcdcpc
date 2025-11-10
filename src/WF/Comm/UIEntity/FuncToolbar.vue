<template>
  <template v-if="IsMobile()">
    <AntButton
      v-if="props.isDelayedSend"
      :shape="shape"
      type="primary"
      @click="SetDelayedSend"
      :style="btnMargin"
      style="margin: 0 12px; background-color: #2970ff"
      class="btnPosition"
      >{{ '延期发送' }}</AntButton
    >
    <AntButton
      v-else
      v-for="btn in list"
      type="primary"
      :loading="btn.loading"
      :shape="shape"
      :disabled="btnDisabled"
      :key="btn.id"
      @click="() => btn.onclick()"
      :style="btnMargin"
      style="background-color: #2970ff"
      :class="'btnPosition ' + btn_style(btn.name)"
      >{{ btn.name }}
    </AntButton>
  </template>
  <template v-else>
    <AntButton v-if="props.isDelayedSend" :shape="shape" type="primary" class="btn_style" @click="SetDelayedSend" :style="btnMargin">{{ '延期发送' }}</AntButton>
    <AntButton v-else type="primary" :shape="shape" :class="btn_style(btn.name)" v-for="btn in list" :key="btn.id" @click="() => btn.onclick()" :style="btnMargin">{{
      btn.name
    }}</AntButton>
  </template>
</template>

<script setup lang="ts">
  import { Button as AntButton, message } from 'ant-design-vue';
  import type { FuncButton } from '../Methods';
  import { computed, ref, watch } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { IsMobile } from '/@/utils/gener/StringUtils';

  const props = defineProps({
    list: {
      type: Object as PropType<FuncButton[]>,
      default: () => {
        return [];
      },
    },
    margin: {
      type: String,
      default: () => {
        return 'left';
      },
    },
    shape: {
      type: String,
      default: 'round',
    },
    params: {
      type: Object,
      default: () => {},
    },
    delaySendTime: {
      type: Object,
      default: () => {},
    },
    row: {
      type: Object,
      default: () => null,
    },
    isDelayedSend: {
      type: Boolean,
      default: false,
    },
    sendDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['handleCancel']);
  const btnMargin = computed(() => {
    if (props.margin === 'both') {
      return {
        marginLeft: `12px`,
        marginRight: `12px`,
      };
    }
    return {
      [`margin-${props.margin}`]: `12px`,
    };
  });
  const btnDisabled = ref<boolean>(props.sendDisabled);
  watch(
    () => props.sendDisabled,
    (val) => {
      console.log('props.sendDisabled', val);
      btnDisabled.value = val;
    },
  );

  const SetDelayedSend = async () => {
    if (props.delaySendTime.days == 0 && props.delaySendTime.hours == 0 && props.delaySendTime.mins == 0) {
      message.error('请设置延期发送的时间');
      return;
    }
    if (props.row?.SendEmps == '' || props.row?.SendEmps == null) {
      message.error('请选择下一个节点的接收人');
      return;
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddJson(props.params);
    handler.AddPara('TB_Day', props.delaySendTime.days);
    handler.AddPara('TB_Hour', props.delaySendTime.hours);
    handler.AddPara('DDL_Minute', props.delaySendTime.mins);
    handler.AddPara('ToNodeID', props.params.ToNode);
    const data = handler.DoMethodReturnString('DelayedSend');
    //设置延期发送成功的提示及提示消失事件
    message.success(await data, 2, onClose);
    if ((await data).indexOf('err@') != -1) {
      message.error(await data);
      return;
    }
  };
  const onClose = () => {
    emit('handleCancel', false);
  };

  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn.includes('新增') || btn.includes('新建')) {
        return 'btn_style btn_add';
      } else if (btn.includes('删除')) {
        return 'btn_style btn_del';
      } else {
        return 'btn_style';
      }
    };
  });
</script>

<style lang="less" scoped>
  .btn_style {
    height: 30px;
    border-radius: 5px;
  }

  .btn_add {
    background-color: #67c23a !important;
    border-color: #67c23a !important;
    color: #fff !important;
  }

  .btn_del {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: #fff !important;
  }

  .btnPosition {
    width: 100%;
    // height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px !important;
  }
</style>
