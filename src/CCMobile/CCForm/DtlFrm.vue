<template>
  <div class="" style="background-color: white; padding-top: 0">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="height: 100%">
        <div class="content wrapper">
          <FrmFool
            v-if="frmData"
            ref="basicData"
            :frmData="frmData"
            :fieldIsReadonly="isReadonly"
            :isReadonly="isReadonly"
            :params="dtlParams"
            :key="componentKey"
            pageFrom="DtlFrm"
          />
        </div>
        <Tabbar v-if="isReadonly === false" v-model="active">
          <TabbarItem v-if="isReadonly === false" class="toolbar" @click="Save">{{ '保存' }}</TabbarItem>
          <TabbarItem v-if="isReadonly === false" class="toolbar" @click="SaveAndAdd">{{ '保存并新增' }}</TabbarItem>
          <TabbarItem v-if="isReadonly === false" class="toolbar" @click="Delete">{{ '删除' }}</TabbarItem>
          <TabbarItem v-if="isReadonly === false" class="toolbar" @click="Close">{{ '关闭' }}</TabbarItem>
        </Tabbar>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { message, Spin } from 'ant-design-vue';
  import { Tabbar, TabbarItem } from 'vant';
  import { reactive, ref, shallowRef } from 'vue';
  import HttpHandler from '/@form/dto/HttpHandler';
  import FrmFool from '/@/CCMobile/CCForm/FrmFool.vue';
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
  });

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
  dtlParams.value.RefOID = props.refOID;
  dtlParams.value.RefPKVal = props.refPKVal;
  //获取表单的分组
  const active = ref(0);
  const componentKey = ref(0);
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
      frmData.value = JSON.parse(JSON.stringify(data));
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
      const rowData = await basicData.value?.VerifyFormData(true);
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
      const data = await handler.DoMethodReturnString('Dtl_SaveRow');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data);
        return false;
      }
      message.success('保存成功:' + data);
      return true;
    } catch (e) {
      message.error(e as string);
      return false;
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
    Close();
  };
  const emit = defineEmits(['handlerClose']);
  const Close = () => {
    emit('handlerClose');
  };
  InitPage();
  defineExpose({ Save });
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
</style>
