<template>
  <div>
    <Form autocomplete="off" :model="rowData" ref="formRef">
      <!-- <CellGroup inset> -->
      <template v-for="mapAttr in mapAttrs" :key="mapAttr.MyPK">
        <div class="ddl-item" :style="mapAttr?.ColSpan <= 3 && (mapAttr.AtPara || '').includes('@IsLabLine=1') == false ? 'display:flex;' : ''">
          <div class="ddl-label" :style="mapAttr?.ColSpan <= 3 && (mapAttr.AtPara || '').includes('@IsLabLine=1') == false ? 'width: 9em' : ''">
            <Tooltip :overlayStyle="{ zIndex: 9999 }">
              <template #title>
                <div class="out-cont" style="display: flex; justify-content: space-between; align-items: center">
                  <div class="one-row" @click="handleDblClick(mapAttr, 'one-row')">{{ '整行' }}</div> |
                  <div class="half-row" @click="handleDblClick(mapAttr, 'half-row')">{{ '半行' }}</div> |
                  <div class="hidden-row" @click="handleDblClick(mapAttr, 'hidden-row')">隐藏(可以在表单设计器界面打开)</div>
                </div>
              </template>
              {{ mapAttr['Name' + sysLang] || mapAttr.Name }}
            </Tooltip>
            <span style="color: red" v-if="mapAttr.UIIsInput">*</span>
          </div>
          <OneMapAttr
            :mapAttr="mapAttr"
            :frmData="props.frmData"
            :mainData="rowData"
            :data="props.data"
            :rules="mapAttr.rules"
            :params="props.params"
            :refPKVal="props.refPKVal"
            :isReadonly="isReadonly"
            :is-page-readonly="props.isPageReadonly"
            :rowIdx="rowIdx"
            :ref="'attrRef_' + mapAttr.KeyOfEn"
            :WGFrm="WGFrm"
          />
        </div>
      </template>
      <!-- </CellGroup> -->
    </Form>
    <!--    &lt;!&ndash;居中弹窗&ndash;&gt;
    <Modal v-model:open="modal.modalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :style="modal.modalHeight" :footer="null">
      <div class="h-100">
        <HandWriting v-if="modal.modalType === 'HandWriting'" :imageSrc="modal.ImgSrc" writingType="KeyOfEn" :keyOfEn="modal.keyOfEn" @ChangeWriteImg="ChangeWriteImg" />
        <Ath v-if="modal.modalType === 'Ath'" :ath-info="modal.Ath" :params="props.params" :is-readonly="props.isReadonly" />
      </div>
    </Modal>-->
  </div>
</template>

<script lang="ts" setup>
  import { Form, Toast } from 'vant';
  import { Tooltip } from 'ant-design-vue';
  // 外部传过来的属性
  import { getCurrentInstance, PropType, ref, watch } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { UIContralType } from '/@/bp/en/EnumLab';
  import OneMapAttr from '/@/CCMobile/CCForm/OneMapAttr.vue';
  import Events from '/@/utils/Events';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import { FormInstance } from 'ant-design-vue';
  import WebUser from '/@/bp/web/WebUser';
  import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { AtPara } from '/@/bp/da/AtPara';
  import Event from '/@/utils/Events';
  const props = defineProps({
    mapAttrs: {
      type: Object as PropType<Array<Recordable>>,
      default: () => {
        return [];
      },
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
      default: null,
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
    data: {
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
    rowIdx: {
      type: Number,
      default: 0,
    },
    refPKVal: {
      type: [Number, String],
      default: '0',
    },
    WGFrm: {
      type: Object as PropType<WaiGuaBaseFrm>,
      default: null,
    },
    isPreview: {
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
  const formRef = ref<FormInstance>();
  const validateForm = async () => {
    let errors = null;
    try {
      await formRef.value?.validate();
    } catch (_errors) {
      errors = _errors;
      scrollToFirstError(_errors);
    }
    return errors;
  };
  const scrollToFirstError = (errorInfo: any) => {
    const firstErrorField = errorInfo[0].name || '';
    if (!!firstErrorField) {
      const firstErrorElement = document.querySelector(`[id="${firstErrorField}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  const sysLang = WebUser.SysLang || 'CH';
  //弹窗显示
  const workData = ref();
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
      Toast.fail(data.value.replace('err@', ''));
      return;
    }
    workData.value = JSON.parse(JSON.stringify(data.value));
    return workData.value;
  };
  const InitPage = async () => {
    workData.value = props.mapAttrs?.filter((item: any) => item.UIContralType === UIContralType.SignCheck).length > 0 ? await GetWorkCheckData() : [];
    console.log(workData.value);
  };
  InitPage();

  //保存审核组件
  const instance = getCurrentInstance();
  const WorkCheckSave = async (isSaveOnly) => {
    if (!props.checkField) return true;
    let refW = instance?.refs['attrRef_' + props.checkField] as InstanceType<typeof OneMapAttr>;
    if (Array.isArray(refW)) refW = refW[0];
    if (!!refW && typeof refW?.WorkCheckSave === 'function') {
      return await refW.WorkCheckSave(isSaveOnly);
    }
    return false;
  };
  /**
   * 双击label独占一行，再次点击取消独占一行
   */
  const handleDblClick = async (attr, row) => {
    if (props.isPreview) {
      const mypk = attr.MyPK;
      const mapAttr = new MapAttr(mypk);
      await mapAttr.Retrieve();
      switch (row) {
        case 'one-row':
          mapAttr.SetPara('IsLabLine', '1');
          break;
        case 'half-row':
          mapAttr.SetPara('IsLabLine', '0');
          break;
        case 'hidden-row':
          mapAttr.UIVisible = 0;
          break;
      }
      await mapAttr.Update();
      //点击后执行刷新;
      Event.emit('isPreviewload', true);
    }
  };
  defineExpose({ mainData: rowData, WorkCheckSave, validateForm, innerAttrs: props.mapAttrs });
</script>

<style lang="less" scoped>
  .ddl-item {
    border-bottom: 1px solid #f0f0f0;
    .ddl-label {
      padding: 11px 10px 0px;
      box-sizing: border-box;
      color: #414141;
      font-size: 15px;

      // font-weight: 600;
      // display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .out-cont {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .one-row {
      width: 25%;
      padding: 0 5px;
    }
    .half-row {
      width: 30%;
      padding: 0 5px;
    }
    .hidden-row {
      padding: 0 5px;
    }
  }
</style>
