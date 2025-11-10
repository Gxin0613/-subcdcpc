<template>
  <div class="form-comparison-container">
    <Card class="comparison-card">
      <div class="comparison-header">
        <div class="header-selectors">
          <span> 表单列表：<Select v-model:value="selectedForm" placeholder="表单列表" style="width: 200px" :options="formOptions" @change="formChange" /> </span>
          <span> 基本版本号：<Select v-model:value="baseVersion" placeholder="基本版本号" style="width: 225px" :options="versionOptions" @change="baseChange" /> </span>
          <span> 比较版本号：<Select v-model:value="compareVersion" placeholder="比较版本号" style="width: 225px" :options="compareVersionOpt" @change="compareChange" /> </span>
          <Button class="compareSum" type="primary" @click="ToFrmDBAll">全面对比</Button>
          <Button class="" type="primary" @click="openCompareSummary">对比汇总</Button>
        </div>
      </div>

      <div class="comparison-content">
        <!-- 左侧：基本版本 -->
        <div class="version-panel">
          <div class="version-header">
            <h3 style="color:green">基本版本: {{ getVersionName(baseVersion) }} </h3>
            <h3 v-if="(frmType === 6 || frmType === 61) && !!baseVersion">
              <Button @click="previewFrm(baseVersion)" style="margin-right: 5px"><i class="icon-doc" style="padding-right: 5px"></i>预览</Button>
              <Button @click="download(baseVersion)"><i class="icon-arrow-down-circle" style="padding-right: 5px"></i>下载Excel</Button>
            </h3>
          </div>
          <!-- 基本版本数据 -->
          <div class="baseData" v-if="isBase">
            <!-- <div class="header toolBar">
              <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                <template v-for="btn in btnList" :key="btn.No">
                  <FormItem>
                    <Button class="flow-btn" @click="ClickBtn(btn, baseVersion)">
                      <span> {{ btn.Name }} </span>
                    </Button>
                  </FormItem>
                </template>
              </Form>
            </div> -->
            <FrmFool
              v-if="!!frmDataBase"
              ref="basicData"
              :frmData="frmDataBase"
              :fieldIsReadonly="true"
              :isReadonly="true"
              :params="{ ...params, TrackID: getVersionTrackID(baseVersion), IshistoryData: 1, IsCanShowFWC: '0' }"
            />
          </div>
        </div>

        <!-- 中间分隔线 -->
        <div class="divider">
          <Divider type="vertical" style="height: 100%" />
        </div>

        <!-- 右侧：比较版本 -->
        <div class="version-panel">
          <div class="version-header">
            <h3>比较版本:{{ getVersionName(compareVersion) }}</h3>
            <h3 v-if="(frmType === 6 || frmType === 61) && !!compareVersion">
              <Button @click="previewFrm(baseVersion)"><i class="icon-doc" style="padding-right: 5px"></i> 预览</Button>
              <Button @click="download(baseVersion)"><i class="icon-arrow-down-circle" style="padding-right: 5px"></i>下载Excel</Button>
            </h3>
          </div>
          <!-- 比较版本数据 -->
          <div class="compareData" v-if="isCompare">
            <FrmFool
              v-if="!!frmDataCompare"
              ref="basicData"
              :frmData="frmDataCompare"
              :fieldIsReadonly="true"
              :isReadonly="true"
              :params="{ ...params, TrackID: getVersionTrackID(compareVersion), IshistoryData: 1, IsCanShowFWC: '0' }"
            />
          </div>
        </div>
      </div>
    </Card>

    <!--居中弹窗-->
    <Modal
      v-model:open="modal.modalVisible"
      centered
      :closable="modal.closable"
      :title="modal.modalTitle"
      :width="modal.modalWidth"
      :body-style="modal.modalHeight"
      :footer="null"
      destroy-on-close
      @cancel="modalClose"
    >
      <div v-if="modal.modalVisible" style="height: 100%; overflow: hidden scroll">
        <div v-if="modal.modalType === 'GL_FrmDBVerHZ'">
          <GenerList :params="frmParams"  />
        </div>
         <div v-if="modal.modalType === 'FrmDBAll'">
          <FrmDBAll :params="frmParams" />
        </div>
        <iframe v-if="modal.modalType == 'AthViewFile'" :src="iframeAthView" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed, reactive } from 'vue';
  import { Card, Select, Divider, message,  Button, Modal } from 'ant-design-vue';
  import type { SelectProps } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import { compareDataChanges, markChangedFields, markGroupFieldChanges } from '/@/utils/compare';
  import { getAppEnvConfig } from '/@/utils/env';
  import WebUser from '/@/bp/web/WebUser';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import GenerList from '/@/WF/views/GenerList.vue';
  import FrmDBAll from './FrmDBAll.vue';
  import { MapData } from '../Admin/FrmLogic/MapData';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import { setBase64 } from '/@/utils/gener/StringUtils';
  import { downloadByUrl } from '/@/utils/file/download';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });

  const btnList = ref([
    {
      No: 'PackUp_zip',
      Name: '打包下载',
      Icon: null,
    },
    {
      No: 'PackUp_pdf',
      Name: '打印',
      Icon: null,
    },
    {
      No: 'OpenVsto',
      Name: '打开vsto表单',
      Icon: null,
    },
  ]);
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;

  const isBase = ref(false);
  const isCompare = ref(false);

  // 响应式数据
  const selectedForm = ref<string>('');
  const baseVersion = ref<string>('');
  const compareVersion = ref<string>('');

  const loading = ref<boolean>(false);

  // 下拉框
  const formOptions = ref<SelectProps['options']>([]);

  const versionOptions = ref<SelectProps['options']>([]);

  // //基本版本 version
  // const baseVersionOpt = ref<SelectProps['options']>([]);
  //比较版本 version
  const compareVersionOpt = ref<SelectProps['options']>([]);

  //frmdata
  const frmData = ref<Recordable<any>>();

  const frmDataBase = ref<Recordable<any>>();
  const frmDataCompare = ref<Recordable<any>>();

  // 数据 - 基本版本
  const DataBase = ref<Recordable<any>>([]);

  // 数据 - 比较版本
  const DataCompare = ref<Recordable<any>>([]);

  //当前表单数据（获取表单属性使用）
  const currentFrmData = ref<Recordable<any>>();

  //表单参数
  const frmParams = ref();

  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
    content: '',
    params: {},
  });

  /**
   * 按钮弹窗操作
   * @param type
   * @param title
   * @param width
   * @param height
   */
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
    };
  };
  const iframeAthView = ref('');
  const previewFrm = async (frmVer) => {
    //调用后台生成临时文件
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('FrmID', selectedForm.value);
    handler.AddPara('FrmDBVer', frmVer);
    let fileUrl = await handler.DoMethodReturnString('GetFrmVstoFile');
    if (fileUrl == '请先填写表单') {
      message.info(fileUrl + ':该表单没有填写，您无法预览.');
      return;
    }
    let i = fileUrl.indexOf('\DataUser');
    let str = fileUrl.substring(i);
    if (str.indexOf('/') == 0) {
      str = fileUrl.substring(0);
    }
    fileUrl = str;

    //配置的在线预览的方式，待处理.
    let host = VITE_GLOB_API_URL;
    if (!host.endsWith('/') && !host.endsWith('\\')) {
      host = host + '/';
    }
    let url = '';
    if (!fileUrl.includes('http')) {
      fileUrl = fileUrl.replace(/\/\//g, '/').replaceAll('\\/', '/').replaceAll('//', '/').replaceAll('\\', '/');
      if (host.startsWith('http://') || host.startsWith('https://')) {
        url = host + fileUrl;
      } else {
        url = window.location.origin + VITE_GLOB_API_URL + fileUrl;
      }
    } else {
      url = fileUrl;
    }
    url = encodeURIComponent(setBase64(url));
    //预览文件服务器.
    var fileServerHost = CommonConfig.PreviewPathOfAth;
    iframeAthView.value = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
    modalShow('AthViewFile', '预览', window.innerWidth * 1, window.innerHeight * 1);
  };
  const download = async (frmVer) => {
    //调用后台生成临时文件
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('FrmID', selectedForm.value);
    handler.AddPara('FrmDBVer', frmVer);
    let fileUrl = await handler.DoMethodReturnString('GetFrmVstoFile');
    if (fileUrl == '请先填写表单') {
      message.info(fileUrl + ':该表单没有填写，您无法预览.');
      return;
    }
    let i = fileUrl.indexOf('\DataUser');
    let str = fileUrl.substring(i);
    if (str.indexOf('/') == 0) {
      str = fileUrl.substring(0);
    }
    fileUrl = str;
    const { VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
    const host = VITE_GLOB_PREVIEW_URL.endsWith('/') ? VITE_GLOB_PREVIEW_URL : VITE_GLOB_PREVIEW_URL + '/';
    downloadByUrl({ url: host + '/' + fileUrl });
  };
  //打印Url
  const packupUrl = ref<string>('');

  const ClickBtn = async (btn, mypk) => {
    switch (btn.No) {
      case 'PackUp_zip':
      case 'PackUp_pdf':
        await packUp(btn, mypk);
        break;
      case 'OpenVsto':
        OpenVsto();
        break;
      default:
        message.info('未实现该功能');
        break;
    }
  };

  /**
   * 打印、打包下载
   * @param btn
   *  */
  const packUp = async (btn, mypk) => {
    const query = props.params || {};
    query['PrintType'] = btn.No.replace('PackUp_', '');
    const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handlers.AddPara('FileType', query.PrintType);
    handlers.AddPara('FK_Node', query.FK_Node);
    handlers.AddPara('FID', query.FID);
    handlers.AddPara('WorkID', query.WorkID);
    handlers.AddPara('FK_Flow', query.FlowNo || query.FK_Flow);
    handlers.AddPara('BasePath', basePath);
    handlers.AddPara('MyPK', mypk);
    // handlers.AddPara('IsWoerkOpt', 'true');
    const dataPackup: any = await handlers.DoMethodReturnString('Packup_Init');

    if (Array.isArray(dataPackup) && dataPackup.length > 0) {
      let url = dataPackup.find((item) => item.No === query['PrintType'])?.Name;
      const startIndex = url.indexOf('/DataUser/');
      const relativePath = url.substring(startIndex);
      url = basePath + relativePath;
      if (!!url) {
        window.open(url);
      } else {
        message.error('未找到zip文件, 原始数据为:' + JSON.stringify(dataPackup));
      }
      return;
    }
    dataPackup.forEach((item) => {
      item.Name = item.Name.replace(basePath + '/', '');
      const startIndex = item.Name.indexOf('/DataUser/');
      const relativePath = item.Name.substring(startIndex);
      if (item.No == 'PackUp_pdf') {
        packupUrl.value = basePath + '/' + relativePath;
        window.open(packupUrl.value);
        return;
      } else if (item.No == 'PackUp_zip') {
        if (item.Name.includes(basePath)) {
          packupUrl.value = item.Name;
        } else {
          packupUrl.value = basePath + '/' + relativePath;
        }
        window.open(packupUrl.value);
        return;
      }
    });
  };

  /**
   * 打开vsto表单
   * */
  const OpenVsto = () => {
    let header = 'excelform';
    let appID = 'FrmExcel';
    const paras = `${header}://-fromccflow,AppID=${appID},FlowNo=${props.params.FlowNo},NodeID=${props.params.FK_Node},FrmID=${selectedForm.value},PWorkID=${
      props.params?.PWorkID || null
    },WhoIsPK=0,WorkID=${props.params.WorkID},IsReadonly=true,Token=${WebUser.Token},WSUrl=${getVstoHost()},WebHostUrl=${window.location.origin}`;
    console.log({ paras });
    let vstoUrl = paras;
    // const url = GloWF.openVSTO('FrmExcel', selectedForm.value, props.params.WorkID);
    window.location.href = vstoUrl;
  };

  /**
   * 获取版本标签
   * @param version
   *  */
  const getVersionLabel = (version: string) => {
    const versionObj = versionOptions.value?.find((opt) => opt.value === version);
    return versionObj?.label || version;
  };

  /**
   * 获取版本名称
   * @param version
   *  */
  const getVersionName = (version: string) => {
    const versionObj = versionOptions.value?.find((opt) => opt.value === version);
    return versionObj?.name || version;
  };

  /**
   * 获取版本TrackID
   * @param version
   *  */
  const getVersionTrackID = (version: string) => {
    const versionObj = versionOptions.value?.find((opt) => opt.value === version);
    return versionObj?.trackid || version;
  };

  /**
   * 检查是否可以进行比较
   *  */
  const canCompare = computed(() => {
    return baseVersion.value && compareVersion.value;
  });

  // 模拟API获取数据
  const fetchComparisonData = async () => {
    if (!canCompare.value) {
      DataBase.value = [];
      DataCompare.value = [];
      return;
    }
    //写比较逻辑
  };

  // 监听版本变化，自动进行比较
  watch(
    [baseVersion, compareVersion, selectedForm],
    () => {
      fetchComparisonData();
    },
    { immediate: true },
  );

  /**
   * 获取表单数据
   * FrmID、WorkID、(数据版本)MyPK
   * */
  const GetFormData = async (mypk: string) => {
    try {
      const en = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      en.AddPara('MyPK', mypk);
      const data = await en.DoMethodReturnJson('FrmDBVer_GetData');

      return data;
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e.toString());
    }
  };

  /**
   * baseChange 基本版本数据获取
   * */
  const baseChange = async (value) => {
    try {
      isBase.value = false;
      DataBase.value = (await GetFormData(value)) ?? {};
      frmDataBase.value = await getCurrentFrmData();

      if (frmDataBase.value) {
        frmDataBase.value.MainTable[0] = JSON.parse(DataBase.value.FrmDB);
      }
      if(!!compareVersion.value)
        await compareChange(compareVersion.value);
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e.toString());
    } finally {
      isBase.value = true;
    }
  };

  /**
   * compareChange 比较版本数据获取
   * */
  const compareChange = async (value) => {
    try {
      isCompare.value = false;
      frmDataCompare.value = await getCurrentFrmData();

      // if (!!value && value !== 'current') {
      if (value == 'current') {
        DataCompare.value = (await GetFormData('')) ?? {};
      } else {
        DataCompare.value = (await GetFormData(value)) ?? {};
      }

      const data = !!DataBase.value.FrmDB ? compareDataChanges(DataBase.value, DataCompare.value) : null;
      const dtlAndAthChanges = { FrmDtlDB: data?.FrmDtlDB, FrmAthDB: data?.FrmAthDB };
      if (frmDataCompare.value) {
        const markedMapattr = data == null ? frmDataCompare?.value?.Sys_MapAttr : markChangedFields(frmDataCompare?.value?.Sys_MapAttr, data.FrmDB);
        // 调用方法处理Sys_GroupField
        const updatedGroupField =
          data == null
            ? frmDataCompare?.value?.Sys_GroupField
            : markGroupFieldChanges(frmDataCompare?.value?.Sys_GroupField, dtlAndAthChanges, frmDataCompare?.value?.Sys_FrmAttachment);
        frmDataCompare.value.Sys_MapAttr = markedMapattr;
        frmDataCompare.value.Sys_GroupField = updatedGroupField;

        frmDataCompare.value.MainTable[0] = JSON.parse(DataCompare.value.FrmDB);
      }
      // }
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e.toString());
    } finally {
      isCompare.value = true;
    }
  };
  /**
   * 对比汇总
   */
  const openCompareSummary = () => {
    frmParams.value = { ...props.params, FrmID: selectedForm.value, EnName: 'GL_FrmDBVerHZ' };
    debugger;
    modalShow('GL_FrmDBVerHZ', '对比汇总');
  };
  /**
   * 全面比对
   */
  const ToFrmDBAll=()=>{
    frmParams.value = { ...props.params, FrmID: selectedForm.value};
    modalShow('FrmDBAll', '全面对比',window.innerWidth*0.8,window.innerHeight*0.8);
  }

  const modalClose = () => {
    modal.modalVisible = false;
  };

  /**
   * formChange 版本下拉框数据获取
   * */
  const frmType = ref(0);
  const formChange = async (value) => {
    const mapData = new MapData();
    mapData.No = value;
    await mapData.Retrieve();
    frmType.value = mapData.FrmType;
    const en = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    en.AddPara('WorkID', props.params.WorkID || '');
    en.AddPara('FrmID', value || '');
    const data = await en.DoMethodReturnJson('FrmDBVer_GenerVerByFrmID');

    versionOptions.value = data?.map((ver) => ({
      value: ver.MyPK,
      label: ver.RecName + '-' + ver.RDT,
      name: ver.NodeName + '-' + ver.RecName + '-' + ver.RDT,
      trackid: ver.TrackID,
    }));
    // 深拷贝到新变量，避免浅拷贝影响
    const copiedVersionOptions = JSON.parse(JSON.stringify(versionOptions.value));
    // baseVersionOpt.value = copiedVersionOptions;
    compareVersionOpt.value = copiedVersionOptions || [];

    //非只读模式，添加一个当前表单版本
    if (props.params.IsReadonly === false) {
      compareVersion.value = compareVersionOpt.value?.length == 0 ? '' : (compareVersionOpt.value?.[0].value as string);
      if (!!compareVersion.value) await compareChange(compareVersion.value);
    }
  };

  /**
   * 获取表单数据
   * */
  const getCurrentFrmData = async () => {
    //Frm数据
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyFlow');
    handler.AddJson(props.params);
    handler.AddPara('PageType', 'Vue3');
    const FrmData = await handler.DoMethodReturnString('GenerWorkNode');
    // frmDataCompare.value = JSON.parse(JSON.stringify(FrmData));
    return JSON.parse(JSON.stringify(FrmData));
  };

  //初始化方法
  const InitPage = async () => {
    try {
      loading.value = true;
      currentFrmData.value = await getCurrentFrmData();

      //表单列表下拉框数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('WorkID', props.params.WorkID || '');
      handler.AddPara('FlowNo', props.params.FlowNo || '');
      const data: any = await handler.DoMethodReturnJson('FrmDBVer_Init');
      formOptions.value = data.map((da) => ({
        value: da.No,
        label: da.Name,
      }));
      // 设置默认选中第一个选项
      if ((formOptions.value ?? []).length > 0) {
        const firstOption = (formOptions.value ?? [])[0];
        selectedForm.value = firstOption && firstOption.value != null ? String(firstOption.value) : '';
        // // 可选：如果需要默认触发formChange事件加载后续数据
        formChange(selectedForm.value);
      }
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e.toString());
    } finally {
      loading.value = false;
    }
  };

  InitPage();
</script>

<style scoped>
  .form-comparison-container {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
  }

  .comparison-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .comparison-header {
    padding: 0 0 16px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
  }

  .header-selectors {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .compareSum {
    margin-left: auto;
  }

  .comparison-content {
    display: flex;
    gap: 0;
    min-height: 600px;
  }

  .version-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 6px;
    overflow: hidden;
  }

  .version-header {
    padding: 16px;
    background-color: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
  }

  .version-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    color: #262626;
  }

  .table-section {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .table-section:last-child {
    border-bottom: none;
  }

  .table-section h4 {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #595959;
  }

  .divider {
    padding: 0 8px;
    display: flex;
    align-items: center;
    background: #fafafa;
  }

  .diff-highlight {
    background-color: #fff2e8;
    padding: 2px 4px;
    border-radius: 2px;
    border-left: 3px solid #ffa940;
  }
</style>
