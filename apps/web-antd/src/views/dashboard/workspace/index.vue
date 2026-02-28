<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  LucideHourglass,
  LucideBug,
  LucideChartBarStacked,
  LucideFilm,
} from '@vben/icons';
import type { AnalysisOverviewItem } from '@vben/common-ui';
import {
  AnalysisChartCard,
  WorkbenchHeader,
  AnalysisOverview,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();

const router = useRouter();

const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: LucideFilm,
    title: '需求',
    totalTitle: '总需求数',
    totalValue: 120_000,
    value: 2000,
  },
  {
    icon: LucideChartBarStacked,
    title: '任务',
    totalTitle: '总任务数',
    totalValue: 500_000,
    value: 20_000,
  },
  {
    icon: LucideBug,
    title: '缺陷',
    totalTitle: '总缺陷数',
    totalValue: 120_000,
    value: 8000,
  },
  {
    icon: LucideHourglass,
    title: '本周工时',
    totalTitle: '总工时',
    totalValue: 50_000,
    value: 5000,
  },
];
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.realName }}, 开始您一天的工作吧！
      </template>
      <template #description> 今日晴，20℃ - 32℃！ </template>
    </WorkbenchHeader>

    <div class="mt-5">
      <AnalysisOverview :items="overviewItems" />
    </div>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">你好</div>
      <div class="w-full lg:w-2/5">我好</div>
    </div>
  </div>
</template>
