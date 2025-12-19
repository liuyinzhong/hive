<script lang="ts" setup>
import type {
  VxeTableGridOptions,
  OnActionClickParams,
} from '#/adapter/vxe-table';

import { useRouter } from 'vue-router';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import addFormModal from './add-modal.vue';
import batchFormModal from './batch-modal.vue';
import trackDrawer from './track-drawer.vue';
import { getStoryList, type SystemStoryApi } from '#/api/dev/story';
import { useGridFormSchema, useColumns } from './data';
import { message } from 'ant-design-vue';
import { sleep } from '#/utils';

// 跳转路由
const router = useRouter();

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    columns: useColumns(onActionClick),
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getStoryList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<SystemStoryApi.SystemStory>,
  gridEvents: {},
});

// #region 单个添加需求

const [AddFormModal, AddFormModalApi] = useVbenModal({
  title: '添加需求',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemStoryApi.SystemStory>) {
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
      // openAddTaskModal(row);
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: SystemStoryApi.SystemStory) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(row: SystemStoryApi.SystemStory) {
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

// #endregion

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

// #region 抽屉组件

const [TrackDrawer, TrackDrawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: trackDrawer,
});

/** 打开抽屉 */
function openDrawer(row: any) {
  TrackDrawerApi.setData({
    values: row,
  }).open();
}
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <a-button class="mr-2" type="primary" @click="onCreate()">
          新建
        </a-button>
        <a-button class="mr-2" type="primary" @click="openAddBatchStoryModal">
          批量新建
        </a-button>
      </template>
    </Grid>
    <AddFormModal />
    <TrackDrawer />
    <BatchFormModal />
  </Page>
</template>
