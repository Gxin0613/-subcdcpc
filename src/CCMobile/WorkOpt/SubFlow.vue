<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <Collapse v-model="activeNames" :border="false" :accordion="true">
        <template v-for="(item, index) in subFlowData" :key="index">
          <CollapseItem :title="item['SubFlowName']" :name="item['SubFlowName']">
            <div v-if="item.IsCanStart && item.Title === undefined" style="text-align: right">
              <a @click="StartFlow(item)">[{{ item.SFCaption }}]</a>
            </div>
            <template v-for="(child, idx) in item.children" :key="idx">
              <div class="vant-address-item" @click="OpenFlow(child)">
                <div class="vant-cell vant-cell--borderless">
                  <div class="vant-cell__value vant-cell__value--alone">
                    <span v-for="column in columns" :key="column.key">
                      <div v-if="column.key === 'Title'" class="vant-gl-link-text">
                        <img :src="GLtongyong" alt="" width="30" style="margin-right: 5px" /> {{ column.title }}:{{ child[column.key] }}
                      </div>
                      <div v-else class="vant-gl-text">
                        <span style="color: #808399"> {{ column.title }}</span>
                        <span>{{ child[column.key] }}</span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </CollapseItem>
        </template>
      </Collapse>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { Spin } from 'ant-design-vue';
  import { Collapse, CollapseItem, Empty, Grid, GridItem, NavBar, PullRefresh, Search, showToast, Tag, Button, Popup } from 'vant';
  // 父组件传过来的属性
  import { onMounted, reactive, ref, shallowRef } from 'vue';
  import { SubFlowHands } from '/@/WF/Admin/AttrNode/SubFlow/SubFlowHand';
  import { FrmSubFlow } from '/@/WF/TSClass/FrmSubFlow';
  import WebUser from '/@/bp/web/WebUser';
  import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import BSEntities from '/@/utils/gener/BSEntities';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { MessageTypeEnum } from '/@/enums/messageTypeEnum';
  import GLtongyong from '/@/assets/images/gltongyong.png';
  import { useRouter } from 'vue-router';
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    nodeInfo: {
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
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const activeNames = ref<string>('');
  const router = useRouter();
  const columns = [
    {
      title: '标题',
      dataIndex: 'Title',
      key: 'Title',
    },
    {
      title: '发起人',
      dataIndex: 'StarterName',
      key: 'StarterName',
    },
    {
      title: '停留节点',
      dataIndex: 'NodeName',
      key: 'NodeName',
    },
    {
      title: '状态',
      dataIndex: 'WFStateText',
      key: 'WFStateText',
    },
    {
      title: '处理人',
      dataIndex: 'TodoEmpNames',
      key: 'TodoEmpNames',
    },
    {
      title: '处理时间',
      dataIndex: 'RDT',
      key: 'RDT',
    },
  ];
  const loading = ref(false);
  const showType = ref('Table');
  const subFlowData = ref<any[]>([]);
  const gwf = ref<GenerWorkFlowExt>({});
  const InitPage = async () => {
    try {
      //当前节点手动启动的所有子流程.
      const subFlows = new SubFlowHands();
      const nodeID = props.nodeInfo.NodeID;
      await subFlows.Retrieve('FK_Node', nodeID, 'SubFlowType', 0, 'Idx');

      //父子流程组件的通用配置信息
      const frmSubFlow = new FrmSubFlow(nodeID);
      await frmSubFlow.Retrieve();

      //获取当前流程实例信息
      const en = new GenerWorkFlowExt(props.params.WorkID);
      await en.Retrieve();
      gwf.value = en;
      //处理累加表单问题，如果当前节点与，绑定子流程的节点不一致，就把他设置为只读.
      if (props.params.FK_Node != nodeID) {
        subFlows.forEach((subFlow) => (subFlow.SubFlowSta = 2));
      }

      //子流程组件配置,控制表单行为的。
      const fsf = new FrmSubFlow(nodeID);
      await fsf.Retrieve();
      //单条启动模式还是会签启动模式
      const subFlowGuids = subFlows.filter((subFlow) => subFlow.SubFlowStartModel != 0);
      //表格/列表显示方式
      showType.value = subFlowGuids.length > 0 ? 'List' : 'Table';
      if (showType.value === 'Table') await ShowTableSubFlow(subFlows, frmSubFlow, en);
      activeNames.value = subFlowData.value[0]['SubFlowName'];
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * Table展示父子流程
   * @param subFlows 绑定的子流程
   * @param frmSubFlow 父子流程组件属性
   * @param gwf 当前流程实例的信息
   * @constructor
   */
  const ShowTableSubFlow = async (subFlows, frmSubFlow, gwf) => {
    for (const subFlow of subFlows) {
      if (subFlow.SubFlowSta != 0) {
        let item = Object.fromEntries(subFlow.Row);
        let pworkid = 0;
        const subflowModel = subFlow.SubFlowModel || 0;
        //启用、只读状态
        if (frmSubFlow.SFSta === 1 && subFlow.SubFlowSta === 1 && props.isReadonly === false) {
          //父子流程组件启用且当前子流程启用，并且当前流程实例的状态是审批状态
          if (subflowModel == 0) {
            // 下级子流程
            pworkid = props.params.WorkID;
            item['IsCanStart'] = true;
          }
          if (subflowModel == 1) {
            //平级子流程
            if (gwf.PWorkID == 0) {
              item['IsCanStart'] = false;
            } else {
              pworkid = gwf.PWorkID;
            }
          }
        }
        if (frmSubFlow.SFSta === 2 || subFlow.SubFlowSta === 2 || props.isReadonly === true) {
          item['IsCanStart'] = false;
          if (subflowModel == 1) pworkid = gwf.PWorkID;
        }
        item.SFCaption = item.SFCaption || '启动子流程';
        //获取发起的子流程
        const gwfs = new BSEntities('BP.WF.GenerWorkFlows');
        if (subFlow.SFShowCtrl == 0) await gwfs.Retrieve('PWorkID', pworkid.toString(), 'FK_Flow', subFlow.SubFlowNo);
        else await gwfs.Retrieve('PWorkID', pworkid.toString(), 'FK_Flow', subFlow.SubFlowNo, 'Starter', WebUser.No);
        item['StarterName'] = subFlow.SubFlowName;
        item.children = [];
        item['key'] = subFlow.FK_Flow;
        gwfs.getData().forEach((gwf) => {
          if (gwf.WFState == 0) return;
          gwf.WFStateText = GetState(gwf.WFState);
          const slWorkID = GetPara(gwf.AtPara, 'SLWorkID') || 0;
          if (slWorkID != 0 && slWorkID != props.params.WorkID)
            //不是当前流程实例启动的平级子流程
            return;
          let str = gwf.TodoEmps || '';
          let result = str.split(';');
          const reg = /[a-zA-Z\,]+/;
          while ((result = str.match(reg))) {
            str = str.replace(result[0], '');
          }

          gwf['TodoEmpNames'] = str;
          item.children.push(gwf);
        });
        subFlowData.value.push(item);
      }
    }
  };

  const GetState = (wfState) => {
    switch (parseInt(wfState)) {
      case 1:
        return '草稿';
      case 2:
        return '新工作';
        break;
      case 3: //已完成.
        return '归档';
        break;
      case 4:
        return '挂起';
      case 5:
        return '退回';
      case 6:
        return '转发';
      case 7:
        return '删除';
      case 8:
        return '加签';
      case 11:
        return '加签回复';
      default:
        return '其它';
    }
  };
  InitPage();
  /**
   * 发起子流程
   * @param row
   * @constructor
   */
  const StartFlow = (row) => {
    const subflowModel = row.SubFlowModel || 0;
    let url = '/CCMobile/MyFlow?';
    if (subflowModel == 0)
      url +=
        'IsStartSameLevelFlow=0&&FK_Flow=' +
        row.SubFlowNo +
        '&PWorkID=' +
        gwf.value.WorkID +
        '&PNodeID=' +
        gwf.value.FK_Node +
        '&PFlowNo=' +
        gwf.value.FK_Flow +
        '&PFID=' +
        gwf.value.FID;
    else
      url +=
        'IsStartSameLevelFlow=1&&FK_Flow=' +
        row.SubFlowNo +
        '&PWorkID=' +
        gwf.value.PWorkID +
        '&PNodeID=' +
        gwf.value.PNodeID +
        '&PFlowNo=' +
        gwf.value.PFlowNo +
        '&PFID=' +
        gwf.value.PFID +
        '&SLWorkID=' +
        gwf.value.WorkID +
        '&SLNodeID=' +
        gwf.value.FK_Node +
        '&SLFlowNo=' +
        gwf.value.FK_Flow;

    router.push(url);
  };

  const iframeMessageHandler = async ({ data }) => {
    switch (data.type) {
      case MessageTypeEnum.ReloadPage:
        baseComponent.value?.resetIframe();
        await InitPage();
        break;
      default:
        break;
    }
  };
  onMounted(() => {
    window.addEventListener('message', iframeMessageHandler, true);
  });

  /**
   * 打开子流程
   * @param row
   * @constructor
   */
  const OpenFlow = (row) => {
    let url =
      '/CCMobile/MyView?WorkID=' +
      row.WorkID +
      '&FK_Flow=' +
      row.FK_Flow +
      '&IsCheckGuide=1&Frms=' +
      row.Paras_Frms +
      '&FK_Node=' +
      row.FK_Node +
      '&PNodeID=' +
      row.PNodeID +
      '&PWorkID=' +
      row.PWorkID;
    router.push(url);
  };
</script>
<style lang="less" scoped>
  .grid-title {
    text-align: center;
    height: 30px;
    margin-top: 12px;
    font-size: 12px;
    overflow-y: hidden;
  }
  .vant-content {
    box-sizing: border-box;
    height: var(--viewport-height);
    // padding-top: 46px;
    margin-top: 110px; //变量,是钉钉模式的时候是65px,正常模式110px
    // background-color: #fafafa;
    background-color: #f2f4f7;
  }
  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 10px;
  }
  .vant-collapse-item__title {
    background: #fafafa !important;
  }
  .vant-collapse-item__content {
    background: #fafafa !important;
  }
  .vant-gl-link-text {
    display: flex;
    align-items: center;
    margin-bottom: var(--van-padding-xs);
    font-size: var(--van-font-size-mg);
    line-height: var(--van-line-height-lg);
    font-weight: bold;
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
  .vant-doc-card {
    margin-bottom: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-doc-card {
    margin-bottom: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-h5 {
    padding: 15px 0 10px;
    margin-bottom: 0;
    font-size: 16px;
    font-weight: 500;
  }
  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: transparent;
  }
  .vant-h5 {
    color: #9ca3af;
  }
  //待办
  :deep(.van-collapse-item__content) {
    background-color: #f2f4f7;
  }
</style>
