<script lang="ts" setup>
import type { MedicalScheduleApi } from '#/api/medical';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, ref, nextTick } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getVisitQueueListApi } from '#/api/medical';
import { $t } from '#/locales';

const schedule = ref<MedicalScheduleApi.Schedule>();

const title = computed(() => {
  if (!schedule.value) return $t('medical.schedule.visitQueue');
  return $t('medical.schedule.visitQueueTitle', [
    schedule.value.doctorName,
    schedule.value.scheduleDate,
    `${schedule.value.startTime.slice(0, 5)}–${schedule.value.endTime.slice(0, 5)}`,
  ]);
});

const [Grid, gridApi] = useVbenVxeGrid<MedicalScheduleApi.VisitQueueItem>({
  showSearchForm: false,
  gridOptions: {
    columns: [
      {
        align: 'center',
        field: 'queueSequence',
        title: $t('medical.registration.queueSequence'),
        width: 96,
      },
      {
        field: 'patientNo',
        minWidth: 130,
        title: $t('medical.registration.patientNo'),
      },
      {
        field: 'patientName',
        minWidth: 110,
        title: $t('medical.registration.patientName'),
      },
      {
        field: 'patientPhone',
        minWidth: 140,
        title: $t('medical.registration.patientPhone'),
      },
      {
        field: 'registrationNo',
        minWidth: 170,
        title: $t('medical.registration.registrationNo'),
      },
      {
        field: 'startTime',
        minWidth: 130,
        slots: { default: 'visitTime' },
        title: $t('medical.registration.visitTime'),
      },
      {
        align: 'center',
        field: 'queueStatus',
        slots: { default: 'queueStatus' },
        title: $t('medical.registration.queueStatus'),
        width: 100,
      },
      {
        align: 'center',
        field: 'callCount',
        title: $t('medical.registration.callCount'),
        width: 96,
      },
      {
        field: 'checkInTime',
        minWidth: 170,
        title: $t('medical.registration.checkInTime'),
      },
    ],
    height: 520,
    pagerConfig: { enabled: false },
    proxyConfig: {
      autoLoad: false,
      ajax: {
        query: async () => {
          if (!schedule.value) return [];
          return getVisitQueueListApi(schedule.value.scheduleId);
        },
      },
    },
    rowConfig: { keyField: 'queueId' },
    toolbarConfig: { enabled: false },
  } as VxeTableGridOptions<MedicalScheduleApi.VisitQueueItem>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      schedule.value = undefined;
      await gridApi.grid?.loadData?.([]);
      return;
    }
    schedule.value = drawerApi.getData<MedicalScheduleApi.Schedule>();
    await nextTick();
    await gridApi.query();
  },
});
</script>

<template>
  <Drawer :footer="false" class="w-[1180px]" :title="title">
    <Grid>
      <template #visitTime="{ row }">
        {{ row.startTime }}–{{ row.endTime }}
      </template>
      <template #queueStatus="{ row }">
        <Tag :color="row.queueStatus === 30 ? 'success' : 'processing'">
          {{ $t(`medical.registration.queueStatus${row.queueStatus}`) }}
        </Tag>
      </template>
    </Grid>
  </Drawer>
</template>
