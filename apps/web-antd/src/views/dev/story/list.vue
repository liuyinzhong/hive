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
import batchFormModalV2 from './batch-modalV2.vue';
import nextModal from './next-modal.vue';
import detailDrawer from './detail-drawer.vue';
import { getStoryList, type SystemStoryApi } from '#/api/dev';
import { useGridFormSchema, useColumns } from './data';
import { message } from 'ant-design-vue';
import { sleep } from '#/utils';

// 跳转路由
const router = useRouter();

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5',
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    rowConfig: {
      drag: true,
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
  gridEvents: {
    /* cellClick: ({ column, row }: any) => {
      if (column.field === 'storyTitle') {
        DetailDrawerApi.setData(row).open();
      }
    }, */
    rowDragstart: (e: any) => {},
    rowDragend: ({ oldRow, _index }: any) => {
      console.log(
        '排序后' + oldRow.moduleTitle + '在' + _index.newIndex + '位',
      );
    },
  },
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
      break;
    }
    case 'next': {
      openNextModal(row);
      break;
    }
    case 'storyTitle': {
      DetailDrawerApi.setData(row).open();
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

// #region 批量添加需求V2

const [BatchFormModalV2, BatchFormModalV2Api] = useVbenModal({
  title: '批量添加需求V2',
  connectedComponent: batchFormModalV2,
  destroyOnClose: true,
});

/** 打开批量添加弹窗V2 */
function openAddBatchStoryModalV2() {
  BatchFormModalV2Api.open();
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

        <a-button class="mr-2" type="primary" @click="openAddBatchStoryModalV2">
          批量新建V2
        </a-button>
      </template>
    </Grid>
    <AddFormModal />
    <BatchFormModal />
    <BatchFormModalV2 />
    <NextModal />
    <DetailDrawer />
  </Page>
</template>
