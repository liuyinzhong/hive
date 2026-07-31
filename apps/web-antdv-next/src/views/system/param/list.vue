<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemParamApi } from '#/api/system';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { deleteParamApi, getParamListApi } from '#/api/system';
import { $t } from '#/locales';

import addFormModal from './add-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import { formatSorts } from '#/utils';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass:
      'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async (
          { page, sorts }: any,
          formValues: Recordable<any>,
        ) => {
          return await getParamListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
    },
  } as VxeTableGridOptions<SystemParamApi.SystemParamFace>,
});

/**
 * 编辑参数
 * @param row 当前行
 */
function onEdit(row: SystemParamApi.SystemParamFace) {
  formModalApi.setData(row).open();
}

/**
 * 创建新参数
 */
function onCreate() {
  formModalApi.setData({}).open();
}

/**
 * 删除参数
 * @param row 当前行
 */
function onDelete(row: SystemParamApi.SystemParamFace) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.paramKey]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteParamApi([row.id as string])
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.paramKey]),
        key: 'action_process_msg',
      });
      refreshGrid();
    })
    .catch(() => {
      hideLoading();
    });
}

/** 刷新表格 */
function refreshGrid() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid>
      <template #paramType="{ row }">
        <Tag color="blue">{{ row.paramType }}</Tag>
      </template>
      <template #isPublic="{ row }">
        <Tag :color="row.isPublic === 1 ? 'green' : 'default'">
          {{
            row.isPublic === 1
              ? $t('system.param.yes')
              : $t('system.param.no')
          }}
        </Tag>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: $t('system.param.edit'),
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: $t('system.param.delete'),
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [
                  row.paramKey,
                ]),
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
          {{ $t('ui.actionTitle.create', [$t('system.param.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
