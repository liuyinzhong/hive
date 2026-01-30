<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, message } from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';
import { $t } from '#/locales';
import { getDictList, type SystemDictApi } from '#/api/system';
import { useColumns, useGridFormSchema } from './data';

import addFormModal from './add-modal.vue';
import type { Recordable } from '@vben/types';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

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
    },
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: false,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          return await getDictList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    } as any,
  },
  gridEvents: {},
});

/**
 * 编辑字典
 * @param row
 */
function onEdit(row: SystemDictApi.SystemDict) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级字典
 * @param row
 */
function onAppend(row: SystemDictApi.SystemDict) {
  formModalApi.setData({ pid: row.id }).open();
}

/**
 * 创建新字典
 */
function onCreate() {
  formModalApi.setData(null).open();
}

/**
 * 删除字典
 * @param row
 */
function onDelete(row: SystemDictApi.SystemDict) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.label]),
    duration: 0,
    key: 'action_process_msg',
  });
  hideLoading();
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictApi.SystemDict>) {
  switch (code) {
    case 'append': {
      onAppend(row);
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
  }
}

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
