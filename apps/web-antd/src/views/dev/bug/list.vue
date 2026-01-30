<script lang="ts" setup>
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  useVbenVxeGrid,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';

import addFormModal from './add-modal.vue';
import detailDrawer from './detail-drawer.vue';
import nextModal from './next-modal.vue';
import { getBugList, type SystemBugApi } from '#/api/dev';
import trackDrawer from './track-drawer.vue';
import { useGridFormSchema, useColumns } from './data';
import { message, Button } from 'ant-design-vue';
import { Plus } from '@vben/icons';
import { sleep } from '#/utils';
import type { Recordable } from '@vben/types';
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
    } as VxeTableGridOptions<SystemBugApi.SystemBug>,
  },
  gridEvents: {},
});

// #region 表格操作按钮的回调函数
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemBugApi.SystemBug>) {
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
      NextModalApi.setData(row).open();
      break;
    }
    case 'bugTitle': {
      DetailDrawerApi.setData(row).open();
      break;
    }
    case 'track': {
      TrackDrawerApi.setData(row).open();
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: SystemBugApi.SystemBug) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(row: SystemBugApi.SystemBug) {
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
// #endregion

// #region 打开轨迹抽屉
const [TrackDrawer, TrackDrawerApi] = useVbenDrawer({
  connectedComponent: trackDrawer,
});
// #endregion

// #region 打开详情抽屉
const [DetailDrawer, DetailDrawerApi] = useVbenDrawer({
  connectedComponent: detailDrawer,
  destroyOnClose: true,
});
// #endregion
</script>

<template>
  <Page autoContentHeight>
    <Grid>
      <template #toolbar-actions>
        <Button class="mr-2" type="primary" @click="onCreate()">
          <Plus class="size-5" />新建缺陷
        </Button>
      </template>
    </Grid>
    <AddFormModal />
    <TrackDrawer />
    <NextModal />
    <DetailDrawer />
  </Page>
</template>
