<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteRoleApi,
  getRoleListApi,
  updateRoleStatusApi,
} from '#/api/system';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import { formatSorts } from '#/utils';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    fieldMappingTime: [['createDate', ['startDate', 'endDate']]],
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onStatusChange),
    height: 'auto',
    keepSource: true,
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }: any, formValues: Recordable<any>) => {
          return await getRoleListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'roleId',
    },

    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRoleFace>,
});

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: number,
  row: SystemRoleApi.SystemRoleFace,
) {
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirm(
      `你要将${row.roleTitle}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateRoleStatusApi(row.roleId, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRoleFace) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemRoleApi.SystemRoleFace) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.roleTitle]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteRoleApi([row.roleId])
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.roleTitle]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
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
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.roleTitle]),
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
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
