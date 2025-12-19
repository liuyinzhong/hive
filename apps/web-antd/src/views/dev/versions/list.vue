<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemVersionApi } from '#/api/dev/versions';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Page } from '@vben/common-ui';
import { getVersionsList } from '#/api/dev/versions';
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { sleep } from '#/utils';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import addFormModal from './add-modal.vue';

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getVersionsList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<SystemVersionApi.SystemVersion>,
  gridEvents: {},
});

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemVersionApi.SystemVersion>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

// #region 单个添加，编辑 表单弹窗
const [FormModal, FormModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

function onEdit(row: SystemVersionApi.SystemVersion) {
  FormModalApi.setData(row).open();
}

function onCreate() {
  FormModalApi.setData(null).open();
}

async function onDelete(row: SystemVersionApi.SystemVersion) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.version]),
    duration: 0,
    key: 'action_process_msg',
  });

  await sleep(1000);

  message.success({
    content: $t('ui.actionMessage.deleteSuccess', [row.version]),
    key: 'action_process_msg',
  });

  await sleep(1000);
  hideLoading();
  gridApi.query();
}

// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <a-button class="mr-2" type="primary" @click="onCreate">
          新建
        </a-button>
      </template>
    </Grid>
    <FormModal />
  </Page>
</template>
