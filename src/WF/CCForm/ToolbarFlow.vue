<template>
  <div style="background-color: transparent; height: 100%; margin-left: auto">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        <FlowError :doc="errorObj.tips" :isShowCloseBtn="false" />
      </div>
      <div v-else class="toolbar-flow">
        <!-- 流程状态显示 -->
        <!-- <Button :style="{ color: tag?.color }" size="small"> {{ tag?.name }}</Button> -->
        <Tag v-if="!!tag && tag.name==='退回'" color="red" @click="OpenInfo()">退回信息</Tag>
        <Tag v-if="!!tag" :color="tag?.color">{{ tag?.name }}</Tag>
        <!-- 优先级 -->
        <Select v-model:value="PRIOptions.value" style="width: 100%" :allow-clear="false" @change="(activeNo, _) => shiftPRI(activeNo as string)" :disabled="isReadonly">
          <SelectOption v-for="item in PRIOptions.options" :key="item.value">
            <Tooltip :title="item.name" placement="right">
            <i class="glyphicon glyphicon-bookmark" :style="{ color: item.label || '#ffde72'}"/>
            </Tooltip>
          </SelectOption>
        </Select>
        <!-- 收藏 -->
        <Tooltip :title="Collect == 1 ? '取消收藏' : '收藏'">
          <div class="collect" @click="isCollect(Collect)">
            <template v-if="Collect == 1"> <StarFilled style="color: gold; font-size: 18px" /></template>
            <template v-else> <StarOutlined style="font-size: 18px" /></template>
          </div>
        </Tooltip>
      </div>
    </Spin>
    <Modal
     v-model:open="modalVisible"
        centered
        title="退回消息"
        :bodyStyle="{height:'500px'}"
        :footer="null">
        <div style="overflow-y: auto; height: 100%">
          <div v-for="item in dataList" style="margin: 12px;border: 1px solid rgb(204, 204, 204);padding: 12px;">
            <div class="vant-address-item">
              <div class="vant-cell vant-cell--borderless">
                <div class="vant-cell__value vant-cell__value--alone">
                  <div class="vant-gl-text">
                      <span style="color: #808399"> 来自节点:</span>
                      <span>{{ item.nodeName }}</span>
                  </div>
                  <div class="vant-gl-text">
                      <span style="color: #808399"> 退回人:</span>
                      <span>{{ item.empName }}</span>
                  </div>
                  <div class="vant-gl-text">
                      <span style="color: #808399"> 退回时间:</span>
                      <span>{{ item.dt }}</span>
                  </div>
                  <div class="vant-gl-text">
                      <span style="color: #808399"> 退回消息:</span>
                      <span>{{ item.msg }}</span>
                  </div>
                  <div v-if="item.ath.length>0">
                    <span>附件:</span>
                    <template v-for="db in item.ath" :key="db.MyPK">
                      <Button type="link" @click="PreviewAth(db)">{{ db.FileName }}</Button>
                      <DownloadOutlined style="color:#1677ff" @click="DownLoadAth(db)"/>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </Modal>
    <Drawer :visible="drawer.visible" :title="drawer.title" :width="drawer.width" @close="drawerClose" :body-style="{ padding: '0 12px' }">
      <iframe v-if="drawer.type == 'AthViewFile'" :src="drawer.iframeAthView" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
    </Drawer>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { Spin, Select, SelectOption, Tag, Tooltip, message, Modal,Button, Drawer } from 'ant-design-vue';
  import { StarFilled, StarOutlined, DownloadOutlined } from '@ant-design/icons-vue';
  import FlowError from '/@/WF/FlowError.vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { getAppEnvConfig } from '/@/utils/env';
  import Dev2InterfaceAth from './Dev2InterfaceAth';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

  const props = defineProps({
    params: {
      //表单属性集合
      type: Object,
      default: () => {},
    },
  });

  interface TagExt {
    name: string;
    color: string;
  }
  interface PRIExt {
    label: string;
    value: number;
  }
  //获取传的参数
  const loading = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const WorkID = props.params.WorkID as string;
  //流程状态显示
  const State = ref<string>();
  const tag = ref<TagExt>();
  //优先级显示
  const PRIOptions = reactive({
    value: 0,
    options: [
      {
        label: '#80a22e',
        value: 0,
        name:'低',
      },
      {
        label: '#ffde72',
        value: 1,
        name: '中',
      },
      {
        label: '#db382e',
        value: 2,
        name: '高'
      },
    ],
  });
  //弹窗显示
  const drawer = reactive({
    visible: false,
    closable: true,
    type: '',
    title: '',
    width: 800,
    modalHeight: {},
    iframeAthView:'',
  });
  const drawerClose = () => {
    drawer.visible = false;
  };
  //收藏
  const Collect = ref<number>(0);
  const isReadonly = ref(false);

  const InitPage = async () => {
    try {
      const gwf = new BSEntity('BP.WF.GenerWorkFlow');
      gwf.setPK(WorkID as string);
      await gwf.RetrieveFromDBSources();
      //流程状态
      if(props.params.pageType === 'MyView' || props.params.pageType === 'MyFrm'){
        State.value = '@已审批=green';
        GetTextTags(State.value);
      }
       
      else if(props.params.pageType === 'MyCC'){
        //State.value = '@已阅=green';
        //GetTextTags(State.value);
      }else{
        getState(gwf.getData().WFState);
      }
      
      //优先级
      PRIOptions.value = gwf.getData().PRI;
      //收藏
      Collect.value = GetPara(gwf.getData().AtPara, 'F_' + WebUser.No);

      if (props.params.pageType === 'MyView' || props.params.pageType === 'MyFrm' || props.params.pageType === 'MyCC') 
        isReadonly.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 状态获取
   * @param WFState
   */
  const getState = (WFState: number) => {
    switch (WFState) {
      case 0:
      case 1:
        State.value = '@草稿=orange';
        break;
      case 2:
        State.value = '@新工作=green';
        break;
      case 3:
        State.value = '@归档=blue';
        break;
      case 4:
        State.value = '@挂起=yellow';
        break;
      case 5:
        State.value = '@退回=red';
        break;
      case 6:
        State.value = '@移交=red';
        break;
      case 7:
        State.value = '@作废=red';
        break;
      case 8:
        State.value = '@加签=green';
        break;
    }
    GetTextTags(State.value);
  };

  /**
   * 获取标签表示的内容
   * @param State
   * @constructor
   */
  const GetTextTags = (State) => {
    if (typeof State == 'string') {
      splitAtString(State).forEach((item) => {
        tag.value = {
          name: item.split('=')[0],
          color: item.split('=')[1],
        };
      });
      return tag.value;
    } else return [];
  };
  /**
   * 切换优先级
   * @param PRI
   * @constructor
   */
  const shiftPRI = async (PRI) => {
    //优先级切换逻辑
    const gwf = new BSEntity('BP.WF.GenerWorkFlow');
    gwf.setPK(WorkID as string);
    await gwf.Init();
    gwf.PRI = PRI;
    await gwf.Update();
  };
  /**
   * 是否收藏
   * @param Show
   */
  const isCollect = async (Show) => {
    if (Show == 1) {
      Collect.value = 0;
    } else {
      Collect.value = 1;
    }
    const gwf = new BSEntity('BP.WF.GenerWorkFlow');
    gwf.setPK(WorkID as string);
    await gwf.Init();
    gwf.setPara('F_' + WebUser.No, Collect.value);
    await gwf.Update();
  };
  /**
   * 显示退回及附件信息
   */

  const dataList = ref<Record<string,any>[]>();
  const modalVisible = ref(false);
  const OpenInfo=async ()=>{
    try{
      
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnJson("Return_Info");
      const info = data['Info'];
      const athList = data['Ath'];
      dataList.value = [];
      info.forEach(info=>{
        const item={
          nodeName:info.NDFromT || info.ndfromt || info.NDFROMT,
          empName: info.EmpFromT || info.empfromt || info.EMPFROMT,
          dt: info.RDT || info.rdt || info.RDT,
          msg: info.Msg || info.msg || info.MSG,
          ath: athList.filter(ath=>parseInt(ath.MyNote || '0') === (info.MyPK || info.mypk || info.MYPK))
        };
        dataList.value?.push(item);
      })
      modalVisible.value = true;
    }catch(e){
      message.error(e as string)
      return;
    }
    
  }
  const drawerShow = (type: string, title: string, width: number = window.innerWidth * 0.8) => {
    drawer.visible = true;
    drawer.type = type;
    drawer.title = title;
    drawer.width = width;
  };

  const DownLoadAth = async (record) => {
    Dev2InterfaceAth.OpenAthGener(record.MyPK);
  };
  const PreviewAth = async(record)=>{
    if (CommonConfig.IsOnlinePreviewOfAth == true) {
      drawer.iframeAthView = await Dev2InterfaceAth.OpenAthKKView(record.MyPK) || '';
      drawerShow('AthViewFile', '预览', window.innerWidth * 1);
      return;
    }
    DownLoadAth(record.MyPK);
  }
  function GetFileUrl(mypk) {
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    const apiPath = '/WF/Comm/ProcessRequest';
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
  InitPage();
</script>
<style scoped lang="less">
  .toolbar-flow {
    height: 100%;
    display: flex;
    background-color: transparent;
    :deep(.ant-tag) {
      padding: 5px;
    }
    .collect {
      display: flex;
      align-items: center;
      margin: 0 10px;
    }
  }
  .vant-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }
  .vant-cell__value {
    position: relative;
    overflow: hidden;
    color: var(--van-cell-value-color);
    text-align: left;
    vertical-align: middle;
    word-wrap: break-word;
  }
</style>
