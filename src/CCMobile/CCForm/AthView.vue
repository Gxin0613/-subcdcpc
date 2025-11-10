<template>
  <div>
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <div>
          <div>
            <div v-if="dbList.length === 0" style="margin-left: 5px">附件(0)</div>
          </div>
          <template v-if="Array.isArray(sorts) && sorts.length > 0">
            <div v-for="sort in sorts" :key="sort.value">
              <h3 style="height: 24px; width: 100%; line-height: 24px; font-size: 14px; box-sizing: border-box; background-color: rgb(221, 221, 221); color: rgb(51, 51, 51)">{{
                sort.value
              }}</h3>
              <div v-if="sort.SortList.length === 0" style="margin-left: 5px">附件(0)</div>
              <div v-for="db in sort.SortList" :key="db.MyPK">
                <Row class="rowNoWrap">
                  <Col :span="24" class="ath-span ath-place Download" @click="AthView(db)"><img :src="getFileTypeIcon(db.FileExts)" alt="" />{{ db.FileName }}</Col>
                </Row>
              </div>
            </div>
          </template>
          <template v-else>
            <div v-for="db in dbList" :key="db.MyPK">
              <Row class="rowNoWrap">
                <Col :span="18" class="ath-span ath-place Download" @click="athPreview(db)"
                  ><img :src="getFileTypeIcon(db.FileExts)" alt="" />
                  {{ db.FileName }}
                </Col>
                <Col :span="6" class="ath-span ath-place Download" @click="athPreview(db)">
                  <Button type="primary" size="mini" class="athDownload" @click.stop="DownLoad(db)"><i class="icon-cloud-download"></i></Button>
                </Col>
              </Row>
            </div>
          </template>
        </div>
        <Popup v-model:show="popModalImg.visible" position="center">
          <img v-if="popModalImg.visible && popModalImg.modalType == 'AthViewImg'" style="width: 100%; height: 100%; object-fit: contain" :src="previeImgUrl" />
        </Popup>
        <Popup v-model:show="popModal.visible" position="bottom" :style="{ width: '100%', height: '100%', backgroundColor: '#fafafd' }" class="modal-iframe">
          <NavBar style="background-color: #4356ff" :title="popModal.title" :fixed="true" left-arrow @click-left="IsOk" />
          <iframe
            v-if="popModal.visible && popModal.modalType == 'AthViewFile'"
            :src="iframeAthView"
            scrolling="auto"
            frameborder="no"
            class="modal-iframe"
            style="margin-top: 46px; width: 100%; height: 100%"
          ></iframe>
        </Popup>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { message, Spin, Row, Col } from 'ant-design-vue';
  import { Popup, NavBar, Button } from 'vant';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { reactive, ref } from 'vue';
  import { FrmAttachmentDB } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getAppEnvConfig } from '/@/utils/env';
  import WebUser from '/@/bp/web/WebUser';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import Event from '/@/utils/Events';
import { setBase64 } from '/@/utils/gener/StringUtils';
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
  console.log(props);
  interface SortItem {
    value: string;
    SortList: any;
  }
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  //附件属性
  const ath = ref<Record<string, any>>({});
  //附件集合
  const dbList = ref<FrmAttachmentDB[]>([]);
  const sorts = ref<SortItem[]>([]);
  const iframeAthView = ref('');
  const previeImgUrl = ref('');
  const { VITE_PUBLIC_PATH, VITE_GLOB_API_URL, VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: 'Pop',
  });
  const popModalImg = reactive({
    visible: false,
    title: '',
    modalType: 'Pop',
  });
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
      console.log('data', data);
      if (typeof data == 'string' && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return;
      }
      //附件集合
      dbList.value = data['DBAths'] || [];

      //附件属性
      ath.value = data['AthDesc'][0];

      //分组
      let sort = ath.value.Sort || '';
      if (sort != '') {
        sorts.value = [];
        sort.split(',').forEach((item) => {
          if (item != '') {
            sorts.value.push({
              value: item,
              SortList: dbList.value.filter((file) => file.Sort == item),
            });
          }
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

  /**
   * 下载文件
   * @param record
   * @constructor
   */
  const DownLoad = (record) => {
    const url = ref('');
    url.value = GetFileUrl(record.MyPK);
    downloadByUrl({ url: url.value, fileName: record.FileName });
  };
  const getFileTypeIcon = (fileExt) => {
    return `${VITE_PUBLIC_PATH}resource/FileType/${fileExt}.gif`;
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
  //文件预览
  const athPreview = (record) => {
  //  debugger;
    if (['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'].includes(record.FileExts.toLowerCase())) {
      handlePreview(record);
    } else {
      AthView(record);
    }
  };
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    PopIframeImg();
    let filePath = file.FileFullName;
    let i = filePath.indexOf('\DataUser');
    let str = filePath.substring(i);
    str = str.replace(/\/\//g, '/').replaceAll('\\/', '/').replaceAll('//', '/').replaceAll('\\', '/');
    const fileUrl = basePath + str;
    previeImgUrl.value = file?.previewUrl || fileUrl;
  };

  //文件预览
  const AthView = (record) => {
    let filePath = record.FileFullName;
    let i = filePath.indexOf('\DataUser');
    let str = filePath.substring(i);
    if (str.indexOf('/') == 0) {
      str = filePath.substring(0);
    }
    let fileUrl = str;
    if (typeof CommonConfig.IsOnlinePreviewOfAth == 'undefined') CommonConfig.IsOnlinePreviewOfAth = true;
    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      //配置的在线预览的方式，待处理.
      let host = VITE_GLOB_PREVIEW_URL;
      if (!host.endsWith('/') && !host.endsWith('\\')) {
        host = host + '/';
      }
      let url = '';
      if (!fileUrl.includes('http')) {
        fileUrl = str.replace(/\/\//g, '/').replaceAll('\\/', '/').replaceAll('//', '/').replaceAll('\\', '/');
        if (host.startsWith('http://') || host.startsWith('https://')) {
          url = host + fileUrl;
        } else {
          url = window.location.origin + basePath + fileUrl;
        }
      } else {
        url = fileUrl;
      }
      url = encodeURIComponent(setBase64(url));
      //预览文件服务器.
      var fileServerHost = CommonConfig.PreviewPathOfAth; //'http://localhost:8012/';
      // window.open(fileServerHost + 'onlinePreview?url=' + url);
      iframeAthView.value = fileServerHost + 'onlinePreview?forceUpdatedCache=true&url=' + url;
      console.log(iframeAthView.value);
      setTimeout(() => {
        PopIframe('AthViewFile', '文件预览');
      }, 50);
      return;
    }
    DownLoad(record);
  };
  
  const PopIframeImg = () => {
    Event.emit('modalShow', true);
    popModalImg.visible = true;
    popModalImg.modalType = 'AthViewImg';
  };
  const PopIframe = (type: string, title: string) => {
    Event.emit('modalShow', true);
    popModal.visible = true;
    popModal.modalType = type;
    popModal.title = title;
  };
  const IsOk = () => {
    Event.emit('modalShow', false);
    popModal.visible = false;
  };
  const DownLoadZip = async () => {
    const httpHandler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    httpHandler.AddJson(props.params);
    httpHandler.AddPara('FK_FrmAttachment', ath.value.MyPK);
    httpHandler.AddPara('PKVal', props.PKValue);
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
    // display: flex;
    min-height: auto;
    margin-top: auto;
    background: #fff;
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
    // height: 32px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  .ath-place {
    padding: 0 18px;
  }
  .rowNoWrap {
    flex-wrap: nowrap;
    margin: 10px 0;
  }
  .athDownload {
    display: flex;
    justify-content: center;
  }
  .Download {
    color: #1890ff;
    cursor: pointer;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
</style>
