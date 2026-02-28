<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { getTaskFindDay } from '#/api/statistics/dev';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  getTaskFindDay({
    date1: '2026/02/25',
    date2: '2026/02/26',
  }).then((res) => {
    renderEcharts({
      grid: {
        bottom: '15%',
        containLabel: true,
        left: '1%',
        right: '1%',
        top: '2 %',
      },
      legend: {
        data: ['昨天', '今天'],
      },
      series: [
        {
          name: '昨天',
          areaStyle: {},
          data: res.date1,
          itemStyle: {
            color: '#5ab1ef',
          },
          smooth: true,
          type: 'line',
        },
        {
          name: '今天',
          areaStyle: {},
          data: res.date2,
          itemStyle: {
            color: '#019680',
          },
          smooth: true,
          type: 'line',
        },
      ],
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: '#019680',
            width: 1,
          },
        },
        trigger: 'axis',
      },
      xAxis: {
        axisTick: {
          show: false,
        },
        boundaryGap: false,
        data: Array.from({ length: 24 }).map((_item, index) => `${index}:00`),
        splitLine: {
          lineStyle: {
            type: 'solid',
            width: 1,
          },
          show: true,
        },
        type: 'category',
      },
      yAxis: [
        {
          type: 'value',
        },
      ],
    });
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
