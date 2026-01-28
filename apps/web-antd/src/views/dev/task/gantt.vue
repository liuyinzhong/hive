<script lang="ts" setup>
import type { MousePointerCellEvent } from '@visactor/vtable';

import { nextTick } from 'vue';

import { Page, useVbenModal, useVbenDrawer } from '@vben/common-ui';
// 偏好设置
import { preferences } from '@vben/preferences';

import { faker } from '@faker-js/faker';
import * as VTable from '@visactor/vtable';
import { Gantt } from '@visactor/vtable-gantt';
import * as VTableGantt from '@visactor/vtable-gantt';

import storyDetailDrawerComponent from '#/views/dev/story/detail-drawer.vue';
import taskDetailDrawerComponent from '#/views/dev/task/detail-drawer.vue';

import { getTaskList, type SystemTaskApi } from '#/api/dev';

const { SCROLL, CLICK_TASK_BAR, MOVE_END_TASK_BAR, CHANGE_DATE_RANGE } =
  VTableGantt.TYPES.GANTT_EVENT_TYPE;
const { CLICK_CELL, DBLCLICK_CELL } = VTable.ListTable.EVENT_TYPE;

const [TaskDetailDrawer, TaskDetailDrawerApi] = useVbenDrawer({
  connectedComponent: taskDetailDrawerComponent,
  destroyOnClose: true,
});

const [StoryDetailDrawer, StoryDetailDrawerApi] = useVbenDrawer({
  connectedComponent: storyDetailDrawerComponent,
  destroyOnClose: true,
});

const columns: any = [
  {
    field: 'storyTitle',
    title: '需求名称',
    width: 100,
    mergeCell: true,
    style: {
      color: preferences.theme.colorPrimary,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  {
    field: 'realName',
    title: '执行人',
    width: 100,
    mergeCell: true,
  },
  {
    field: 'taskTitle',
    title: '任务项',
    width: 100,
    style: {
      color: preferences.theme.colorPrimary,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },

  {
    field: 'startDate',
    title: '开始时间',
    width: 'auto',
  },
  {
    field: 'endDate',
    title: '结束时间',
    width: 'auto',
  },
];

nextTick(async () => {
  let TaskData: any = await getTaskList({});
  const ganttInstance = new Gantt(
    document.querySelector('#tableContainer') as HTMLDivElement,
    {
      overscrollBehavior: 'none',
      records: TaskData.items,
      taskKeyField: 'taskId',
      minDate: '2025-08-1',
      maxDate: '2025-09-1',
      markLine: true,
      taskListTable: {
        columns,
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
        // rightFrozenColCount: 1
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
          lineColor: 'green',
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
        progressField: 'progress',
        moveable: (args) => {
          return args.taskRecord.progress !== 100;
        },
        resizable: (args) => {
          return args.taskRecord.progress !== 100;
        },
        hoverBarStyle: {
          barOverlayColor: 'rgba(99, 144, 0, 0.2)',
        },
        labelText: '{taskTitle} {progress}%',
        labelTextStyle: {
          fontFamily: 'Arial',
          fontSize: 16,
          textAlign: 'left',
          textOverflow: 'ellipsis',
          color: 'rgb(240, 246, 251)',
          orientHandleWithOverflow: 'right',
        },
        barStyle: {
          width: 24,
          barColor: preferences.theme.colorPrimary,
          completedBarColor: preferences.theme.colorSuccess,
          cornerRadius: 12,
          borderLineWidth: 2,
          borderColor: preferences.theme.colorSuccess,
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
    },
  );

  ganttInstance.on(SCROLL, (...args) => {
    console.log('任务列表左右滚动表格事件');
  });
  ganttInstance.on(CLICK_TASK_BAR, (...args) => {
    console.log('点击任务条事件');
  });
  ganttInstance.on(MOVE_END_TASK_BAR, (...args) => {
    console.log('任务条移动结束事件');
  });
  ganttInstance.on(CHANGE_DATE_RANGE, (...args) => {
    console.log('改变日期范围事件');
  });

  ganttInstance.taskListTableInstance?.on(
    CLICK_CELL,
    (args: MousePointerCellEvent) => {
      console.log('左侧任务信息-单元格单击事件', args);
      if (args.field === 'taskTitle') {
        TaskDetailDrawerApi.setData(args.originData).open();
      }
      if (args.field === 'storyTitle') {
        StoryDetailDrawerApi.setData(args.originData).open();
      }
    },
  );
  ganttInstance.taskListTableInstance?.on(
    DBLCLICK_CELL,
    (args: MousePointerCellEvent) => {
      console.log('左侧任务信息-单元格双击事件', args);
    },
  );
});
</script>
<template>
  <Page auto-content-height>
    <div class="h-full w-full bg-white p-2">
      <div
        id="tableContainer"
        class="h-full w-full"
        style="position: relative"
      ></div>
    </div>
    <TaskDetailDrawer />
    <StoryDetailDrawer />
  </Page>
</template>
