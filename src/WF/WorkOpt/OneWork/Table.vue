<template>
  <div class="p-1">
    <Spin :spinning="loading" style="background-color: white">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content">
        <BasicTable @register="registerTable" :pagination="false">
          <template #action="{ record, column }">
            <TableAction :actions="createActions(record, column)" />
          </template>
        </BasicTable>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
    import { Spin, Tooltip, message } from 'ant-design-vue';
  import { ActionItem, BasicColumn, BasicTable, EditRecordRow, TableAction, useTable } from '/@/components/Table';
  // 父组件传过来的属性
  import { h, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { ActionType } from '/@/WF/WorkOpt/OneWork/ActionType';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import WebUser from '/@/bp/web/WebUser';
  interface TrackItem {
    MyPK: string;
    idx: number;
    NodeName: string;
    Province: string;
    Msg: string;
    ActionType: string;
    ActionTypeText: string;
    EmpName: string;
    StartTime: string;
    EndTime: string;
    PassTime: string;
  }
  const props = defineProps({
    params: {
      //请求参数集合
      type: Object,
      default: () => {},
    },
  });
  //错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);
  const columns: BasicColumn[] = [
    {
      title: '#',
      dataIndex: 'idx',
      width: 50,
    },
    {
      title: '执行环节',
      dataIndex: 'NodeName',
      width: 100,
    },
    {
      title: '信息',
      dataIndex: 'Msg',
      ellipsis: true,
      customRender(opt) {
        if (opt.text.length < 9) return opt.text;
        return h(Tooltip, { title: opt.text, placement: 'top' }, () => h('span', {}, opt.text.substring(0, 9) + '...'));
      },
    },
     {
       title: '操作类型',
       dataIndex: 'ActionTypeText',
     },
    {
      title: '执行人',
      dataIndex: 'EmpName',
    },
    {
      title: '开始时间',
      dataIndex: 'StartTime',
      width: 180,
    },
    {
      title: '结束时间',
      dataIndex: 'EndTime',
      width: 180,
    },
    {
      title: '历时',
      dataIndex: 'PassTime',
    },
  ];
  const tableData = ref<TrackItem[]>([]);
  const InitPage = async () => {
    try {
      loading.value = true;
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_OneWork');
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnString('TimeBase_Init');
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('err@', ''));
        return;
      }
      const result = JSON.parse(JSON.stringify(data));
      ParseTrackOfTable(result);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  };
  /**
   * 解析流程轨迹table展示
   */
  const ParseTrackOfTable = (trackData) => {
    const tracks = trackData['Track'];
    //获得流程引擎注册表信息.
    const gwf = trackData['WF_GenerWorkFlow'][0];
    //审核组件信息.
    const fwc = trackData['FrmWorkCheck'][0];
    //获得工作人员列表.
    const gwls = trackData['WF_GenerWorkerList'];
    const executor = GetPara(gwf.AtPara, 'Auth') || ''; //授权办理人
    //解析列表
    const idx = ref(0);
    const trackResults = tracks.filter(
      (track) =>
        track.ActionType != ActionType.FlowBBS &&
        track.ActionType != ActionType.WorkCheck &&
        track.ActionType != ActionType.AutoWorkCheck &&
        !(fwc.FWCMsgShow == '1' && track.NDFrom == props.params.FK_Node && WebUser.No != track.EmpTo),
    );
    trackResults.forEach((track) => {
      const trackItem = <TrackItem>{};
      //前进、结束、队列模式
      //处理情况的解析
      if (track.ActionType == ActionType.Forward || track.ActionType == ActionType.FlowOver || track.ActionType == ActionType.TeampUp || track.ActionType == ActionType.Order) {
        if (fwc.FWCVer == 0) {
          const checkTrack = tracks.filter((item) => item.NDFrom == track.NDFrom && item.ActionType == ActionType.WorkCheck && item.EmpFrom == track.EmpFrom);
          if (checkTrack.length > 0) trackItem.Msg = checkTrack[0].Msg;
        } else {
          const val = track.Msg.replace('null', '').split('WorkCheck@');
          if (val.length == 2) trackItem.Msg = val[1];
        }
      }
      trackItem.Msg = trackItem.Msg || '无';
      if (trackItem.Msg == '0') trackItem.Msg = '无';

      if (trackItem.Msg != '无') trackItem.Msg = trackItem.Msg.replace(new RegExp('\t\n', 'g'), '<br>').replace('null', '');
      //获取开始时间、结束时间
      if (idx.value == 0) {
        trackItem.StartTime = track.RDT;
        trackItem.EndTime = track.RDT;
      } else {
        //上一节点的到达时间就是本节点的开始时间
        const track1 = trackResults[idx.value - 1];
        trackItem.StartTime = track1.RDT;
        trackItem.EndTime = track.RDT;
      }
      const seconds = dayjs(trackItem.EndTime).diff(trackItem.StartTime, 'second');
      trackItem.PassTime = formatSeconds(seconds);
      trackItem.NodeName = track.NDFromT;
      if (executor.includes(track.EmpFromT) == true) trackItem.Province = executor.replace('给' + track.EmpFromT, '');
      else trackItem.Province = '已办理';
      trackItem.ActionType = track.ActionType;
      trackItem.ActionTypeText = track.ActionTypeText;
      trackItem.EmpName = track.EmpFromT;
      trackItem.idx = idx.value++;
      trackItem.MyPK = track.MyPK;
      tableData.value.push(trackItem);
    });

    //当前节点的待办

    //是否还有未审核的处理人
    if (!!gwls) {
      const gwlResults = gwls.filter((gwl) => gwl.IsPass != 1);
      gwlResults.forEach((gwl) => {
        const trackItem = <TrackItem>{};
        trackItem.idx = idx.value++;
        trackItem.NodeName = gwl.NodeName;
        trackItem.Province = parseInt(gwl.IsRead) == 0 ? '未阅读' : '已阅读';
       // trackItem.Msg = '';
        trackItem.ActionType = '等待处理';
        trackItem.EmpName = gwl.EmpName;
        trackItem.StartTime = gwl.RDT;
        trackItem.EndTime = '';
        trackItem.PassTime = '';
        trackItem.MyPK = '';
        tableData.value.push(trackItem);
      });
    }
  };
  InitPage();

  const [registerTable, { setTableData }] = useTable({
    title: '',
    columns: columns,
    dataSource: tableData.value,
    showIndexColumn: false,
    showTableSetting: false,
    tableSetting: { fullScreen: false },
    scroll: { y: window.innerHeight - 20 },
    /* actionColumn: {
      width: 160,
      title: '表单',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },*/
  });

  /**
   * 创建表单的操作
   * @param record
   * @param column
   */
  function createActions(record: EditRecordRow, column: BasicColumn): ActionItem[] {
    if (record.MyPK === '') return [];
    else
      return [
        {
          label: '打开表单',
          onClick: OpenFrm.bind(null, record, column),
        },
      ];
  }

  /**
   *秒数转化为时分秒
   * @param value
   */
  const formatSeconds = (value) => {
    //  秒
    const second = ref(parseInt(value));
    //  分
    const minute = ref(0);
    //  小时
    const hour = ref(0);
    //  如果秒数大于60，将秒数转换成整数
    if (second.value > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute.value = parseInt(second.value / 60);
      //  获取秒数，秒数取佘，得到整数秒数
      second.value = parseInt(second.value % 60);
      //  如果分钟大于60，将分钟转换成小时
      if (minute.value > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour.value = parseInt(minute.value / 60);
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute.value = parseInt(minute.value % 60);
      }
    }
    let result = '' + parseInt(second.value) + '秒';
    if (minute.value > 0) {
      result = '' + parseInt(minute.value) + '分' + result;
    }
    if (hour.value > 0) {
      result = '' + parseInt(hour.value) + '小时' + result;
    }
    return result;
  };
  /**
   * 打开表单，查看历史数据
   * @param record
   * @constructor
   */
  const OpenFrm = async (record) => {
    //ToDO暂未处理
  };
</script>
<style scoped></style>
