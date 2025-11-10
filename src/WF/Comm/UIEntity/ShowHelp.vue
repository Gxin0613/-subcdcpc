<template>
  <ThemeWrapper>
    <div class="container">
      <div style="margin-right: auto">
        <Button type="primary" @click="showHelp" style="margin-right: 10px"><i class="icon-support">&nbsp;</i>{{ '显示帮助' }}</Button>
        <Popover v-model:open="isScanCode" trigger="click" placement="top" class="bubblePopover">
          <template #title>
            <i class="icon-bubble"></i><span>{{ '请扫码进行提问' }}</span>
          </template>
          <template #content> <img src="/resource/WF/Admin/Img/ScanCode.png" width="250" alt="" /> </template>
          <Button type="primary" @click="inquire"
            ><i class="icon-bubble"></i> <span style="margin-left: 8px">{{ '扫码提问' }}</span></Button
          >
        </Popover>
      </div>
    </div>
  </ThemeWrapper>
</template>

<script lang="ts" setup>
  import { Button, Popover } from 'ant-design-vue';
  import { ref } from 'vue';
  import ThemeWrapper from '../ThemeWrapper.vue';
  const props = defineProps({
    isGPEShowHelp: {
      type: Boolean,
      required: false,
      default: false,
    },
    isGPNShowHelp: {
      type: Boolean,
      required: false,
      default: false,
    },
  });
  const emit = defineEmits(['changeShowHelp']);
  //显示隐藏帮助
  const isGPEShowHelp = ref(props.isGPEShowHelp);
  const isGPNShowHelp = ref(props.isGPNShowHelp);
  const showHelp = () => {
    isGPEShowHelp.value = !isGPEShowHelp.value;
    isGPNShowHelp.value = !isGPNShowHelp.value;
    emit('changeShowHelp', isGPEShowHelp.value, isGPNShowHelp.value);
  };

  //显示提问
  const isScanCode = ref(false);
  const inquire = () => {
    isScanCode.value = true;
  };
</script>

<style lang="less" scoped></style>
