<template>
  <div class="p-2">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <template v-else>
        <NavBar v-if="isShowBar" :title="title" :fixed="true" left-arrow @click-left="onClickLeft" />
        <!-- VSTO -->
        <template v-if="pageData.FrmType == '6'">
          <a :href="vstoUrl" style="display: flex; justify-content: center; font-size: 25px">{{ '打开vsto表单' }}</a>
        </template>
        <!-- 经典表单 -->
        <template v-else-if="pageData.FrmType == '0' || pageData.FrmType == '10'">
          <MyDictToolbarMobile v-if="buttonList.length > 0" :button-list="buttonList" :display-button-as-dropdown="false" />
          <ChartFrm v-if="pageData.FrmType == 10" :params="params" ref="ChartFrmRef" :fieldIsReadonly="params.isReadonly || props.isReadonly" />
          <FrmFool
            v-else-if="pageData.FrmType == '0' && formData"
            ref="formRef"
            :frm-data="formData"
            :is-readonly="params.isReadonly || props.isReadonly"
            :params="params"
            pageFrom="FrmBill"
            style="margin-bottom: 50px; height: calc(var(--viewport-height) - 116px); overflow-y: auto"
          />
        </template>
        <!-- 未解析的表单 -->
        <template v-else>{{ '未解析的表单' }}</template>

        <Popup
          v-model:show="modal.modalVisible"
          :closable="modal.closable"
          :title="modal.modalTitle"
          :width="modal.modalWidth"
          :body-style="modal.modalHeight"
          :footer="null"
          destroy-on-close
          @cancel="modalClose"
          position="bottom"
          :style="{ width: '100%', height: '100%' }"
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
          <div v-else-if="modal.modalType === 'Track'" style="width: 100%; height: 100%">
            <NavBar :title="modal.modalTitle" :fixed="true" left-arrow @click-left="modalClose" />
            <component :is="compInfo.component" :params="compInfo.params" />
          </div>
        </Popup>
      </template>
    </Spin>
  </div>
</template>
<script setup lang="ts">
  import { MyDictToolbarMobile } from '/@/components/SearchComponent';
  import { markRaw, reactive, ref, shallowRef, toRaw } from 'vue';
  import { Card, message, Spin, Button } from 'ant-design-vue';
  import { Popup, NavBar } from 'vant';
  import { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import { useRoute } from 'vue-router';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import FrmFool from '/@/CCMobile/CCForm/FrmFool.vue';
  import { GenerBill } from '/@/CCFast/CCBill/GenerBill';
  import WebUser from '/@/bp/web/WebUser';
  import ChartFrm from '/@/WF/CCForm/ChartFrm.vue';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  import { getVstoHost } from '/@/utils/VstoUtils';
  import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '/@/WF/Comm/UIEntity/ClassFactoryOfWaiGuaEntity';
  import { GenerWorkFlowExts } from '../WF/TSClass/FlowData/GenerWorkFlowExt';
  import { createAsyncComponent } from '../utils/factory/createAsyncComponent';
  const emit = defineEmits(['trigger-close', 'trigger-update']);
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const buttonStyle: Recordable = {
    marginRight: '12px',
  };

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
  });
  console.log('mydict props', props);
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
  //轨迹：移动端打开component
  const compInfo = reactive({
    component: {},
    params: {},
  });
  //打印
  const basePath = import.meta.env.VITE_GLOB_API_URL;
  const PrintType = ref();
  const URL = ref();
  const IsHtmlPage = ref(false);
  const IsPdfPage = ref(false);
  const IsZipPage = ref(false);
  const isShowBar = ref(false);
  const title = ref('');
  //打印单据
  const PrintDocData = ref();

  const originalProps = toRaw(props.params);
  const type = ref(props.printType);

  const formRef = shallowRef<InstanceType<typeof FrmFool>>();
  enum EventType {
    New = 'New',
    Save = 'Save',
    Delete = 'Delete',
    Archive = 'Archive',
    Draft = 'Draft',
    Cancel = 'Cancel',
    Return = 'Return',
    Track = 'Track',
    Submit = 'Submit',
    Approve = 'Approve',
    PrintPDF = 'PrintPDF',
    PrintHtml = 'PrintHtml',
    PrintRTF = 'PrintRTF',
    PrintCCWord = 'PrintCCWord',
    ExpZip = 'ExpZip',
    WaiGua = 'WaiGua',
  }
  const pageData = reactive<Recordable>({});
  const isReadonly = ref(false);
  const dataPrint = ref();

  const vstoUrl = ref();
  //章节表单
  const ChartFrmRef = shallowRef<InstanceType<typeof ChartFrm>>();

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
    const mapData = new MapData(pageData.FrmID);
    await mapData.Retrieve();
    // @0=经典表单@1=自由表单@8=开发者表单@10=章节表单@6=VSTO表单
    pageData.FrmType = mapData.FrmType;
    pageData.FrmType = pageData.FrmType === 8 ? 0:pageData.FrmType; 
    let header = 'excelform';
    if (pageData.FrmType == 61) {
      header = 'wordform';
    }
    const paras = `${header}://-fromccflow,AppID=MyBillExcel,FrmID=${getParams('FrmID')},Token=${WebUser.Token},WSUrl=${getVstoHost()},WorkID=${oid}`;
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

  const handleButtonClick = async (type: EventType, btnName) => {
    try {
      if (type === EventType.New) {
        await createNew();
        return;
      }
      if (type === EventType.Save) {
        setTimeout(async () => {
          const rowData = await formRef.value?.VerifyFormData(false);

          if (rowData == null) return false;
          const handler = new HttpHandler('BP.CCBill.WF_CCBill');
          const keys = Object.keys(rowData);
          handler.AddJson(originalProps);
          for (const key of keys) {
            handler.AddPara(key, encodeURIComponent(rowData[key]));
          }
          handler.AddJson(originalProps);
          const msg = await handler.DoMethodReturnString('MyBill_SaveIt');
          message.success(msg);
          emit('trigger-update');
        }, 10);
        return;
      }
      if (type === EventType.Delete) {
        if (window.confirm('您确定要删除吗?') == false) return;
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyDict_Delete');
        message.info(msg);
        emit('trigger-close');
        return;
      }

      //草稿.
      if (type === EventType.Draft) {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyDict_Draft');
        message.info(msg);
        emit('trigger-close');
        return;
      }
      if (type === EventType.Archive || type === EventType.Submit) {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', getParams('FrmID'));
        handler.AddPara('WorkID', getParams('WorkID'));
        const msg = await handler.DoMethodReturnString('MyDict_Submit');
        if (msg.includes('成功')) {
          switch (type) {
            case EventType.Archive:
              message.info(msg);
              break;

            case EventType.Submit:
              message.info('提交成功');
              break;
          }
        }
        // message.info(msg);
        emit('trigger-close');
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
          const url = dataPackup.find((item) => item.No === 'zip')?.Name;
          if (!!url) {
            window.open(url);
          } else {
            message.error('未找到zip文件, 原始数据为:' + JSON.stringify(dataPackup));
          }
          return;
        }
        if (dataPackup.indexOf('info@') == 0) {
          dataPrint.value = JSON.parse(dataPackup.replace('info@', ''));
          dataPrint.value.forEach((item) => {
            item.Name = item.Name.replace(basePath + '/', '');
            if (PrintType.value == 'Html') {
              PrintType.value = 'htm';
            }
            if (PrintType.value == item.No && item.No == 'htm') {
              IsHtmlPage.value = true;
              URL.value = basePath + '/' + item.Name;
              modalShow('Packup', '打印');
              return;
            } else if (PrintType.value.toLowerCase() == item.No && item.No == 'pdf') {
              IsPdfPage.value = true;
              URL.value = basePath + '/' + item.Name;
              window.open(basePath + '/' + item.Name);
              modalShow('Packup', '打印');
              return;
            } else if (PrintType.value.toLowerCase() == item.No && item.No == 'zip') {
              IsZipPage.value = true;
              URL.value = basePath + '/' + item.Name;
              window.location.href = basePath + '/' + item.Name;
              modalShow('Packup', '打印');
              return;
            }
          });
        }
        return;
      }
      if (type == EventType.PrintRTF || type == EventType.PrintCCWord) {
        try {
          const handlerDoc = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
          handlerDoc.AddPara('FrmID', getParams('FrmID'));
          handlerDoc.AddPara('SourceType', 'Bill');
          handlerDoc.AddPara('WorkID', getParams('WorkID'));
          const dataPrintDoc: any = await handlerDoc.DoMethodReturnJson('PrintDoc_Init');
          PrintDocData.value = dataPrintDoc;
          //如果是一个url.
          if (PrintDocData.value.indexOf('file@') == 0) {
            PrintDocData.value = PrintDocData.value.replace('file@', '');
            if (PrintDocData.value.indexOf('rtf@') != -1) {
              //直接执行打印
              PrintDocData.value = PrintDocData.value.replace('rtf@', '');
              URL.value = basePath + '/' + PrintDocData.value;
              window.location.href = URL.value;
              modalShow('PrintDoc', '打印单据');
            } else {
              message.info('其他类型还未解析');
            }
            return;
          }
        } catch (err: any) {
          message.error(err);
        }
      }
      if (type === EventType.Track) {
        //获取OID，然后获取发起的流程
        const OID = getParams('OID') || getParams('WorkID') || 0;
        const gwfs = new GenerWorkFlowExts();
        await gwfs.Retrieve('PWorkID', OID);
        if (gwfs.length > 0) {
          modalShow('Track', '轨迹');
          const gwf = gwfs[0];
          compInfo.component = markRaw(
            createAsyncComponent(() => import('/src/WF/WorkOpt/OneWork/Track.vue'), {
              loading: true,
            }),
          );
          compInfo.params = { WorkID: gwf.WorkID, FK_Node: gwf.FK_Node, FK_Flow: gwf.FK_Flow };
          return;
        } else {
          message.info('还未开始审核');
          return;
        }
      }
      if (entityWG.value != null && type === 'WaiGua') {
        const rowData = await formRef.value?.VerifyFormData(true);
        entityWG.value?.BtnClick('EntityToolbar', btnName, '', rowData);
        return;
      }

      message.warn(`[type = '${type}'] 未实现`);
    } catch (e: any) {
      message.error(e.toString());
    }
  };
  type ButtonList = Array<{ BtnID: EventType; BtnLab: string }>;
  const buttonList = ref<ToolbarButtonDef[]>([]);
  const route = useRoute();
  const dataBtn = ref<ButtonList>();
  const getParams = (name: string) => route.query[name] || originalProps[name] || '';
  const InitToolbar = async () => {
    //初始化单据控制表.
    const gb = new GenerBill();
    gb.WorkID = getParams('WorkID'); //获得传来的参数.
    await gb.RetrieveFromDBSources();

    //如果是空白状态.
    let btns: Array<{ BtnID: EventType; BtnLab: string; params?: {} }> = [
      {
        BtnID: EventType.Save,
        BtnLab: '保存',
      },
      {
        BtnID: EventType.Delete,
        BtnLab: '删除',
      },
      {
        BtnID: EventType.Archive,
        BtnLab: '归档',
      },
    ];
    let frmIsReadonly = false;

    if (gb.BillState == 0 || gb.BillState == 1) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Submit,
        BtnLab: '提交审核',
      });
    }

    //如果是草稿.
    // if (gb.BillState == 1) {
    //   btns = '/保存/删除/归档/提交审核/';
    // }

    //如果是编辑中.
    if (gb.BillState == 2) {
      // btns = '/保存/删除/归档/提交审核/设置草稿';
      btns.push(
        {
          BtnID: EventType.Submit,
          BtnLab: '提交审核',
        },
        {
          BtnID: EventType.Draft,
          BtnLab: '设置草稿',
        },
      );
    }
    //如果是审核中.
    if (gb.BillState == 3) {
      // 如果是当前处理人.
      if (WebUser.No == gb.Starter) {
        btns.push(
          {
            BtnID: EventType.Submit,
            BtnLab: '提交审核',
          },
          {
            BtnID: EventType.Cancel,
            BtnLab: '撤销',
          },
        );
      } else {
        btns.push(
          {
            BtnID: EventType.Return,
            BtnLab: '退回',
          },
          {
            BtnID: EventType.Approve,
            BtnLab: '提交审核',
          },
        );
        // btns = '/归档/提交审核/退回/批准/';
      } //如果是审核人.
      frmIsReadonly = true;
    }

    if (gb.BillState == 100 || gb.Starter == WebUser.No) {
      // btns = '/保存/删除/归档/';
      frmIsReadonly = true;
    }

    //如果是归档.
    if (gb.BillState == 100) {
      // btns = '/保存/删除/归档/';
      frmIsReadonly = true;
    }

    // alert(btns);
    // alert(frmIsReadonly);

    //通用按钮: 打印/轨迹/
    btns.push(
      {
        BtnID: EventType.PrintHtml,
        BtnLab: '打印',
      },
      {
        BtnID: EventType.Track,
        BtnLab: '轨迹',
      },
    );
    dataBtn.value = btns;
    const printTypeArr = ['PrintZip', 'PrintHtml', 'PrintPDF', 'PrintRTF'];
    for (let i = 0; i < printTypeArr.length; i++) {
      if (type.value == printTypeArr[i]) {
        if (type.value == 'PrintZip') {
          type.value = 'ExpZip';
        }
        dataBtn.value = btns.filter((item) => item.BtnID == type.value);
      }
    }

    let btnList = dataBtn.value;
    if (props.isFramework) {
      btnList = btnList.filter((btn) => btn.BtnLab !== '新建' && btn.BtnLab !== '删除');
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
          handleButtonClick(button.BtnID, button.BtnLab);
        },
      };
    });
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
    title.value = formData.value.Sys_MapData[0].Name;
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
  const InitDict = async () => {
    try {
      loading.value = true;
      // 初始化页面参数
      InitPageParam();
      if (!props.params.isShowBar) isShowBar.value = true;
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn('WGEntity_' + getParams('FrmID'));
      if (entityWG.value != null) entityWG.value.params = props.params;
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
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
  InitDict();
</script>

<style lang="less" scoped>
  .input-card {
    // margin-top: 10px;
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
</style>
