<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalScheduleApi } from '#/api/medical';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteScheduleTemplateApi,
  getScheduleTemplateListApi,
} from '#/api/medical';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import { useTemplateColumns, useTemplateSearchSchema } from './data';
import FormDrawerComponent from './form-drawer.vue';

const { hasAccessByCodes } = useAccess();
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useTemplateSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-3',
  },
  gridOptions: {
    columns: useTemplateColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getScheduleTemplateListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalScheduleApi.ScheduleTemplate>,
});

function openForm(row?: MedicalScheduleApi.ScheduleTemplate) {
  formDrawerApi.setData(row ?? {}).open();
}

async function removeTemplate(row: MedicalScheduleApi.ScheduleTemplate) {
  await deleteScheduleTemplateApi(row.templateId);
  message.success($t('medical.common.deleteSuccess'));
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('medical.schedule.templateTitle')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['medical:scheduleTemplate:create'])"
          type="primary"
          @click="openForm()"
        >
          <Plus class="size-5" />
          {{ $t('medical.schedule.createTemplate') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'medical:scheduleTemplate:update',
              icon: 'lucide:edit',
              text: $t('common.edit'),
              onClick: () => openForm(row),
            },
          ]"
          :dropdown-actions="[
            {
              auth: 'medical:scheduleTemplate:delete',
              danger: true,
              icon: 'lucide:trash-2',
              text: $t('common.delete'),
              popConfirm: {
                title: $t('medical.common.deleteConfirm', [row.templateName]),
                confirm: () => removeTemplate(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
