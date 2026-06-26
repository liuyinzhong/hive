<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DevVersionApi } from '#/api/dev';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getVersionsListApi, deleteVersionApi } from '#/api/dev';
import { $t } from '#/locales';

import addFormModal from './add-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import nextFormModal from './next-modal.vue';
import { formatSorts } from '#/utils';
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
    columns: useColumns(),
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
      sort: true,
      ajax: {
        query: async (
          { page, sorts, filters }: any,
          formValues: Recordable<any>,
        ) => {
          return await getVersionsListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<DevVersionApi.DevVersionFace>,
  gridEvents: {},
});

// #region 单个添加，编辑 表单弹窗
const [FormModal, FormModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

// #region 单个流转 表单弹窗
const [NextModal, NextModalApi] = useVbenModal({
  connectedComponent: nextFormModal,
  destroyOnClose: true,
});

function onEdit(row: DevVersionApi.DevVersionFace) {
  FormModalApi.setData(row).open();
}

function onCreate() {
  FormModalApi.setData(null).open();
}

/**
 * 查看版本详情/统计
 * @param row
 */
function onDetail(row: DevVersionApi.DevVersionFace) {
  router.push({
    path: `/dev/versions/detail/${row.versionId}`,
  });
}

async function onDelete(row: DevVersionApi.DevVersionFace) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.version]),
    duration: 0,
  });
  try {
    await deleteVersionApi([row.versionId ?? '']);
    message.success('删除成功');
    gridApi.query();
  } finally {
    hideLoading();
  }
}

// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '统计',
              icon: 'lucide:chart-pie',
              onClick: () => onDetail(row),
            },
            {
              text: '流转',
              icon: 'lucide:redo-dot',
              disabled: row.releaseStatus === '99',
              onClick: () => NextModalApi.setData(row).open(),
            },
            {
              text: '编辑',
              icon: 'lucide:pencil-line',
              disabled: row.releaseStatus === '99',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: '更新日志',
              icon: 'lucide:logs',
              onClick: () => {},
            },
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.version]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
      <template #toolbar-actions>
        <a-button class="mr-2" type="primary" @click="onCreate">
          新建
        </a-button>
      </template>
    </Grid>
    <FormModal @success="gridApi.query" />
    <NextModal @success="gridApi.query" />
  </Page>
</template>
