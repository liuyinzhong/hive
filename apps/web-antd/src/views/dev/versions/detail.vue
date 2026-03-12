<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useTabs } from '@vben/hooks';
import { Page } from '@vben/common-ui';
import { useRoute } from 'vue-router';
import { Card } from 'ant-design-vue';
import { type DevVersionApi, getVersionDetail } from '#/api/dev';
import { AnalysisChartCard } from '@vben/common-ui';

import AnalyticsVisitsData from './component/analytics-visits-data.vue';
import AnalyticsVisitsSales from './component/analytics-visits-sales.vue';
import AnalyticsVisitsSource from './component/analytics-visits-source.vue';

defineOptions({
  name: 'VersionDetail',
});

const route = useRoute();

const { setTabTitle } = useTabs();

const versionId: any = computed(() => {
  return route.params?.versionId ?? '-1';
});

const versionInfo = ref<DevVersionApi.DevVersionFace>({});
onMounted(async () => {
  versionInfo.value = await getVersionDetail(versionId.value);
  setTabTitle(`版本详情 ${versionInfo.value.version}`);
});
</script>
<template>
  <Page autoContentHeight>
    <Card>
      <div class="mt-5 w-full md:flex">
        <AnalysisChartCard
          class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
          title="访问数量"
        >
          <AnalyticsVisitsData />
        </AnalysisChartCard>
        <AnalysisChartCard
          class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
          title="访问来源"
        >
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
        <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="本周任务">
          <AnalyticsVisitsSales />
        </AnalysisChartCard>
      </div>
    </Card>
  </Page>
</template>
