<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <template v-if="ath.FileType === 1">
          <template v-if="!!ath.OpenDesc">
            <span style="color: red">{{ ath.OpenDesc }}</span>
          </template>
          <!--只上传图片展示-->
          <template v-if="isUpload">
            <Upload
              v-model:file-list="dbList"
              list-type="picture-card"
              :action="actionURL"
              :before-upload="beforeUpload"
              :accept="accept"
              :multiple="true"
              @preview="handlePreview"
              @change="handleChange"
              @remove="handlerRemove"
              :customRequest="customRequest"
            >
              <div v-if="dbList.length <= ath.TopNumOfUpload && isUpload">
                <PlusOutlined />
              </div>
            </Upload>
          </template>
          <!-- 图片预览 -->
          <template v-else>
            <NImageGroup :render-toolbar="renderToolbar">
              <NSpace>
                <NImage v-for="db in dbList" :key="db.MyPK" :height="200" :src="db.url" />
              </NSpace>
            </NImageGroup>
          </template>
          <Modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel" :width="previewWidth">
            <img alt="example" style="width: 100%" :src="previewImage" />
          </Modal>
        </template>
        <template v-if="ath.FileType === 2">
          <div class="clearfix">
            <Upload
              v-model:file-list="dbList"
              :action="actionURL"
              :before-upload="beforeUpload"
              :accept="accept"
              :multiple="true"
              list-type="picture"
              @preview="handlePreview"
              @change="handleChange"
              @remove="handlerRemove"
              @download="DownLoad"
              :customRequest="customRequest"
            >
              <div v-if="dbList.length <= ath.TopNumOfUpload && isUpload">
                <Button><PlusOutlined />{{ '上传附件' }}</Button>
              </div>
              <template v-if="!!ath.OpenDesc">
                <span style="color: red">{{ ath.OpenDesc }}</span>
              </template>
              <template #itemRender="{ file, actions }">
                <div class="ant-upload-list ant-upload-list-picture">
                  <div class="ant-upload-list-item-container">
                    <div class="ant-upload-list-item ant-upload-list-item-undefined">
                      <a class="ant-upload-list-item-thumbnail" :href="file.url" target="_blank" rel="noopener noreferrer">
                        <img :src="file.url" :alt="file.name" class="ant-upload-list-item-image" @click="actions.preview" />
                      </a>
                      <div class="ant-upload-list-item-name">
                        <a rel="noopener noreferrer" :title="file.name" href="javaScript:void(0)" @click="actions.download">{{ file.name }}</a>
                        <br />
                        <span>经度:{{ file.latitude }}</span> | <span>纬度:{{ file.longitude }}</span> | <span>方位角:{{ file.direction }}</span>
                      </div>
                      <span class="ant-upload-list-item-actions picture"> <DeleteOutlined @click="actions.remove" /> </span>
                      <div class="ant-upload-list-item-progress" style="display: none"><!----></div>
                    </div>
                  </div>
                </div>
              </template>
            </Upload>
          </div>
        </template>
        <template v-if="ath.FileType === 0">
          <template v-if="!!ath.OpenDesc">
            <span style="color: red">{{ ath.OpenDesc }}</span>
          </template>
          <div ref="tableRef">
            <Table :columns="columns" :data-source="dbList" tableLayout="auto" bordered size="small" :row-key="(record) => record.MyPK" :pagination="false" :scroll="{ y: 300 }">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'Oper'">
                  <Button v-if="ath.IsDownload === '1'" type="link" @click="DownLoad(record)">
                    <DownloadOutlined />
                  </Button>
                  <template v-if="ath.AthEditType == 3">
                    <Button
                      v-if="
                        !AthReadonly && (record.FileExts === 'xls' || record.FileExts === 'xlsx' || record.FileExts === 'doc' || record.FileExts === 'docx') && ath.DeleteWay != 0
                      "
                      type="link"
                      @click="onLineEditForOFFICE(record)"
                      class="editBtn"
                    >
                      <img src="/resource/edit/office.png" alt="" style="width: 13px; height: 13px" />
                    </Button>
                    <Button
                      v-if="!AthReadonly && (record.FileExts === 'doc' || record.FileExts === 'docx') && ath.DeleteWay != 0"
                      type="link"
                      @click="onLineEditForWPS(record)"
                      class="editBtn"
                    >
                      <img src="/resource/edit/wps.png" alt="" />
                    </Button>
                  </template>
                  <template v-if="ath.AthEditType != 0 && ath.AthEditType != 3">
                    <Button
                      v-if="
                        !AthReadonly && (record.FileExts === 'xls' || record.FileExts === 'xlsx' || record.FileExts === 'doc' || record.FileExts === 'docx') && ath.DeleteWay != 0
                      "
                      type="link"
                      @click="onLineEdit(record)"
                      ><i class="icon-note"></i
                    ></Button>
                  </template>
                  <Popconfirm
                    v-if="!AthReadonly && (ath.DeleteWay == 1 || (ath.DeleteWay == 2 && record.Rec == WebUser.No))"
                    :title="'你确定要删除该文件吗?'"
                    :ok-text="'确定'"
                    :cancel-text="'取消'"
                    @confirm="Delete(record)"
                  >
                    <Button type="link" style="vertical-align: middle"><i class="icon-close"></i></Button>
                  </Popconfirm>
                </template>
              </template>
            </Table>
          </div>
          <div class="upload-modal-toolbar" style="margin: 5px">
            <!--表格展示-->
            <div>
              <Select v-if="sorts.length > 0" v-model:value="sortSelect" :placeholder="'选择附件分类'" style="width: 160px" @change="ChangeActionURL">
                <SelectOption v-for="item in sorts" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectOption>
              </Select>
            </div>
            <Upload
              name="file"
              :accept="accept"
              :action="actionURL"
              :multiple="true"
              :showUploadList="false"
              :before-upload="beforeUpload"
              @change="handleChange"
              :customRequest="customRequest"
              class="upload-modal-toolbar__btn"
            >
              <Button v-if="isUpload" type="primary">{{ '选择文件' }}</Button>
            </Upload>
          </div>
        </template>
        <template v-if="ath.FileType === 3">
          <Row>
            <Col v-for="(item, idx) in dbList" class="uploadant" :key="idx">
              <div class="image-item" :style="{ backgroundImage: 'url(' + item.url + ')' } as StyleValue" @click="DownLoad(item)">
                <div v-if="!AthReadonly && (ath.DeleteWay == 1 || (ath.DeleteWay == 2 && item.Rec == WebUser.No))" class="image-close" @click="Delete(item)">X</div>
              </div>
            </Col>
            <Col class="uploadant">
              <Upload
                name="file"
                :accept="accept"
                :action="actionURL"
                :multiple="true"
                :showUploadList="false"
                :before-upload="beforeUpload"
                @change="handleChange"
                :customRequest="customRequest"
                class="signUpload"
              >
                <div v-if="dbList.length <= ath.TopNumOfUpload && isUpload">
                  <PlusOutlined />
                </div>
              </Upload>
            </Col>
          </Row>
        </template>
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
          <div v-if="modal.modalType === 'onLineEdit'">
            <ul class="tb_style_ul">
              <li></li>
              <li></li>
              <li></li>
              <li class="tb_style_li" style="text-align: center; font-weight: bolder">
                <a :href="vstoUrl">{{ '启动office文档在线编辑' }}</a></li
              >
              <li></li>
              <li></li>
              <li></li>
              <li></li>

              <li>1.使用vsto插件在线编辑附件,可以直接保存,实现在线编辑.</li>
              <li>2.对doc,docx,.xls,xlsx 结尾的office文档有效.</li>
              <li>3.要求本机上安装office或者wps软件.</li>
              <li>4.如果是第一次使用，就必须下载安装该插件</li>
              <li
                >5. <a :href="vsToZip">{{ '下载VSSTO安装程序' }}</a></li
              >
            </ul>
          </div>
        </Modal>
        <!-- 预览->抽屉打开iframe -->
        <!--右侧滑出-->
        <Modal
          :open="drawerVisible"
          centered
          :title="modal.modalTitle"
          :width="'70vw'"
          destroy-on-close
          :body-style="{ height: 'calc(100vh - 55px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }"
          @cancel="drawerClose"
        >
          <div style="width: 50%; height: 100%">
            <iframe v-if="modal.modalType == 'AthViewFile'" :src="iframeAthView" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
          </div>
        </Modal>
        <Modal
          :open="previewVisible"
          :title="previewTitle"
          :footer="null"
          @cancel="handleCancel"
          :width="'70vw'"
          :style="{ top: '0', paddingBottom: '0' }"
          :body-style="{ height: 'calc(100vh - 55px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }"
        >
          <div class="full-modal-cont">
            <img alt="example" class="full-modal-img" :src="previewImage" />
          </div>
        </Modal>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { Upload, message, Button, Spin, Select, SelectOption, Modal, Table, Popconfirm, Drawer, Row, Col, ImagePreviewGroup, Image as AImage } from 'ant-design-vue';
  import { PlusOutlined, DownloadOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { computed, createVNode, h, onUnmounted, reactive, ref, shallowRef, StyleValue, watch } from 'vue';
  import type { UploadChangeParam, UploadFile } from 'ant-design-vue';
  import { GetParamsUrl } from '/@/utils/gener/StringUtils';
  import { FrmAttachmentDB } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
  import WebUser from '/@/bp/web/WebUser';
  import { getAppEnvConfig } from '/@/utils/env';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import * as Exifr from 'exifr';
  import { AtPara } from '/@/bp/da/AtPara';
  import Sortable from 'sortablejs';
  import Dev2InterfaceAth from './Dev2InterfaceAth';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ImageRenderToolbarProps, NImage, NImageGroup, NSpace } from 'naive-ui';
  const { t } = useI18n();
  const { VITE_PUBLIC_PATH, VITE_GLOB_PLATFORM, VITE_GLOB_API_URL, VITE_GLOB_PREVIEW_URL } = getAppEnvConfig();
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
      type: [Number, String],
      default: '0',
    },
  });
  interface SortItem {
    value: string;
    label: string;
  }

  interface FrmAttachmentDBExt extends FrmAttachmentDB {
    RowSpan: number;
    url: string;
  }
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);

  const tableRef = shallowRef<HTMLElement>();

  const AthReadonly = computed(() => (typeof props.isReadonly === 'string' ? parseInt(props.isReadonly) : props.isReadonly) || parseInt(props.params.IsReadonly || '0'));

  //附件属性
  const ath = ref<Record<string, any>>({});
  //附件集合
  const dbList = ref<FrmAttachmentDBExt[]>([]);
  const columns = ref<any[]>([]);
  const isUpload = ref(false);
  const uploadURL = ref('');
  const actionURL = ref('');
  const accept = ref('*.*');
  const sorts = ref<SortItem[]>([]);
  const sortSelect = ref(undefined);
  const vsToZip = ref();
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
  //抽屉打开侧滑显示
  const drawerVisible = ref<boolean>(false);
  const drawerClose = () => {
    drawerVisible.value = false;
  };

  //图片附件属性
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');
  const previewWidth = window.innerWidth * 0.4;
  const vstoUrl = ref();
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  const getFileTypeIcon = (fileExt) => {
    return `${VITE_PUBLIC_PATH}resource/FileType/${fileExt}.gif`;
  };
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      handler.AddPara('RefOID', props.PKValue === '0' ? props.params.PKVal : props.PKValue);
      handler.AddPara('IsReadonly', AthReadonly.value);
      handler.AddPara('FK_FrmAttachment', props.athInfo?.MyPK || props.params.FK_FrmAttachment);
      handler.AddPara('FrmID', props.athInfo?.FK_MapData || props.params.FrmID);
      const data = await handler.DoMethodReturnString('Ath_Init');
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
              label: item,
            });
          }
        });
      }

      if (dbList.value.length > 0) {
        dbList.value.forEach((item) => {
          if (ath.value.FileType === 2) {
            const atPara = new AtPara(item.AtPara);
            const latitude = atPara.GetValStrByKey('Latitude');
            const longitude = atPara.GetValStrByKey('Longitude');
            const direction = atPara.GetValStrByKey('Direction');
            item.name = item.FileName;
            item.latitude = latitude;
            item.longitude = longitude;
            item.direction = direction;
          }
          item.previewUrl = GetFileUrl(item.MyPK);
          item.FileSize = item.FileSize.toFixed(2);
          if (ath.value.FileType === 2 || ath.value.FileType === 3) {
            item.url = item.previewUrl;
          }
          if (ath.value.FileType === 1)
            getBase64(item.previewUrl).then(
              (base64) => {
                item.url = (base64 as string) || item.previewUrl;
              },
              (err) => {
                console.log(err);
                item.url = item.previewUrl;
              },
            );
        });
      }

      if (sorts.value.length > 0) {
        const db = dbList.value.reduce((accumulator, current) => {
          const key = current.Sort; // 获取当前元素的age属性值作为key

          if (!accumulator[key]) {
            accumulator[key] = []; // 如果该key不存在于结果集合中，则创建新的空数组
          }

          accumulator[key].push(current); // 将当前元素添加到相应的group中

          return accumulator;
        }, {});
        dbList.value = [];
        for (const dbElement in db) {
          dbList.value = dbList.value.concat(db[dbElement]);
        }
        const rowMerge: number[] = mergeCells('Sort');
        dbList.value.forEach((item, idx) => {
          item.RowSpan = rowMerge[idx];
          item.FileSize = item.FileSize.toFixed(2);
        });
      }
      if (columns.value.length != 0) return;
      //移除上传btn的ID,否则造成字段附件点击文本上传
      const element = document.getElementById('form_item_' + ath.value.NoOfObj);
      if (element != null) element.setAttribute('id', '');
      //可上传附件的类型
      GetStringAccept();
      //是否可以上传
      isUpload.value = ath.value.IsUpload == true && !AthReadonly.value;
      //关联主键
      let pkvalue = props.PKValue === '0' ? props.params.WorkID : props.PKValue;
      pkvalue = pkvalue === '0' ? props.params.PKVal : pkvalue;

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
      columns.value.push({
        title: '#',
        dataIndex: 'Idx',
        key: 'Idx',
        width: 50,
        customRender: ({ index }) => {
          return index + 1;
        },
      });
      if (sort != '')
        columns.value.push({
          title: '类别',
          dataIndex: 'Sort',
          key: 'Sort',
          customCell: (record) => {
            return { rowSpan: record.RowSpan, colSpan: record.RowSpan == 0 ? 0 : 1 };
          },
        });
      columns.value.push({
        title: '文件名',
        dataIndex: 'FileName',
        key: 'FileName',
        align: 'left',
        width: 200,
        customRender: ({ text, record }) => {
          return h(
            'div',
            {
              onClick: () => {
                if (['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'webp'].includes(record.FileExts.toLowerCase())) {
                  if (ath.value.AthSaveWay == 6) {
                    handleKingsoftPreview(record);
                  } else {
                    handlePreview(record);
                  }
                } else {
                  AthView(record);
                }
              },
              style: { display: 'flex', color: '#1890FF', cursor: 'pointer', wordBreak: 'break-all' },
            },
            [
              h('img', {
                src: getFileTypeIcon(record.FileExts.toLowerCase()),
                style: { marginRight: '5px', width: '20px', height: '20px', objectFit: 'none' },
                onError: DefaultIconImg,
              }),
              h('div', {}, text),
            ],
          );
        },
      });
      columns.value.push({
        title: '上传日期',
        dataIndex: 'RDT',
        key: 'RDT',
        width: 150,
      });
      columns.value.push({
        title: '上传人',
        dataIndex: 'RecName',
        key: 'RecName',
        width: 100,
      });
      columns.value.push({
        title: '大小(MB)',
        dataIndex: 'FileSize',
        key: 'FileSize',
        width: 100,
        customRender: ({ text }) => {
          // 将 KB 转换为 MB
          const textKB = parseFloat(text);
          return !!textKB ? (textKB / 1024).toFixed(4) : 0;
        },
      });
      columns.value.push({
        title: '操作',
        dataIndex: 'Oper',
        key: 'Oper',
        fixed: 'right',
        align: 'center',
        width: 200,
      });
      //移动
      if (!!ath.value.IsIdx) await initSortable();
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
    vsToZip.value = 'http://eyer.ccbpm.cn/DownLoad/vstoinstall.exe';
  };

  InitPage();

  watch(
    () => props?.PKValue,
    (val) => {
      if (!val) return;
      InitPage();
    },
  );

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
      accept.value = 'image/JPG,image/JPEG,image/TIFF';
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
   * @param file
   */
  const beforeUpload = async (file) => {
    if (ath.value.FileType === 1 || ath.value.FileType === 2 || ath.value.FileType === 3) {
      if (!file.type.includes('image')) {
        message.error('只允许上传图片文件!');
        //dbList.splice(index, 1);
        return Upload.LIST_IGNORE; // 阻止上传
      }
    }
    var fileExt = file.name.replace(/.+\./, '').toLowerCase();

    if (['bat', 'exe'].indexOf(fileExt) > -1) {
      message.error('不允许上传exe,bat文件');
      return Upload.LIST_IGNORE; // 阻止上传
    }

    //判断是否是海南配置
    if (CommonConfig.IsHN) {
      const validFileTypes = accept.value.toLowerCase().split(',');
      if (!validFileTypes.includes('*.*') && !accept.value.toLowerCase().includes(fileExt)) {
        message.error('文件类型不符合要求');
        file.status = 'removed';
        return false;
      }
    }
    const isSelectSort = (sorts.value.length > 0 && sortSelect.value != '' && sortSelect.value !== undefined) || sorts.value.length == 0;
    if (isSelectSort == false) {
      message.error('请选择类别后再上传附件');
    }
    const isMaxSize = file.size / 1024 <= ath.value.FileMaxSize;
    if (isMaxSize == false) {
      message.error('上传的附件不能大于' + ath.value.FileMaxSize / 1024 + 'M');
    }

    const isMaxFile = dbList.value.length < ath.value.TopNumOfUpload;
    if (isMaxFile == false) {
      message.error('上传的附件数量不能大于' + ath.value.TopNumOfUpload);
    }

    return isSelectSort && isMaxSize && isMaxFile;
  };

  const ChangeActionURL = (value) => {
    actionURL.value = uploadURL.value + '&Sort=' + value;
  };
  const handleChange = (info: UploadChangeParam) => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      InitPage();
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败.`);
    }
  };

  const customRequest = async (data) => {
    let latitude = 0;
    let longitude = 0;
    let direction = '';
    if (ath.value.FileType === 2) {
      let file = data.file;
      try {
        const tags = await Exifr.parse(file, {
          gps: true,
        });
        if (tags.GPSLatitude && tags.GPSLongitude) {
          // latitude = convertToDegree(tags.GPSLatitude, tags.GPSLatitudeRef);
          // longitude = convertToDegree(tags.GPSLongitude, tags.GPSLongitudeRef);
          longitude = tags.longitude;
          latitude = tags.latitude;
        }
      } catch (error) {
        // message.error('图片不存在ExIF信息');
      }
    }
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('FK_FrmAttachment', ath.value.MyPK);
      handler.AddPara('AttachPK', ath.value.MyPK);
      handler.AddPara('FrmID', ath.value.FK_MapData);
      handler.AddJson(props.params);
      let pkvalue = props.PKValue === '0' ? props.params.WorkID : props.PKValue;
      pkvalue = pkvalue == undefined || pkvalue === '0' ? props.params.PKVal : pkvalue;
      handler.AddPara('PKVal', pkvalue);
      handler.AddFile(data.file);
      handler.AddPara('Sort', sortSelect.value);
      handler.AddPara('OrgNo', WebUser.OrgNo);
      if (ath.value.FileType === 2) {
        handler.AddPara('Latitude', latitude);
        handler.AddPara('Longitude', longitude);
        handler.AddPara('Direction', direction);
      }
      const result: any = await handler.DoMethodReturnString('MoreAttach');
      console.log('cuostomRequest', '文件上传');

      if (result.msg.includes('err@')) {
        message.error(result.msg.replace('err@', ''));
        return;
      }
      //判断是否需要加入kkfile队列
      if (CommonConfig.IsOnlinePreviewOfAth && CommonConfig.IsAddTaskOfKKFile) {
        await Dev2InterfaceAth.AddTaskOfKKFile(result.FileFullName);
      }
    } catch (e: any) {
      message.error(e);
    } finally {
      loading.value = false;
    }
    await InitPage();
  };
  // const convertToDegree = (coordinates, ref) => {
  //   let degree = 0;
  //   const refs = {
  //     N: 'north',
  //     S: 'south',
  //     E: 'east',
  //     W: 'west',
  //   };

  //   if (coordinates && ref && refs[ref.charAt(0)]) {
  //     degree = coordinates.reduce((a, b) => a + b) / coordinates.length;
  //     if (ref.charAt(0) === 'S' || ref.charAt(0) === 'W') {
  //       degree = degree * -1;
  //     }
  //   }
  //   return degree;
  // };
  const mergeCells = (key) => {
    const redata2 = dbList.value; //表格数据
    const pos2 = ref(0);
    const spanArr = ref<number[]>([]); //合并数数组
    redata2.reduce((old, cur, i) => {
      // old 上一个元素  cur 当前元素  i 索引
      if (i === 0) {
        // 第一次判断先增加一个 1 占位 ，索引为0
        spanArr.value.push(1);
        pos2.value = 0;
      } else {
        if (cur[key] == old[key]) {
          spanArr.value[pos2.value] += 1;
          spanArr.value.push(0);
        } else {
          spanArr.value.push(1);
          pos2.value = i;
        }
      }
      return cur;
    }, {});
    return spanArr.value;
  };
  //图片附件的操作

  function getBase64(img) {
    function getBase64Image(img) {
      //width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
      let canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      let ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL();
      return dataURL;
    }

    let image = new Image();
    image.crossOrigin = '';
    image.src = img;
    return new Promise((resolve, reject) => {
      image.onload = function () {
        resolve(getBase64Image(image)); //将base64传给done上传处理
      };
      image.onerror = (e) => {
        reject(e);
      };
    });
  }

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
      FileFullName: string;
      FileName: string;
      url: string;
    },
  ) => {
    let host = VITE_GLOB_PREVIEW_URL;
    if (!host.endsWith('/') && !host.endsWith('\\')) {
      host = host + '/';
    }
    let fileUrl = file.FileFullName;
    const startIndex = fileUrl.indexOf('DataUser/');
    const relativePath = fileUrl.substring(startIndex);
    let athUrl = relativePath.replace(/\/\//g, '/').replaceAll('\\/', '/').replaceAll('//', '/').replaceAll('\\', '/');
    const previewUrl = host + athUrl;
    if (ath.value.AthSaveWay === 4) previewImage.value = fileUrl;
    else if (ath.value.AthSaveWay === 5) previewImage.value = GetFileUrl(file.MyPK);
    else previewImage.value = previewUrl;
    previewVisible.value = true;
    previewTitle.value = file.FileName || file.url.substring(file.url.lastIndexOf('/') + 1);
  };
  const handlerRemove = async (
    file: UploadFile & {
      MyPK: string;
    },
  ) => {
    Modal.confirm({
      content: '确定要删除此数据吗.',
      icon: createVNode(ExclamationCircleOutlined),
      okText: '确定',
      async onOk() {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        handler.AddPara('DelPKVal', file.MyPK);
        const data = await handler.DoMethodReturnString('AttachmentUpload_Del');
        if (typeof data == 'string' && data.includes('err@') == true) {
          message.error(data.replace('err@', ''));
          return;
        }
        dbList.value.forEach((item, index) => {
          if (item.MyPK === file.MyPK) {
            dbList.value.splice(index, 1);
          }
        });
      },
      onCancel() {
        Modal.destroyAll();
      },
    });

    return false;
  };
  /**
   * 下载文件
   * @param record
   * @constructor
   */
  const DownLoad = (record) => {
    Dev2InterfaceAth.OpenAthGener(record.MyPK);
  };
  const onLineEdit = (record) => {
    if (ath.value.AthEditType == 1) {
      //office插件
      Dev2InterfaceAth.OpenAthAuto(record.MyPK);
    } else {
      // //wps插件
      Dev2InterfaceAth.OpenAthAuto(record.MyPK);
    }
  };

  /**
   * office插件在线编辑
   */
  const onLineEditForOFFICE = (record) => {
    // //office插件
    Dev2InterfaceAth.OpenAthAuto(record.MyPK);
    modalShow('onLineEdit', '在线编辑', window.innerWidth * 0.4, window.innerWidth * 0.3);
  };

  /**
   * WPS插件在线编辑方式
   */
  const onLineEditForWPS = (record) => {
    //wps插件
    Dev2InterfaceAth.OpenAthAuto(record.MyPK);
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
      message.error(data.replace('err@', ''));
      return;
    }
    await InitPage();
  };
  //检查附件上传数量
  const CheckAth = (isMustUpload = false) => {
    if (isMustUpload && dbList.value.length == 0) {
      message.error(ath.value.Name + '上传的附件数量不能为空，请上传附件');
      return false;
    }
    const uploadFileNumCheck = ath.value.UploadFileNumCheck;
    if (uploadFileNumCheck == 1 && dbList.value.length == 0) {
      message.error(ath.value.Name + '上传的附件数量不能为空，请上传附件');
      return false;
    }
    //每个类别下不能为空
    if (sorts.value.length != 0 && uploadFileNumCheck == 2) {
      let msg = '';
      for (const sort of sorts.value) {
        const db = dbList.value.filter((item) => item.Sort === sort.value);
        if (db.length == 0) msg += '类别[' + sort.value + ']下的附件不能为空;';
      }
      if (!!msg) {
        message.error(msg);
        return false;
      }
    }
    const isMaxFile = dbList.value.length > ath.value.TopNumOfUpload;
    if (isMaxFile == true) {
      message.error(ath.value.Name + '上传的附件数量不能大于' + ath.value.TopNumOfUpload);
      return false;
    }
    const isMinFile = dbList.value.length < ath.value.NumOfUpload;
    if (isMinFile == true) {
      message.error(ath.value.Name + '上传的附件数量不能小于' + ath.value.NumOfUpload);
      return false;
    }
    return true;
  };
  const iframeAthView = ref();
  const drawerShow = (type: string, title: string, width: number = window.innerWidth * 0.8) => {
    drawerVisible.value = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
  };
  //文件预览
  const AthView = async (record) => {
    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      iframeAthView.value = await Dev2InterfaceAth.OpenAthKKView(record.MyPK);
      drawerShow('AthViewFile', '预览', window.innerWidth * 1);
      return;
    }
    DownLoad(record.MyPK);
  };
  const modalClose = () => {
    modal.modalVisible = false;
  };

  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
    };
  };

  //TreeEns流程拖拽排序
  let sortablejsRef: Nullable<Sortable> = null;
  // 初始化拖动事件
  const initSortable = async () => {
    setTimeout(async () => {
      const tbodyEl = tableRef.value?.querySelector('.ant-table-body')?.querySelector('tbody');
      if (!tbodyEl) {
        console.error('拖动功能初始化失败');
        return;
      }
      sortablejsRef = new Sortable(tbodyEl, {
        animation: 150,
        dataIdAttr: 'data-row-key',
        onStart: (_ev) => {
          // tableItemInDragStatus.value = true;
        },
        onEnd: async (ev) => {
          console.log({ ev });
          try {
            const sortedList = sortablejsRef?.toArray() || [];
            // 因为这个表格有个隐藏列，需要去掉第1项
            if (sortedList.length < 3) {
              return;
            }
            const targetList = sortedList.slice(1).join(',');
            console.log('targetList', targetList);
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
            handler.AddJson(props.params);
            handler.AddPara('AthMyPKs', targetList);
            await handler.DoMethodReturnString('Ath_SaveIdx');
            setTimeout(() => {
              InitPage();
            }, 16);
          } catch (e: any) {
            message.error(e);
          }
        },
      });
    }, 200);
  };

  // 移除所有拖动事件
  const removeAllSortablejs = () => {
    if (sortablejsRef) {
      sortablejsRef.destroy();
    }
  };
  //附件默认图标
  const DefaultIconImg = (e) => {
    const avatar = 'resource/FileType/file.gif';
    const img = e.srcElement;
    img.src = avatar;
    img.onerror = null;
  };
  const renderToolbar = ({ nodes }: ImageRenderToolbarProps) => {
    return [nodes.prev, nodes.next, nodes.rotateCounterclockwise, nodes.rotateClockwise, nodes.resizeToOriginalSize, nodes.zoomOut, nodes.zoomIn, nodes.close];
  };
  onUnmounted(() => {
    removeAllSortablejs();
  });

  defineExpose({ CheckAth, dbList, InitPage, ath });
</script>

<style scoped lang="less">
  .editBtn {
    padding: 4px 8px;
  }
  .uploadant {
    width: 102px;
    height: 42px;
    text-align: center;
    vertical-align: top;
    border: 1px solid #d9d9d9;
    cursor: pointer;
    transition: border-color 0.3s;
  }
  .signUpload {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
  }
  .image-item {
    margin: 5px;
    width: 92px;
    height: 32px;
    background-size: 100% 100%;
    display: inline-block;
    position: relative;
    border-radius: 5px;
    border: solid 1px #e8e8e8;
  }
  .image-close {
    position: absolute;
    display: inline-block;
    right: -6px;
    top: -6px;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    border-radius: 12px;
    background-color: #a89d9d;
    color: #f3f3f3;
    border: solid 1px #a89d9d;
    font-size: 9px;
    font-weight: 200;
    z-index: 1;
  }
  .full-modal-cont {
    height: calc(100vh);
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .full-modal-img {
    min-width: 100%;
    object-fit: contain;
    width: auto;
    height: auto;
  }
</style>
