<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalRegistrationFeeApi } from '#/api/medical';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getRegistrationFeeRuleListApi } from '#/api/medical';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import {
  useRegistrationFeeColumns,
  useRegistrationFeeSearchSchema,
} from './data';
import FormDrawerComponent from './form-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useRegistrationFeeSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-5',
  },
  gridOptions: {
    columns: useRegistrationFeeColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getRegistrationFeeRuleListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalRegistrationFeeApi.RegistrationFeeRule>,
});

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openAdjust(row: MedicalRegistrationFeeApi.RegistrationFeeRule) {
  formDrawerApi.setData(row).open();
}

function periodStatusText(status: MedicalRegistrationFeeApi.PeriodStatus) {
  return $t(`medical.registrationFee.${status}`);
}

function periodStatusColor(status: MedicalRegistrationFeeApi.PeriodStatus) {
  if (status === 'current') return 'success';
  if (status === 'future') return 'processing';
  return 'default';
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('medical.registrationFee.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['medical:registrationFee:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('medical.registrationFee.create') }}
        </Button>
      </template>
      <template #periodStatus="{ row }">
        <Tag :color="periodStatusColor(row.periodStatus)">
          {{ periodStatusText(row.periodStatus) }}
        </Tag>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="
            row.periodStatus === 'expired'
              ? []
              : [
                  {
                    auth: 'medical:registrationFee:adjust',
                    icon: 'lucide:badge-dollar-sign',
                    text: $t('medical.registrationFee.adjust'),
                    onClick: () => openAdjust(row),
                  },
                ]
          "
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
