<template>
  <div>
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <!--        <div class="leftType"> {{ ath.Name }} </div>-->
        <div v-if="dbList.length === 0" style="margin-top: 5px; margin-left: 5px">附件(0)</div>
        <div v-else style="border: 1px solid #ccc; width: 100%">
          <Button v-if="dbList.length > 0" type="link" class="btnStyle" @click="DownLoadZip()"
            ><span style="text-decoration: underline">{{ '全部下载' }}</span></Button
          >

          <div v-for="db in dbList" :key="db.MyPK">
            <Row class="rowNoWrap">
              <Col :span="13" class="ath-span ath-place Download" @click="athPreview(db)"><img :src="getFileTypeIcon(db.FileExts)" alt="" />{{ db.FileName }}</Col>
              <Col :span="7" class="ath-span">({{ db.FileSize }}MB)</Col>
              <Col :span="4" class="athDownload"><VerticalAlignBottomOutlined :style="{ fontSize: '16px' }" class="Download" @click="DownLoad(db)" /></Col>
            </Row>
          </div>
        </div>
        <!--右侧滑出-->
        <Drawer :visible="drawerVisible" :title="modal.modalTitle" :width="modal.modalWidth" @close="drawerClose" :body-style="{ padding: '0 12px' }">
          <iframe v-if="modal.modalType == 'AthViewFile'" :src="iframeAthView" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
        </Drawer>
        <Modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel" :width="previewWidth">
          <img alt="example" style="width: 100%" :src="previewImage" />
        </Modal>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { message, Spin, Button, Row, Col, Drawer, Modal } from 'ant-design-vue';
  import type { UploadFile } from 'ant-design-vue';
  import { VerticalAlignBottomOutlined } from '@ant-design/icons-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { reactive, ref } from 'vue';
  import { FrmAttachmentDB } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getAppEnvConfig } from '/@/utils/env';
  import WebUser from '/@/bp/web/WebUser';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import Dev2InterfaceAth from './Dev2InterfaceAth';
  const { VITE_PUBLIC_PATH, VITE_GLOB_API_URL, VITE_GLOB_PREVIEW_URL, VITE_GLOB_KKFILE_MINIOHOST } = getAppEnvConfig();
  const props = defineProps({
    athInfo: {
      type: Object,
      default: () => {},
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

  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    closable: true,
    modalType: '',
    modalTitle: '',
    modalWidth: 800,
    modalHeight: {},
    content: '',
  });

  const getFileTypeIcon = (fileExt) => {
    return `${VITE_PUBLIC_PATH}resource/FileType/${fileExt}.gif`;
  };
  //抽屉打开侧滑显示
  const drawerVisible = ref<boolean>(false);
  const drawerClose = () => {
    drawerVisible.value = false;
  };
  const loading = ref(false);
  //附件属性
  const ath = ref<Record<string, any>>({});
  //附件集合
  const dbList = ref<FrmAttachmentDB[]>([]);
  const iframeAthView = ref('');
  //图片附件属性
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');
  const previewWidth = window.innerWidth * 0.7;

  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      handler.AddPara('RefOID', props.PKValue);
      handler.AddPara('IsReadonly', props.isReadonly);
      handler.AddPara('FK_FrmAttachment', props.athInfo.MyPK);
      handler.AddPara('FrmID', props.athInfo.FK_MapData);
      const data = await handler.DoMethodReturnString('Ath_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return;
      }
      //附件集合
      dbList.value = data['DBAths'] || [];
      dbList.value.forEach((item) => {
        // 将 KB 转换为 MB
        const textKB = parseFloat(item.FileSize);
        item.FileSize = !!textKB ? (textKB / 1024).toFixed(2) : 0;
      });
      //附件属性
      ath.value = data['AthDesc'][0];
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  InitPage();

  /**
   * 下载文件
   * @param record
   * @constructor
   */
  const DownLoad = (record) => {
    const url = ref('');
    url.value = GetFileUrl(record.MyPK);
    downloadByUrl({ url: url.value });
  };
  const handleCancel = () => {
    previewVisible.value = false;
    previewTitle.value = '';
  };
  // 处理 金山接口 的图片预览
  const handleKingsoftPreview = (record) => {
    const exts = record.FileExts.toLowerCase(); //文件后缀
    const fileId = record.MyNote; // 文件ID
    const fileName = record.FileName; // 文件ID
    if (!fileId) {
      message.error('无法预览该文件，缺少文件ID');
      return;
    }
    if (!['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'].includes(exts)) {
      message.error('无法预览该文件，金山只支持图片格式预览');
      return;
    }
    if (!fileName) {
      message.error('无法预览该文件，缺少文件名称');
      return;
    }
    Dev2InterfaceAth.OpenImageByKingsot(fileId, exts, fileName)
      .then((url) => {
        if (!url) {
          message.error('无法预览该文件，获取预览地址失败');
          return;
        }
        console.log('url', url);
        previewImage.value = VITE_GLOB_PREVIEW_URL + url;
        console.log('previewImage', previewImage.value);
        previewVisible.value = true;
        previewTitle.value = record.FileName || record.url?.substring?.(record.url?.lastIndexOf('/') + 1) || '';
      })
      .catch((error) => {
        message.error('无法预览该文件，' + error);
      });
  };
  const handlePreview = async (
    file: UploadFile & {
      previewUrl: string;
      FileFullName: string;
      FileName: string;
    },
  ) => {
    let host = VITE_GLOB_PREVIEW_URL;
    if (ath.value.AthSaveWay == 5) {
      host = VITE_GLOB_KKFILE_MINIOHOST;
    }
    if (!host.endsWith('/') && !host.endsWith('\\')) {
      host = host + '/';
    }
    if (!file.previewUrl) {
      let fileUrl = file.FileFullName;
      const startIndex = fileUrl.indexOf('DataUser/');
      const relativePath = fileUrl.substring(startIndex);
      let athUrl = relativePath.replace(/([^:]\/)\/+/g, '$1');
      const previewUrl = host + athUrl;
      previewImage.value = previewUrl.replace(/([^:]\/)\/+/g, '$1'); // 替换非协议部分的重复斜杠;
    } else {
      previewImage.value = file.previewUrl;
    }
    previewVisible.value = true;
    previewTitle.value = file.FileName || file.url?.substring?.(file.url?.lastIndexOf('/') + 1) || '';
  };
  const athPreview = (record) => {
    if (['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'].includes(record.FileExts.toLowerCase())) {
      if (ath.value.AthSaveWay == 6) {
        handleKingsoftPreview(record);
      } else {
        handlePreview(record);
      }
    } else {
      AthView(record);
    }
  };
  const AthView = (record) => {
    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      Dev2InterfaceAth.OpenAthKKView(record.MyPK).then((url) => {
        iframeAthView.value = url || '';
        drawerShow('AthViewFile', '预览', window.innerWidth * 1);
      });
      return;
    } else {
      // 直接下载
      DownLoad(record);
    }
  };
  const drawerShow = (type: string, title: string, width: number = window.innerWidth * 0.8) => {
    drawerVisible.value = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
  };
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  function GetFileUrl(mypk) {
    const prefix = import.meta.env.MODE === 'development' ? '/api/' : basePath;
    const apiPath = 'WF/Comm/ProcessRequest';
    return (
      prefix +
      apiPath +
      '?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=' +
      props.params.WorkID +
      '&FK_Node=' +
      props.params.FK_Node +
      '&MyPK=' +
      mypk +
      '&Token=' +
      WebUser.Token
    );
  }

  const DownLoadZip = async () => {
    const httpHandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    httpHandler.AddJson(props.params);
    httpHandler.AddPara('FK_FrmAttachment', ath.value.MyPK);
    httpHandler.AddPara('PKVal', props.PKValue);
    httpHandler.AddPara('FK_Node', props.params.FK_Node);
    let data = await httpHandler.DoMethodReturnString('AttachmentUpload_DownZip');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data);
      return;
    }
    const str = basePath + 'DataUser/Temp/' + WebUser.No + '/' + data['PageName'];
    //downloadByUrl({ url: str });
    window.location.href = str;
  };
</script>

<style lang="less" scoped>
  .content {
    display: flex;
  }
  .leftType {
    display: flex;
    align-items: center;
    background: #eee;
    font-size: 12px;
    width: 20%;
    justify-content: center;
  }
  .btnStyle {
    padding: 0 10px;
    color: #000;
    font-weight: 600;
    text-decoration: underline;
  }
  .ath-span {
    height: 32px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 12px;
    display: flex;
    align-items: flex-start;
    line-height: 1.3em;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ath-place {
    padding: 0 10px;
  }
  .rowNoWrap {
    flex-wrap: nowrap;
  }
  .athDownload {
    display: flex;
    justify-content: center;
  }
  .Download {
    color: #1890ff;
    cursor: pointer;
    word-break: break-all;
  }
</style>
