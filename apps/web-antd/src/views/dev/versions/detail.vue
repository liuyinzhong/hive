<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { DevVersionApi } from '#/api/dev';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AnalysisOverview, Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import {
  LucideBug,
  LucideCheckCircle,
  LucideFilm,
  LucideListTodo,
} from '@vben/icons';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { Card, Col, Collapse, CollapsePanel, Row } from 'ant-design-vue';

import { getVersionDetail, getVersionStatistics } from '#/api/dev';

defineOptions({
  name: 'VersionDetail',
});

const route = useRoute();
const { setTabTitle } = useTabs();

const versionId = computed<string>(() => {
  return (route.params?.versionId as string) ?? '-1';
});

const versionInfo = ref<DevVersionApi.DevVersionFace>({});
const statistics = ref<DevVersionApi.VersionStatisticsFace | null>(null);
const loading = ref(true);

const overviewItems = computed<AnalysisOverviewItem[]>(() => {
  const s = statistics.value?.summary;
  return [
    {
      icon: LucideFilm,
      title: '需求',
      totalTitle: '需求总数',
      totalValue: s?.storyTotal ?? 0,
      value: s?.storyDone ?? 0,
    },
    {
      icon: LucideListTodo,
      title: '任务',
      totalTitle: '任务总数',
      totalValue: s?.taskTotal ?? 0,
      value: s?.taskDone ?? 0,
    },
    {
      icon: LucideBug,
      title: '缺陷',
      totalTitle: '缺陷总数',
      totalValue: s?.bugTotal ?? 0,
      value: s?.bugFixed ?? 0,
    },
    {
      icon: LucideCheckCircle,
      title: '完成率',
      totalTitle: '任务完成率',
      totalValue: s?.taskTotal ?? 0,
      value: s?.taskDone ?? 0,
    },
  ];
});

// ---- 图表 ref ----
// 趋势折线图
const trendChartRef = ref<EchartsUIType>();
const { renderEcharts: renderTrend } = useEcharts(trendChartRef);

// 人员维度
const personTaskChartRef = ref<EchartsUIType>();
const personStoryChartRef = ref<EchartsUIType>();
const personHoursChartRef = ref<EchartsUIType>();
const moduleChartRef = ref<EchartsUIType>();
const { renderEcharts: renderPersonTask } = useEcharts(personTaskChartRef);
const { renderEcharts: renderPersonStory } = useEcharts(personStoryChartRef);
const { renderEcharts: renderPersonHours } = useEcharts(personHoursChartRef);
const { renderEcharts: renderModule } = useEcharts(moduleChartRef);

// 需求面板
const storyTypeChartRef = ref<EchartsUIType>();
const storySourceChartRef = ref<EchartsUIType>();
const storyFunnelChartRef = ref<EchartsUIType>();
const { renderEcharts: renderStoryType } = useEcharts(storyTypeChartRef);
const { renderEcharts: renderStorySource } = useEcharts(storySourceChartRef);
const { renderEcharts: renderStoryFunnel } = useEcharts(storyFunnelChartRef);

// 任务面板
const taskTypeChartRef = ref<EchartsUIType>();
const taskWorkloadChartRef = ref<EchartsUIType>();
const { renderEcharts: renderTaskType } = useEcharts(taskTypeChartRef);
const { renderEcharts: renderTaskWorkload } = useEcharts(taskWorkloadChartRef);

// Bug 面板
const bugTypeChartRef = ref<EchartsUIType>();
const bugLevelChartRef = ref<EchartsUIType>();
const bugFixerChartRef = ref<EchartsUIType>();
const bugSourceChartRef = ref<EchartsUIType>();
const { renderEcharts: renderBugType } = useEcharts(bugTypeChartRef);
const { renderEcharts: renderBugLevel } = useEcharts(bugLevelChartRef);
const { renderEcharts: renderBugFixer } = useEcharts(bugFixerChartRef);
const { renderEcharts: renderBugSource } = useEcharts(bugSourceChartRef);

// 共用饼图配置生成器
function makePieOption(
  name: string,
  data: DevVersionApi.DistItem[],
  radius: string | string[] = ['38%', '65%'],
) {
  return {
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center', type: 'scroll' as const },
    series: [
      {
        name,
        type: 'pie' as const,
        radius,
        center: ['50%', '44%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' as const },
        },
        labelLine: { show: false },
        data,
      },
    ],
  };
}

function renderAllCharts(data: DevVersionApi.VersionStatisticsFace) {
  // 趋势折线图
  renderTrend({
    tooltip: {
      trigger: 'axis',
      axisPointer: { lineStyle: { color: '#019680', width: 1 } },
    },
    legend: { data: ['完成任务数', '修复Bug数'], bottom: 0 },
    grid: {
      top: '8%',
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.progressTrend.dates,
      axisTick: { show: false },
    },
    yAxis: [{ type: 'value', minInterval: 1 }],
    series: [
      {
        name: '完成任务数',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.2 },
        itemStyle: { color: '#5ab1ef' },
        data: data.progressTrend.taskDone,
      },
      {
        name: '修复Bug数',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.2 },
        itemStyle: { color: '#ff7373' },
        data: data.progressTrend.bugFixed,
      },
    ],
  });

  // 人员维度
  renderPersonTask(makePieOption('人员任务占比', data.personTaskDist));
  renderPersonStory(makePieOption('人员需求参与', data.personStoryDist));
  renderPersonHours(makePieOption('人员工时占比', data.personHoursDist));
  renderModule(makePieOption('模块任务占比', data.moduleDist, '60%'));

  // 需求面板
  renderStoryType(makePieOption('需求类型', data.storyTypeDist, '60%'));
  renderStorySource(makePieOption('需求来源', data.storySourceDist, '60%'));
  // 漏斗图
  renderStoryFunnel({
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [
      {
        name: '需求状态',
        type: 'funnel',
        left: '10%',
        width: '80%',
        minSize: '0%',
        maxSize: '100%',
        sort: 'none',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}',
          color: '#fff',
          fontSize: 12,
        },
        itemStyle: { borderWidth: 0 },
        data: data.storyStatusFunnel,
      },
    ],
  });

  // 任务面板
  renderTaskType(makePieOption('任务类型', data.taskTypeDist, '60%'));
  renderTaskWorkload({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['计划工时(h)', '实际工时(h)'], bottom: 0 },
    grid: {
      top: '8%',
      left: '3%',
      right: '4%',
      bottom: '14%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: data.taskWorkload.categories,
        axisTick: { show: false },
        axisLabel: { rotate: 30 },
      },
    ],
    yAxis: [{ type: 'value', name: '工时(h)', minInterval: 1 }],
    series: [
      {
        name: '计划工时(h)',
        type: 'bar',
        barMaxWidth: 30,
        itemStyle: { color: '#5ab1ef', borderRadius: [4, 4, 0, 0] },
        data: data.taskWorkload.planHours,
      },
      {
        name: '实际工时(h)',
        type: 'bar',
        barMaxWidth: 30,
        itemStyle: { color: '#019680', borderRadius: [4, 4, 0, 0] },
        data: data.taskWorkload.actualHours,
      },
    ],
  });

  // Bug 面板
  renderBugType(makePieOption('Bug类型', data.bugTypeDist));
  renderBugLevel(makePieOption('Bug级别', data.bugLevelDist, ['38%', '65%']));
  // Bug 修复人柱状图
  renderBugFixer({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: {
      top: '8%',
      left: '3%',
      right: '6%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: {
      type: 'category',
      data: data.bugFixerDist.map((d) => d.name),
      axisLabel: { width: 70, overflow: 'truncate' },
    },
    series: [
      {
        name: 'Bug数量',
        type: 'bar',
        barMaxWidth: 22,
        itemStyle: { color: '#f56c6c', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right' },
        data: data.bugFixerDist.map((d) => d.value),
      },
    ],
  });
  renderBugSource(makePieOption('Bug来源', data.bugSourceDist, '60%'));
}

onMounted(async () => {
  loading.value = true;
  try {
    const [detail, stats] = await Promise.all([
      getVersionDetail(versionId.value),
      getVersionStatistics(versionId.value),
    ]);
    versionInfo.value = detail;
    statistics.value = stats;
    setTabTitle(`版本详情 ${versionInfo.value.version}`);
    if (stats) {
      renderAllCharts(stats);
    }
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <Page auto-content-height>
    <!-- 概览统计卡片 -->
    <AnalysisOverview :items="overviewItems" />

    <!-- 开发进度趋势 -->
    <Card title="开发进度趋势" class="mt-4">
      <EchartsUI ref="trendChartRef" height="260px" />
    </Card>

    <!-- 人员维度占比 -->
    <Card title="人员维度占比" class="mt-4">
      <Row :gutter="[16, 16]">
        <Col :span="6">
          <div class="text-center text-sm text-gray-500 mb-2">
            人员任务数量占比
          </div>
          <EchartsUI ref="personTaskChartRef" height="260px" />
        </Col>
        <Col :span="6">
          <div class="text-center text-sm text-gray-500 mb-2">
            人员需求参与占比
          </div>
          <EchartsUI ref="personStoryChartRef" height="260px" />
        </Col>
        <Col :span="6">
          <div class="text-center text-sm text-gray-500 mb-2">人员工时占比</div>
          <EchartsUI ref="personHoursChartRef" height="260px" />
        </Col>
        <Col :span="6">
          <div class="text-center text-sm text-gray-500 mb-2">模块任务占比</div>
          <EchartsUI ref="moduleChartRef" height="260px" />
        </Col>
      </Row>
    </Card>

    <!-- 需求 / 任务 / Bug 折叠面板 -->
    <Collapse class="mt-4" default-active-key="['story', 'task', 'bug']">
      <!-- 需求面板 -->
      <CollapsePanel key="story" header="需求分析">
        <Row :gutter="[16, 16]">
          <Col :span="8">
            <div class="text-center text-sm text-gray-500 mb-2">
              需求类型分布
            </div>
            <EchartsUI ref="storyTypeChartRef" height="280px" />
          </Col>
          <Col :span="8">
            <div class="text-center text-sm text-gray-500 mb-2">
              需求来源分布
            </div>
            <EchartsUI ref="storySourceChartRef" height="280px" />
          </Col>
          <Col :span="8">
            <div class="text-center text-sm text-gray-500 mb-2">
              需求状态消耗漏斗图
            </div>
            <EchartsUI ref="storyFunnelChartRef" height="280px" />
          </Col>
        </Row>
      </CollapsePanel>

      <!-- 任务面板 -->
      <CollapsePanel key="task" header="任务分析">
        <Row :gutter="[16, 16]">
          <Col :span="10">
            <div class="text-center text-sm text-gray-500 mb-2">
              任务类型分布
            </div>
            <EchartsUI ref="taskTypeChartRef" height="300px" />
          </Col>
          <Col :span="14">
            <div class="text-center text-sm text-gray-500 mb-2">
              任务计划/实际工时对比
            </div>
            <EchartsUI ref="taskWorkloadChartRef" height="300px" />
          </Col>
        </Row>
      </CollapsePanel>

      <!-- Bug 面板 -->
      <CollapsePanel key="bug" header="Bug 分析（已确认）">
        <Row :gutter="[16, 16]">
          <Col :span="6">
            <div class="text-center text-sm text-gray-500 mb-2">
              Bug类型分布
            </div>
            <EchartsUI ref="bugTypeChartRef" height="280px" />
          </Col>
          <Col :span="6">
            <div class="text-center text-sm text-gray-500 mb-2">
              Bug级别分布
            </div>
            <EchartsUI ref="bugLevelChartRef" height="280px" />
          </Col>
          <Col :span="6">
            <div class="text-center text-sm text-gray-500 mb-2">
              Bug修复人分布
            </div>
            <EchartsUI ref="bugFixerChartRef" height="280px" />
          </Col>
          <Col :span="6">
            <div class="text-center text-sm text-gray-500 mb-2">
              Bug来源分布
            </div>
            <EchartsUI ref="bugSourceChartRef" height="280px" />
          </Col>
        </Row>
      </CollapsePanel>
    </Collapse>
  </Page>
</template>
