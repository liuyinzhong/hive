<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalDepartmentApi } from '#/api/medical';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteMedicalDepartmentsApi,
  getMedicalDepartmentTreeApi,
} from '#/api/medical';
import { $t } from '#/locales';

import { useDepartmentColumns, useDepartmentSearchSchema } from './data';
import FormModalComponent from './form-modal.vue';

const { hasAccessByCodes } = useAccess();
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: FormModalComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDepartmentSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridOptions: {
    columns: useDepartmentColumns(),
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) =>
          getMedicalDepartmentTreeApi(formValues),
      },
    },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
    treeConfig: {
      parentField: 'pid',
      rowField: 'departmentId',
      transform: false,
    },
  } as VxeTableGridOptions<MedicalDepartmentApi.Department>,
});

function openCreate(pid?: string) {
  formModalApi.setData(pid ? { pid } : {}).open();
}

function openEdit(row: MedicalDepartmentApi.Department) {
  formModalApi.setData({ ...row }).open();
}

async function removeDepartment(row: MedicalDepartmentApi.Department) {
  await deleteMedicalDepartmentsApi([row.departmentId]);
  message.success($t('medical.common.deleteSuccess'));
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="gridApi.query()" />
    <Grid :table-title="$t('medical.department.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['medical:department:create'])"
          type="primary"
          @click="openCreate()"
        >
          <Plus class="size-5" />
          {{ $t('medical.department.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'medical:department:create',
              text: $t('medical.department.createChild'),
              onClick: () => openCreate(row.departmentId),
            },
            {
              auth: 'medical:department:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              auth: 'medical:department:delete',
              danger: true,
              disabled: Boolean(row.children?.length),
              icon: 'lucide:trash-2',
              text: $t('common.delete'),
              popConfirm: {
                title: $t('medical.common.deleteConfirm', [row.departmentName]),
                confirm: () => removeDepartment(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
