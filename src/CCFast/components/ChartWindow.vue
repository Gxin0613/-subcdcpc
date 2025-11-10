<template>
  <BaseComponent ref="baseComp">
    <div ref="chartRef" class="chart-window"></div>
  </BaseComponent>
</template>

<script setup lang="ts">
  // import * as echarts from 'echarts/core';
  // import { GridComponent, DatasetComponent, TitleComponent, TooltipComponent, VisualMapComponent, LegendComponent, ToolboxComponent } from 'echarts/components';
  // import { PieChart } from 'echarts/charts';
  // import { LabelLayout } from 'echarts/features';
  // import { LineChart } from 'echarts/charts';
  // import { BarChart } from 'echarts/charts';
  // import { UniversalTransition } from 'echarts/features';
  // import { CanvasRenderer } from 'echarts/renderers';

  import { EChartsOption } from 'echarts';
  import { onMounted, watch, shallowRef, onUnmounted } from 'vue';

  import * as echarts from 'echarts';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import { windowOpen } from '/@/utils/windowOpen';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  // import chinaMap from '../../assets/china/china.json';

  // 初始化echarts
  // echarts.use([
  //   GridComponent,
  //   LineChart,
  //   PieChart,
  //   BarChart,
  //   TitleComponent,
  //   TooltipComponent,
  //   VisualMapComponent,
  //   LegendComponent,
  //   ToolboxComponent,
  //   UniversalTransition,
  //   LabelLayout,
  //   CanvasRenderer,
  //   DatasetComponent,
  // ]);

  const props = defineProps({
    options: {
      type: Object as PropType<EChartsOption>,
      default: () => ({}),
    },
  });
  const chartRef = shallowRef<HTMLElement>();
  let chartEl: any = null;
  const handleChartResize = () => {
    if (chartEl) chartEl.resize();
  };
  const initChart = () => {
    const el = chartRef.value!;
    if (!chartEl) {
      chartEl = echarts.init(el);
      // echarts.registerMap('china', chinaMap);  //注册地图
    }
    //内容清空进行重绘
    chartEl.clear(); //清除
    window.onresize = chartEl.resize;
    //end
    chartEl.setOption(props.options);
    // 类型安全的点击事件处理
    chartEl.on('click', (params: echarts.ECElementEvent) => {
      if (!!params.data.customData && params.data.customData.IsOpen) {
        const customData = params.data.customData;
        const openWay = customData.DtlOpenWay;
        const url = GloComm.UrlGenerList('GL_Jump', '&Key=' + customData.Key + '&PKVal=' + customData.PKVal);
        //`@0=抽屉50%@1=抽屉70%@2=抽屉90%@3=弹窗打开@4=新窗口打开
        if (openWay === 0 || openWay === 1 || openWay === 2) baseComp.value?.openDrawerByUrl('明细', url, openWay === 0 ? '50%' : openWay === 1 ? '70%' : '90%');
        if (openWay === 3) {
          baseComp.value?.openModalByUrl('明细', url, null, customData.DtlW == 0 ? 500 : customData.DtlW, customData.DtlH == 0 ? 300 : customData.DtlH);
        }
        if (openWay === 4) {
          windowOpen('/#/WF/GenerList?EnName=GL_Jump&Key=' + customData.Key + '&PKVal=' + customData.PKVal);
        }
      }
    });
  };
  watch(
    () => props.options,
    () => {
      initChart();
    },
  );
  onMounted(() => {
    initChart();
    //监听变化自适应
    window.addEventListener('resize', handleChartResize);
  });
  onUnmounted(() => {
    //监听变化自适应
    window.removeEventListener('resize', handleChartResize);
  });

  // onBeforeUnmount(() => {
  // });
</script>

<style scoped lang="less">
  .chart-window {
    width: 100%;
    height: 100%;
  }
</style>
