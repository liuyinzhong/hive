<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DevBugApi } from '#/api/dev';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getBugList } from '#/api/dev';
import { sleep } from '#/utils';

import addFormModal from './add-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import detailDrawer from './detail-drawer.vue';
import nextModal from './next-modal.vue';
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
          return await getBugList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    } as VxeTableGridOptions<DevBugApi.DevBugFace>,
  },
  gridEvents: {},
});

// #region 表格操作按钮的回调函数
function onActionClick({
  code,
  row,
}: OnActionClickParams<DevBugApi.DevBugFace>) {
  switch (code) {
    case 'addTask': {
      break;
    }
    case 'bugTitle': {
      DetailDrawerApi.setData(row).open();
      break;
    }
    case 'confirmBug': {
      row.openModalSource = 'confirmBug';
      NextModalApi.setData(row).open();
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'next': {
      row.openModalSource = 'next';
      NextModalApi.setData(row).open();
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: DevBugApi.DevBugFace) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(_row: DevBugApi.DevBugFace) {
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

// #region 单个添加
const [AddFormModal, AddFormModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

// #endregion

// #region 流转弹窗
const [NextModal, NextModalApi] = useVbenModal({
  connectedComponent: nextModal,
  destroyOnClose: true,
});

// #region 打开详情抽屉
const [DetailDrawer, DetailDrawerApi] = useVbenDrawer({
  connectedComponent: detailDrawer,
  destroyOnClose: true,
});
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button class="mr-2" type="primary" @click="onCreate()">
          <Plus class="size-5" />新建缺陷
        </Button>
      </template>
    </Grid>
    <AddFormModal @success="gridApi.query" />
    <NextModal @success="gridApi.query" />
    <DetailDrawer />
  </Page>
</template>
