<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  useVbenVxeGrid,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';

import addFormModal from './add-modal.vue';
import batchFormModal from './batch-modal.vue';
import nextModal from './next-modal.vue';
import detailDrawer from './detail-drawer.vue';

import addTaskModal from '#/views/dev/task/add-modal.vue';
import addBugModal from '#/views/dev/bug/add-modal.vue';

import { getStoryList, type DevStoryApi } from '#/api/dev';
import { useGridFormSchema, useColumns } from './data';
import { message, Button } from 'ant-design-vue';
import { Plus } from '@vben/icons';
import { sleep } from '#/utils';
import type { Recordable } from '@vben/types';
// 跳转路由
const router = useRouter();

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
      export: true,
    },
    exportConfig: {},
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          return await getStoryList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as any,
  gridEvents: {},
});

// #region 单个添加需求
const [AddFormModal, AddFormModalApi] = useVbenModal({
  title: '添加需求',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});
// #endregion

// #region 表格操作按钮的回调函数
function onActionClick({
  code,
  row,
}: OnActionClickParams<DevStoryApi.DevStoryFace>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'addTask': {
      AddTaskModalApi.setData({
        storyId: row.storyId,
        projectId: row.projectId,
        versionId: row.versionId,
        moduleId: row.moduleId,
        openModalSource: 'storyListAddBtn',
      }).open();
      break;
    }
    case 'addBug': {
      AddBugModalApi.setData({
        storyId: row.storyId,
        projectId: row.projectId,
        versionId: row.versionId,
        moduleId: row.moduleId,
        openModalSource: 'storyListAddBtn',
      }).open();
      break;
    }
    case 'next': {
      openNextModal(row);
      break;
    }
    case 'storyTitle': {
      /* router.push({
        path: `/dev/story/detail/${row.storyNum}`,
      }); */
      DetailDrawerApi.setData(row).open();
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: DevStoryApi.DevStoryFace) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(row: DevStoryApi.DevStoryFace) {
  const hideLoading = message.loading({
    content: '正在删除',
    duration: 0,
    key: 'action_process_msg',
  });

  await sleep(1000);

  message.success({
    content: '删除成功',
    key: 'action_process_msg',
  });

  await sleep(1000);
  hideLoading();
  gridApi.query();
}
//#endregion

// #region 批量添加需求

const [BatchFormModal, BatchFormModalApi] = useVbenModal({
  title: '批量添加需求',
  connectedComponent: batchFormModal,
  destroyOnClose: true,
});

/** 打开批量添加弹窗 */
function openAddBatchStoryModal() {
  BatchFormModalApi.open();
}

// #endregion

// #region 流转弹窗
const [NextModal, NextModalApi] = useVbenModal({
  title: '流转需求',
  connectedComponent: nextModal,
  destroyOnClose: true,
});

/** 打开流转弹窗 */
function openNextModal(row: any) {
  NextModalApi.setData(row).open();
}
// #endregion

// #region 详情抽屉
const [DetailDrawer, DetailDrawerApi] = useVbenDrawer({
  connectedComponent: detailDrawer,
  destroyOnClose: true,
});
// #endregion

// #region 任务添加弹窗
const [AddTaskModal, AddTaskModalApi] = useVbenModal({
  title: '添加任务',
  connectedComponent: addTaskModal,
  destroyOnClose: true,
});
// #endregion

// #region 缺陷添加弹窗
const [AddBugModal, AddBugModalApi] = useVbenModal({
  title: '添加缺陷',
  connectedComponent: addBugModal,
  destroyOnClose: true,
});
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button class="mr-2" type="primary" @click="onCreate()">
          <Plus class="size-5" />新建需求
        </Button>
        <Button class="mr-2" type="primary" @click="openAddBatchStoryModal">
          批量新建
        </Button>
      </template>
    </Grid>
    <AddFormModal />
    <BatchFormModal />
    <NextModal />
    <DetailDrawer />
    <AddTaskModal />
    <AddBugModal />
  </Page>
</template>
