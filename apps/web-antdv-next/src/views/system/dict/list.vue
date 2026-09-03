<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getDictListApi, deleteDictApi } from '#/api/system';
import { $t } from '#/locales';

import addFormModal from './add-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import { formatVxeTableSorts } from '#/utils';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    submitOnEnter: true,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(),
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
    },
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    pagerConfig: {
      enabled: false,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      childrenField: 'children',
      showLine: false,
      transform: false,
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
          return await getDictListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
            ...formValues,
          });
        },
      },
    } as VxeTableGridOptions<SystemDictApi.SystemDictFace>,
  },
  gridEvents: {},
});

/**
 * 编辑字典
 * @param row
 */
function onEdit(row: SystemDictApi.SystemDictFace) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级字典
 * @param row
 */
function onAppend(row: SystemDictApi.SystemDictFace) {
  formModalApi.setData({ pid: row.id, type: row.type }).open();
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
function onDelete(row: SystemDictApi.SystemDictFace) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.label]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDictApi([row.id as string])
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.label]),
        key: 'action_process_msg',
      });
      refreshGrid();
    })
    .catch(() => {
      hideLoading();
    });
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
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '新增下级',
              disabled: row._level > 0,
              onClick: () => onAppend(row),
            },
            {
              text: '编辑',
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              disabled: !!(row.children && row.children.length > 0),
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.label]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
