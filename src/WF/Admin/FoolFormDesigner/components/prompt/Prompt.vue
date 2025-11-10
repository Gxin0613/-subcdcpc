<template>
  <Teleport to="body">
    <Transition name="fade-dialog">
      <div v-if="!loading && visible" class="prompt-wrapper">
        <div class="prompt" :style="promptStyle">
          <div class="header">
            <h5>{{ '创建' }}</h5>
            <div style="cursor: pointer" @click="handleClose()">
              <i style="font-size: 25px" class="icon-close"></i>
            </div>
          </div>
          <div class="options" v-if="isInput">
            <!-- <div class="tips">{{'请选择输入框类型'}}</div> -->
            <div class="radio-group">
              <n-radio-group v-model:value="dragElem.key" @update-value="updateCheckedType">
                <n-radio v-for="inputType in filteredInputTypes" :key="inputType.key" :value="inputType.key">{{ inputType.title }} </n-radio>
              </n-radio-group>
            </div>
          </div>
          <div class="content">
            <!-- <div class="tips">请输入名称与ID:</div> -->
            <n-input v-model:value="currentName" :placeholder="'字段中文名.'" />
            <n-input v-model:value="currentId" :placeholder="'字段英文名,自动生成拼音后可修改.'" />
            <div class="set-field">
              <n-radio-group v-model:value="pinyinType" name="radiogroup" @change="generatePinyin(currentName)">
                <n-radio key="fpy" value="fpy">{{ '全拼' }}</n-radio>
                <n-radio key="spy" value="spy">{{ '简拼' }}</n-radio>
              </n-radio-group>
              <n-form-item v-if="isInput" path="age" label="自动匹配" label-style="padding-left: 0 !important">
                <n-switch v-model:value="ismark" @update:value="ismarkChange" />
              </n-form-item>
            </div>
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
  import { NInput, useMessage, NRadioGroup, NRadio, NSwitch, NFormItem } from 'naive-ui';
  import { ref, computed, watch } from 'vue';
  import useValidator from '/@form/hooks/useValidator';
  import { useDesignerStore } from '/@/store/modules/form';
  import { inputGroup } from '/@form/props/form/FormComponents';
  import useWidgetsHelper from '/@form/hooks/useWidgetsHelper';
  import HttpHandler from '/@form/dto/HttpHandler';
  import { DataType } from '/@/bp/en/DataType';
  import { GenerMyDataType } from '../../api/FrmAPI';
  const pinyinType = ref('fpy');
  const ismark = ref(true);
  const showCreateBtn = ref(true);
  const widgetHelper = useWidgetsHelper();
  const inputTypes = inputGroup.children;
  const currentName = ref('');
  const currentId = ref('');
  const store = useDesignerStore();
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

  const typeMap = {
    [DataType.AppString]: 'text',
    [DataType.AppBoolean]: 'checkbox',
    [DataType.AppDate]: 'date',
    [DataType.AppDateTime]: 'datetime',
    [DataType.AppMoney]: 'amount',
    [DataType.AppInt]: 'integer',
    [DataType.AppFloat]: 'number',
  };

  const handleClose = () => {
    currentName.value = '';
    currentId.value = '';
    emit('close');
  };
  // 生成拼音
  //debouce 定时器
  const generatePinyin = async (val: string) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('name', val);
    handler.AddPara('flag', pinyinType.value === 'fpy');
    currentId.value = await handler.DoMethodReturnString('ParseStringToPinyin');
    // 只有文本 大块文字 整数 数值  金额 日期 日期时间 开关才判断类型
    if (ismark.value) {
      const typeValueArr = Object.values(typeMap);
      if (typeValueArr.includes(store.currentDragWidget.key) || store.currentDragWidget.key == 'textBig') {
        let myDataType = await GenerMyDataType(currentName.value);
        if (myDataType == -1) {
          myDataType = 1;
        }
        const key = typeMap[myDataType];
        if (!key) return;
        updateCheckedType(key);
      }
    }
  };

  // 监听 currentName 的变化
  watch(currentName, async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
      handler.AddPara('name', newValue);
      handler.AddPara('flag', pinyinType.value === 'fpy');
      currentId.value = await handler.DoMethodReturnString('ParseStringToPinyin');
      // 只有文本 大块文字 整数 数值  金额 日期 日期时间 开关才判断类型
      if (ismark.value) {
        const typeValueArr = Object.values(typeMap);
        if (typeValueArr.includes(store.currentDragWidget.key) || store.currentDragWidget.key == 'textBig') {
          let myDataType = await GenerMyDataType(currentName.value);
          if (myDataType == -1) {
            myDataType = 1;
          }
          const key = typeMap[myDataType];
          if (!key) return;
          updateCheckedType(key);
        }
      }
    }
  });

  
  const ismarkChange = (val) => {
    //将按钮的值写入localstroage
    if (val == true) {
      localStorage.setItem('ismark', '1');
    } else {
      localStorage.setItem('ismark', '0');
    }
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
  const dragElem = computed(() => store.currentDragWidget);
  const isInput = computed(() => store.currentDragWidget?.category === 'input');
  const emit = defineEmits(['addElem', 'close']);
  const filteredInputTypes = computed(() => {
    return inputTypes.filter((input) => input.showInPanel !== false && !input.key.startsWith('enums') && !input.key.startsWith('foreignKey') && input.key !== 'fieldTemplate');
  });
  const message = useMessage();
  const { isFalsyValue } = useValidator();
  // 枚举/外键
  // const addEnums = () => {
  //   let groupID = props.widgetInfo?.id;
  //   if (!groupID) {
  //     groupID = store.widgetsDtoList[0].GroupID;
  //   }
  //   // return;
  //   EventBus.emit('openIframe', {
  //     title: '添加枚举类型字段',
  //     url: getEnumsFieldUrl('enumsRadio', groupID, route.query.FrmID + ''),
  //   });
  //   emit('close');
  // };
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
        showCreateBtn.value = false;
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
      if (!!localStorage.getItem('ismark')) {
        if (localStorage.getItem('ismark') == '1') {
          ismark.value = true;
        } else {
          ismark.value = false;
        }
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
        .set-field {
          display: flex;
          align-items: baseline;
        }
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
