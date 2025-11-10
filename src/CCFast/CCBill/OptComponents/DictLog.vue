<template>
  <div>
    <div class="log" v-for="item in logList" :key="item.LDate + '_' + item.LTime">
      <span>{{ item.LDate }}</span>
      <span class="dot"></span>
      <span>{{ item.LTime }}</span>
      <span class="recName">{{ item.RecName }}</span>
      <span>{{ item.ActionTypeText }}</span>
      <span>{{ item.Msg }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
  const logList = ref<TDictLog[]>([]);

  interface TDictLog {
    RecName: string;
    ActionTypeText: string;
    Msg: string;
    LDate: string;
    LTime: string;
  }

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  function padDate(value: number): string {
    return value < 10 ? '0' + value.toString() : value.toString();
  }

  function formatTime(value: string): string {
    var date = new Date(value);
    var hours = padDate(date.getHours());
    var minutes = padDate(date.getMinutes());
    return hours + ':' + minutes;
  }

  function formatDate(value: string): string {
    var date = new Date(value);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效的日期';
    }

    // 获取年份、月份（加1以转换为人类可读的月份）、日期
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');

    // 计算星期几，注意 getDay() 返回的是 0-6（周日-周六）
    var weekDayIndex = date.getDay();
    var week = '星期' + ['日', '一', '二', '三', '四', '五', '六'][weekDayIndex];

    // 返回格式化的日期和星期
    return year + '-' + month + '-' + day + '  ' + week;
  }

  const loadData = async () => {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_OptComponents');
    handler.AddPara('FrmID', props.params.FrmID);
    if (!props.params.PTable) {
      const mapdata = new MapData(props.params.FrmID);
      await mapdata.Retrieve();
      handler.AddPara('PTable', mapdata.PTable);
    } else {
      handler.AddPara('PTable', props.params.PTable);
    }
    handler.AddPara('WorkID', props.params.PKVal || props.params.workID);
    const ens = await handler.DoMethodReturnJson('Track_Init');

    ens.sort((a, b) => {
      const dateA = new Date(a.RDT).getTime();
      const dateB = new Date(b.RDT).getTime();
      return dateB - dateA;
    });

    ens.forEach(async (item) => {
      logList.value.push({
        RecName: item.RecName,
        ActionTypeText: item.ActionTypeText,
        Msg: item.Msg,
        LDate: formatDate(item.RDT),
        LTime: formatTime(item.RDT),
      });
    });
  };

  onMounted(async () => {
    await loadData();
  });
</script>

<style lang="less" scoped>
  .log {
    padding: 20px 10px 20px 30px;
    display: flex;
    align-items: center;

    span {
      display: inline-block;
      margin-right: 15px;
    }

    .recName {
      display: inline-block;
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background-color: #1890ff;
      color: #fff;
      line-height: 40px;
      text-align: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background-color: #67c23a;
    }
  }
</style>
