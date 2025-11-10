<template>
  <Teleport to="body">
    <Transition name="fade-dialog">
      <div v-if="!loading && visible" class="prompt-wrapper">
        <div class="prompt" :style="promptStyle">
          <div class="header">
            <h5>{{ '创建大块文本字段' }}</h5>
            <div style="cursor: pointer" @click="emit('close')">
              <i style="font-size: 25px" class="icon-close"></i>
            </div>
          </div>
          <div class="content">
            <div class="tips">{{ '字段名称' }}</div>
            <n-input v-model:value="currentName" :placeholder="'字段中文名.'" @update:value="generatePinyin" />
            <div class="tips">字段ID:</div>

            <n-input v-model:value="currentId" :placeholder="'字段英文名,自动生成拼音后可修改.'" />
            <n-radio-group v-model:value="pinyinType" name="radiogroup" @change="generatePinyin(currentName)">
              <n-radio key="fpy" value="fpy">{{ '全拼' }}</n-radio>
              <n-radio key="spy" value="spy">{{ '简拼' }}</n-radio>
            </n-radio-group>
          </div>
          <div class="footer">
            <div></div>
            <!-- <div class="btn" @click="addEnums">{{'枚举/外键'}}</div> -->
            <div class="align-right">
              <div class="btn" v-if="showCreateBtn" @click="addComponent(false)">{{ '创建并继续' }}</div>
              <div class="btn" style="margin-left: 12px; background-color: #eb9615" @click="addComponent(true)">{{ '创建并关闭' }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
  import { NInput, useMessage, NRadioGroup, NRadio } from 'naive-ui';
  import { ref, computed, watch } from 'vue';
  import useValidator from '/@form/hooks/useValidator';
  import { useDesignerStore } from '/@/store/modules/form';
  import { inputGroup } from '/@form/props/form/FormComponents';
  import useWidgetsHelper from '/@form/hooks/useWidgetsHelper';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { getEnumsFieldUrl } from '/@/WF/Admin/FoolFormDesigner/utils/EnumUtils';
  import EventBus from '/@/utils/Events';
  import { useRoute } from 'vue-router';
  const pinyinType = ref('fpy');
  const showCreateBtn = ref(true);
  const widgetHelper = useWidgetsHelper();
  const inputTypes = inputGroup.children;
  const currentName = ref('');
  const currentId = ref('');
  const store = useDesignerStore();
  const route = useRoute();
  const loading = computed(() => store.globalLoading);

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    widgetInfo: {
      type: Object,
      default: () => ({}),
    },
  });

  // 生成拼音
  const generatePinyin = async (val: string) => {
    // 从表不生成ID
    if (store.currentDragWidget.key === 'table' && store.currentDragWidget.category === 'Slave') {
      return;
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('name', val);
    handler.AddPara('flag', pinyinType.value === 'fpy');
    currentId.value = await handler.DoMethodReturnString('ParseStringToPinyin');
  };

  const updateCheckedType = (val: string) => {
    const targetTypes = inputTypes.filter((input) => input.key === val);
    if (targetTypes.length === 0) {
      message.error('出现错误，无法找到类型');
      return;
    }
    const item = JSON.parse(JSON.stringify(targetTypes[0]));
    store.currentDragWidget = widgetHelper.mergeWidgetObject(item);
  };
  const promptStyle = computed(() => {
    return {
      height: isInput.value ? '380px' : '260px',
    };
  });
  const dragElem = ref('textBig');
  const isInput = computed(() => store.currentDragWidget?.category === 'input');
  const emit = defineEmits(['addElem', 'close']);
  const filteredInputTypes = computed(() => {
    return inputTypes.filter((input) => input.showInPanel !== false && !input.key.startsWith('enums') && !input.key.startsWith('foreignKey') && input.key !== 'fieldTemplate');
  });
  const message = useMessage();
  const { isFalsyValue } = useValidator();
  // 枚举/外键
  const addEnums = () => {
    let groupID = props.widgetInfo?.id;
    if (!groupID) {
      groupID = store.widgetsDtoList[0].GroupID;
    }
    // return;
    EventBus.emit('openIframe', {
      title: '添加枚举类型字段',
      url: getEnumsFieldUrl('enumsRadio', groupID, route.query.FrmID + ''),
    });
    emit('close');
  };
  // 添加组件
  const addComponent = (close: boolean) => {
    if (isFalsyValue(currentName.value)) {
      message.error('请正确输入名称');
      return;
    }
    if (isFalsyValue(currentId.value)) {
      message.error('请正确输入ID');
      return;
    }
    emit('addElem', currentName.value, currentId.value, close);
    currentId.value = '';
    currentName.value = '';

    if (!close) {
      store.newWidgetIndex++;
    } else {
      store.newWidgetIndex = 0;
    }
  };

  watch(
    () => props.visible,
    (val) => {
      if (!val) return;
      // 从表不生成ID
      if (store.currentDragWidget.key === 'table' && store.currentDragWidget.category === 'slave') {
        currentName.value = '从表';
        currentId.value = 'Dtl1';
        return;
      }
      if (store.currentDragWidget.category === 'appendix') {
        currentName.value = store.currentDragWidget.defaultName;
        currentId.value = store.currentDragWidget.defaultId;
        showCreateBtn.value = false;
        return;
      }
      if (store.currentDragWidget.key === 'iframe') {
        currentName.value = store.currentDragWidget.defaultName;
        currentId.value = store.currentDragWidget.defaultId;
      }
    },
  );
</script>

<style lang="less" scoped>
  .fade-enter-from {
    opacity: 0;
  }

  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-from .prompt,
  .fade-leave-to .prompt {
    transform: scale(1.1);
  }
  .prompt-wrapper {
    background-color: rgba(0, 0, 0, 0.2);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .prompt {
      width: 400px;
      background-color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 2px 12px;
      border-radius: 12px;

      .header {
        height: 60px;
        line-height: 60px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
      }

      .options {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;

        .tips {
          margin-bottom: 13px;
        }

        .radio-group {
          width: 100%;
          box-sizing: border-box;
          padding-left: 14px;
          padding-right: 14px;
        }

        &:deep(.n-radio) {
          width: 50%;
        }
      }

      .content {
        color: #666666;
        margin-top: 20px;

        .tips {
          margin-bottom: 12px;
        }

        :deep(.n-input) {
          margin-bottom: 10px;
        }
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100px;

        .align-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .btn {
          width: auto;
          height: 40px;
          background-color: #1890ff;
          color: white;
          border-radius: 8px;
          line-height: 40px;
          text-align: center;
          padding: 0 6px;
          cursor: pointer;
          font-size: 14px;
        }
      }
    }
  }
</style>
