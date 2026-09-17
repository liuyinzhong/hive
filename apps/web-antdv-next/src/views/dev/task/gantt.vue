<script lang="ts" setup>
import type { MousePointerCellEvent } from '@visactor/vtable';

import type { DevTaskApi } from '#/api/dev';

import { onMounted, onUnmounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
// 偏好设置
import { preferences } from '@vben/preferences';

import * as VTable from '@visactor/vtable';
import { Gantt, TYPES } from '@visactor/vtable-gantt';

import { Alert, Spin } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { getProjectsListApi, getTaskListApi } from '#/api/dev';
import { getLocalDictList, getLocalDictText } from '#/dicts';
import { projectSchema, versionSchema } from '#/views/dev/base/baseSchema';
import taskDetailDrawerComponent from './detail-drawer.vue';
import { getRangePresets } from '#/utils/date';

const { CLICK_TASK_BAR } = TYPES.GANTT_EVENT_TYPE;
const { CLICK_CELL } = VTable.ListTable.EVENT_TYPE;

const [TaskDetailDrawer, TaskDetailDrawerApi] = useVbenDrawer({
  connectedComponent: taskDetailDrawerComponent,
  destroyOnClose: true,
});

/** 甘特图单次拉取任务上限，超出仅展示前 N 条并提示 */
const MAX_TASK_COUNT = 500;

/** 任务状态配色：待执行中性灰、执行中主色、已完成成功色，未知回退主色 */
const STATUS_COLORS: Record<string, string> = {
  '0': '#8c8c8c',
  '10': preferences.theme.colorPrimary,
  '99': preferences.theme.colorSuccess,
};

function statusColor(status?: string) {
  return STATUS_COLORS[status ?? ''] ?? preferences.theme.colorPrimary;
}

/** 颜色向白色混合，用于任务条内进度完成段的浅色 */
function mixWithWhite(hex: string, ratio: number) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex;
  }
  const num = Number.parseInt(hex.slice(1), 16);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * ratio);
  const r = mix((num >> 16) & 255);
  const g = mix((num >> 8) & 255);
  const b = mix(num & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** 甘特图查询表单：项目必选默认第一个，版本/状态/时间窗口可选 */
const [GanttQueryForm, ganttFormApi] = useVbenForm({
  async handleReset() {
    await ganttFormApi.setValues({
      dateRange: undefined,
      taskStatus: undefined,
      versionId: undefined,
    });
    await loadTasks();
  },
  async handleSubmit() {
    await loadTasks();
  },
  schema: [
    projectSchema({
      componentProps: {
        allowClear: false,
      },
    }),
    versionSchema({
      rules: '',
      componentProps: {
        autoSelect: false,
        allowClear: true,
      },
    }),
    {
      component: 'ApiSelect',
      fieldName: 'taskStatus',
      label: '任务状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        mode: 'multiple',
        api: () => getLocalDictList('TASK_STATUS'),
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'dateRange',
      label: '范围',
      componentProps: {
        allowClear: true,
        presets: getRangePresets(),
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ],
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 80,
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
});

const containerRef = ref<HTMLDivElement>();
const loading = ref(false);
/** 未设置起止日期、被过滤出甘特图的任务数 */
const unscheduledCount = ref(0);
/** 查询命中的任务总数，可能大于实际展示数 */
const totalCount = ref(0);

let ganttInstance: Gantt | null = null;
/** 上次自动推导回填的时间窗口，用于区分用户手选值 */
let lastDerivedRange: [string, string] | undefined;
/** 查询序号，丢弃快速连续查询时先发慢回的过期响应 */
let requestSeq = 0;

/** 左侧任务列表列：执行人合并单元格，任务标题点击打开详情抽屉 */
const taskListColumns = [
  {
    field: 'realName',
    title: '执行人',
    width: 100,
    mergeCell: true,
  },
  {
    field: 'taskTitle',
    title: '任务项',
    width: 220,
    style: {
      color: preferences.theme.colorPrimary,
      cursor: 'pointer',
      underline: true,
    },
  },
  {
    field: 'taskStatus',
    title: '状态',
    width: 90,
    formatter: (record: DevTaskApi.DevTaskFace) =>
      getLocalDictText('TASK_STATUS', record.taskStatus) || '-',
    style: {
      color: (args: { value?: unknown }) => statusColor(args.value as string),
    },
  },
];

/** 按当前表单条件查询任务并渲染甘特图 */
async function loadTasks() {
  const seq = ++requestSeq;
  const values = await ganttFormApi.getValues();
  if (!values.projectId) {
    return;
  }
  loading.value = true;
  try {
    const result = await getTaskListApi({
      page: 1,
      pageSize: MAX_TASK_COUNT,
      projectId: values.projectId,
      taskStatus: values.taskStatus || undefined,
      versionId: values.versionId || undefined,
    });
    if (seq !== requestSeq) {
      return;
    }
    const items = result.items || [];
    totalCount.value = result.total;
    // 未设置起止日期的任务不参与甘特图；按执行人加开始日期排序保证执行人合并单元格连续
    const scheduled = items
      .filter((item) => item.startDate && item.endDate)
      .sort(
        (a, b) =>
          (a.realName ?? '').localeCompare(b.realName ?? '', 'zh-Hans-CN') ||
          (a.startDate ?? '').localeCompare(b.startDate ?? ''),
      );
    unscheduledCount.value = items.length - scheduled.length;
    // 用户手选的时间窗口优先保留；自动推导值不算手选，随每次查询的数据重算
    const formRange = values.dateRange as string[] | undefined;
    const isManualRange =
      !!formRange &&
      formRange.length === 2 &&
      (formRange[0] !== lastDerivedRange?.[0] ||
        formRange[1] !== lastDerivedRange?.[1]);
    let dateRange: [string, string];
    if (isManualRange) {
      dateRange = formRange as [string, string];
    } else {
      dateRange = deriveDateRange(scheduled);
      lastDerivedRange = dateRange;
      await ganttFormApi.setFieldValue('dateRange', dateRange);
    }
    renderGantt(scheduled, dateRange);
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
    }
  }
}

/** 时间窗口默认值：数据最早开始前推 7 天到最晚结束后延 7 天，并始终包含今天 */
function deriveDateRange(records: DevTaskApi.DevTaskFace[]): [string, string] {
  const today = dayjs();
  let min = today.subtract(7, 'day');
  let max = today.add(1, 'month');
  if (records.length > 0) {
    const starts = records.map((item) => dayjs(item.startDate as string));
    const ends = records.map((item) => dayjs(item.endDate as string));
    min = starts.reduce((a, b) => (a.isBefore(b) ? a : b)).subtract(7, 'day');
    max = ends.reduce((a, b) => (a.isAfter(b) ? a : b)).add(7, 'day');
    if (min.isAfter(today)) {
      min = today.subtract(7, 'day');
    }
    if (max.isBefore(today)) {
      max = today.add(7, 'day');
    }
  }
  return [min.format('YYYY-MM-DD'), max.format('YYYY-MM-DD')];
}

function renderGantt(
  records: DevTaskApi.DevTaskFace[],
  dateRange: [string, string],
) {
  if (!containerRef.value) {
    return;
  }
  if (ganttInstance) {
    ganttInstance.setRecords(records);
    ganttInstance.updateDateRange(dateRange[0], dateRange[1]);
    return;
  }
  ganttInstance = new Gantt(containerRef.value, {
    overscrollBehavior: 'none',
    records,
    taskKeyField: 'taskId',
    minDate: dateRange[0],
    maxDate: dateRange[1],
    // 今天标记线（主题色虚线），加载后自动滚动定位
    markLine: {
      date: dayjs().format('YYYY-MM-DD'),
      style: {
        lineColor: preferences.theme.colorPrimary,
        lineWidth: 1,
        lineDash: [4, 2],
      },
    },
    taskListTable: {
      columns: taskListColumns,
      theme: {
        headerStyle: {
          borderColor: '#f0f0f0',
          fontSize: 13,
          fontFamily: 'PingFang SC',
          fontWeight: 500,
          color: '#262626',
          bgColor: '#fafafa',
          padding: [12, 16],
        },
        bodyStyle: {
          fontSize: 13,
          fontFamily: 'PingFang SC',
          color: '#595959',
          bgColor: '#ffffff',
          borderColor: '#f0f0f0',
          padding: [0, 16],
        },
      },
    },
    frame: {
      outerFrameStyle: {
        borderLineWidth: 2,
        borderColor: '#e1e4e8',
        cornerRadius: 8,
      },
      verticalSplitLine: {
        lineColor: '#e1e4e8',
        lineWidth: 3,
      },
      horizontalSplitLine: {
        lineColor: '#e1e4e8',
        lineWidth: 3,
      },
      verticalSplitLineMoveable: true,
      verticalSplitLineHighlight: {
        lineColor: preferences.theme.colorPrimary,
        lineWidth: 3,
      },
    },
    grid: {
      verticalLine: {
        lineWidth: 1,
        lineColor: '#e1e4e8',
      },
      horizontalLine: {
        lineWidth: 1,
        lineColor: '#e1e4e8',
      },
    },
    taskBar: {
      startDateField: 'startDate',
      endDateField: 'endDate',
      progressField: 'percent',
      // 只读甘特图：不允许拖拽或缩放修改任务日期
      moveable: false,
      resizable: false,
      hoverBarStyle: {
        barOverlayColor: 'rgba(0, 0, 0, 0.08)',
      },
      labelText: '{taskTitle} {percent}%',
      labelTextStyle: {
        fontFamily: 'PingFang SC',
        fontSize: 12,
        textAlign: 'left',
        textOverflow: 'ellipsis',
        color: 'rgb(240, 246, 251)',
        orientHandleWithOverflow: 'right',
      },
      barStyle: (args: { taskRecord?: DevTaskApi.DevTaskFace }) => {
        const color = statusColor(args.taskRecord?.taskStatus);
        return {
          width: 24,
          cornerRadius: 12,
          barColor: color,
          completedBarColor: mixWithWhite(color, 0.35),
        };
      },
    },
    timelineHeader: {
      colWidth: 100,
      backgroundColor: '#EEF1F5',
      horizontalLine: {
        lineWidth: 1,
        lineColor: '#e1e4e8',
      },
      verticalLine: {
        lineWidth: 1,
        lineColor: '#e1e4e8',
      },
      scales: [
        {
          unit: 'month',
          step: 1,
          format(date) {
            return `${date.dateIndex}月`;
          },
          style: {
            fontSize: 12,
            textAlign: 'center',
            textBaseline: 'middle',
            color: '#262626',
            padding: [8, 0],
          },
        },
        {
          unit: 'day',
          step: 1,
          format(date) {
            return date.dateIndex.toString();
          },
          style: {
            fontSize: 12,
            textAlign: 'center',
            textBaseline: 'middle',
            color: '#8c8c8c',
            padding: [8, 0],
          },
        },
      ],
    },
  });

  // click_task_bar 事件载荷中任务记录字段为 record
  ganttInstance.on(CLICK_TASK_BAR, (args: { record?: unknown }) => {
    const record = args?.record;
    if (record) {
      TaskDetailDrawerApi.setData(record).open();
    }
  });
  ganttInstance.taskListTableInstance?.on(
    CLICK_CELL,
    (args: MousePointerCellEvent) => {
      if (args.field === 'taskTitle') {
        TaskDetailDrawerApi.setData(args.originData).open();
      }
    },
  );
}

onMounted(async () => {
  /* 项目默认选中第一个后再首查,与任务列表页一致 */
  const projects = await getProjectsListApi();
  const projectId = projects?.[0]?.projectId;
  if (projectId) {
    await ganttFormApi.setFieldValue('projectId', projectId);
  }
  await loadTasks();
});

onUnmounted(() => {
  ganttInstance?.release();
  ganttInstance = null;
});
</script>
<template>
  <Page auto-content-height>
    <div class="flex h-full w-full flex-col gap-2 bg-white p-2">
      <GanttQueryForm />
      <Alert
        v-if="unscheduledCount > 0"
        :message="`${unscheduledCount} 个任务未设置起止日期，未在甘特图中展示`"
        show-icon
        type="info"
      />
      <Alert
        v-if="totalCount > MAX_TASK_COUNT"
        :message="`共 ${totalCount} 条任务，仅展示前 ${MAX_TASK_COUNT} 条`"
        show-icon
        type="warning"
      />
      <div class="min-h-0 flex-1">
        <!-- Spin 内外两层都需撑满高度，内层容器默认 auto 高会把甘特图容器压成 0 -->
        <Spin
          :spinning="loading"
          :classes="{ root: 'h-full', container: 'h-full' }"
        >
          <div
            ref="containerRef"
            class="h-full w-full"
            style="position: relative"
          ></div>
        </Spin>
      </div>
    </div>
    <TaskDetailDrawer />
  </Page>
</template>
