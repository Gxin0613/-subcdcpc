<template>
  <BaseComponent ref="baseComp">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else style="background-color: #f2f5f7; height: 100%">
        <!-- VSTO -->
        <template v-if="pageData.FrmType == '6' || pageData.FrmType == '61'">
          <search-toolbar
            v-if="isHidToolba === false && buttonList.length > 0"
            :button-list="buttonList"
            :display-button-as-dropdown="false"
            :billState="billState"
            pageType="MyBill"
            :params="pageData"
          />
          <a @click="handleClick" style="display: flex; justify-content: center; font-size: 25px">{{ '打开vsto表单' }}</a>
          <div class="content wrapper" :style="isFixedbar ? { paddingTop: '50px' } : ''">
            <FrmFool v-if="formData" ref="formRef" :frm-data="formData" :fieldIsReadonly="fieldIsReadonly" :is-readonly="fieldIsReadonly" :params="params" />
          </div>
        </template>
        <!-- 经典表单 -->
        <template v-else-if="pageData.FrmType == '0' || pageData.FrmType == '10'">
          <div :style="isFixedbar ? toolbarStyle : ''">
            <search-toolbar
              v-if="isHidToolba === false && buttonList.length > 0"
              :button-list="buttonList"
              :display-button-as-dropdown="false"
              :billState="billState"
              :params="pageData"
              pageType="MyBill"
              @open-single-design="openSinglePage"
            />
          </div>
          <div class="content wrapper" :style="isFixedbar ? { paddingTop: '0px' } : ''">
            <ChartFrm v-if="pageData.FrmType == 10" :params="params" ref="ChartFrmRef" :fieldIsReadonly="params.isReadonly || props.isReadonly" />
            <FrmFool
              v-else-if="pageData.FrmType == '0' && formData"
              ref="formRef"
              :frm-data="formData"
              :fieldIsReadonly="fieldIsReadonly"
              :is-readonly="fieldIsReadonly"
              :params="{ isReadonly: fieldIsReadonly, ...params }"
              :isSetHeight="!(!!billCheckModel && billCheckModel != 'None')"
            />
            <!--显示审核意见-->
            <div v-if="!!billCheckModel && billCheckModel != 'None'" :style="{ margin:'auto',width:frmBill.FrmW+'px'}">
              <WorkCheckParseTrackTime :generBill="gb" :params="pageData" ref="WorkCheckRef" />
            </div>
          </div>
        </template>
        <!-- 未解析的表单 -->
        <template v-else>{{ '未解析的表单' }}</template>
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
        <Modal
          v-model:open="popModal.visible"
          :title="popModal.title"
          :body-style="{
            padding: '12px',
          }"
          :width="popModal.width"
          :style="popModal.height"
          @ok="PopModalOK"
        >
          <Pop
            v-if="popModal.visible === true"
            :popHeight="popModal.height"
            :selectVal="popModal.selectNo"
            :selectNameVal="popModal.selectName"
            :mapExt="(popModal.mapExt as EnMapExt)"
            :key="popModal.componetKey"
            ref="refPop"
          />
        </Modal>
      </div>
    </Spin>
  </BaseComponent>
</template>
<script setup lang="ts">
  import { SearchToolbar } from '/@/components/SearchComponent';
  import { computed, createVNode, markRaw, reactive, ref, shallowRef, toRaw } from 'vue';
  import { Button, Card, message, Modal, Spin } from 'ant-design-vue';
  import { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/WF/CCForm/FrmFool.vue';
  // import { ToolbarBtn } from './Template/ToolBarBtn';
  import { GenerBill } from './GenerBill';
  import WebUser from '/@/bp/web/WebUser';
  import ChartFrm from '/@/WF/CCForm/ChartFrm.vue';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  import { userCCBillSelfLoader } from '/@/DataUser/OverrideFiles/CCBill_MyDict';
  import { getAppEnvConfig } from '/@/utils/env';
  import WorkCheckParseTrackTime from '/@/CCFast/CCBill/WorkOpt/WorkCheckParseTrackTime.vue';
  import { usePackUp } from '/@/CCFast/CCBill/hooks/usePackup';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import { FrmBill } from './FrmBill';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import Dev2InterfaceCCBill from '../Dev2InterfaceCCBill';
  import { EventType, MyBillToolbar } from './MyBillToolbar';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { ClassFactoryOfGroupPageNew } from '/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageNew';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { FrmDictBtn } from '/@/CCFast/CCBill/FrmDictBtn';
  import { EnMapExt, ExtModel } from '/@/bp/en/Map/EnMapExt';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import { AtPara } from '/@/bp/da/AtPara';
  import { GloWF } from '/@/WF/Admin/GloWF';
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const emit = defineEmits(['trigger-close', 'trigger-update']);
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const buttonStyle: Recordable = {
    marginRight: '12px',
  };

  defineOptions({
    name: 'CommMyBill',
  });

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    printType: {
      type: String,
      default: '',
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isFramework: {
      type: Boolean,
      default: false,
    },
    isFixedbar: {
      type: Boolean,
      default: false,
    },
    menu: {
      type: Array,
      default: () => [],
    },
  });
  const isFixedbar = ref(props.params?.isFixedbar || props?.isFixedbar || false);
  const { beforeSave } = userCCBillSelfLoader(props.params);
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
  //打印
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basePath = VITE_GLOB_API_URL;
  const PrintType = ref();
  const URL = ref();
  const IsHtmlPage = ref(false);
  const IsPdfPage = ref(false);
  const IsZipPage = ref(false);

  const originalProps = toRaw(props.params);
  const type = ref(props.printType);

  const formRef = shallowRef<InstanceType<typeof FrmFool>>();
  const pageData = reactive<Recordable>({});
  const isReadonly = ref(false);
  const dataPrint = ref();
  const isHidToolba = ref(false);
  const vstoUrl = ref();
  const header = ref();
  //章节表单
  const ChartFrmRef = shallowRef<InstanceType<typeof ChartFrm>>();
  const WorkCheckRef = shallowRef<InstanceType<typeof WorkCheckParseTrackTime>>();

  const toolbarStyle = computed(() => {
    return { position: 'sticky', top: 0, width: '100%', backgroundColor: '#fff' };
  });
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: new EnMapExt(),
    enableSelect: false,
    selectNo: '',
    selectName: '',
    componetKey: 0,
  });

  const InitPageParam = async () => {
    pageData.FrmType = getParams('FrmType') || 0;
    pageData.FK_Flow = getParams('FK_Flow');
    pageData.FK_Node = getParams('FK_Node') || 0;
    pageData.FID = getParams('FID') == null ? 0 : getParams('FID');
    const oid = getParams('WorkID') || getParams('OID') || 0;
    pageData.OID = oid;
    pageData.WorkID = oid;
    pageData.Paras = getParams('Paras');
    pageData.IsReadonly = getParams('IsReadonly');
    pageData.IsStartFlow = getParams('IsStartFlow');
    pageData.FK_MapData = getParams('FK_MapData');
    pageData.FrmID = getParams('FrmID');
    isReadonly.value = !!parseInt(pageData.IsReadonly);
    isHidToolba.value = parseInt(getParams('HidToolba') || '0') === 1 ? true : false;
    const mapData = new MapData(pageData.FrmID);
    await mapData.Retrieve();
    // @0=经典表单@1=自由表单@8=开发者表单@10=章节表单@6=VSTO表单
    pageData.FrmType = mapData.FrmType;
    pageData.FrmType = pageData.FrmType === 8 ? 0 : pageData.FrmType;
    header.value = 'excelform';
    if (pageData.FrmType == 61) {
      header.value = 'wordform';
    }
    const paras = `${header.value}://-fromccflow,AppID=MyBillExcel,FrmID=${getParams('FrmID')},Token=${WebUser.Token},WSUrl=${getVstoHost()},WorkID=${oid}`;
    vstoUrl.value = paras;
  };

  const createNew = async () => {
    formData.value = undefined;
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddJson(originalProps);
    originalProps['WorkID'] = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
    setTimeout(() => {
      InitDict();
    }, 50);
  };
  const handleClose = () => {
    const topWindow = (window.top === window ? window : window.top)!;
    const hashUrl = topWindow.location.hash;
    try {
      window.parent.postMessage({ type: MessageTypeEnum.ReloadPage, url: '/' + hashUrl }, '*');
    } catch (e) {
      const pre = hashUrl.includes('?') ? '&1=1' : '?1=1';
      topWindow.location.replace('/' + hashUrl + pre);
    }
  };

  const handleClick = async (event) => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('Header', header.value);
      const result: any = await handler.DoMethodReturnString('IsInstallVSTO');
      window.location.href = vstoUrl.value;
      // 执行自定义逻辑，例如记录日志
    } catch (e) {
      event.preventDefault();
      message.error(e as string);
    }
  };

  const SaveFrm = async () => {
    const frmType = pageData.FrmType;
    const oid = getParams('WorkID');
    const frmID = getParams('FrmID');
    if (frmType == 6) {
      const msg = await Dev2InterfaceCCBill.SetEditing(frmID, oid);
      message.success(msg || ' ');
      return;
    }
    let rowData = null;
    if (pageData.FrmType === 10) await ChartFrmRef.value.Save();
    else rowData = await formRef.value?.VerifyFormData(false);
    const valid = await beforeSave(rowData, getParams('FrmID'), getParams('WorkID'));
    if (!valid) return;
    if (rowData == null && pageData.FrmType !== 10) return false;

    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddJson(originalProps);
    if (rowData != null) {
      const keys = Object.keys(rowData);
      for (const key of keys) {
        handler.AddPara(key, encodeURIComponent(rowData[key]));
      }
    }

    const msg = await handler.DoMethodReturnString('MyBill_SaveIt');
    message.success(msg);

    //保存并新建.
    if (type.value === EventType.SaveAndNew) await createNew();
    emit('trigger-update');
    setTimeout(() => {
      buttonList.value = [];
      InitToolbar();
    }, 100);
  };

  const handleButtonClick = async (type: EventType, btnName, params) => {
    const frmID = getParams('FrmID');
    const workID = getParams('WorkID');

    try {
      if (type === EventType.New) {
        await createNew();
        return;
      }
      if (type === EventType.Save || type === EventType.SaveAndNew) {
        await SaveFrm();
        return;
      }
      if (type === EventType.Delete) {
        Modal.confirm({
          content: '您确定要删除吗',
          icon: createVNode(ExclamationCircleOutlined),
          okText: '确定',
          async onOk() {
            const handler = new HttpHandler('BP.CCBill.WF_CCBill');
            handler.AddPara('FrmID', getParams('FrmID'));
            handler.AddPara('WorkID', getParams('WorkID'));
            const msg = await handler.DoMethodReturnString('MyBill_Delete');
            message.info(msg);
            emit('trigger-close');
            return;
          },
          cancelText: '取消',
          onCancel() {
            Modal.destroyAll();
          },
        });
        return;
      }

      if (type === EventType.Cancel) {
        Modal.confirm({
          content: '您确定要作废吗',
          icon: createVNode(ExclamationCircleOutlined),
          okText: '确定',
          async onOk() {
            const handler = new HttpHandler('BP.CCBill.WF_CCBill');
            handler.AddPara('FrmID', getParams('FrmID'));
            handler.AddPara('WorkID', getParams('WorkID'));
            const msg = await handler.DoMethodReturnString('MyBill_Cancel');
            message.info(msg);
            emit('trigger-close');
            return;
          },
          cancelText: '取消',
          onCancel() {
            Modal.destroyAll();
          },
        });
        return;
      }

      //草稿.
      if (type === EventType.Draft) {
        const rowData = await formRef.value?.VerifyFormData(true);
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        if (rowData != null) {
          const keys = Object.keys(rowData);
          handler.AddJson(originalProps);
          for (const key of keys) {
            handler.AddPara(key, rowData[key]);
          }
        }
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyDict_Draft');
        message.info(msg);
        emit('trigger-close');
        return;
      }
      //审核通过.
      if (type === EventType.Approve) {
        await SaveFrm();
        //自由模式
        if (billCheckModel.value === 'SelfCheck1') {
          //需要打开人员选择器，选择人员点击发送
          popModal.visible = true;
          popModal.componetKey++;
          const mapExt = new EnMapExt();
          mapExt.ExtModel = ExtModel.Pop;
          mapExt.ExtType = 'PopTreeEns';
          mapExt.AtPara = new AtPara();
          mapExt.Tag1 = GloWF.srcDeptLazily;
          mapExt.Tag3 = GloWF.srcEmpLazily;
          mapExt.Tag4 = GloWF.srcEmpSearchKey; // 搜索数据源
          mapExt.Tag5 = GloWF.srcDeptRoot;
          mapExt.AtPara.SetVal('IsShowSearch', '1');
          mapExt.AtPara.SetVal('IsLazily', '1');
          //单选还是多选.
          mapExt.AtPara.SetVal('IsMultipleChoice', '0');
          mapExt.W = '800px';
          mapExt.H = '400px';
          popModal.mapExt = mapExt;
          return;
        }
        let msg = '';
        if (!!WorkCheckRef.value) msg = WorkCheckRef.value.workCheckDoc;
        if (!msg) {
          message.error('请填写审核信息');
          return;
        }
        //获取审核的msg
        const info = await Dev2InterfaceCCBill.Send(frmID, workID, msg);
        message.info(info);
        emit('trigger-close');
        handleClose();
        return;
      }
      //审核退回
      if (type === EventType.ReturnSta) {
        await SaveFrm();
        const url = '/src/CCFast/CCBill/WorkOpt/ReturnWork.vue?WorkID=' + workID + '&FrmID=' + frmID;
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
        return;
      }

      //提交审核.
      if (type === EventType.SubmitCheck) {
        await SaveFrm();
        const mapData = new MapData(pageData.FrmID);
        await mapData.Retrieve();

        let msg = '';
        if (!!WorkCheckRef.value) msg = WorkCheckRef.value.workCheckDoc;
        if (!msg) {
          message.error('请输入申请原因');
          return;
        }

        //自由模式
        if (billCheckModel.value === 'SelfCheck1') {
          //需要打开人员选择器，选择人员点击发送
          popModal.visible = true;
          popModal.componetKey++;
          const mapExt = new EnMapExt();
          mapExt.ExtModel = ExtModel.Pop;
          mapExt.ExtType = 'PopTreeEns';
          mapExt.AtPara = new AtPara();
          mapExt.Tag1 = GloWF.srcDeptLazily;
          mapExt.Tag3 = GloWF.srcEmpLazily;
          mapExt.Tag4 = GloWF.srcEmpSearchKey; // 搜索数据源
          mapExt.Tag5 = GloWF.srcDeptRoot;
          mapExt.AtPara.SetVal('IsShowSearch', '1');
          mapExt.AtPara.SetVal('IsLazily', '1');
          //单选还是多选.
          mapExt.AtPara.SetVal('IsMultipleChoice', '0');
          mapExt.W = '800px';
          mapExt.H = '400px';
          popModal.mapExt = mapExt;
          return;
        }
        //抢办 队列 协作
        if (billCheckModel.value === 'SelfCheck2' || billCheckModel.value === 'SelfCheck3' || billCheckModel.value === 'SelfCheck4') {
          const handler = new HttpHandler('BP.CCBill.WF_CCBill');
          handler.AddPara('FrmID', pageData.FrmID);
          handler.AddPara('WorkID', pageData.WorkID);
          await handler.DoMethodReturnString('MyBill_HistoryCheck');
          const url = GloComm.UrlDtlSearch(
            '',
            'TS.CCBill.WorkOpt.SelfCheckWorker',
            '',
            '',
            '提交审核',
            '',
            '',
            true,
            '&FrmID=' + pageData.FrmID + '&WorkID=' + pageData.WorkID + '&Msg=' + msg,
          );
          baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
          return;
        }
        const msg2 = '';
        //初始化审核人路径.
        let handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', frmID);
        handler.AddPara('WorkID', workID);
        handler.AddPara('Msg', msg2);
        let data = await handler.DoMethodReturnString('MyBill_CheckerInit');
        if (data.indexOf('err@') == 0) {
          alert(data);
          return;
        }
        message.info(data);
        emit('trigger-close');
        return;
      }

      //归档.
      if (type === EventType.Archive) {
        //  if (window.confirm('您确定要归档吗？归档之后就是只读状态，可以通过撤销归档进行编辑.') == false) return;

        await SaveFrm();
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyBill_Submit');
        message.info(msg);
        message.info(msg);
        setTimeout(async () => {
          buttonList.value = [];
          formData.value = undefined;
          isReadonly.value = true;
          fieldIsReadonly.value = true;
          originalProps.IsReadonly = 1;
          await InitDict();
        }, 100);

        return;
      }
      if (type === EventType.ArchiveUn) {
        if (window.confirm('您确定要撤销归档吗？') == false) return;

        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyBill_ArchiveUn');
        message.info(msg);
        setTimeout(async () => {
          buttonList.value = [];
          formData.value = undefined;
          isReadonly.value = false;
          fieldIsReadonly.value = false;
          originalProps.IsReadonly = 1;
          await InitDict();
        }, 100);
        //emit('trigger-close');
        return;
      }
      //撤销审核:
      if (type === EventType.UnSend) {
        if (window.confirm('您确定要撤销吗？') == false) return;

        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyBill_UnSend');
        message.info(msg);
        emit('trigger-close');
        return;
      }

      //回滚流程.
      if (type === EventType.Reback) {
        const msg3 = window.prompt('请输入回滚原因', '如下原因需要重新审批');
        if (!msg3) return;

        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        handler.AddPara('Msg', msg3);
        const data = await handler.DoMethodReturnString('MyBill_RebackFlow');
        message.info(data);
        emit('trigger-close');
        return;
      }
      //审核路径.
      if (type == EventType.CheckEmps) {
        const url = GloComm.UrlGenerList('GL_GenerWorker', '&WorkID=' + getParams('WorkID'));
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
        return;
      }
      //纂改数据
      if (type == EventType.RecJuggle) {
        const enGPN = await ClassFactoryOfGroupPageNew.GetEn('GPN_BillRecJuggle');
        if (enGPN != null) {
          baseComp.value?.openDrawer({
            title: enGPN.PageTitle,
            width: '80%',
            component: markRaw(
              createAsyncComponent(() => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'), {
                loading: true,
              }),
            ),
            params: { EnName: enGPN.classID, ...pageData },
          });
          return;
        }
        return;
      }

      if (type == EventType.PrintPDF || type == EventType.PrintHtml || type == EventType.ExpZip) {
        PrintType.value = type.startsWith('Print') ? type.replace('Print', '') : type.replace('Exp', '');
        const handlers = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handlers.AddPara('FrmID', getParams('FrmID'));
        handlers.AddPara('SourceType', 'Bill');
        handlers.AddPara('WorkID', getParams('WorkID'));
        handlers.AddPara('BasePath', basePath);
        const dataPackup: any = await handlers.DoMethodReturnString('Packup_Init');
        if (Array.isArray(dataPackup) && dataPackup.length > 0) {
          for (const item of dataPackup) {
            item.Name = item.Name.replace(basePath + '/', '');
            const startIndex = item.Name.indexOf('/DataUser/');
            const relativePath = item.Name.substring(startIndex);
            if (type == EventType.PrintHtml) {
              IsPdfPage.value = true;
              URL.value = basePath + '/' + relativePath;
              window.open(basePath + '/' + relativePath);
              modalShow('Packup', '打印');
              return;
            } else if (type == EventType.PrintPDF) {
              IsPdfPage.value = true;
              URL.value = basePath + relativePath;
              window.open(basePath + relativePath);
              modalShow('Packup', '打印');
              return;
            } else if (type == EventType.ExpZip) {
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
          }

          // const url = dataPackup.find((item) => item.No === 'zip')?.Name;
          // if (!!url) {
          //   window.open(url);
          // } else {
          //   message.error('未找到zip文件, 原始数据为:' + JSON.stringify(dataPackup));
          // }
          // return;
        }
        if (dataPackup.indexOf('info@') == 0) {
          usePackUp(modalShow, dataPackup, URL, IsHtmlPage, IsPdfPage, IsZipPage, PrintType, dataPrint, basePath);
        }
        return;
      }
      if (type == EventType.PrintTemplate) {
        const url = GloComm.UrlGenerList('GL_Printer', '&WorkID=' + workID + '&FrmID=' + frmID);
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
        return;
      }
      if (type == EventType.FlowView) {
        const url = GloComm.UrlMyView(params.WorkID, '&FlowNo=' + params.FlowNo);
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
        return;
      }
      if (type == EventType.Track) {
        const url = GloComm.UrlGenerList('GL_Track', '&WorkID=' + workID + '&FrmID=' + frmID);
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url));
        return;
      }
      if (entityWG.value != null && type === 'WaiGua') {
        const rowData = await formRef.value?.VerifyFormData(true);
        const result = await entityWG.value?.BtnClick('EntityToolbar', btnName, '', rowData);
        if (!!result && result?.hasOwnProperty?.('ReturnType')) baseComp.value?.handleGPNCallback(result);
        return;
      }
      message.warn(`[type = '${type}'] 未实现`);
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  //选择人员后审核
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const PopModalOK = async () => {
    const checkedInfo = refPop.value!.handlerPopOK();
    if (checkedInfo.length == 0) {
      message.error('请选择审核人');
      return;
    }
    let msg = '';
    if (!!WorkCheckRef.value) msg = WorkCheckRef.value.workCheckDoc;

    let data = '';
    try {
      if (gb.CurrIdx == 0) {
        if (!msg) {
          message.error('请输入申请原因');
          return;
        }
        let handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', pageData.FrmID);
        handler.AddPara('WorkID', pageData.WorkID);
        handler.AddPara('EmpNo', checkedInfo[0][0]);
        handler.AddPara('Msg', msg);
        data = await handler.DoMethodReturnString('MyBill_CheckerInit');
        if (data.indexOf('err@') == 0) {
          alert(data);
          return;
        }
      } else {
        if (!msg) {
          message.error('请输入审核意见');
          return;
        }
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', pageData.FrmID);
        handler.AddPara('WorkID', pageData.WorkID);
        handler.AddPara('ToEmp', checkedInfo[0][0]);
        handler.AddPara('RefNo', msg);
        data = await handler.DoMethodReturnString('MyBill_Send');
      }
      message.info(data);
      emit('trigger-close');
      handleClose();
    } catch (e) {
      message.error(e as string);
    }
    return;
  };
  type ButtonList = Array<{ BtnID: EventType; BtnLab: string }>;
  const buttonList = ref<ToolbarButtonDef[]>([]);
  const route = useRoute();
  const dataBtn = ref<ButtonList>();
  const fieldIsReadonly = ref(props.params.isReadonly || props.isReadonly);
  const getParams = (name: string) => route.query[name] || originalProps[name] || '';
  const billState = ref(0);
  const isHaveCheck = ref(false);
  const billCheckModel = ref('None');
  const isLoadHistory = ref(false);
  const gb = new GenerBill();
  const frmBill = new FrmBill(getParams('FrmID'));
  const InitToolbar = async () => {
    //初始化单据控制表.
    gb.WorkID = getParams('WorkID'); //获得传来的参数.
    const count = await gb.RetrieveFromDBSources();
    if (count === 0) gb.BillState = getParams('BillState');
    
    frmBill.No = getParams('FrmID');
    await frmBill.RetrieveFromDBSources();
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', getParams('FrmID'));
    handler.AddPara('IsReadonly', getParams('IsReadonly'));
    if (!!getParams('WorkID') && getParams('WorkID') != 'undefined') handler.AddPara('WorkID', getParams('WorkID'));
    else handler.AddPara('WorkID', getParams('OID'));
    handler.AddPara('IsMobile', 0);
    const btnRoles = await handler.DoMethodReturnJson('MyDict_ToolBarInit');
    billState.value = gb.BillState;
    //如果是空白状态.
    let btns: ArrayToolbarAPI<{ BtnID: EventType; BtnLab: string; params: {} }> = [];
    //审核模式
    billCheckModel.value = frmBill.BillCheckModel;
    //自由模式是否显示历史信息
    isLoadHistory.value = frmBill.GetParaBoolean('IsLoadHistory');
    //默认不审核.
    if (frmBill.BillCheckModel == '' || frmBill.BillCheckModel == '0' || frmBill.BillCheckModel == 'None') {
      MyBillToolbar.None(btns, gb, frmBill, getParams('Frm'), btnRoles);
    }
    //按照API审核.
    if (frmBill.BillCheckModel == 'ByAPI') {
      isHaveCheck.value = true;
      MyBillToolbar.ToolbarAPI(btns, gb, frmBill, getParams('Frm'));
    }
    //按照固定人员审核.
    if (frmBill.BillCheckModel == 'BySettingEmpNos') {
      isHaveCheck.value = true;
      MyBillToolbar.BySettingEmpNos(btns, gb, frmBill, getParams('Frm'));
    }
    //按照自定义模式审核
    if (frmBill.BillCheckModel == 'SelfCheck1' || frmBill.BillCheckModel == 'SelfCheck2' || frmBill.BillCheckModel == 'SelfCheck3' || frmBill.BillCheckModel == 'SelfCheck4') {
      isHaveCheck.value = true;
      MyBillToolbar.BySettingSelfChecks(btns, gb, frmBill, getParams('Frm'));
    }

    fieldIsReadonly.value = gb.BillState == 100 || gb.BillState == 200 || gb.BillState == 3 ? true : MyBillToolbar.frmIsReadonly;
    //如果是归档状态并且有纂改数据权限增加按钮操作
    if (parseInt(btnRoles.RecJuggle) == 1 && (gb.BillState == 100 || gb.BillState == 200)) {
      btns.push({
        BtnID: EventType.RecJuggle,
        BtnLab: '纂改数据',
      });
    }
    //综合判断btns的权限.
    const handerBtn = new HttpHandler('BP.CCBill.WF_CCBill');
    handerBtn.AddPara('FrmID', getParams('FrmID'));
    handerBtn.AddPara('WorkID', getParams('WorkID'));

    //是否可以提交？
    // if (MyBillToolbar.IsExitBtn(btns, EventType.SubmitCheck) == true) {
    //   const data = await handerBtn.DoMethodReturnString('MyBillBtnsEnable_SubmitCheck');
    //   if (data == '0') MyBillToolbar.deleteBtn(btns, EventType.SubmitCheck);
    // }

    // //是否可以删除?
    // if (MyBillToolbar.IsExitBtn(btns, EventType.Delete) == true) {
    //   const data = await handerBtn.DoMethodReturnString('MyBillBtnsEnable_Delete');
    //   if (data == '0') MyBillToolbar.deleteBtn(btns, EventType.Delete);
    // }

    const val = getParams('IsReadonly');
    //if (val == 1) MyBillToolbar.frmIsReadonly = true;

    if (MyBillToolbar.IsExitBtn(btns, EventType.Save) == true && fieldIsReadonly.value == true) {
      //是否可以保存?
      MyBillToolbar.deleteBtn(btns, EventType.Save);
    }

    //是否绑定流程
    const workIDOfFlow = gb.GetParaInt('WorkIDOfFlow', 0);
    const flowNo = gb.GetParaString('FlowNo', '');
    if (workIDOfFlow != 0) {
      btns.push({
        BtnID: EventType.FlowView,
        BtnLab: '流程轨迹',
        params: {
          WorkID: workIDOfFlow,
          FlowNo: flowNo,
        },
      });
    }
    //增加轨迹
    btns.push({
      BtnID: EventType.Track,
      BtnLab: '轨迹',
    });
    //通用按钮: 打印/轨迹/
    const frmBtn = new FrmDictBtn(getParams('FrmID'));
    await frmBtn.RetrieveFromDBSources();
    if (frmBtn.PrintHtmlEnable === 1)
      btns.push({
        BtnID: EventType.PrintHtml,
        BtnLab: frmBtn.PrintHtmlLab,
      });
    if (frmBtn.PrintPDFEnable === 1)
      btns.push({
        BtnID: EventType.PrintPDF,
        BtnLab: frmBtn.PrintPDFLab,
      });
    if (frmBtn.PrintZipEnable === 1)
      btns.push({
        BtnID: EventType.ExpZip,
        BtnLab: frmBtn.PrintZipLab,
      });
    if (frmBtn.PrintTemplateEnable === 1)
      btns.push({
        BtnID: EventType.PrintTemplate,
        BtnLab: frmBtn.PrintTemplateLab,
      });
    dataBtn.value = btns;
    let btnList = dataBtn.value;
    if (props.isFramework) {
      btnList = btnList.filter((btn) => btn.BtnLab !== '新建' && btn.BtnLab !== '保存&新建');
    }
    if (entityWG.value != null) {
      const btns = entityWG.value?.EntityToolbarBtns;
      if (!!btns) {
        btns.split(',').forEach((item) => {
          btnList.push({
            BtnID: 'WaiGua',
            BtnLab: item,
          });
        });
      }
    }
    buttonList.value = [];
    buttonList.value = btnList.map((button) => {
      return {
        type: 'primary',
        key: button.BtnID,
        name: button.BtnLab,
        shape: 'default',
        isDanger: button.BtnID.toLowerCase() === 'delete',
        isGhost: true,
        style: buttonStyle,
        onClick: () => {
          handleButtonClick(button.BtnID, button.BtnLab, button.params);
        },
      };
    });
    if (billState.value != 0) {
      handerBtn.AddPara('IsMyBillToolBar', 1);
      const methods = (await handerBtn.DoMethodReturnJson('MyBill_Methods')) || [];
      //const methods = new Methods();
      //await methods.Retrieve('FrmID', getParams('FrmID'), 'IsMyBillToolBar', 1, 'MethodModel', 'FlowEtc');
      methods.forEach((method) => {
        buttonList.value.push({
          type: 'primary',
          key: method.No,
          name: method.Name,
          shape: 'default',
          isDanger: false,
          isGhost: true,
          style: buttonStyle,
          onClick: async () => {
            try {
              const oid = getParams('WorkID'); //单据与实体都会调用他.
              const frmID = getParams('FrmID');
              const handler = new HttpHandler('BP.CCBill.WF_CCBill');
              handler.AddPara('WorkID', oid);
              handler.AddPara('RefNo', oid); //有可能是实体编号.
              handler.AddPara('FrmID', frmID);
              handler.AddPara('MethodNo', method.No); //方法ID.
              let data = (await handler.DoMethodReturnString('MyDict_DoFlowEtc_StartFlow')) as string;
              if (data.includes('err@') == true) {
                message.error(data);
                return;
              }
              data = '/#/WF' + data;
              data = data.replace('../', '/');
              data = data.replace('.htm', '');
              baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, data));
            } catch (e) {
              message.error(e as string);
            }
          },
        });
      });
    }

    console.log('buttonList:', buttonList.value);
  };
  const formData = ref<Recordable>();
  const GetFormData = async () => {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    delete originalProps.EnsName;
    delete originalProps.RefPKVal;
    delete originalProps.Title;
    delete originalProps.Name;
    delete originalProps.title;
    handler.AddJson(originalProps);
    handler.AddJson(pageData);
    handler.AddPara('PageType', 'Vue3');
    const data = await handler.DoMethodReturnJson('FrmGener_Init');
    formData.value = data;
  };

  //打开弹窗
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 500) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = {
      height: height + 'px',
    };
  };
  //关闭弹窗
  const modalClose = async () => {
    modal.modalVisible = false;
    IsHtmlPage.value = false;
    IsPdfPage.value = false;
    IsZipPage.value = false;
  };
  const entityWG = ref<Nullable<WaiGuaBaseEntity>>(null);

  const openSinglePage = () => {
    const url = `/src/WF/Comm/PanelGroup.vue?EnName=PG_Group2Method&RefPKVal=No&PKVal=${originalProps.FrmID || getParams('FrmID')}&RefMainEnName=TS.CCBill.FrmEntityNoName`;
    baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '单记录设计'));
  };
  const InitDict = async () => {
    try {
      loading.value = true;
      // 初始化页面参数
      await InitPageParam();
      // 初始化工具栏
      // await setPrintBtn(type.value);
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + pageData.FrmID);
      if (!!entityWG.value) {
        const mapData = new MapData();
        mapData.No = pageData.FrmID;
        await mapData.Retrieve();
        entityWG.value.mapData = mapData;
        entityWG.value.params = props.params;
      }
      await InitToolbar();
      await GetFormData();
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    } finally {
      loading.value = false;
    }
  };

  InitDict();
</script>

<style lang="less" scoped>
  .p-2 {
    padding-top: 0;
  }
  .input-card {
    // margin-top: 10px;
    :deep(.ant-card-body) {
      padding: 8px 24px 24px;
    }
    :deep(.ant-card-head) {
      background-color: #f9f9f9;
    }
  }
  .title {
    font-size: 16px;
  }

  .group-title {
    font-size: 14px;
  }
  .wrapper {
    margin: 0 auto;
    padding-left: 24px;
    padding-right: 24px;
    height: auto;
  }

  .content {
    position: relative;
    left: 0;
    top: 0;
    z-index: 10;
    border-radius: 5px;
  }
</style>
