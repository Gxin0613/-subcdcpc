<template>
  <div :class="{ 'p-10': !autoLayout }" style="background-color: #f2f5f7; height: 100%">
    <Spin :spinning="loading" style="height: 100% !important">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="height: 100%; background-color: white">
        <div style="line-height: 64px; background-color: white; width: 100%; height: 50px; padding-left: 15px">
          <Button v-if="isReadonly === false" class="toolbar" @click="Save">{{ '保存' }}</Button>
          <Button v-if="isReadonly === false && isInsert" class="toolbar" @click="SaveAndAdd">{{ '保存并新增' }}</Button>
          <Button v-if="isReadonly === false && isDelete" class="toolbar" @click="Delete">{{ '删除' }}</Button>
          <Button class="toolbar" @click="Close">{{ '关闭' }}</Button>
        </div>
        <div class="content wrapper">
          <FrmFool
            v-if="frmData"
            :auto-layout="autoLayout"
            ref="basicData"
            :frmData="frmData"
            :fieldIsReadonly="isReadonly"
            :isReadonly="isReadonly"
            :params="dtlParams"
            :key="componentKey"
          />
        </div>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { message, Spin, Button } from 'ant-design-vue';
  import { reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@form/dto/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import { cloneDeep } from 'lodash-es';
  // 父组件传过来的属性
  const props = defineProps({
    mapDtl: {
      type: Object,
      default: () => {},
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    rowData: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    mainData: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    refOID: {
      type: Number,
      default: 0,
    },
    refPKVal: {
      type: String,
      default: '0',
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    autoLayout: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['handlerClose', 'delete-success', 'close', 'save-success']);

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const frmData = ref();
  const isLoadAfter = ref(false);
  const refOID = ref(props.refOID);
  const dtlParams = ref(cloneDeep(props.params));
  const isInsert = ref(true);
  const isDelete = ref(true);
  //获取表单的分组
  const componentKey = ref(0);
  const isHavedSave = ref(refOID.value != 0 ? true : false);
  //初始化页面
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('EnsName', props.mapDtl.No);
      const params = cloneDeep(props.params);
      delete params['EnsName'];
      delete params['FK_Node'];
      delete params['NodeID'];
      delete params['PKVal'];
      handler.AddJson(params);
      handler.AddPara('RefOID', refOID.value);
      handler.AddPara('PageType', 'Vue3');
      let data = await handler.DoMethodReturnString('DtlFrm_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('DtlFrm_Init获取失败:' + data);
        return;
      }
      if (typeof data['PageName'] != 'undefined') {
        refOID.value = data['OID'];
        handler.AddPara('RefOID', refOID.value);
        data = await handler.DoMethodReturnString('DtlFrm_Init');
        if (typeof data == 'string' && data.includes('err@') == true) {
          errorObj.hasError = true;
          errorObj.tips = data.replace('err@', '');
          console.log('DtlFrm_Init获取失败:' + data);
          return;
        }
      }
      dtlParams.value.WorkID = refOID.value || props.refPKVal;
      dtlParams.value.RefPKVal = props.refPKVal;
      for (const key in props.mainData) {
        if (key == 'OID' || key == 'Title' || key == 'FID') continue;
        if (Array.isArray(props.mainData[key])) dtlParams.value[key] = props.mainData[key].join(',');
        else dtlParams.value[key] = props.mainData[key];
      }
      frmData.value = JSON.parse(JSON.stringify(data));
      if (frmData.value.Sys_GroupField.length == 1) frmData.value.Sys_GroupField[0].Lab = '';
      //修改表单字段的分组ID=0的替换成基础分组;
      const gf = frmData.value.Sys_GroupField.find(group=>group.CtrlType==='' || group.CtrlType == null);
      if(!!gf){
        frmData.value.Sys_MapAttr.forEach(item=>{
          if(item.UIVisible && item.GroupID == 0)
            item.GroupID = gf.OID;
        })
      }

      
      isInsert.value = props.mapDtl?.IsInsert === '1' && props.isReadonly == false && parseInt(props?.mapDtl?.IsReadonly) == 0;
      isDelete.value = (props.mapDtl?.IsDelete === '1' || props.mapDtl?.IsInsert === '1') && props.isReadonly == false && parseInt(props?.mapDtl?.IsReadonly) == 0;
      isLoadAfter.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * 保存从表数据
   * @constructor
   */
  const basicData = shallowRef<InstanceType<typeof FrmFool>>();
  const Save = async () => {
    try {
      //更改数据字段值的类型
      const rowData = await basicData.value?.VerifyFormData(false);
      if (rowData == null) {
        return false;
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(rowData);
      handler.AddPara('IsForDtl', 1);
      handler.AddPara('EnsName', props.mapDtl.No);
      handler.AddPara('RefPKVal', props.refPKVal);
      handler.AddPara('OID', refOID.value);
      handler.AddPara('RowIndex', 0);
      handler.AddPara('IsVue3', 1);
      for (const key in props.mainData) {
        if (key == 'OID' || key == 'Title' || key == 'FID') continue;
        if (Array.isArray(props.mainData[key])) handler.AddPara(key, props.mainData[key].join(','));
        else handler.AddPara(key, props.mainData[key]);
      }
      const data = await handler.DoMethodReturnString('Dtl_SaveRow');
      isHavedSave.value = true;
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return false;
      }
      message.success('保存成功:' + data);
      return true;
    } catch (e) {
      isHavedSave.value = true;
      message.error(e as string);
      return false;
    } finally {
      emit('save-success');
    }
  };
  /**
   * 保存并新增
   * @constructor
   */
  const SaveAndAdd = async () => {
    const result = await Save();
    if (result == false) return;
    refOID.value = 0;
    isHavedSave.value = false;
    await InitPage();
    componentKey.value++;
  };
  /**
   * 删除当前行
   * @constructor
   */
  const Delete = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('FK_MapDtl', props.mapDtl.No);
    handler.AddPara('RefOID', refOID.value);
    handler.AddPara('RefPKVal', props.refPKVal);
    const data = await handler.DoMethodReturnString('Dtl_DeleteRow');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('err@', ''));
      return;
    }
    emit('handlerClose');
    emit('delete-success', refOID.value);
  };
  const Close = async () => {
    if (isHavedSave.value == false) await Delete();
    else emit('handlerClose');
    emit('close');
  };
  InitPage();
</script>

<style lang="less" scoped>
  .toolbar {
    border-radius: 5px;
    align-items: center;
    cursor: pointer;
    margin: 5px 5px 5px 0px;
  }
  .form-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    // height: 80px;
    // line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding-right: 8px;

    img {
      width: 120px;
      height: 60px;
      object-fit: contain;
    }

    p {
      display: flex;
      align-items: center;
    }
  }
  .GroupBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    line-height: 80px;
    font-weight: 600;
    font-size: 14px;
    padding: 10px;
    margin-bottom: 4px;
    background-color: whitesmoke;

    img {
      width: 120px;
      height: 60px;
      object-fit: contain;
    }

    p {
      display: flex;
      align-items: center;
    }
  }
  .GroupTitle {
    margin: 10px 0;
    border-radius: 5px;
    background-color: #e3dbd7;
    // color: #598da7;
  }
  :deep(.ant-spin-nested-loading) {
    height: 100%;
  }
  :deep(.ant-spin-container) {
    height: 100%;
  }
</style>
