<template>
  <div class="body" style="text-align: left">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div>
        <PageHeader style="border: 1px solid rgb(235, 237, 240)" :title="'处理表单'" />
        <ul class="tb_style_ul">
          <li class="tb_style_li">
            <a @click="handleClick"><i class="icon-film" style="padding-right: 5px"></i>打开【{{ frmType }}】表单</a>
          </li>
          <li class="tb_style_li">
            <a @click.stop="previewFrm"><i class="icon-doc" style="padding-right: 5px"></i>{{ 'KKFile预览表单' }}</a></li
          >
          <li class="tb_style_li">
            <a @click.stop="viewFrm"><i class="icon-magnifier" style="padding-right: 5px"></i>{{ '查看经典表单' }}</a></li
          >
        </ul>
      </div>
      <div>
        <PageHeader style="border: 1px solid rgb(235, 237, 240)" :title="'安装插件'" />
        <ul class="tb_style_ul">
          <li class="tb_style_li">该插件是一个ccflow开发的office插件,要求安装在office2013以上版本.</li>
          <!-- <li class="tb_style_li">{{'该需要下载后安装'}}</li> -->
          <li class="tb_style_li">
            <a :href="vstoZip"><i class="icon-arrow-down-circle" style="padding-right: 5px"></i>{{ '下载VSTO安装程序' }}</a></li
          >
        </ul>
      </div>
      <!--右侧滑出-->
    </Spin>
    <Modal
      v-if="modalShow === 'right' && modalInfo.type == 'Frm'"
      v-model:open="modalInfo.visible"
      :title="modalInfo.title"
      :body-style="{
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
      }"
      width="80%"
      :footer="null"
      :centered="false"
      :style="{ right: 0, marginRight: 0, top: 0, height: 'calc(100vh)' }"
    >
      <Frm v-if="modalInfo.visible" :frmID="pageData.FrmID" :params="newParmes" />
    </Modal>
    <Modal
      v-else
      v-model:open="modalInfo.visible"
      :footer="null"
      centered
      :title="modalInfo.title"
      :body-style="{
        height: '800px',
        overflowY: 'auto',
      }"
      :width="modalInfo.width"
      @close="drawerClose"
    >
      <template v-if="modalInfo.visible">
        <div v-if="isEditVSTOToFrmFool && newParmes.IsReadonly == false" class="toolBar" :style="toolbarStyle">
          <Button class="flow-btn" @click="Save()" style="margin-right: 5px"><i class="icon-check custom-icon-style"></i><span> 保存</span></Button>
          <Button class="flow-btn" @click="SaveAndClose()"><i class="icon-close custom-icon-style"></i><span> 保存并关闭</span></Button>
        </div>
        <div style="margin: 0 auto" :style="{ padding: isEditVSTOToFrmFool && newParmes.IsReadonly == false ? '45px 24px 0px' : '0px 24px 0px' }">
          <Frm v-if="modalInfo.type == 'Frm'" :frmID="pageData.FrmID" :params="newParmes" ref="frmRef" />
        </div>

        <iframe v-if="modalInfo.type == 'AthViewFile'" :src="iframeAthView" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
      </template>
    </Modal>
  </div>
</template>
<script setup lang="ts">
  import { message, PageHeader, Spin, Modal, Button } from 'ant-design-vue';
  import { computed, reactive, ref, shallowRef } from 'vue';
  import { useRoute } from 'vue-router';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '../utils/env';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import Frm from '/@/WF/CCForm/Frm.vue';
  import HttpHandler from '../utils/gener/HttpHandler';
  import { CommonConfig } from '../DataUser/OverrideFiles/CommonConfig';
  import { cloneDeep } from 'lodash-es';
  import { setBase64 } from '../utils/gener/StringUtils';
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    frmSln: {
      type: String,
      default: '',
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    modalShow: {
      type: String,
      default: 'centered',
    },
    mapDataRef: {
      type: Object,
      default: () => ({}),
    },
  });
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const vstoUrl = ref();
  const frmType = ref('Excel');
  //抽屉打开侧滑显示
  const drawerClose = () => {
    modalInfo.value.visible = false;
  };
  const frmNodes = ref<any[]>([]);
  //弹窗显示
  const modalInfo = ref({
    visible: false,
    closable: true,
    type: '',
    title: '',
    width: 800,
    height: {},
    content: '',
  });
  const vstoZip = ref();
  const appID = ref();
  const header = ref();
  const iframeAthView = ref('');
  const pageData = reactive<Recordable>({});
  const route = useRoute();
  const getParams = (name: string) => route.query[name] || props.params[name] || null;
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const frmSln = ref(props.frmSln);
  const emit = defineEmits<{ (event: 'update-from-type'): void }>();
  const isEditVSTOToFrmFool = ref(false);
  const viewFrm = () => {
    isEditVSTOToFrmFool.value = CommonConfig.IsEditVSTOToFrmFool || false;

    //修改引用的组件
    if (isEditVSTOToFrmFool.value === true && typeof props.params.PageFrom == 'undefined') emit('update-from-type');
    else {
      newParmes.value.IsReadonly = isEditVSTOToFrmFool.value == false ? 1 : !pageData.IsReadonly ? 0 : 1;
      drawerShow('Frm', '查看表单', window.innerWidth * 0.7);
    }
  };
  const frmRef = shallowRef<InstanceType<typeof Frm>>();
  const Save = async () => {
    await frmRef.value?.Save();
  };
  const SaveAndClose = async () => {
    await Save();
    modalInfo.value.visible = false;
  };
  const toolbarStyle = computed(() => {
    return { position: 'fixed', zIndex: 100, width: window.innerWidth * 0.7 + 'px' };
  });
  async function previewFrm() {
    //调用后台生成临时文件
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    if (frmNodes.value?.[0]?.['WhoIsPK'] == 2) {
      handler.AddPara('WorkID', pageData.PWorkID);
    } else {
      handler.AddPara('WorkID', pageData.WorkID);
    }
    handler.AddPara('Token', WebUser.Token?.replace(',,', ''));
    handler.AddPara('FrmID', pageData.FrmID);
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
    // window.open(fileServerHost + 'onlinePreview?url=' + url);
    iframeAthView.value = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
    drawerShow('AthViewFile', '预览', window.innerWidth * 1);
  }

  const handleClick = async (event) => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('Header', header.value);
      await handler.DoMethodReturnString('IsInstallVSTO');
      window.location.href = vstoUrl.value;
      // 执行自定义逻辑，例如记录日志
    } catch (e) {
      event.preventDefault();
      message.error(e as string);
    }
  };

  const drawerShow = (type: string, title: string, width: number) => {
    modalInfo.value.type = type;
    modalInfo.value.title = title;
    modalInfo.value.width = width;
    modalInfo.value.visible = true;
  };
  const newParmes = ref<Recordable>(props.params);
  const InitPageParam = async () => {
    try {
      //对于表单树（由于query不随着表单树的tab变化故采用）故采用父子传参

      if (!!frmSln.value) {
        route.query['isReadonly'] = props.frmSln;
      }
      loading.value = true;
      pageData.FK_Flow = getParams('FlowNo') || getParams('FK_Flow');
      pageData.FK_Node = getParams('FK_Node') || getParams('NodeID') || 0;
      pageData.FID = getParams('FID') == null ? 0 : getParams('FID');
      const oid = getParams('WorkID') || getParams('OID') || 0;
      pageData.WorkID = oid;
      pageData.Paras = getParams('Paras');
      pageData.IsReadonly = props.isReadonly;
      pageData.PWorkID = getParams('PWorkID');
      pageData.IsStartFlow = getParams('IsStartFlow');
      pageData.IsPrint = getParams('IsPrint');
      pageData.IsEdit = getParams('IsEdit');
      pageData.FrmID = getParams('Frms') || getParams('FrmID');

      //单表单接收query的frmid参数 但是对于多表单query里面的frmid参数不变化故采用单独传参方式
      if (!!props.mapDataRef.No) {
        pageData.FrmID = props.mapDataRef.No;
        pageData.FrmType = props.mapDataRef.FrmType;
        frmType.value = props.mapDataRef.Name;
      }
      pageData.Token = WebUser.Token?.replace(',,', '');
      newParmes.value = cloneDeep(pageData);

      //执行表单初始化方法
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('PageType', 'Vue3');
      handler.AddJson(pageData);
      const resultFrm: any = await handler.DoMethodReturnJson('FrmGener_Init');
      if (typeof resultFrm == 'string' && resultFrm.includes('err@') == true) {
        //发送时发生错误
        message.error(resultFrm.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(resultFrm));
      frmNodes.value = result['WF_FrmNode'];
      if (frmNodes.value.length == 1 && frmNodes.value[0].FrmSln == 1) {
        // eslint-disable-next-line vue/no-mutating-props
        pageData.IsReadonly = true;
      }
      //alert(pageData.FrmID);
      //   const mapData = new MapData(pageData.FrmID);
      //   await mapData.Retrieve();
      // @0=经典表单@1=自由表单@8=开发者表单@10=章节表单@6=VSTO表单
      //   pageData.FrmType = mapData.FrmType;
      // celform://-fromccflow,AppID=MyBill,FrmID=Frm_CeShiVSTOBiaoShan,FK_MapData=Frm_CeShiVSTOBiaoShan,WorkID=101,IsEdit=null,
      // IsPrint=null,FK_Flow=004,
      // FK_Node=401,UserNo=admin,Token=9086daaa-fa45-4be9-9679-6dd788b79edf,IsReadonly=null,PWorkID=0,WSUrl=http://localhost:2296
      //isedit isprint IsReadonly
      header.value = 'excelform';
      // let appID = 'MyFlowExcel';
      appID.value = 'FrmExcel';
      if (pageData.FrmType == 61) {
        header.value = 'wordform';
        appID.value = 'MyFlowWord';
      }
      const paras = `${header.value}://-fromccflow,AppID=${appID.value},FlowNo=${pageData.FK_Flow},NodeID=${pageData.FK_Node},FrmID=${pageData.FrmID},PWorkID=${
        pageData.PWorkID
      },WhoIsPK=${frmNodes.value?.[0]?.['WhoIsPK'] || 0},WorkID=${oid},IsReadonly=${pageData.IsReadonly},Token=${WebUser.Token},WSUrl=${getVstoHost()},WebHostUrl=${
        window.location.origin
      }`;
      console.log({ paras });
      vstoUrl.value = paras;
      vstoZip.value = 'http://eyer.ccbpm.cn/DownLoad/vstoinstall.exe';
      loading.value = false;
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };

  InitPageParam();
</script>
<style lang="less" scoped>
  .body {
    background-color: #fff;

    .tb_style_ul {
      border: 1px solid rgb(235, 237, 240);
    }

    .tb_style_li {
      height: 40px;
      padding: 15px 0 0 25px;
    }
  }
  .toolBar {
    background-color: white;
    padding: 5px 30px 0px;
  }
  .custom-icon-style {
    margin-right: 8px;
  }
  .toolbar-wrapper {
    box-sizing: border-box;
    display: flex;
    //align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: auto;
    //background-color: #4877fb;
    padding: 13px 2.2rem;
    justify-content: space-between;

    align-items: center;
    flex-wrap: wrap;
    .flow-btn {
      //padding: 4px 16px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
</style>
