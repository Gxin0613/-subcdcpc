<template>
  <template v-if="Array.isArray(sorts) && sorts.length > 0">
    <div v-for="sort in sorts" :key="sort.value" :style="isMarginTop ? { marginTop: '46px' } : {}">
      <h3 style="height: 32px; width: 100%; line-height: 32px; font-size: 14px; box-sizing: border-box; background-color: rgb(221, 221, 221); color: rgb(51, 51, 51)">{{
        sort.value
      }}</h3>
      <ul>
        <Uploader
          v-if="ath.MyPK != undefined"
          v-model="sort.SortList"
          :after-read="(file) => afterRead(file, sort.value)"
          :before-read="beforeUpload"
          multiple
          :max-count="ath.TopNumOfUpload"
          :max-size="ath.FileMaxSize * 1024"
          :accept="accept"
          :disabled="ath.IsUpload === 0 || props.isReadonly == true"
          @oversize="onOversize"
          @click-preview="AthView"
          :class="dbList.length > 0 ? 'vant-upload' : ''"
        >
          <template #preview-cover="{ file }">
            <div class="preview-cover van-ellipsis">{{ file.name }}</div>
          </template>
          <Button v-if="ath.IsUpload != 0 || props.isReadonly != true" icon="plus" type="primary" class="van-upload-btn">{{ '上传文件' }}</Button>
        </Uploader>
      </ul>
    </div>
  </template>
  <template v-else>
    <template v-if="ath.FileType === 2">
      <div class="clearfix">
        <template v-if="!!ath.OpenDesc">
          <span style="color: red">{{ ath.OpenDesc }}</span>
        </template>
        <Uploader
          :after-read="(file) => afterRead(file, '')"
          :before-read="beforeUpload"
          multiple
          :max-count="ath.TopNumOfUpload"
          :max-size="ath.FileMaxSize * 1024"
          :accept="accept"
          :disabled="ath.IsUpload === 0 || props.isReadonly == true"
          @oversize="onOversize"
          :class="dbList.length > 0 ? 'vant-upload' : ''"
          :style="isMarginTop ? { marginTop: '46px', marginLeft: '20px' } : { marginLeft: '20px' }"
        >
          <div v-if="dbList.length <= ath.TopNumOfUpload && isUpload">
            <Button><Icon name="plus" />{{ '上传附件' }}</Button>
          </div>
        </Uploader>
        <!-- 自定义图片展示 -->
        <template v-for="item in dbList">
          <div>
            <div style="margin: 5px">
              <div
                style="
                  position: relative;
                  height: 66px;
                  padding: 8px;
                  border: 1px solid #d9d9d9;
                  border-radius: 8px;
                  margin-top: 8px;
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  transition: background-color 0.3s;
                "
              >
                <a
                  style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 48px; height: 48px; line-height: 60px; text-align: center; flex: none"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img :src="item.url" :alt="item.Name" style="display: block; width: 48px; height: 48px; overflow: hidden" @click="handlePreview(item)" />
                </a>
                <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 0 8px; line-height: 1.5714285714285714; flex: auto; transition: all 0.3s">
                  <a rel="noopener noreferrer" :title="item.Name" href="javaScript:void(0)" @click="DownLoad(item)">{{ item.Name }}</a>
                  <br />
                  <span>经度:{{ item.latitude }}</span> | <span>纬度:{{ item.longitude }}</span> | <span>方位角:{{ item.direction }}</span>
                </div>
                <span class="ant-upload-list-item-actions picture"
                  ><Icon
                    name="delete-o"
                    @click="
                      isShowConfigDialog = true;
                      selectAth = item;
                    "
                  />
                </span>
                <div class="ant-upload-list-item-progress" style="display: none"><!----></div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
    <Uploader
      v-else
      v-model="dbList"
      :after-read="(file) => afterRead(file, '')"
      :before-read="beforeUpload"
      multiple
      :max-count="ath.TopNumOfUpload"
      :max-size="ath.FileMaxSize * 1024"
      :accept="accept"
      :disabled="ath.IsUpload === 0 || props.isReadonly == true"
      @oversize="onOversize"
      @click-preview="AthView"
      :class="dbList.length > 0 ? 'vant-upload' : ''"
      :style="isMarginTop ? { marginTop: '46px' } : {}"
    >
      <template #preview-cover="{ file }">
        <div class="preview-cover van-ellipsis">{{ file.name }}</div>
      </template>
      <Button v-if="ath.IsUpload != 0 || props.isReadonly != true" icon="plus" type="primary" class="van-upload-btn">{{ '上传文件' }}</Button>
    </Uploader>
  </template>
  <Popup v-model:show="popModal.visible" position="right" class="modal-iframe">
    <NavBar style="background-color: #4356ff" :title="popModal.title" :fixed="true" left-arrow @click-left="IsOk" />
    <iframe
      v-if="popModal.visible && popModal.modalType == 'AthViewFile'"
      :src="iframeAthView"
      scrolling="auto"
      frameborder="no"
      class="modal-iframe"
      style="margin-top: 46px"
    ></iframe>
  </Popup>
  <Popup v-model:show="popModalImg.visible" position="center">
    <img v-if="popModalImg.visible && popModalImg.modalType == 'AthViewImg'" style="width: 100%; height: 100%; object-fit: contain" :src="previeImgUrl" />
  </Popup>
  <Dialog
    :title="'删除附件'"
    v-model:show="isShowConfigDialog"
    :showCancelButton="true"
    :confirm-button-text="'确认'"
    :cancel-button-text="'取消'"
    @confirm="onConfirm"
    @cancel="isShowConfigDialog = false"
    ><div style="padding: 26px">{{ '你确定要删除该附件吗?' }}</div></Dialog
  >
</template>
<script lang="ts" setup>
  import { Uploader, Button, Popup, NavBar, showFailToast, Dialog, Icon } from 'vant';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { reactive, ref } from 'vue';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getAppEnvConfig } from '/@/utils/env';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import { AtPara } from '/@/bp/da/AtPara';
  import * as Exifr from 'exifr';
  import Dev2InterfaceAth from '/@/WF/CCForm/Dev2InterfaceAth';
  import { message } from 'ant-design-vue';
  const props = defineProps({
    athInfo: {
      type: Object,
      default: () => {
        return {};
      },
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
      default: '',
    },
    isMarginTop: {
      type: Boolean,
      default: false,
    },
  });
  interface SortItem {
    value: string;
    SortList: any;
  }
  const { VITE_GLOB_PLATFORM, VITE_GLOB_API_URL, VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  const previeImgUrl = ref('');
  //附件属性
  const ath = ref<Record<string, any>>({});
  //附件集合
  const dbList = ref<Record<string, any>[]>([]);
  const isUpload = ref(false);
  const uploadURL = ref('');
  const actionURL = ref('');
  const accept = ref('*.*');
  const sorts = ref<SortItem[]>([]);
  const isShowConfigDialog = ref(false);
  const selectAth = ref<Record<string, any>>();

  const photoInfo = {
    longitude: '',
    latitude: '',
    direction: '',
  };
  const popModalImg = reactive({
    visible: false,
    title: '',
    modalType: 'Pop',
  });
  const PopIframeImg = () => {
    popModalImg.visible = true;
    popModalImg.modalType = 'AthViewImg';
  };
  const appNo = localStorage.getItem('GJPT-AppNo');
  if (appNo == '66138-410116-95714') {
    window.addEventListener('message', (e) => {
      if (e.data._fun == 'coordinates') {
        const { longitude, latitude, direction } = e.data.data;
        photoInfo.latitude = latitude;
        photoInfo.longitude = longitude;
        photoInfo.direction = direction;
      }
    });
  }

  const InitPage = async () => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      handler.AddPara('IsReadonly', props.isReadonly);
      handler.AddPara('FK_FrmAttachment', props.athInfo.MyPK);
      handler.AddPara('FrmID', props.athInfo.FK_MapData);
      const data = await handler.DoMethodReturnString('Ath_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        showFailToast(data.replace('err@', ''));
        return;
      }

      //附件属性
      ath.value = data['AthDesc'][0];
      //附件集合
      data['DBAths'].forEach((item) => {
        if (props.isReadonly == false) {
          if (parseInt(ath.value.DeleteWay) == 2 && item.Rec == WebUser.No) item.deletable = true;
          else if (ath.value.DeleteWay == 1) item.deletable = true;
          else item.deletable = false;
        } else item.deletable = false;
        let latitude = 0;
        let longitude = 0;
        let direction = '';
        if (ath.value.FileType === 2) {
          const atPara = new AtPara(item.AtPara);
          latitude = atPara.GetValStrByKey('Latitude');
          longitude = atPara.GetValStrByKey('Longitude');
          direction = atPara.GetValStrByKey('Direction');
        }
        if (!!item.Sort) {
          dbList.value.push({
            url: GetFileUrl(item.MyPK),
            file: new File([], item.FileName, {}),
            MyPK: item.MyPK,
            Name: item.FileName,
            FileExts: item.FileExts,
            deletable: item.deletable,
            isImage: IsImage(item.FileExts),
            FileFullName: item.FileFullName,
            Sort: item.Sort,
            latitude: latitude,
            longitude: longitude,
            direction: direction,
            beforeDelete: () => {
              isShowConfigDialog.value = true;
              selectAth.value = item;
            },
          });
        } else {
          dbList.value.push({
            url: GetFileUrl(item.MyPK),
            file: new File([], item.FileName, {}),
            MyPK: item.MyPK,
            Name: item.FileName,
            FileExts: item.FileExts,
            deletable: item.deletable,
            isImage: IsImage(item.FileExts),
            FileFullName: item.FileFullName,
            latitude: latitude,
            longitude: longitude,
            direction: direction,
            beforeDelete: () => {
              isShowConfigDialog.value = true;
              selectAth.value = item;
            },
          });
        }
      });
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

      //可上传附件的类型
      GetStringAccept();
      //是否可以上传
      isUpload.value = ath.value.IsUpload == true && props.isReadonly == false;
      //关联主键
      const pkvalue = props.PKValue == '' ? props.params.WorkID : props.PKValue;

      const prefix = import.meta.env.MODE === 'development' ? '/api/' : basePath;
      const apiPath = VITE_GLOB_PLATFORM === 'CCFLOW' ? 'WF/Comm/ProcessRequest' : 'WF/Ath/AttachmentUploadS.do';
      //上传请求的URL
      actionURL.value =
        prefix +
        apiPath +
        '?DoType=HttpHandler&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&DoMethod=MoreAttach&AttachPK=' +
        ath.value.MyPK +
        '&FK_FrmAttachment=' +
        ath.value.MyPK +
        '&FrmID=' +
        ath.value.FK_MapData +
        GetParamsUrl(props.params) +
        '&PKVal=' +
        pkvalue;
      uploadURL.value = actionURL.value;
    } catch (e) {
    } finally {
    }
  };
  InitPage();

  const handlePreview = async (file: UploadProps['fileList'][number]) => {
//    debugger;
    PopIframeImg();
    previeImgUrl.value = file.url;
  };
  const onConfirm = async () => {
    isShowConfigDialog.value = false;
    await handlerRemove(selectAth.value);
    selectAth.value = {};
  };
  /**
   * 提示超出上传文件大小信息
   * @param file
   */
  const onOversize = (file) => {
    //通过 max-size 属性可以限制上传文件的大小，超过大小的文件会被自动过滤，这些文件信息可以通过 oversize 事件获取。
    window.console.log(file);
    showFailToast({ message: '文件不能超过' + ath.value.FileMaxSize + 'KB' });
  };
  /**
   * 附件上传事件
   * @param file
   */
  const afterRead = async (files, _sort) => {
    if (Array.isArray(files) && files.length > 1) {
      for (let file of files) {
        file.status = 'uploading';
        file.message = '上传中...';
        await uploadFile(file, _sort);
      }
    } else {
      files.status = 'uploading';
      files.message = '上传中...';
      setTimeout(() => {
        uploadFile(files, _sort);
      }, 1000);
    }
  };
  /**
   * 文件上传
   * @param file
   */
  const uploadFile = async (file, sort = '') => {
    let latitude = 0;
    let longitude = 0;
    let direction = '';
    if (ath.value.FileType === 2) {
      let fileW = file.file;
      direction = photoInfo.direction;
      try {
        const tags = await Exifr.parse(fileW, {
          gps: true,
        });
        if (tags.GPSLatitude && tags.GPSLongitude) {
          // latitude = convertToDegree(tags.GPSLatitude, tags.GPSLatitudeRef);
          // longitude = convertToDegree(tags.GPSLongitude, tags.GPSLongitudeRef);
          longitude = tags.longitude;
          latitude = tags.latitude;
        }
        if (tags.GPSImgDirection) {
          direction = tags.GPSImgDirection;
        }
      } catch (error) {
        // message.error('图片不存在ExIF信息');
      }
    }
    // 上传文件
    const pkvalue = props.PKValue == '' ? props.params.WorkID : props.PKValue;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('AttachPK', ath.value.MyPK);
    handler.AddPara('FK_FrmAttachment', ath.value.MyPK);
    handler.AddPara('FrmID', ath.value.FK_MapData);
    handler.AddPara('PKVal', pkvalue);
    handler.AddFile(file.file);
    handler.AddPara('Sort', sort);
    handler.AddPara('OrgNo', WebUser.OrgNo);
    if (ath.value.FileType === 2) {
      handler.AddPara('Latitude', latitude);
      handler.AddPara('Longitude', longitude);
      handler.AddPara('Direction', direction);
    }
    const data: any = await handler.DoMethodReturnString('MoreAttach');
    if (data.msg.includes('err@')) {
      showFailToast(data.replace('err@', ''));
      file.status = 'failed';
      return false;
    }
    //判断是否需要加入kkfile队列
    if (CommonConfig.IsOnlinePreviewOfAth && CommonConfig.IsAddTaskOfKKFile) {
      await Dev2InterfaceAth.AddTaskOfKKFile(data.FileFullName);
    }
    file.status = 'done';
    dbList.value = [];
    await InitPage();
  };
  const convertToDegree = (coordinates, ref) => {
    let degree = 0;
    const refs = {
      N: 'north',
      S: 'south',
      E: 'east',
      W: 'west',
    };

    if (coordinates && ref && refs[ref.charAt(0)]) {
      degree = coordinates.reduce((a, b) => a + b) / coordinates.length;
      if (ref.charAt(0) === 'S' || ref.charAt(0) === 'W') {
        degree = degree * -1;
      }
    }
    return degree;
  };
  /**
   * 获取可以上传的附件格式
   * @constructor
   */
  const GetStringAccept = () => {
    if (ath.value.FileType === 1) {
      accept.value = 'image/*';
      return;
    }
    if (ath.value.FileType === 2) {
      accept.value = 'image/*';
      return;
    }
    if (ath.value.FileType === 3) {
      accept.value = 'image/JPG,image/JPEG,image/PNG';
      return;
    }
    let exts = ath.value.Exts || '';
    if (exts === '' || exts === '*') accept.value = '*.*';
    else accept.value = exts.replace(/[*]/g, '');
  };
  /**
   * 附件上传验证
   */
  const beforeUpload = (file) => {
    let dataArray: any[] = [];
    let isUpload = true;
    if (!Array.isArray(file)) {
      dataArray.push(file);
    } else {
      dataArray = [...file];
    }

    if (dataArray.length > 0) {
      try {
        dataArray.forEach((item) => {
     //     debugger;
          if (ath.value.FileType === 1 || ath.value.FileType === 2 || ath.value.FileType === 3) {
            if (!item.type.includes('image')) {
              showFailToast('只允许上传图片文件!');
              isUpload = false;
              throw '终止循环,文件不符合要求'; // 抛出一个异常
            }
          }
          var fileExt = item.name.replace(/.+\./, '').toLowerCase();

          if (['bat', 'exe'].indexOf(fileExt) > -1) {
            showFailToast('不允许上传exe,bat文件');
            isUpload = false;
            throw '终止循环,文件不符合要求'; // 抛出一个异常
          }

          //判断是否是海南配置
          if (CommonConfig.IsHN) {
            if (ath.value.Exts != '' && accept.value != '*.*' && !ath.value.Exts.toLowerCase().includes(fileExt)) {
              showFailToast('文件类型不符合要求');
              isUpload == false;
              throw '终止循环,文件不符合要求'; // 抛出一个异常
            }
          }

          const isSelectSort = sorts.value.length > 0 || sorts.value.length == 0;
          const isMaxFile = dbList.value.length < ath.value.TopNumOfUpload;
          if (isMaxFile == false) {
            showFailToast('上传的附件数量不能大于' + ath.value.TopNumOfUpload);
          }
          if (!(isSelectSort && isMaxFile)) {
            isUpload = false;
            throw '终止循环,文件不符合要求'; // 抛出一个异常
          }
        });
      } catch (error) {
        console.log('catch内容:' + error); // catch内容：终止循环
      }
      return isUpload;
    }
  };
  const handlerRemove = async (file) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('DelPKVal', file.MyPK);
    const data = await handler.DoMethodReturnString('AttachmentUpload_Del');
    if (typeof data == 'string' && data.includes('err@') == true) {
      showFailToast(data.replace('err@', ''));
      return;
    }
    dbList.value.forEach((item, index) => {
      if (item.MyPK === file.MyPK) {
        dbList.value.splice(index, 1);
      }
    });
    return false;
  };
  /**
   * 下载文件
   * @param record
   * @constructor
   */
  const DownLoad = (file) => {
    //如果是图片只预览
    if (typeof file.MyPK !== 'undefined') {
      //之前上传的文件
      if (IsImage(file.FileExts) == true) return true;
      const url = ref('');
      url.value = GetFileUrl(file.MyPK);
      downloadByUrl({ url: url.value });
      return;
    }
    if (file.file.type.startsWith('image/')) return true;
    const url = ref('');
    url.value = GetFileUrl(file.MyPK);
    downloadByUrl({ url: url.value });
  };

  const IsImage = (ext) => {
    const exts = '.gif,.jpg,.jepg,.jpeg,.bmp,.png,.tif,.gsp';
    return exts.includes(ext.toLowerCase());
  };
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
  /**
   * 删除文件
   * @param record
   * @constructor
   */
  const Delete = async (record) => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('DelPKVal', record.MyPK);
    const data = await handler.DoMethodReturnString('AttachmentUpload_Del');
    if (typeof data == 'string' && data.includes('err@') == true) {
      showFailToast(data.replace('err@', ''));
      return;
    }
    await InitPage();
  };
  //检查附件上传数量
  const CheckAth = (isMustUpload = false) => {
    if (isMustUpload && dbList.value.length == 0) {
      message.error(ath.value.Name + '上传的附件数量不能为空');
      return false;
    }
    const uploadFileNumCheck = ath.value.UploadFileNumCheck;
    if (uploadFileNumCheck == 1 && dbList.value.length == 0) {
      showFailToast(ath.value.Name + '上传的附件数量不能为空');
      return false;
    }
    //每个类别下不能为空
    if (sorts.value.length != 0 && uploadFileNumCheck == 2) {
      let msg = '';
      for (const sort of sorts.value) {
        if (sort.SortList.length == 0) {
          msg += '类别[' + sort.value + ']下的附件不能为空;';
        }
      }
      if (!!msg) {
        showFailToast(msg);
        return false;
      }
    }
    const isMaxFile = dbList.value.length > ath.value.TopNumOfUpload;
    if (isMaxFile == true) {
      showFailToast(ath.value.Name + '上传的附件数量不能大于' + ath.value.TopNumOfUpload);
      return false;
    }
    const isMinFile = dbList.value.length < ath.value.NumOfUpload;
    if (isMinFile == true) {
      showFailToast(ath.value.Name + '上传的附件数量不能小于' + ath.value.NumOfUpload);
      return false;
    }
    return true;
  };
  const iframeAthView = ref('');
  //文件预览
  const AthView = (record) => {
    if (['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'].includes(record.FileExts.toLowerCase())) {
      return;
    }
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
    DownLoad(record.MyPK);
  };

  const setBase64 = (input) => {
    let _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    input = utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  };

  const utf8_encode = (input) => {
    input = input.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < input.length; n++) {
      let c = input.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: 'Pop',
  });
  const PopIframe = (type: string, title: string) => {
    popModal.visible = true;
    popModal.modalType = type;
    popModal.title = title;
  };
  const IsOk = () => {
    popModal.visible = false;
  };
  defineExpose({ CheckAth, dbList, InitPage });
</script>

<style lang="less">
  .vant-upload {
    background-color: white;
    margin: 0px 16px;
    width: calc(100% - 32px);
    padding: 10px;
    border-radius: 8px;
  }
  .preview-cover {
    position: absolute;
    bottom: 0;
    box-sizing: border-box;
    width: 100%;
    padding: 4px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    background: rgba(0, 0, 0, 0.3);
  }
  .van-uploader__file-name {
    display: none;
  }
  .van-uploader__input-wrapper {
    display: flex;
    align-items: center;
  }
  .van-uploader__wrapper {
    margin-top: 45px;
  }
  .van-upload-btn {
    margin: 10px;
  }
  .modal-iframe {
    width: 100%;
    height: 100%;
  }
</style>
