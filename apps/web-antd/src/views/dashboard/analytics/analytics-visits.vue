<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { getTaskFindYear } from '#/api/statistics/dev';
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  getTaskFindYear({ year: 2026 }).then((res) => {
    renderEcharts({
      grid: {
        bottom: 0,
        containLabel: true,
        left: '1%',
        right: '1%',
        top: '2 %',
      },
      series: [
        {
          barMaxWidth: 80,
          // color: '#4f69fd',
          data: res.list,
          type: 'bar',
        },
      ],
      tooltip: {
        formatter: '{c}小时',
        axisPointer: {
          lineStyle: {
            // color: '#4f69fd',
            width: 1,
          },
        },
        trigger: 'axis',
      },
      xAxis: {
        data: Array.from({ length: 12 }).map(
          (_item, index) => `${index + 1}月`,
        ),
        type: 'category',
      },
      yAxis: {
        type: 'value',
      },
    });
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
