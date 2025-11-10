<template>
  <!-- <base-component ref="baseComponent"> -->
  <div>
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="">
        <Row :gutter="16">
          <Col v-for="(btn, index) in dr" :key="btn.No" :xs="24" :sm="12" :md="8" :lg="4">
            <Tooltip placement="top">
              <template #title>
                <span> {{ btn.Name }}</span>
              </template>
              <Button type="link" @click="handleButtonClick(btn)" block class="action-button">
                {{ btn.Name }}
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </div>
    </Spin>
    <!--右侧滑出-->
    <Drawer
      :visible="drawerVisible"
      :title="modal.modalTitle"
      :width="modal.modalWidth"
      @close="drawerClose"
      :body-style="{
        padding: '0 12px',
      }"
    >
      <div v-if="drawerVisible">
        <GroupPageNew v-if="modal.modalType === 'GPN_StartDocFlow'" :params="query" @close-self="drawerVisible = false" />
        <GenerList
          v-else-if="modal.modalType === 'GL_OfficeTrack'"
          :params="{ EnName: 'GL_OfficeTrack', FlowNo: query.FlowNo || query.FK_Flow, WorkID: query.WorkID, NodeID: query.FK_Node }"
        />
      </div>
    </Drawer>
  </div>
  <!-- </base-component> -->
</template>

<script lang="ts" setup>
  import { message, Spin, Button, Row, Col, Drawer, Tooltip } from 'ant-design-vue';
  import type { UploadFile } from 'ant-design-vue';
  import { VerticalAlignBottomOutlined, FileWordOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { reactive, ref } from 'vue';
  import { FrmAttachmentDB } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getAppEnvConfig } from '/@/utils/env';
  import WebUser from '/@/bp/web/WebUser';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import Dev2InterfaceAth from './Dev2InterfaceAth';
  import { BtnLab } from '../Admin/AttrNode/BtnLab';
  import { useRoute } from 'vue-router';
  import GroupPageNew from '/@/WF/Comm/UIEntity/GroupPageNew.vue';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import { onlineEdit, installWpsAddin } from '/@/components/wps/index.cjs';
  import { setBase64 } from '/@/utils/gener/StringUtils';
  import GenerList from '/@/WF/views/GenerList.vue';
  import { emit } from 'process';

  const { VITE_PUBLIC_PATH, VITE_GLOB_API_URL, VITE_GLOB_PREVIEW_URL, VITE_GLOB_KKFILE_MINIOHOST } = getAppEnvConfig();
  const loading = ref(false);
  const props = defineProps({
    athInfo: {
      type: Object,
      default: () => {},
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    curMapAttr: {
      type: Object,
      default: null,
    },
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    PKValue: {
      type: String,
      default: '0',
    },
  });

  const route = useRoute();

  interface Btn {
    Icon: string;
    Name: string;
    No: string;
    Oper: string;
    Role: string;
    BtnType: string;
  }

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

  //侧滑显示
  const drawerVisible = ref<boolean>(false);

  const drawerShow = (type: string, title: string, width: number = window.innerWidth * 0.5) => {
    drawerVisible.value = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
  };

  const drawerClose = () => {
    drawerVisible.value = false;
    if (modal.modalType === 'TZWorkerEnable') {
      window.location.reload();
    }
  };

  let query = {
    ...route.query,
    ...props.params,
  };

  //操作按钮集合
  const dr = ref<Array<any>>([]);
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });

  // 根据No值获取按钮类型
  const getButtonType = (no: string) => {
    switch (no) {
      case 'DocWord':
        return 'primary';
      case 'OfficeTrackEnalbe':
        return 'default';
      case 'DownGovEnable':
        return 'dashed';
      case 'KKViewEnable':
        return 'primary';
      case 'DownVSTOEnable':
        return 'dashed';
      default:
        return 'default';
    }
  };

  // 根据No值获取按钮图标
  const getButtonIcon = (no: string) => {
    switch (no) {
      case 'DocWord':
        return FileWordOutlined;
      case 'OfficeTrackEnalbe':
        return FileTextOutlined;
      case 'DownGovEnable':
        return DownloadOutlined;
      case 'KKViewEnable':
        return EyeOutlined;
      case 'DownVSTOEnable':
        return VerticalAlignBottomOutlined;
      default:
        return null;
    }
  };

  // 处理按钮点击事件
  const handleButtonClick = (btn: any) => {
    switch (btn.No) {
      case 'DocWord':
        handleDocWord(btn);
        break;
      case 'OfficeTrackEnalbe':
        handleOfficeTrack(btn);
        break;
      case 'DownGovEnable':
        handleDownGov(btn);
        break;
      case 'KKViewEnable':
        handleKKView(btn);
        break;
      case 'DownVSTOEnable':
        handleDownVSTO(btn);
        break;
      case 'RenameGW':
        renameGW(btn);
        break;
      default:
      //message.error('未知按钮类型:', btn.Name);
    }
  };

  // 处理Word文档操作
  const handleDocWord = async (btn: any) => {
    try {
      if (!(await GetGongWenTemplateNode(btn?.AtPara, btn.No))) {
        // OfficeFileType 0-word 1-wps  OfficeBtnEnable 0-不可用 1-可编辑 2-不可编辑
        if (parseStringToObjectGetByKey(btn?.AtPara, 'OfficeFileType') == 0) {
          let officeEnable = parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable');
          let isReadonly = false;
          if (officeEnable == 0 || officeEnable == 2) {
            isReadonly = true;
          }
          let onLineeditUrl =
            'wordform://-fromccflow,AppID=DocFile' +
            ',WorkID=' +
            query.WorkID +
            ',FK_Node=' +
            query.FK_Node +
            ',IsReadonly=' +
            isReadonly +
            ',officeBtnEnable=' +
            parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable') +
            ',Token=' +
            WebUser.Token?.replace(',,', '') +
            ',WSUrl=' +
            getVstoHost();
          window.location.href = onLineeditUrl;
          return;
        }
        //OfficeFileType 0-word 1-wps
        if (parseStringToObjectGetByKey(btn?.AtPara, 'OfficeFileType') == 1) {
          let officeEnable = parseStringToObjectGetByKey(btn?.AtPara, 'OfficeBtnEnable');
          if (officeEnable == 0 || officeEnable == 2) {
            officeEnable = 3;
          }
          if (officeEnable == 1) {
            officeEnable = -1;
          }
          const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
          const downloadFileUrl = basePath + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
          const uploadFileUrl = basePath + 'WF/VSTO/SaveGongWenWordWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
          //安装wps插件后执行回调函数
          installWpsAddin(onlineEdit, [officeEnable, WebUser.Name, downloadFileUrl, uploadFileUrl]);
          return;
        }
        if (parseStringToObjectGetByKey(btn?.AtPara, 'OfficeFileType') == 3) {
          window.open('/#/WF/FrmOnlyOffice?WorkID=' + query.WorkID + '&NodeID=' + (query?.NodeID || query.FK_Node) + '&gongWenTemplateFile=', '_blank');
        }
        return;
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
    }
  };

  /*
   * 判断当前节点是否是开始节点且已存在公文
   */
  const GetGongWenTemplateNode = async (btnPara: string, btnNo: string) => {
    const nodeID = query.FK_Node as string;
    const workID = query.WorkID as string;
    if (nodeID.endsWith('01')) {
      //判断当前流程是否存在存在公文
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('workID', workID);
      handler.AddPara('nodeID', nodeID);
      const result: any = await handler.DoMethodReturnJson('IsGongWenByteExist');
      if (result == '公文文件不存在') {
        query['EnName'] = 'GPN_StartDocFlow';
        query['btnPara'] = btnPara;
        query['btnNo'] = btnNo;
        drawerShow('GPN_StartDocFlow', '公文模版');
        return true;
      }
    }
    return false;
  };

  const parseStringToObjectGetByKey = (str, keyPara) => {
    const parts = str.split('@');
    const obj = {};

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      obj[key] = value;
    });
    if (obj[keyPara] == 'undefined') {
      obj[keyPara] = null;
    }
    return obj[keyPara];
  };

  // 处理公文版本操作
  const handleOfficeTrack = async (btn: any) => {
    try {
      // 打开公文版本追踪界面
      drawerShow('GL_OfficeTrack', '公文版本', window.innerWidth * 0.8);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
    }
  };

  // 处理下载公文操作
  const handleDownGov = async (btn: any) => {
    try {
      const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
      const downloadFileUrlForDownGov =
        basePath + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
      downloadByUrl({ url: downloadFileUrlForDownGov });
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
    }
  };

  // 处理公文预览操作
  const handleKKView = async (btn: any) => {
    try {
      const handler2 = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler2.AddPara('workID', query.WorkID);
      handler2.AddPara('nodeID', query?.NodeID || query.FK_Node);
      let result: any = await handler2.DoMethodReturnJson('IsGongWenByteExist');
      if (result == '公文文件不存在') {
        message.info(result);
      } else {
        AthView();
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
    }
  };

  //文件预览
  const AthView = () => {
    if (typeof CommonConfig.IsOnlinePreviewOfAth == 'undefined') CommonConfig.IsOnlinePreviewOfAth = true;
    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      //配置的在线预览的方式，待处理.
      //预览文件服务器.
      var fileServerHost = CommonConfig.PreviewPathOfAth;
      const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
      const downloadFileUrl = basePath + 'WF/VSTO/GenerGongWenByteWPS?nodeID=' + (query?.NodeID || query.FK_Node) + '&token=' + WebUser.Token + '&workId=' + query.WorkID;
      //同文件名字使用以生成过的在线预览文件kkfile逻辑使用guid每次得生成在线预览文件
      const docName = crypto.randomUUID() + '.docx';
      var previewUrl = downloadFileUrl + '&fullfilename=' + docName;
      var onlinePreviewUrl = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + encodeURIComponent(setBase64(previewUrl));
      window.open(onlinePreviewUrl);
    }
    return;
  };

  // 处理VSTO插件下载操作
  const handleDownVSTO = async (btn: any) => {
    try {
      // 下载VSTO插件
      await downloadVSTOPlugin();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
    }
  };
  const emit = defineEmits(['update-row']);
  const renameGW = async (btn: any) => {
    // 修改 DocWord 按钮的名称
    const docWordBtn = dr.value.find((item) => item.No === 'DocWord');
    let fileName = window.prompt('公文名称', docWordBtn.Name.replaceAll('.docx', '').replaceAll('.doc', ''));
    // if (!!fileName) {
    //   emit('update-row', 'GovAth', fileName);
    // }
    if (fileName === null) {
      return;
    }
    if (docWordBtn) {
      if (!!fileName) {
        docWordBtn.Name = fileName.replaceAll('.docx', '').replaceAll('.doc', '') + '.docx';
      } else {
        fileName = '我的公文';
        docWordBtn.Name = fileName.replaceAll('.docx', '').replaceAll('.doc', '') + '.docx';
      }
    }

    const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handlers.AddPara('FK_Node', query.FK_Node);
    handlers.AddPara('WorkID', query.WorkID);
    handlers.AddPara('GovAth', fileName);
    const dataPackup: any = await handlers.DoMethodReturnString('RenameGW');
  };

  // 解析AtPara参数
  const parseAtPara = (atPara: string) => {
    const params: any = {};
    if (!atPara) return params;

    const pairs = atPara.split('@').filter((pair) => pair.includes('='));
    pairs.forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[key] = value;
      }
    });

    return params;
  };

  // 以下是各操作的具体实现方法（需要根据实际情况完善）
  const openWordEditor = async (fileType: string) => {
    // 实现打开Word编辑器的逻辑
    message.info(`打开Word编辑器，文件类型: ${fileType === '0' ? 'Word' : 'WPS'}`);
  };

  const openWordViewer = async (fileType: string) => {
    // 实现打开Word查看器的逻辑
    message.info(`打开Word查看器，文件类型: ${fileType === '0' ? 'Word' : 'WPS'}`);
  };

  const openOfficeTrackView = async () => {
    // 实现打开公文版本追踪的逻辑
    message.info('打开公文版本追踪');
  };

  const downloadGovDocument = async (fileType: string) => {
    // 实现下载公文正文的逻辑
    message.info(`下载公文正文，文件类型: ${fileType === '0' ? 'Word' : 'WPS'}`);
  };

  const openKKFilePreview = async () => {
    // 实现KK文件预览的逻辑
    message.info('打开公文预览');
  };

  const downloadVSTOPlugin = async () => {
    // 实现下载VSTO插件的逻辑
    window.location.href = 'http://eyer.ccbpm.cn/DownLoad/vstoinstall.exe';
  };

  const InitPage = async () => {
    try {
      loading.value = true;
      if (!!props.params.WorkID) {
        //判断当前流程是否存在存在公文
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('workID', props.params.WorkID);
        handler.AddPara('nodeID', props.params.NodeID);
        const result: any = await handler.DoMethodReturnJson('IsGongWenByteExist');

        const btnLab = new BtnLab(props.params.FK_Node);
        const count = await btnLab.RetrieveFromDBSources();
        btnLab.OfficeFileType = props.curMapAttr.Tag;
        console.log(typeof props.rowData.GovAth);
        //@0=office文件@1=WPS文件@2=混合模式@3=OnlyOffice在线文件
        if (btnLab.OfficeBtnEnable > 0 && btnLab.OfficeBtnLocal == 0) {
          dr.value.push({
            No: 'DocWord',
            Name: (!!props.rowData.GovAth && props.rowData.GovAth != 'null' ? props.rowData.GovAth : '我的公文') + '.docx',
            Oper: '',
            AtPara: '@OfficeFileType=' + btnLab.OfficeFileType + '@OfficeBtnEnable=' + btnLab.OfficeBtnEnable,
          });
          //OfficeFileType 0-word 1-wps  OfficeBtnEnable 0-不可用 1-可编辑 2-不可编辑
        }
        if ((props.curMapAttr.Tag == 0 && result == '公文文件存在') || (!!props.curMapAttr.Tag1 && props.curMapAttr.Tag == 1)) {
          //公文版本
          if (btnLab.OfficeTrackEnalbe == 1) {
            dr.value.push({
              No: 'OfficeTrackEnalbe',
              Name: btnLab.OfficeTrackLab,
              Oper: '',
            });
          }

          //下载公文正文
          if (btnLab.DownGovEnable) {
            dr.value.push({
              No: 'DownGovEnable',
              Name: btnLab.DownGovLab,
              Oper: '',
              AtPara: '@OfficeFileType=' + btnLab.OfficeFileType + '@OfficeBtnEnable=' + btnLab.OfficeBtnEnable,
            });
          }

          //公文正文在线预览
          if (btnLab.KKViewEnable) {
            dr.value.push({
              No: 'KKViewEnable',
              Name: btnLab.KKViewLab,
              Oper: '',
            });
          }
        }
        if (btnLab.OfficeBtnEnable > 0 && btnLab.OfficeBtnLocal == 0) {
          dr.value.push({
            No: 'RenameGW',
            Name: '公文重命名',
            Oper: '',
            AtPara: '',
          });
          //OfficeFileType 0-word 1-wps  OfficeBtnEnable 0-不可用 1-可编辑 2-不可编辑
        }
        //下载VSTO插件
        if (btnLab.DownVSTOEnable) {
          dr.value.push({
            No: 'DownVSTOEnable',
            Name: btnLab.DownVSTOLab,
            Oper: '',
          });
        }
      } else {
        dr.value.push({
          No: 'CeShi',
          Name: '我的公文.docx',
          Oper: '',
          AtPara: '',
        });
        dr.value.push({
          No: 'CeShi',
          Name: '公文版本',
          Oper: '',
        });
        dr.value.push({
          No: 'CeShi',
          Name: '下载公文',
          Oper: '',
          AtPara: '',
        });
        dr.value.push({
          No: 'CeShi',
          Name: 'KK在线预览',
          Oper: '',
        });
        dr.value.push({
          No: 'CeShi',
          Name: '公文重命名',
          Oper: '',
          AtPara: '',
        });
        dr.value.push({
          No: 'DownVSTOEnable',
          Name: '下载VSTO插件',
          Oper: '',
        });
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  InitPage();
</script>

<style scoped lang="less">
  .action-button {
    margin-bottom: 8px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    height: 32px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    // :deep(.ant-btn) {
    // }
  }
</style>
