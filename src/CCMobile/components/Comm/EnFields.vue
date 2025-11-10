<template>
  <Form>
    <CellGroup>
      <template v-for="attr in mapAttrs" :key="attr.Key">
        <!--boolean值-->
        <template v-if="isBoolean(attr)">
          <Field name="switch" :label="attr.Desc">
            <template #input>
              <Switch v-model="row[attr.Key]" :disabled="isReadOnly(attr)" />
            </template>
          </Field>
        </template>
        <!--日期类型-->
        <template v-else-if="isDate(attr)">
          <Field
            v-model="row[attr.Key]"
            :label="attr.Desc"
            :is-link="!isReadOnly(attr)"
            readonly
            name="datePicker"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            input-align="right"
            center
            @click="onDateClickPop(attr)"
          />
        </template>
        <!--日期时间类型-->
        <template v-else-if="isDateTime(attr)">
          <Field
            v-model="row[attr.Key]"
            :label="attr.Desc"
            :is-link="!isReadOnly(attr)"
            readonly
            name="datePicker"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            label-align="top"
            :disabled="isReadOnly(attr)"
            center
            @click="onDateClickPop(attr, isReadOnly(attr))"
          />
        </template>
        <!-- 金额类型 -->
        <template v-else-if="isMoney(attr)">
          <Field
            v-model="row[attr.Key]"
            type="number"
            :label="attr.Desc"
            :id="attr.Key"
            stringMode
            input-align="right"
            :disabled="isReadOnly(attr)"
            center
            :formatter="(value) => Number(value).toFixed(2)"
          />
        </template>
        <!--数字类型-->
        <template v-else-if="isNumber(attr)">
          <Field
            v-model="row[attr.Key]"
            type="number"
            :label="attr.Desc"
            :id="attr.Key"
            stringMode
            label-align="left"
            input-align="right"
            :disabled="isReadOnly(attr)"
            center
            :formatter="(value) => Number(value).toFixed(2)"
          />
        </template>
        <!-- DDL /枚举-->
        <template v-else-if="isDDL(attr) || isRadioButton(attr)">
          <Field
            v-if="row.hasOwnProperty(attr.Key + 'Text')"
            readonly
            clickable
            name="picker"
            :is-link="!isReadOnly(attr)"
            :disabled="isReadOnly(attr)"
            v-model="row[attr.Key + 'Text']"
            :label="attr.Desc"
            input-align="right"
            center
            @click-input="onSelectClickPop(attr)"
          />
          <Field
            v-if="row.hasOwnProperty(attr.Key + 'T')"
            readonly
            clickable
            name="picker"
            :is-link="!isReadOnly(attr)"
            :disabled="isReadOnly(attr)"
            v-model="row[attr.Key + 'T']"
            :label="attr.Desc"
            input-align="right"
            center
            @click-input="onSelectClickPop(attr)"
          />
        </template>
        <!--文本域-->
        <template v-else-if="isTextArea(attr)">
          <Field v-model="row[attr.Key]" type="textarea" :label="attr.Desc" rows="1" autosize :maxlength="attr.UIWidth" :disabled="isReadOnly(attr)" class="vant-textarea" />
        </template>
        <!--文本框整行-->
        <template v-else-if="isTextBox(attr)">
          <Field
            v-if="attr.Key.toLowerCase() === 'icon'"
            :is-link="!isReadOnly(attr)"
            v-model="row[attr.Key]"
            :label="attr.Desc"
            @click="openIconPicker(attr.Key)"
            center
            label-align="top"
          />
          <Field v-else v-model="row[attr.Key]" center :label="attr.Desc" label-align="left" input-align="right" :disabled="isReadOnly(attr)" />
        </template>

        <!--pop弹出框-->
        <template v-else-if="isPopTextArea(attr)">
          <Field :is-link="true" v-model="row[attr.Key + 'T']" center :label="attr.Desc" input-align="right" @click="onClickPop(attr)" class="vant-popModal" />
        </template>

        <!--单附件-->
        <template v-else-if="isSingleAth(attr)"> </template>
      </template>
    </CellGroup>
    <!--日期时间弹出-->
    <Popup v-model:show="datePop.visible" position="bottom">
      <DatePicker
        v-if="datePop.dateType === 'date'"
        v-model="datePop.currentDate"
        :minDate="datePop.minDate"
        :maxDate="datePop.maxDate"
        @confirm="onConfirmDate"
        @cancel="datePop.visible = false"
      />
      <PickerGroup v-else :title="datePop.mapAttr.Desc" :tabs="['选择日期', '选择时间']" @confirm="onConfirmDate" @cancel="datePop.visible = false">
        <DatePicker v-model="datePop.currentDate" :minDate="datePop.minDate" :maxDate="datePop.maxDate" />
        <TimePicker v-model="datePop.currentTime" :columns-type="['hour', 'minute', 'second']" />
      </PickerGroup>
    </Popup>
    <!--下拉框弹出-->
    <Popup v-model:show="selectPop.visible" position="bottom">
      <Picker show-toolbar :columns="selectPop.ddl" @confirm="onConfirmSelect" @cancel="selectPop.visible = false" />
    </Popup>
    <Popup v-model:show="popModal.visible" position="right" :style="{ width: '100%', height: '100%' }">
      <NavBar :title="popModal.title" :fixed="true" left-arrow @click-left="PopModalOK" />
      <div style="padding-top: 46px; height: calc(var(--viewport-height) - 46px)">
        <Pop
          v-if="popModal.visible === true"
          :selectVal="rowData[popModal.keyOfEn]"
          :title="popModal.title"
          :selectNameVal="popModal.itemNames"
          :mapExt="(popModal.mapExt as EnMapExt)"
          ref="refPop"
        />
      </div>
      <Tabbar class="tool-bar" v-model="active">
        <TabbarItem class="btn-type" @click="PopModalOK" style="width: 90%; height: 80%">
          <Button type="primary" class="btnPosition">
            <!-- <CarryOutOutlined style="margin-right: 5px" /> -->
            确认
          </Button>
        </TabbarItem>
      </Tabbar>
    </Popup>
    <Popup v-model:show="iconPickerVisible" position="right" :style="{ width: '100%', height: '100%', backgroundColor: '#f7f8fa' }">
      <NavBar title="选择图标" :fixed="true" left-arrow @click-left="iconPickerVisible = false" />
      <IconPicker @pick-icon="updateIcon" style="margin: 56px 16px 10px 16px" />
    </Popup>
  </Form>
</template>
<script lang="ts" setup>
  import { Attr } from '/@/bp/en/Map/Attr';
  import { reactive, ref, shallowRef, toRefs } from 'vue';
  import { Button } from 'ant-design-vue';
  import { Form, CellGroup, Field, Switch, Popup, DatePicker, PickerGroup, TimePicker, Picker, NavBar, showFailToast, Tabbar, TabbarItem } from 'vant';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import IconPicker from '/@form/components/icon-picker/IconPicker.vue';
  // import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import Pop from '/@/CCMobile/CCForm/Pop.vue';
  import { FileItem } from '/@/components/Upload/src/typing';
  import { DataType } from '/@/bp/en/DataType';
  import dayjs from 'dayjs';
  import { EnMapExt } from '/@/bp/en/Map/EnMapExt';
  interface DDL {
    label: string;
    value: string | number;
  }

  interface CustomAttr extends Attr {
    ddl: DDL[];
  }

  const props = defineProps({
    mapAttrs: {
      type: Object as PropType<CustomAttr[]>,
      default: () => {
        return [];
      },
    },
    pk: {
      type: String,
      default: '',
    },
    pkVal: {
      type: [String, Number],
      default: '',
    },
    savedState: {
      type: Boolean,
      default: false,
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  const active = ref('');

  const row = ref(props.rowData);
  for (const attr of props.mapAttrs) {
    const rowKey = attr.Key;
    if (row.value.hasOwnProperty(rowKey) && !row.value[rowKey] && row.value[rowKey] !== 0) {
      row.value[rowKey] = attr._defaultVal;
    }
  }
  const currYear = dayjs().year();
  //时间弹窗
  const datePop = reactive<{
    visible: boolean;
    dateType: string;
    currentDate: string[];
    currentTime: string[];
    minDate: Date;
    maxDate: Date;
    mapAttr: Recordable;
  }>({
    visible: false,
    dateType: '',
    currentDate: [],
    currentTime: [],
    minDate: new Date(currYear - 100, 0, 1),
    maxDate: new Date(currYear + 100, 12, 32),
    mapAttr: {},
  });
  //选择器弹窗
  const selectPop = reactive({
    visible: false,
    ddl: [],
    mapAttr: {},
  });
  /**
   * 日期时间弹窗
   * @param mapAttr
   */
  //当按钮禁用时不让其弹窗
  const onDateClickPop = (mapAttr, disabled = false) => {
    if (disabled) {
      datePop.visible = false;
    } else {
      datePop.visible = true;
      datePop.dateType = mapAttr.MyDataType === DataType.AppDate ? 'date' : 'datetime';
      datePop.mapAttr = mapAttr;
      datePop.currentDate = dayjs().format('YYYY-MM-DD').split('-');
      datePop.currentTime = dayjs().format('HH:mm:ss').split(':');
    }
  };
  const onConfirmDate = ({ selectedValues }) => {
    let val = '';
    if (datePop.dateType === 'date') val = selectedValues.join('-');
    else if (datePop.dateType === 'time') val = selectedValues.join(':');
    else val = `${datePop.currentDate.join('-')} ${datePop.currentTime.join(':')}`;
    row.value[datePop.mapAttr['Key']] = val;
    datePop.visible = false;
  };
  /**
   * select 弹窗
   * @param mapAttr
   */
  const onSelectClickPop = (mapAttr) => {
    selectPop.visible = true;
    selectPop.ddl = mapAttr['ddl'];
    selectPop.mapAttr = mapAttr;
  };
  /**
   * select弹窗选择后确定操作
   * @param value
   */
  const onConfirmSelect = ({ selectedOptions }) => {
    row.value[selectPop.mapAttr['Key']] = selectedOptions[0].value;
    row.value[selectPop.mapAttr['Key'] + 'Text'] = selectedOptions[0].text;
    selectPop.visible = false;
  };

  const selectedKey = ref('');
  const iconPickerVisible = ref(false);
  const openIconPicker = (attrKey: string) => {
    selectedKey.value = attrKey;
    iconPickerVisible.value = true;
  };
  const updateIcon = (icon: string) => {
    if (selectedKey.value) {
      row.value[selectedKey.value] = icon;
    } else {
      showFailToast('图标未能选中，字段[' + selectedKey.value + '] 不存在');
    }
    iconPickerVisible.value = false;
  };
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    itemNames: '',
    keyOfEn: '',
    mapExt: new EnMapExt(),
  });
  const onClickPop = (attr) => {
    popModal.visible = true;
    popModal.title = attr.mapExt[0].AtPara?.GetValStrByKey('Label') || '请选择' + attr.Name;
    popModal.keyOfEn = attr.Key;
    popModal.mapExt = attr.mapExt[0];
    popModal.modalType = attr.mapExt[0].ExtType;
  };
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const PopModalOK = () => {
    const val = refPop.value?.handlerPopOK?.();
    row.value[popModal.keyOfEn] = val?.[0].join(',');
    row.value[popModal.keyOfEn + 'T'] = val?.[1].join(',');
    popModal.visible = false;
  };

  const { pk, pkVal, savedState } = toRefs(props);
  // 当前行是否只读
  const isReadOnly = (attr: Attr) => {
    const readonly = attr.UIIsReadonly || (attr.Key === pk.value && !!pkVal.value) || (attr.Key === pk.value && savedState);
    return readonly as boolean;
  };

  // 文件列表
  const fileList = ref<FileItem[]>([]);

  // const handleRemove = (file: FileItem) => {
  //   const index = fileList.value.indexOf(file);
  //   const newFileList = fileList.value.slice();
  //   newFileList.splice(index, 1);
  //   fileList.value = newFileList;
  //   return Promise.resolve(true);
  // };
  // const beforeUpload = (file: FileItem, attr) => {
  //   const atPara = new AtPara(attr.UIBindKey);
  //   const format = atPara.GetValStrByKey('Format');
  //   if (format === '*.*') {
  //     fileList.value = [...fileList.value, file];
  //     return false;
  //   }
  //   //后缀名
  //   const ext = file.name.substring(file.name.lastIndexOf('.') + 1);
  //   if (format.includes(ext) == false) {
  //     showFailToast('附件上传格式不正确');
  //     fileList.value = [];
  //     return false;
  //   }
  //   fileList.value = [...fileList.value, file];
  //   return false;
  // };

  const { isNumber, isDateTime, isDate, isDDL, isBoolean, isMoney, isTextBox, isTextArea, isPopTextArea, isRadioButton, isSingleAth } = useFieldType();

  defineExpose({ rowData: row, FileList: fileList });
</script>

<style lang="less" scoped>
  .van-switch {
    margin-left: calc(100% - 62px);
  }
  .picker {
    height: 100%;
    background: white;
    margin: 56px 16px 10px 16px;
    width: auto;
  }
  :deep(.van-field__label) {
    color: #1890ff;
    flex: 1;
  }
  //pop弹窗
  .vant-popModal {
    margin: 5px 0;
    background-color: #eee;
    border-radius: 5px;
  }
  //文本域
  .vant-textarea {
    margin: 5px 0;
    background-color: #eee;
    border-radius: 5px;
  }
  .tool-bar {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-type:hover {
    background-color: #4356ff;
    color: #fff;
    height: 100%;
  }
  .van-tabbar-item {
    flex: none !important;
  }

  .van-tabbar-item--active {
    background-color: #4356ff;
    color: #fff;
    height: 100%;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
  .btnPosition {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
