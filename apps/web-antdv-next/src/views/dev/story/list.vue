<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DevStoryApi } from '#/api/dev';

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { LucidePlus, LucideTableProperties } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteStoryApi,
  getProjectsListApi,
  getStoryListApi,
  updateStoryFieldApi,
} from '#/api/dev';
import addBugModal from '#/views/dev/bug/add-modal.vue';
import addTaskModal from '#/views/dev/task/add-modal.vue';

import addFormModal from './add-modal.vue';
import batchFormModal from './batch-modal.vue';
import batchNextModal from './batch-next-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import detailDrawer from './detail-drawer.vue';
import nextModal from './next-modal.vue';
import { formatVxeTableSorts } from '#/utils';
// 跳转路由
// eslint-disable-next-line unused-imports/no-unused-vars
const router = useRouter();

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    checkboxConfig: {
      // 已关闭的需求禁止勾选流转
      checkMethod: ({ row }: any) => row.storyStatus !== '99',
    },
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
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      autoLoad: false,
      sort: true,
      ajax: {
        query: async (
          { page, sorts, filters }: any,
          formValues: Recordable<any>,
        ) => {
          return await getStoryListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<DevStoryApi.DevStoryFace>,
  gridEvents: {},
});

onMounted(async () => {
  /* 项目默认选中第一个后再生效首查;query不实时读表单,须显式传参 */
  const projects = await getProjectsListApi();
  const projectId = projects?.[0]?.projectId;
  if (projectId) {
    await gridApi.formApi.setValues({ projectId });
  }
  gridApi.query(projectId ? { projectId } : {});
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
    case 'storyTitle': {
      /* router.push({
        path: `/dev/story/detail/${row.storyNum}`,
      }); */
      DetailDrawerApi.setData(row).open();
      break;
    }
    case 'updateField': {
      updateStoryFieldApi(row.storyId, {
        key: row.key,
        value: row.value,
      }).finally(() => {
        gridApi.query();
      });
      break;
    }
  }
}

function addTask(row: DevStoryApi.DevStoryFace) {
  AddTaskModalApi.setData({
    storyId: row.storyId,
    projectId: row.projectId,
    versionId: row.versionId,
    moduleId: row.moduleId,
    openModalSource: 'storyListAddBtn',
  }).open();
}

function addBug(row: DevStoryApi.DevStoryFace) {
  AddBugModalApi.setData({
    storyId: row.storyId,
    projectId: row.projectId,
    versionId: row.versionId,
    moduleId: row.moduleId,
    openModalSource: 'storyListAddBtn',
  }).open();
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: DevStoryApi.DevStoryFace) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(_row: DevStoryApi.DevStoryFace) {
  const hideLoading = message.loading({
    content: '正在删除',
    duration: 0,
  });
  try {
    await deleteStoryApi([_row.storyId ?? '']);
    message.success('删除成功');
    gridApi.query();
  } finally {
    hideLoading();
  }
}
// #endregion

// #region 批量添加需求

const [BatchFormModal, BatchFormModalApi] = useVbenModal({
  title: '批量添加需求',
  connectedComponent: batchFormModal,
  destroyOnClose: true,
});

/** 打开批量添加弹窗,行内项目继承列表当前查询项目 */
async function openAddBatchStoryModal() {
  const formValues = await gridApi.formApi.getValues();
  BatchFormModalApi.setData({ projectId: formValues?.projectId }).open();
}

// #endregion

// #region 批量流转需求
const [BatchNextModal, BatchNextModalApi] = useVbenModal({
  title: '批量流转需求',
  connectedComponent: batchNextModal,
  destroyOnClose: true,
});

/** 打开批量流转弹窗 */
function openBatchNextModal() {
  const rows = gridApi.grid.getCheckboxRecords() as DevStoryApi.DevStoryFace[];
  if (rows.length === 0) {
    message.warning('请先勾选要流转的需求');
    return;
  }
  BatchNextModalApi.setData({
    storyIds: rows.map((row) => row.storyId ?? ''),
    projectId: rows[0]?.projectId,
  }).open();
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
          <template #icon>
            <LucidePlus class="size-5" />
          </template>
          新建需求
        </Button>

        <Button class="mr-2" type="primary" @click="openAddBatchStoryModal">
          <template #icon>
            <LucideTableProperties class="size-5" />
          </template>
          批量新建
        </Button>

        <Button class="mr-2" @click="openBatchNextModal"> 批量流转 </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '',
              icon: 'lucide:badge-plus',
              disabled:
                !row.versionId || ['0', '99'].includes(row.storyStatus ?? ''),
              onClick: () => addTask(row),
            },
            {
              text: '',
              icon: 'lucide:bug',
              disabled: !row.versionId || ['0'].includes(row.storyStatus ?? ''),
              onClick: () => addBug(row),
            },
            {
              text: '',
              icon: 'lucide:redo-dot',
              disabled: row.storyStatus === '99',
              onClick: () => openNextModal(row),
            },
            {
              text: '',
              icon: 'lucide:pencil-line',
              disabled: row.storyStatus === '99',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [
                  '#' + row.storyNum,
                ]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <AddFormModal @success="gridApi.query" />
    <BatchFormModal @success="gridApi.query" />
    <BatchNextModal @success="gridApi.query" />
    <NextModal @success="gridApi.query" />
    <DetailDrawer />
    <AddTaskModal />
    <AddBugModal />
  </Page>
</template>
