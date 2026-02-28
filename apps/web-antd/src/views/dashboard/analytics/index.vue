<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  LucideHourglass,
  LucideBug,
  LucideChartBarStacked,
  LucideFilm,
  LucideFileStack,
} from '@vben/icons';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

import { getWorkspaceEnum } from '#/api/statistics/dev';
import { onMounted, ref } from 'vue';

const overviewItems: any = ref([
  {
    icon: LucideFilm,
    title: '需求',
    totalTitle: '总需求数',
    totalValue: 0,
    totalValueFindKey: 'storyTotalNum',
    value: 0,
    valueFindKey: 'storyNum',
  },
  {
    icon: LucideChartBarStacked,
    title: '任务',
    totalTitle: '总任务数',
    totalValue: 0,
    totalValueFindKey: 'taskTotalNum',
    value: 0,
    valueFindKey: 'taskNum',
  },
  {
    icon: LucideBug,
    title: '缺陷',
    totalTitle: '总缺陷数',
    totalValueFindKey: 'bugTotalNum',
    totalValue: 0,
    valueFindKey: 'bugNum',
    value: 0,
  },
  {
    icon: LucideFileStack,
    title: '版本',
    totalTitle: '总版本数',
    totalValueFindKey: 'versionTotalNum',
    totalValue: 0,
    valueFindKey: 'versionNum',
    value: 0,
  },
  {
    icon: LucideHourglass,
    title: '本周工时',
    totalTitle: '总工时',
    totalValue: 50_000,
    value: 5000,
  },
]);

const chartTabs: TabOption[] = [
  {
    label: '任务趋势',
    value: 'trends',
  },
  {
    label: '工时总量',
    value: 'visits',
  },
];

onMounted(() => {
  getWorkspaceEnum({}).then((res) => {
    overviewItems.value.forEach((item: any) => {
      item.totalValue = res?.[item.totalValueFindKey] || 0;
      item.value = res?.[item.valueFindKey] || 0;
    });
  });
});
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="本周任务">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
