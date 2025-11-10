<template>
  <BaseComponent ref="baseComp">
    <div class="p-1">
      <Spin :spinning="loading" style="background-color: white">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div v-else class="content">
          <Form :label-col="{ style: { width: '150px' } }" :wrapper-col="{ span: 14 }">
            <FormItem v-if="d1IsString === false" :label="d1Label">
              <CheckboxGroup v-model:value="d1Select">
                <Checkbox v-for="item in d1DDL" :key="item.value" :value="item.value" :name="item.label">
                  {{ item.label }}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem :label="d2Label">
              <CheckboxGroup v-model:value="d2Select">
                <Checkbox v-for="item in d2DDL" :key="item.value" :value="item.value" :name="item.label">
                  {{ item.label }}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
            <FormItem v-if="parseInt(listModel) === 4 || parseInt(listModel) === 5" :label="d3Label">
              <CheckboxGroup v-model:value="d3Select">
                <Checkbox v-for="item in d3DDL" :key="item.value" :value="item.value" :name="item.label">
                  {{ item.label }}
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </Form>
        </div>
      </Spin>
    </div>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Form, FormItem, CheckboxGroup, Checkbox } from 'ant-design-vue';
  // 父组件传过来的属性
  import { reactive, ref, shallowRef } from 'vue';
  import { ddlInfo } from '/@/WF/CCForm/FrmEnd';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    frmData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    settingVal: {
      type: Object,
      default: () => {
        return {};
      },
    },
    listModel: {
      type: Number,
      default: 3,
    },
    d1: {
      type: String,
      default: '',
    },
    d2: {
      type: String,
      default: '',
    },
    d3: {
      type: String,
      default: '',
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const d1IsString = ref(false);
  const d1DDL = ref<Record<string, any>[]>([]);
  const d2DDL = ref<Record<string, any>[]>([]);
  const d3DDL = ref<Record<string, any>[]>([]);
  const d1Select = ref<any[]>([]);
  const d2Select = ref<any[]>([]);
  const d3Select = ref<any[]>([]);
  const d1Label = ref('');
  const d2Label = ref('');
  const d3Label = ref('');
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      const mapAttrs = props.frmData['Sys_MapAttr'];
      //维度1字段
      let mapAttr = mapAttrs.filter((item) => item.KeyOfEn === props.d1)[0];
      d1IsString.value = mapAttr.MyDataType === DataType.AppString && mapAttr.UIContralType === UIContralType.TB && mapAttr.LGType === FieldTypeS.Normal;
      d1Label.value = mapAttr.Name;
      d1DDL.value = GetDDLOption(mapAttr, props.frmData);
      d1Select.value = props.settingVal[props.d1] || [];
      if (d1Select.value.length == 0) d1DDL.value.forEach((item) => d1Select.value.push(item.value));

      //维度2字段
      mapAttr = mapAttrs.filter((item) => item.KeyOfEn === props.d2)[0];
      d2Label.value = mapAttr.Name;
      d2DDL.value = GetDDLOption(mapAttr, props.frmData);
      d2Select.value = props.settingVal[props.d2] || [];
      if (d2Select.value.length == 0) d2DDL.value.forEach((item) => d2Select.value.push(item.value));

      //维度3字段
      if (parseInt(props.listModel) == 4 || parseInt(props.listModel) == 5) {
        mapAttr = mapAttrs.filter((item) => item.KeyOfEn === props.d3)[0];
        d3Label.value = mapAttr.Name;
        d3DDL.value = GetDDLOption(mapAttr, props.frmData);
        d3Select.value = props.settingVal[props.d3] || [];
        if (d3Select.value.length == 0) d3DDL.value.forEach((item) => d3Select.value.push(item.value));
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * 获取枚举、外键、外部数据源的选择集合
   * @param mapAttr
   * @constructor
   */
  const GetDDLOption = (mapAttr, frmData) => {
    let uiBindKey = mapAttr.UIBindKey || '';
    if (uiBindKey == '')
      return [
        {
          value: '',
          label: '绑定的外键枚举值丢失',
        },
      ];
    const options: Array<ddlInfo> = [];
    let data = frmData[mapAttr.KeyOfEn];
    if (data == undefined) data = frmData[mapAttr.UIBindKey];
    //枚举字段
    if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
      const myEnums = frmData.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
      if ((mapAttr.UIIsInput === 0 || mapAttr.DefVal === '-1') && mapAttr.UIContralType == UIContralType.DDL) {
        options.push({
          value: mapAttr.MyDataType === DataType.AppString ? '-1' : -1,
          label: '-无-',
        });
      }
      myEnums.forEach((item) => {
        options.push({
          value: item.StrKey || item.IntKey,
          label: item.Lab,
        });
      });
      return options;
    }

    if (data == undefined)
      return [
        {
          value: '',
          label: '请选择',
        },
      ];

    return data.map((item) => {
      return {
        value: item.No,
        label: item.Name,
      };
    });
  };
  InitPage();
  const handlerOK = () => {
    return [d1Select.value, d2Select.value, d3Select.value];
  };
  defineExpose({ handlerOK });
</script>

<style scoped>
  .must-input {
    color: red;
  }
  /*:deep(.ant-table-cell >div) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

  }*/
</style>
