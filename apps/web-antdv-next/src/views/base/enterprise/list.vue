<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BaseEnterpriseApi } from '#/api/base';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getEnterpriseListApi } from '#/api/base';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import {
  enterpriseRoleLabel,
  useEnterpriseColumns,
  useEnterpriseSearchSchema,
} from './data';
import FormDrawerComponent from './form-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useEnterpriseSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useEnterpriseColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          const roleTypes = Array.isArray(formValues.roleTypes)
            ? formValues.roleTypes.join(',')
            : formValues.roleTypes;
          return getEnterpriseListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            roleTypes,
            sorts: formatSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'enterpriseId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<BaseEnterpriseApi.Enterprise>,
});

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openEdit(row: BaseEnterpriseApi.Enterprise) {
  formDrawerApi.setData({
    enterpriseId: row.enterpriseId,
    rowVersion: row.rowVersion,
  }).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('base.enterprise.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['base:enterprise:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('base.enterprise.create') }}
        </Button>
      </template>
      <template #roles="{ row }">
        <div class="flex flex-wrap gap-1">
          <Tag v-for="role in row.roles" :key="role" color="blue">
            {{ enterpriseRoleLabel(role) }}
          </Tag>
        </div>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'base:enterprise:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openEdit(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
