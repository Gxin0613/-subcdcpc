<template>
  <div style="background-color: rgb(240, 242, 245); height: 100%">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" :isShowCloseBtn="false" />
      </div>
      <div v-else style="background-color: rgb(240, 242, 245); height: 100%">
        <!--工具栏-->
        <div class="header toolBar" :style="{ minHeight: '55px', zIndex: 100 }">
          <div class="toolbar-wrapper">
            <Form layout="inline" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
              <FormItem>
                <Button class="flow-btn" @click="ClickBtn('Save')">
                  <i :class="GloComm.MyWorkToolbarICON('Save')" class="custom-icon-style"></i>
                  <span>{{ '保存' }}</span>
                </Button>
              </FormItem>
              <FormItem>
                <Button class="flow-btn" @click="ClickBtn('htm')">
                  <i :class="GloComm.MyWorkToolbarICON('PackUp_html')" class="custom-icon-style"></i>
                  <span>{{ '打印Html' }}</span>
                </Button>
              </FormItem>
              <FormItem>
                <Button class="flow-btn" @click="ClickBtn('pdf')">
                  <i :class="GloComm.MyWorkToolbarICON('PackUp_pdf')" class="custom-icon-style"></i>
                  <span>{{ '打印PDF' }}</span>
                </Button>
              </FormItem>
              <FormItem>
                <Button class="flow-btn" @click="ClickBtn('zip')">
                  <i :class="GloComm.MyWorkToolbarICON('PackUp_zip')" class="custom-icon-style"></i>
                  <span>{{ '打印ZIP' }}</span>
                </Button>
              </FormItem>
            </Form>
          </div>
        </div>
        <!--表单内容-->
        <div class="content wrapper" style="width: calc(100% - 230px)">
          <FrmFool v-if="frmData" ref="basicData" :frmData="frmData" :isReadonly="params.isReadonly" :params="params" />
        </div>
      </div>
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
        <div v-if="modal.modalType.includes('Packup')" style="width: 100%; height: 100%">
          <div v-if="IsHtmlPage" style="width: 100%; height: 100%">
            <iframe :src="URL" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
          </div>
          <div v-if="IsPdfPage" style="width: 100%; height: 100%">
            <Card style="width: 100%; height: 100%">
              <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
              <ul>
                <li>{{ 'pdf在线打印与预览' }}</li>
                <li>系统把整个表单生成了一个pdf文件.</li>
                <li
                  >{{ '点击这里' }}<a :href="URL" target="_blank">{{ '进行下载与在线预览' }}</a></li
                >
              </ul>
              <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
            </Card>
          </div>
          <div v-if="IsZipPage" style="width: 100%; height: 100%">
            <Card style="width: 100%; height: 100%">
              <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
              <ul>
                <li>{{ 'zip在线打印与预览' }}</li>
                <li>系统把整个表单生成了一个zip文件,这个文件里包括了,表单的附件，二维码等信息.</li>
                <li
                  >{{ '点击这里' }}<a :href="URL" target="_blank">{{ '进行打包下载' }}</a></li
                >
              </ul>
              <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
            </Card>
          </div>
        </div>
        <div v-else-if="modal.modalType === 'PrintDoc'" style="width: 100%; height: 100%">
          <Card style="width: 100%; height: 100%">
            <template #title> <span style="color: red">提示:如果不能弹出打印窗口,请点击连接手工打印下载.</span> </template>
            <ul>
              <li>{{ '单据打印' }}</li>
              <li
                >{{ '点击这里' }}<a :href="URL" download>{{ '进行单据下载' }}</a></li
              >
            </ul>
            <Button type="primary" @click="modalClose">{{ '关闭窗口' }}</Button>
          </Card>
        </div>
      </Modal>
    </Spin>
  </div>
</template>

<script lang="ts" setup>
  import { inject, reactive, ref, shallowRef } from 'vue';
  import { message, Spin, Card, Form, FormItem, Modal, Button } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  import FlowError from '/@/WF/FlowError.vue';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { getAppEnvConfig } from '/@/utils/env';
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  //获取传的参数
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const frmData = ref(null);
  const contentStyle = reactive({
    width: 'calc(100% - 230px)',
  });
  //如果在章节表单解析文件引用，需要做一些样式的配置
  const isChapterForm = inject('isChapterForm');
  const URL = ref('');
  //打印
  const IsHtmlPage = ref(false);
  const IsPdfPage = ref(false);
  const IsZipPage = ref(false);
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;
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
  //初始化页面，判断当前流程表单类型
  const InitPage = async () => {
    try {
      loading.value = true;
      //获取表单的数据
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(props.params);
      handler.AddPara('PageType', 'Vue3');
      const data = await handler.DoMethodReturnString('FrmGener_Init');
      if (typeof data == 'string' && data.includes('err@') == true) {
        errorObj.hasError = true;
        errorObj.tips = data.replace('err@', '');
        console.log('GenerWorkNode获取失败:' + data);
        return;
      }
      frmData.value = JSON.parse(JSON.stringify(data));
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  const ClickBtn = async (btnNo) => {
    switch (btnNo) {
      case 'Save':
        await Save(1);
        break;
      case 'htm':
      case 'pdf':
      case 'zip':
        const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handlers.AddPara('FrmID', props.params.FrmID);
        handlers.AddPara('SourceType', 'Bill');
        handlers.AddPara('WorkID', props.params.OID);
        handlers.AddPara('BasePath', basePath);
        const dataPackup: any = await handlers.DoMethodReturnString('Packup_Init');

        if (Array.isArray(dataPackup) && dataPackup.length > 0) {
          let url = dataPackup.find((item) => item.No === btnNo)?.Name;
          const startIndex = url.indexOf('/DataUser/');
          const relativePath = url.substring(startIndex);
          url = basePath + '/' + relativePath;
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
          if (btnNo == item.No && item.No == 'htm') {
            IsPdfPage.value = true;
            URL.value = basePath + '/' + relativePath;
            window.open(basePath + '/' + relativePath);
            modalShow('Packup', '打印');
            return;
          } else if (btnNo == item.No && item.No == 'pdf') {
            IsPdfPage.value = true;
            URL.value = basePath + '/' + relativePath;
            window.open(basePath + '/' + relativePath);
            modalShow('Packup', '打印');
            return;
          } else if (btnNo == item.No && item.No == 'zip') {
            IsZipPage.value = true;
            if (item.Name.includes(basePath)) {
              URL.value = item.Name;
            } else {
              URL.value = basePath + '/' + relativePath;
            }
            window.open(URL.value);
            modalShow('Packup', '打印');
            return;
          }
        });
        break;
      default:
        break;
    }
  };
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
  const modalClose = async () => {
    modal.modalVisible = false;
    IsHtmlPage.value = false;
    IsPdfPage.value = false;
    IsZipPage.value = false;
  };
  const basicData = shallowRef<InstanceType<typeof FrmFool>>();
  const Save = async (type) => {
    try {
      loading.value = true;
      //更改数据字段值的类型
      const rowData = await basicData.value?.VerifyFormData(true);
      if (rowData == null) return false;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddJson(rowData);
      handler.AddJson(props.params);
      handler.AddPara('EnsName', props.params.FrmID);
      const data = await handler.DoMethodReturnString('FrmGener_Save');
      if (typeof data == 'string' && data.includes('err@') == true) {
        message.error(data.replace('err@', ''));
        return false;
      }
      if (type == 0) message.success('保存成功');
      return true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      return false;
    } finally {
      loading.value = false;
    }
  };
  const getStyle = () => {
    if (isChapterForm === '1')
      return reactive({
        width: 'auto',
        height: 'auto',
        padding: '0',
      });
    else return contentStyle;
  };
  //获取主表字段
  const GetMainData = () => {
    return basicData.value?.mainData;
  };
  //更改主表表单字段
  const UpdateData = (val) => {
    return basicData.value?.handleUpdate(val);
  };
  defineExpose({ Save, GetMainData, UpdateData });
  InitPage();
</script>

<style lang="less" scoped>
  .toolBar {
    background-color: white;
    // position: fixed;
    width: 100%;
    //height: 50px;
    // z-index: 1000;
  }
  .toolbar-wrapper {
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    padding-right: 1.2rem;
    height: auto;
    padding-left: 2.2rem;
    padding-top: 13px;
    .flow-btn {
      border-radius: 5px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
  .wrapper {
    margin: 0 auto;
    padding: 10px 24px 24px;
    height: 100%;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    /**width: 1030px !important;*/
    border-radius: 5px;
  }
</style>
