<template>
  <div class="content">
    <Form :model="rowData" :layout="props.labPostion === 'left' ? 'horizontal' : 'vertical'" ref="formRef" autocomplete="off" class="form_content">
      <Row :gutter="[16, 8]">
        <template v-for="mapAttr in mapAttrs" :key="mapAttr.MyPK">
          <template v-if="props.labPostion === 'top'">
            <Col v-show="parseInt(mapAttr.UIVisible) === 1" :span="mapAttr.colSpan">
              <div class="ant-row ant-form-item" style="row-gap: 0px; margin-bottom: 0px">
                <div class="ant-col ant-form-item-label" :style="{ textAlign: props.labAlign + ' !important', paddingLeft: '10px' }">
                  <label class="" :title="mapAttr.Name">
                    <!--公文正文-->
                    <span v-if="Array.isArray(mapAttr.rules) && mapAttr.rules.length > 0" class="isRules">*</span>
                    <template v-if="mapAttr.UIContralType === 110">
                      <Button type="link" v-if="sysLang === 'FT'">{{ mapAttr['NameFT'] || mapAttr.Name }}</Button>
                      <Button type="link" v-else-if="sysLang === 'EN'">{{ mapAttr['NameEN'] || mapAttr.Name }}</Button>
                      <Button type="link" v-else-if="sysLang === 'JA'">{{ mapAttr['NameJA'] || mapAttr.Name }}</Button>
                      <Button type="link" v-else>{{ mapAttr.Name }}</Button>
                    </template>
                    <template v-else>
                      <span v-if="sysLang === 'FT'">{{ mapAttr['NameFT'] || mapAttr.Name }}</span>
                      <span v-else-if="sysLang === 'EN'">{{ mapAttr['NameEN'] || mapAttr.Name }}</span>
                      <span v-else-if="sysLang === 'JA'">{{ mapAttr['NameJA'] || mapAttr.Name }}</span>
                      <span v-else>{{ mapAttr.Name }}</span>
                    </template>
                  </label>
                </div>
              </div>
              <FormItem :name="mapAttr.KeyOfEn" :rules="mapAttr.rules" :labelAlign="props.labAlign as FormLabelAlign" :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
                <OneMapAttr
                  :mapAttr="mapAttr"
                  :mainData="rowData"
                  :frmData="props.frmData"
                  :params="props.params"
                  :refPKVal="props.params.WorkID || props.params.RefPKVal"
                  :isReadonly="props.isReadonly"
                  :is-page-readonly="props.isPageReadonly"
                  :is-reload="props.isReload"
                  :ref="'attrRef_' + mapAttr.KeyOfEn"
                  :WGFrm="WGFrm"
                  @update-row="(key, val, idx) => updateRow(key, val, idx)"
                />
              </FormItem>
            </Col>
          </template>
          <template v-else>
            <div v-if="mapAttr.isShowDiv && parseInt(mapAttr.UIVisible) === 1" :style="{ width: mapAttr.classVal + '%' }"></div>
            <Col v-show="parseInt(mapAttr.UIVisible) === 1" :span="mapAttr.labelSpan" :key="mapAttr.KeyOfEn + '_tb_label'">
              <div class="ant-row ant-form-item" style="row-gap: 0px; margin-bottom: 0px">
                <div class="ant-col ant-form-item-label" :style="{ textAlign: props.labAlign + ' !important' }">
                  <label class="" :title="mapAttr.Name">
                    <!--公文正文-->
                    <span v-if="Array.isArray(mapAttr.rules) && mapAttr.rules.length > 0" class="isRules">*</span>
                    <template v-if="mapAttr.UIContralType === 110">
                      <span type="link" v-if="sysLang === 'FT'">{{ mapAttr['NameFT'] || mapAttr.Name }}</span>
                      <span type="link" v-else-if="sysLang === 'EN'">{{ mapAttr['NameEN'] || mapAttr.Name }}</span>
                      <span type="link" v-else-if="sysLang === 'JA'">{{ mapAttr['NameJA'] || mapAttr.Name }}</span>
                      <span type="link" v-else>{{ mapAttr.Name }}</span>
                    </template>
                    <template v-else>
                      <span v-if="sysLang === 'FT'">{{ mapAttr['NameFT'] || mapAttr.Name }}</span>
                      <span v-else-if="sysLang === 'EN'">{{ mapAttr['NameEN'] || mapAttr.Name }}</span>
                      <span v-else-if="sysLang === 'JA'">{{ mapAttr['NameJA'] || mapAttr.Name }}</span>
                      <span v-else>{{ mapAttr.Name }}</span>
                    </template>
                  </label>
                </div>
              </div>
            </Col>
            <Col v-show="parseInt(mapAttr.UIVisible) === 1" :span="mapAttr.colSpan">
              <FormItem :name="mapAttr.KeyOfEn" :rules="mapAttr.rules" :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
                <OneMapAttr
                  :mapAttr="mapAttr"
                  :mainData="rowData"
                  :frmData="props.frmData"
                  :params="props.params"
                  :refPKVal="props.params.WorkID || props.params.RefPKVal"
                  :isReadonly="props.isReadonly"
                  :is-page-readonly="props.isPageReadonly"
                  :is-reload="props.isReload"
                  :ref="'attrRef_' + mapAttr.KeyOfEn"
                  :WGFrm="WGFrm"
                  @update-row="(key, val, idx) => updateRow(key, val, idx)"
                />
              </FormItem>
            </Col>
          </template>
        </template>
      </Row>
    </Form>
    <!--居中弹窗-->
    <Modal v-model:open="modal.modalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :style="modal.modalHeight" :footer="null">
      <div class="h-100">
        <HandWriting v-if="modal.modalType === 'HandWriting'" :imageSrc="modal.ImgSrc" writingType="KeyOfEn" :keyOfEn="modal.keyOfEn" @ChangeWriteImg="ChangeWriteImg" />
        <Ath v-if="modal.modalType === 'Ath'" :ath-info="modal.Ath" :params="props.params" :is-readonly="props.isReadonly" />
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
  import { Form, FormItem, Row, Col, Button, Modal, message } from 'ant-design-vue';
  // 外部传过来的属性
  import { getCurrentInstance, PropType, reactive, ref, shallowRef, watch } from 'vue';
  import { MapAttrExt } from '/@/WF/CCForm/FrmEnd';
  import HandWriting from '/@/WF/CCForm/HandWriting.vue';
  import Ath from './Ath.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { UIContralType } from '/@/bp/en/EnumLab';
  import OneMapAttr from '/@/WF/CCForm/OneMapAttr.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import Events from '/@/utils/Events';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import type { FormInstance } from 'ant-design-vue';
  import { DataType } from '/@/bp/en/DataType';
  import { FormLabelAlign } from 'ant-design-vue/es/form/interface';

  const formRef = ref<FormInstance>();
  const props = defineProps({
    mapAttrs: {
      type: Array as PropType<Array<MapAttrExt>>,
      default: () => [],
    },
    frmData: {
      type: Object,
      default: null,
    },
    fwcVer: {
      type: Number,
      default: 0,
    },
    params: {
      type: Object,
      default: () => ({ WorkID: 0 }),
    },
    checkField: {
      type: String,
      default: '',
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isPageReadonly: {
      type: Boolean,
      default: false,
    },
    mainData: {
      type: Object,
      default: () => {},
    },
    tableCol: {
      type: Number,
      default: 4,
    },
    labPostion: {
      type: String,
      default: 'left',
    },
    labAlign: {
      type: String,
      default: 'left',
    },
    WGFrm: {
      type: Object as PropType<WaiGuaBaseFrm>,
      default: null,
    },
    isHaveBorder: {
      type: Boolean,
      default: false,
    },
    isReload: {
      type: Boolean,
      default: false,
    },
  });
  const rowData = ref(props.mainData);
  watch(
    () => rowData.value,
    () => {
      Events.emit('autoSave');
    },
    {
      deep: true,
    },
  );
  const validateForm = async () => {
    let errors = null;
    try {
      await formRef.value?.validateFields();
    } catch (_errors) {
      errors = _errors;
      scrollToFirstError(_errors);
    }
    return errors;
  };
  const clearValidate = async () => {
    await formRef.value?.clearValidate();
  };
  const scrollToFirstError = (errorInfo: any) => {
    const firstErrorField = errorInfo.errorFields[0].name[0];
    const firstErrorElement = document.querySelector(`[id="form_item_${firstErrorField}"]`);
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const updateRow = (key: string, val: string, _idx: number) => {
    rowData.value[key] = val;
    if (!!val) formRef.value?.clearValidate(key);
  };
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    modalTitle: '',
    modalType: '',
    keyOfEn: '',
    ImgSrc: '',
    Ath: {},
    modalWidth: 800,
    modalHeight: {},
  });
  const sysLang = WebUser.SysLang || 'CH';
  const workData = ref();
  // const route = useRoute();
  //获取审核组件的数据集合
  const GetWorkCheckData = async () => {
    if (workData.value != null) return workData.value;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddJson(props.params);
    handler.AddPara('IsReadonly', props.isReadonly);
    const data = ref();
    if (props.fwcVer == 0) data.value = await handler.DoMethodReturnString('WorkCheck_Init');
    else data.value = await handler.DoMethodReturnString('WorkCheck_Init2019');
    if (typeof data.value === 'string' && data.value.includes('err@')) {
      message.error(data.value.replace('err@', ''));
      return;
    }
    workData.value = JSON.parse(JSON.stringify(data.value));
    return workData.value;
  };
  const InitPage = async () => {
    if (!!props.checkField)
      workData.value = props.mapAttrs?.filter((item: MapAttrExt) => item.UIContralType === UIContralType.SignCheck).length > 0 ? await GetWorkCheckData() : [];
    props.mapAttrs.forEach((mapAttr) => {
      const tl: number[] = computedCols(mapAttr);
      mapAttr['labelSpan'] = tl[0];
      mapAttr['colSpan'] = tl[1];
      if (mapAttr.UIContralType === UIContralType.HyperLink || mapAttr.UIContralType === UIContralType.Btn || mapAttr.UIContralType === UIContralType.GovDocFile) {
        mapAttr['labelSpan'] = 0;
        mapAttr['colSpan'] = tl[0] + tl[1];
      }
      if (parseInt(mapAttr.UIVisible) === 1) {
        const val = ((24 - totalSpan) / 24.0) * 100; //'ant-col ant-col-' + (24 - totalSpan);
        totalSpan += parseInt(tl[0]) + parseInt(tl[1]);
        if (totalSpan > 24) {
          //需要换行
          totalSpan = tl[0] + tl[1];
          mapAttr['isShowDiv'] = true;
          mapAttr['classVal'] = val;
          return;
        }
        if (totalSpan == 24) totalSpan = 0;
        mapAttr['isShowDiv'] = false;
        mapAttr['classVal'] = '';
      }
    });
  };

  const ChangeWriteImg = (val) => {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    rowData.value[modal.keyOfEn] = VITE_GLOB_API_URL + val.substring(val.indexOf('/DataUser'));
    modal.modalVisible = false;
  };

  let totalSpan = 0;
  const computedCols = (mapAttr): number[] => {
    let tspan = 24 / props.tableCol;
    if (mapAttr.MyDataType === DataType.AppString && (mapAttr?.TextModel == 2 || mapAttr?.TextModel == 3) && mapAttr.ColSpan == 4) {
      mapAttr.ColSpan = 3;
    }
    const { LabelColSpan, ColSpan } = mapAttr;
    //标签在顶部，标签和输入框占相同的span
    if (props.labPostion === 'top') {
      if (ColSpan == props.tableCol) return [24, 24];
      return [(LabelColSpan + ColSpan) * tspan, (LabelColSpan + ColSpan) * tspan];
    }
    if (props.tableCol == 4) {
      switch (ColSpan) {
        case 0:
          tspan = 0;
          break;
        case 1:
          tspan = 8;
          break;
        case 2:
          tspan = 12;
          break;
        case 3:
          tspan = 20;
          break;
        case 4:
          tspan = 24;
          break;
        default:
          tspan = 8;
          break;
      }
      let lspan = 0;
      switch (LabelColSpan) {
        case 0:
          lspan = 0;
          break;
        case 1:
          lspan = 4;
          break;
        case 2:
          lspan = 12;
          break;
        case 3:
          lspan = 16;
          break;
        case 4:
          lspan = 24;
          break;
        default:
          lspan = 4;
          break;
      }

      return [lspan, tspan];
    }
    if (props.tableCol == 6) {
      if (ColSpan == 6) return [24, 24];
      tspan = ColSpan * 4;
      const lspan = LabelColSpan * 4;
      return [lspan, tspan];
    }
    return [0, 24];
  };

  //保存审核组件
  const instance = getCurrentInstance();
  const WorkCheckSave = async (isSaveOnly) => {
    if (!props.checkField) return true;
    let refW = instance?.refs['attrRef_' + props.checkField] as InstanceType<typeof OneMapAttr>;
    if (!!refW && Array.isArray(refW)) refW = refW[0];
    if (!!refW) {
      return await refW?.WorkCheckSave?.(isSaveOnly);
    }
    return true;
  };
  InitPage();
  defineExpose({ mainData: rowData, WorkCheckSave, validateForm, clearValidate });
</script>

<style scoped>
  .form-item-mustInput {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  :deep(.ant-form-item) {
    margin: 0 0 4px !important;
  }

  /* label文本过长进行换行 */
  :deep(.ant-form-item .ant-form-item-label > label) {
    white-space: break-spaces;
    height: auto;
    line-height: 18px;
  }
  /**大块文本添加是否必填样式 */
  .isRules {
    display: inline-block;
    margin-inline-end: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    color: red;
  }
  .inputLab {
    display: inline-block;
    margin-inline-end: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: '*';
  }
</style>
